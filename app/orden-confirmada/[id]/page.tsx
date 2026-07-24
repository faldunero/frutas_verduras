'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'

interface Orden {
  id: string
  nombre: string
  email: string
  telefono: string
  direccion: string
  metodoPago: string
  estado: string
  subtotal: number
  impuestos: number
  envio: number
  total: number
  items: Array<{
    nombre: string
    cantidad: number
    precioUnitario: number
    subtotal: number
  }>
  createdAt: any
}

export default function OrdenConfirmadaPage() {
  const params = useParams()
  const ordenId = params.id as string
  const [orden, setOrden] = useState<Orden | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrden()
  }, [ordenId])

  const fetchOrden = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'ordenes', ordenId))
      if (docSnap.exists()) {
        setOrden({
          id: docSnap.id,
          ...docSnap.data(),
        } as Orden)
      } else {
        toast.error('Orden no encontrada')
      }
    } catch (error) {
      console.error('Error fetching orden:', error)
      toast.error('Error al cargar la orden')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando orden...</p>
        </div>
      </div>
    )
  }

  if (!orden) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold mb-2">Orden no encontrada</h1>
            <Link href="/" className="inline-block text-green-600 hover:text-green-700 mt-4">
              Volver a inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Confirmación */}
        <div className="bg-white rounded-lg shadow p-8 mb-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">¡Orden Confirmada!</h1>
          <p className="text-gray-600 mb-2">Tu orden ha sido recibida exitosamente</p>
          <p className="text-gray-500">Número de orden: <span className="font-bold">{orden.id}</span></p>
        </div>

        {/* Detalles */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Información de Entrega */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Información de Entrega</h2>

            <div className="space-y-3 text-gray-700">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="font-medium">{orden.nombre}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{orden.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="font-medium">{orden.telefono}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Dirección</p>
                <p className="font-medium">{orden.direccion}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Método de Pago</p>
                <p className="font-medium capitalize">
                  {orden.metodoPago === 'transfer'
                    ? 'Transferencia Bancaria'
                    : orden.metodoPago === 'efectivo'
                    ? 'Efectivo al Recibir'
                    : 'Tarjeta de Crédito/Débito'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <p className="font-medium capitalize bg-yellow-100 text-yellow-800 px-3 py-1 rounded inline-block">
                  {orden.estado}
                </p>
              </div>
            </div>
          </div>

          {/* Resumen de Orden */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Resumen de Orden</h2>

            {/* Productos */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="space-y-3">
                {orden.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{item.nombre}</p>
                      <p className="text-gray-500">x{item.cantidad} @ ${item.precioUnitario.toLocaleString()}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      ${item.subtotal.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totales */}
            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${orden.subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span>Impuestos (19%):</span>
                <span>${orden.impuestos.toLocaleString()}</span>
              </div>

              <div className="flex justify-between pb-3 border-b border-gray-200">
                <span>Envío:</span>
                <span>Gratis</span>
              </div>

              <div className="flex justify-between items-center pt-3">
                <span className="font-bold">Total:</span>
                <span className="text-2xl font-bold text-green-600">
                  ${orden.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Próximos Pasos */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-bold text-blue-900 mb-3">Próximos Pasos</h3>
          <ul className="space-y-2 text-blue-800">
            <li>✅ Tu orden ha sido confirmada</li>
            <li>📧 Recibirás un email de confirmación en breve</li>
            <li>🚚 Entregaremos dentro de 24 horas</li>
            <li>📱 Te contactaremos por teléfono para confirmar la entrega</li>
          </ul>
        </div>

        {/* Botones */}
        <div className="flex gap-4 mt-8">
          <Link
            href="/ordenes"
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 text-center font-medium"
          >
            Ver Mis Órdenes
          </Link>
          <Link
            href="/catalogo"
            className="flex-1 border-2 border-green-600 text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 text-center font-medium"
          >
            Seguir Comprando
          </Link>
        </div>
      </div>
    </div>
  )
}
