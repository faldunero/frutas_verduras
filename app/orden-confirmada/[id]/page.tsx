'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import Link from 'next/link'
import { FiCheckCircle } from 'react-icons/fi'

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
  comentarios: string
  createdAt: string
}

export default function OrdenConfirmadaPage() {
  const params = useParams()
  const ordenId = params.id as string
  const [orden, setOrden] = useState<Orden | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrden = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'ordenes', ordenId))
        if (docSnap.exists()) {
          setOrden({
            id: docSnap.id,
            ...docSnap.data(),
          } as Orden)
        }
      } catch (error) {
        console.error('Error loading orden:', error)
      } finally {
        setLoading(false)
      }
    }
    loadOrden()
  }, [ordenId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Cargando información de tu orden...</p>
          </div>
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
            <p className="text-gray-600 mb-8">
              No pudimos encontrar la información de tu orden
            </p>
            <Link
              href="/"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700"
            >
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
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <div className="text-6xl text-green-600 mx-auto mb-4">✓</div>
            <h1 className="text-3xl font-bold mb-2">¡Orden Confirmada!</h1>
            <p className="text-gray-600 text-lg">
              Tu compra ha sido recibida exitosamente
            </p>
          </div>

          {/* Número de orden */}
          <div className="bg-green-50 border-2 border-green-600 rounded-lg p-4 text-center mb-8">
            <p className="text-gray-700 text-sm">Número de Orden</p>
            <p className="text-2xl font-bold text-green-600 font-mono break-all">
              {orden.id}
            </p>
          </div>

          {/* Instrucciones de pago */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-8">
            <h2 className="font-bold text-blue-900 mb-2">Próximos pasos</h2>
            <p className="text-blue-800 text-sm mb-3">
              Realiza una transferencia bancaria con los siguientes datos:
            </p>
            <div className="bg-white p-3 rounded text-sm space-y-1">
              <p>
                <strong>Monto:</strong> ${orden.total.toLocaleString('es-CL')}
              </p>
              <p>
                <strong>Banco:</strong> [Tu banco]
              </p>
              <p>
                <strong>Cuenta:</strong> [Tu cuenta]
              </p>
              <p>
                <strong>Concepto:</strong> Orden {orden.id}
              </p>
            </div>
            <p className="text-blue-800 text-xs mt-3">
              Tu pedido será despachado el día siguiente de recibida la transferencia
            </p>
          </div>
        </div>

        {/* Detalles de la orden */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Detalles de tu Orden</h2>

          {/* Datos personales */}
          <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-3">Datos de Contacto</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Nombre</p>
                <p className="font-medium">{orden.nombre}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium">{orden.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Teléfono</p>
                <p className="font-medium">{orden.telefono}</p>
              </div>
              <div>
                <p className="text-gray-600">Método de Pago</p>
                <p className="font-medium">Transferencia Bancaria</p>
              </div>
            </div>
          </div>

          {/* Dirección de entrega */}
          <div className="mb-8 pb-8 border-b">
            <h3 className="font-bold text-gray-900 mb-3">Dirección de Entrega</h3>
            <div className="text-sm">
              <p className="font-medium">
                {orden.calle} {orden.numero}
                {orden.anexo && `, ${orden.anexo}`}
              </p>
              <p className="text-gray-600">{orden.comuna}</p>
            </div>
          </div>

          {/* Productos */}
          <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-4">Productos</h3>
            <div className="space-y-3">
              {orden.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-start py-3 border-b last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.nombre}</p>
                    <p className="text-sm text-gray-600">
                      Cantidad: {item.cantidad}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${item.precioUnitario.toLocaleString('es-CL')}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${item.subtotal.toLocaleString('es-CL')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen de costos */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-medium">
                ${orden.subtotal.toLocaleString('es-CL')}
              </span>
            </div>
            {orden.impuestos > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-700">Impuestos (19%):</span>
                <span className="font-medium">
                  ${orden.impuestos.toLocaleString('es-CL')}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-700">Envío:</span>
              <span className="font-medium">Gratis</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span className="text-green-600">
                ${orden.total.toLocaleString('es-CL')}
              </span>
            </div>
          </div>
        </div>

        {/* Notas importantes */}
        <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 mb-8">
          <h3 className="font-bold text-yellow-900 mb-2">Información Importante</h3>
          <ul className="text-yellow-800 text-sm space-y-2">
            <li>✓ Tu pedido será recibido el día anterior y despachado el día siguiente</li>
            <li>✓ No existe devolución de productos</li>
            <li>✓ En caso de inconformidad, comunícate con nosotros para abonarte el valor</li>
            <li>✓ Tienes 2 días para solicitar devolución y 2 días más para transferencia</li>
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <Link
            href="/ordenes"
            className="block text-center bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-bold"
          >
            Ver mis órdenes
          </Link>
          <Link
            href="/catalogo"
            className="block text-center border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg hover:bg-green-50 font-bold"
          >
            Seguir comprando
          </Link>
          <Link
            href="/"
            className="block text-center text-green-600 hover:text-green-700 font-medium"
          >
            ← Volver a inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
