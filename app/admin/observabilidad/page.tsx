'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { CONFIG } from '@/lib/config'
import { collection, query, onSnapshot, where, orderBy, limit } from 'firebase/firestore'
import Link from 'next/link'
import { FiArrowLeft, FiAlertTriangle, FiClock, FiCheckCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface Orden {
  id: string
  nombre: string
  email: string
  total: number
  estado: string
  items: any[]
  createdAt: any
  reservadoHasta?: any
}

interface Producto {
  id: string
  nombre: string
  unidades: number
}

export default function ObservabilidadPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [ordenesPendientes, setOrdenesPendientes] = useState<Orden[]>([])
  const [ordenesPagadas, setOrdenesPagadas] = useState<Orden[]>([])
  const [stockBajo, setStockBajo] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdmin) {
      router.push('/auth/login')
      return
    }

    const qPendiente = query(
      collection(db, 'ordenes'),
      where('estado', '==', 'pendiente'),
      orderBy('createdAt', 'desc'),
      limit(CONFIG.PENDING_ORDERS_LIMIT)
    )

    const unsubPendiente = onSnapshot(
      qPendiente,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Orden[]
        setOrdenesPendientes(data)
      },
      (error) => {
        console.error('Error órdenes pendientes:', error)
        toast.error('Error al cargar órdenes pendientes')
      }
    )

    const qPagada = query(
      collection(db, 'ordenes'),
      where('estado', '==', 'pagada'),
      orderBy('createdAt', 'desc'),
      limit(CONFIG.PAID_ORDERS_LIMIT)
    )

    const unsubPagada = onSnapshot(
      qPagada,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Orden[]
        setOrdenesPagadas(data)
      },
      (error) => {
        console.error('Error órdenes pagadas:', error)
        toast.error('Error al cargar órdenes pagadas')
      }
    )

    const qProductos = query(collection(db, 'productos'))
    const unsubProductos = onSnapshot(
      qProductos,
      (snapshot) => {
        const data = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((p: any) => (p.unidades || 0) < CONFIG.LOW_STOCK_THRESHOLD) as Producto[]
        setStockBajo(data.sort((a, b) => (a.unidades || 0) - (b.unidades || 0)))
        setLoading(false)
      },
      (error) => {
        console.error('Error productos:', error)
        toast.error('Error al cargar productos')
        setLoading(false)
      }
    )

    return () => {
      unsubPendiente()
      unsubPagada()
      unsubProductos()
    }
  }, [isAdmin, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando observabilidad...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="flex items-center text-green-600 hover:text-green-700 mb-4">
            <FiArrowLeft className="mr-2" /> Volver al admin
          </Link>
          <h1 className="text-4xl font-bold">Observabilidad</h1>
          <p className="text-gray-600 mt-2">Monitoreo en tiempo real de órdenes y stock</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Órdenes Pendientes</p>
                <p className="text-3xl font-bold text-orange-600">{ordenesPendientes.length}</p>
              </div>
              <FiClock className="text-4xl text-orange-200" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Órdenes Pagadas</p>
                <p className="text-3xl font-bold text-green-600">{ordenesPagadas.length}</p>
              </div>
              <FiCheckCircle className="text-4xl text-green-200" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Productos Stock Bajo</p>
                <p className="text-3xl font-bold text-red-600">{stockBajo.length}</p>
              </div>
              <FiAlertTriangle className="text-4xl text-red-200" />
            </div>
          </div>
        </div>

        {stockBajo.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-red-900 mb-4">Productos con Stock Bajo (&lt; {CONFIG.LOW_STOCK_THRESHOLD})</h2>
            <div className="space-y-2">
              {stockBajo.map((p) => (
                <div key={p.id} className="flex justify-between items-center bg-white p-3 rounded">
                  <span className="font-medium">{p.nombre}</span>
                  <span className="text-red-600 font-bold">{p.unidades || 0} disponibles</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b p-6">
            <h2 className="text-2xl font-bold">Órdenes Pendientes</h2>
            <p className="text-gray-600 text-sm mt-1">Esperando pago</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID Orden</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Cliente</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Items</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ordenesPendientes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Sin órdenes pendientes
                    </td>
                  </tr>
                ) : (
                  ordenesPendientes.map((orden) => (
                    <tr key={orden.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{orden.id.slice(0, 12)}...</code>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{orden.nombre}</p>
                          <p className="text-sm text-gray-600">{orden.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-green-600">${orden.total.toLocaleString('es-CL')}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">{orden.items?.length || 0} productos</td>
                      <td className="px-6 py-4">
                        <Link href="/admin/pedidos" className="text-green-600 hover:text-green-700 font-medium text-sm">
                          Ver orden →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b p-6">
            <h2 className="text-2xl font-bold">Órdenes Pagadas (Últimas 10)</h2>
            <p className="text-gray-600 text-sm mt-1">Compras confirmadas</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID Orden</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Cliente</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Items</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ordenesPagadas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      Sin órdenes pagadas
                    </td>
                  </tr>
                ) : (
                  ordenesPagadas.map((orden) => (
                    <tr key={orden.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{orden.id.slice(0, 12)}...</code>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{orden.nombre}</p>
                          <p className="text-sm text-gray-600">{orden.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-green-600">${orden.total.toLocaleString('es-CL')}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">{orden.items?.length || 0} productos</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
