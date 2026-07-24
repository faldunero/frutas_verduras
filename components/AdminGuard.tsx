'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error('No tienes permiso para acceder')
      router.push('/')
    }
  }, [isAdmin, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return <>{children}</>
}
