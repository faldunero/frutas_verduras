'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AdminGuard } from '@/components/AdminGuard'

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Redireccionar a la página de productos
    router.push('/admin/productos')
  }, [router])

  return (
    <AdminGuard>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando panel administrativo...</p>
        </div>
      </div>
    </AdminGuard>
  )
}
