import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [rol, setRol] = useState<'client' | 'admin' | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserRol(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserRol(session.user.id)
      } else {
        setRol(null)
      }
      setLoading(false)
    })

    return () => subscription?.unsubscribe()
  }, [])

  const fetchUserRol = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('rol')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user rol:', error)
      setRol('client') // Default to client
    } else {
      setRol(data?.rol ?? 'client')
    }
  }

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    router.push('/')
  }

  const register = async (
    email: string,
    password: string,
    nombre: string
  ) => {
    const { error: signUpError, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
        },
      },
    })

    if (signUpError) throw signUpError

    // Create user record
    if (data.user) {
      const { error: insertError } = await supabase.from('users').insert([
        {
          id: data.user.id,
          email,
          nombre,
          rol: 'client',
        },
      ])

      if (insertError) throw insertError
    }

    router.push('/auth/login')
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setRol(null)
    router.push('/')
  }

  return {
    user,
    session,
    loading,
    rol,
    isAuthenticated: !!user,
    isAdmin: rol === 'admin',
    login,
    register,
    logout,
  }
}
