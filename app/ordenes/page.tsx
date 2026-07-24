'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import toast from 'react-hot-toast'

interface PedidoItem {
  id: string
  nombre: string
  precio: number
  cantidad: number
}

interface Pedido {
  id: string
  usuarioId: string
  usuarioEmail: string
  usuarioNombre: string
  items: PedidoItem[]
  total: number
  estado: 'pendiente' | 'completado' | 'cancelado'
  fechaCreacion: any
  direccion?: string
  telefono?: string
}

export default function OrdenesPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login')
      } else if (user) {
        fetchPedidos()
      }
    }
  }, [isAuthenticated, user, authLoading, router])

  const fetchPedidos = async () => {
    try {
      const q = query(
        collection(db, 'pedidos'),
        where('usuarioId', '==', user?.uid),
        orderBy('fechaCreacion', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Pedido[]
      setPedidos(data)
    } catch (error) {
      console.error('Error fetching pedidos:', error)
      toast.error('Error al cargar tus pedidos')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando tus pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Pedidos</h1>
          <p className="text-gray-600">Historial de todas tus compras</p>
        </div>

        {pedidos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-gray-600 text-lg mb-6">No tienes pedidos aún</p>
            <Link
              href="/catalogo"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg"
            >
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <div
                key={pedido.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Fecha del Pedido</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {pedido.fechaCreacion?.toDate?.()?.toLocaleDateString('es-CL') ||
                        'Fecha no disponible'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 font-medium">ID Pedido</p>
                    <p className="text-lg font-mono text-gray-900 truncate">{pedido.id}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total</p>
                    <p className="text-lg font-semibold text-green-600">
                      ${pedido.total.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 font-medium">Estado</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                        pedido.estado === 'completado'
                          ? 'bg-green-100 text-green-800'
                          : pedido.estado === 'pendiente'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Productos:</p>
                  <div className="space-y-2">
                    {pedido.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-gray-700 text-sm">
                        <span>
                          {item.nombre} <span className="text-gray-600">x{item.cantidad}</span>
                        </span>
                        <span>${(item.precio * item.cantidad).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {pedido.direccion && (
                  <div className="border-t mt-4 pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Entrega:</p>
                    <div className="text-sm text-gray-700">
                      <p>📍 {pedido.direccion}</p>
                      {pedido.telefono && <p>📱 {pedido.telefono}</p>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/" className="text-green-600 hover:text-green-700 font-medium">
            ← Volver a Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
