'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi'

export default function CartPage() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const { items, removeItem, updateQuantity, getSubtotal, getTotal } = useCart()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando carrito...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const subtotal = getSubtotal()
  const impuestos = Math.round(subtotal * 0.19)
  const total = getTotal()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Tu Carrito</h1>

          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Carrito Vacío</h2>
            <p className="text-gray-600 mb-8">No tienes productos en tu carrito</p>
            <Link
              href="/catalogo"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded"
            >
              Ver Catálogo
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Tu Carrito</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Productos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-gray-200 p-6 hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{item.nombre}</h3>
                    <p className="text-gray-600 text-sm">{item.descripcion}</p>
                    <p className="text-green-600 font-bold mt-2">
                      ${item.precio.toLocaleString()}
                    </p>
                  </div>

                  {/* Controles de cantidad */}
                  <div className="flex items-center gap-4 mx-6">
                    <button
                      onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <FiMinus size={20} />
                    </button>
                    <span className="text-lg font-bold w-8 text-center">{item.cantidad}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <FiPlus size={20} />
                    </button>
                  </div>

                  {/* Subtotal y botón eliminar */}
                  <div className="text-right w-32">
                    <p className="font-bold text-gray-900">
                      ${(item.precio * item.cantidad).toLocaleString()}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-800 mt-2 flex items-center justify-center gap-1 w-full"
                    >
                      <FiTrash2 size={18} />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumen</h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Impuestos (19%):</span>
                  <span>${impuestos.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Envío:</span>
                  <span>Gratis</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-green-600">
                  ${total.toLocaleString()}
                </span>
              </div>

              <Link
                href="/checkout"
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded text-center mb-3"
              >
                Proceder al Pago
              </Link>

              <Link
                href="/catalogo"
                className="block w-full border-2 border-green-600 text-green-600 hover:bg-green-50 font-bold py-3 px-4 rounded text-center"
              >
                Seguir Comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
