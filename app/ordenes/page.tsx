'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import Link from 'next/link'
import { FiPackage, FiArrowLeft } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface Orden {
  id: string
  nombre: string
  email: string
  telefono: string
  calle: string
  numero: string
  anexo: string
  comuna: string
  metodoPago: string
  estado: string
  subtotal: number
  impuestos: number
  envio: number
  total: number
  items: Array<{
    productoId: string
    nombre: string
    cantidad: number
    precioUnitario: number
    subtotal: number
  }>
  createdAt: any
}

const statusColors: { [key: string]: string } = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  confirmada: 'bg-blue-100 text-blue-800',
  despachada: 'bg-purple-100 text-purple-800',
  entregada: 'bg-green-100 text-green-800',
  cancelada: 'bg-red-100 text-red-800',
}

const statusLabels: { [key: string]: string } = {
  pendiente: 'Pendiente de Pago',
  confirmada: 'Confirmada',
  despachada: 'Despachada',
  entregada: 'Entregada',
  cancelada: 'Cancelada',
}

export default function OrdenesPage() {
  const { user, isAuthenticated } = useAuth()
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrdenes = async () => {
      if (!isAuthenticated || !user?.uid) {
        setLoading(false)
        return
      }

      try {
        const q = query(
          collection(db, 'ordenes'),
          where('userId', '==', user.uid)
        )
        const snapshot = await getDocs(q)
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Orden[]
        // Ordenar por fecha descendente en el cliente
        data.sort((a, b) => {
          const dateA = new Date(a.createdAt?.toDate?.() || a.createdAt).getTime()
          const dateB = new Date(b.createdAt?.toDate?.() || b.createdAt).getTime()
          return dateB - dateA
        })
        setOrdenes(data)
      } catch (error) {
        console.error('Error loading ordenes:', error)
        toast.error('Error al cargar tus órdenes')
      } finally {
        setLoading(false)
      }
    }

    loadOrdenes()
  }, [user?.uid, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-2xl font-bold mb-2">Inicia sesión para continuar</h1>
            <p className="text-gray-600 mb-8">
              Necesitas tener una cuenta para ver tus órdenes
            </p>
            <Link
              href="/auth/login"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700"
            >
              Ir a Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Cargando tus órdenes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-green-600 hover:text-green-700">
            <FiArrowLeft size={24} />
          </Link>
          <h1 className="text-4xl font-bold">Mis Órdenes</h1>
        </div>

        {ordenes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-gray-700">No tienes órdenes</h2>
            <p className="text-gray-600 mb-8">
              Aún no has realizado ninguna compra. ¡Comienza a comprar!
            </p>
            <Link
              href="/catalogo"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-bold"
            >
              Ver Catálogo
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {ordenes.map((orden) => (
              <Link
                key={orden.id}
                href={`/orden-confirmada/${orden.id}`}
                className="block bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Orden</p>
                    <p className="font-mono text-lg font-bold text-gray-900 break-all">
                      {orden.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      ${orden.total.toLocaleString('es-CL')}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Fecha</p>
                    <p className="font-medium">
                      {new Date(orden.createdAt?.toDate?.() || orden.createdAt).toLocaleDateString(
                        'es-CL'
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <p
                      className={`font-medium px-3 py-1 rounded-full text-sm w-fit ${
                        statusColors[orden.estado] || statusColors['pendiente']
                      }`}
                    >
                      {statusLabels[orden.estado] || orden.estado}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Productos</p>
                    <p className="font-medium">{orden.items.length} artículos</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Entrega</p>
                    <p className="font-medium">{orden.comuna}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">Productos:</p>
                  <div className="flex flex-wrap gap-2">
                    {orden.items.map((item, idx) => (
                      <span key={idx} className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {item.nombre} x{item.cantidad}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
