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
          <div className="animate-spin w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel administrativo...</p>
        </div>
      </div>
    </AdminGuard>
  )
}
