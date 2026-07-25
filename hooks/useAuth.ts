import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [rol, setRol] = useState<'user' | 'admin' | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        await fetchUserRol(firebaseUser.uid)
      } else {
        setUser(null)
        setRol(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const fetchUserRol = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        setRol(userData.rol || 'user')
      } else {
        setRol('user')
      }
    } catch (error) {
      console.error('Error fetching user rol:', error)
      setRol('user')
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      if (result.user) {
        await fetchUserRol(result.user.uid)
      }
      router.push('/')
    } catch (error: any) {
      throw new Error(error.message || 'Error al iniciar sesión')
    }
  }

  const register = async (
    email: string,
    password: string,
    nombre: string
  ) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)

      if (result.user) {
        // Create user record in Firestore
        await setDoc(doc(db, 'users', result.user.uid), {
          email,
          nombre,
          rol: 'user',
          direccion: '',
          telefono: '',
          createdAt: new Date(),
        })
      }

      router.push('/auth/login')
    } catch (error: any) {
      throw new Error(error.message || 'Error al registrarse')
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setRol(null)
      router.push('/')
    } catch (error: any) {
      throw new Error(error.message || 'Error al cerrar sesión')
    }
  }

  return {
    user,
    loading,
    rol,
    isAuthenticated: !!user,
    isAdmin: rol === 'admin',
    login,
    register,
    logout,
  }
}
