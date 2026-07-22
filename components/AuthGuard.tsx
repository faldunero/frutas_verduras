'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'client'
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { isAuthenticated, rol, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login')
        return
      }

      if (requiredRole && rol !== requiredRole) {
        router.push('/')
      }
    }
  }, [isAuthenticated, rol, loading, router, requiredRole])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole && rol !== requiredRole) {
    return null
  }

  return <>{children}</>
}
