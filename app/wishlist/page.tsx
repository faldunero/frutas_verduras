'use client'

import Link from 'next/link'
import { useWishlist } from '@/hooks/useWishlist'
import { useCart } from '@/hooks/useCart'
import { FiTrash2, FiShoppingCart } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlist()
  const { addItem } = useCart()

  const handleAgregar = (producto: any) => {
    addItem(producto, 1)
    toast.success(`${producto.nombre} agregado al carrito`)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Mi Wishlist</h1>

          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">❤️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Wishlist Vacía</h2>
            <p className="text-gray-600 mb-8">No tienes productos guardados aún</p>
            <Link
              href="/catalogo"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg"
            >
              Explorar Productos
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mi Wishlist ({items.length})</h1>
          <button
            onClick={clearWishlist}
            className="text-red-600 hover:text-red-700 font-medium text-sm"
          >
            Limpiar wishlist
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((producto) => (
            <div key={producto.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              {producto.imagenUrl ? (
                <img src={producto.imagenUrl} alt={producto.nombre} className="w-full h-48 object-cover"/>
              ) : (
                <div className="bg-green-100 h-48 flex items-center justify-center text-5xl"></div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{producto.nombre}</h3>
                <p className="text-gray-600 text-sm mb-2">{producto.descripcion}</p>
                <p className="text-gray-500 text-xs mb-3">Peso: {producto.peso}</p>

                <div className="flex justify-between items-center mb-3">
                  <span className="text-green-600 font-bold text-lg">
                    ${producto.precio.toLocaleString('es-CL')}
                  </span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Stock: {producto.stock}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAgregar(producto)}
                    disabled={producto.stock === 0}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <FiShoppingCart size={16}/>
                    Carrito
                  </button>
                  <button
                    onClick={() => removeItem(producto.id)}
                    className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded"
                  >
                    <FiTrash2 size={18}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/" className="text-green-600 hover:text-green-700 font-medium">
            ← Volver a Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
