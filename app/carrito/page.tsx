'use client'

import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, clearCart, getSubtotal } = useCart()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const subtotal = getSubtotal()

  // Calcular IVA solo para productos con conIVA: true
  const ivaAmount = items.reduce((total, item) => {
    if (item.conIVA) {
      return total + Math.round(item.precio * item.cantidad * 0.19)
    }
    return total
  }, 0)

  const total = subtotal + ivaAmount

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para comprar')
      router.push('/auth/login')
      return
    }

    if (items.length === 0) {
      toast.error('El carrito está vacío')
      return
    }

    router.push('/checkout')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Carrito de Compras</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-8">
              Agrega productos del catálogo para comenzar a comprar
            </p>
            <Link
              href="/catalogo"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition"
            >
              Ver Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Tabla de productos */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold">Producto</th>
                      <th className="px-6 py-4 text-center font-bold">Precio</th>
                      <th className="px-6 py-4 text-center font-bold">Cantidad</th>
                      <th className="px-6 py-4 text-center font-bold">Subtotal</th>
                      <th className="px-6 py-4 text-center font-bold">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold">{item.nombre}</p>
                            <p className="text-sm text-gray-600">{item.descripcion}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          ${item.precio.toLocaleString('es-CL')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.cantidad - (item.unidadVenta === 'kilo' ? 0.5 : 1)
                                )
                              }
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <FiMinus />
                            </button>
                            <div className="text-center">
                              <span className="font-bold block">
                                {item.cantidad}
                              </span>
                              <span className="text-xs text-gray-600">
                                {item.unidadVenta === 'kilo' ? 'kilos' : 'unidades'}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.cantidad + (item.unidadVenta === 'kilo' ? 0.5 : 1)
                                )
                              }
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <FiPlus />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-bold">
                          ${(item.precio * item.cantidad).toLocaleString('es-CL')}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => {
                              removeItem(item.id)
                              toast.success('Producto eliminado')
                            }}
                            className="text-red-600 hover:text-red-800 font-bold"
                          >
                            <FiTrash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 text-right">
                <button
                  onClick={() => {
                    if (window.confirm('¿Vaciar carrito?')) {
                      clearCart()
                      toast.success('Carrito vaciado')
                    }
                  }}
                  className="text-red-600 hover:text-red-800 font-bold text-sm"
                >
                  Vaciar carrito
                </button>
              </div>
            </div>

            {/* Resumen */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                <h2 className="text-2xl font-bold mb-6">Resumen</h2>

                <div className="space-y-3 mb-6 pb-6 border-b">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toLocaleString('es-CL')}</span>
                  </div>
                  {ivaAmount > 0 && (
                    <div className="flex justify-between">
                      <span>IVA (19%):</span>
                      <span>${ivaAmount.toLocaleString('es-CL')}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mb-8 text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">${total.toLocaleString('es-CL')}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition mb-4"
                >
                  Proceder al Pago
                </button>

                <Link
                  href="/catalogo"
                  className="block text-center text-green-600 hover:text-green-700 font-medium text-sm"
                >
                  Seguir comprando
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
