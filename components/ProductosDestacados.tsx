'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { db, Producto } from '@/lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import toast from 'react-hot-toast'
import { FiHeart } from 'react-icons/fi'

const categoryLabels: { [key: string]: string } = {
  frutas: 'Frutas',
  verduras: 'Verduras',
  organico: 'Orgánico',
  otro: 'Otros',
}

export function ProductosDestacados() {
  const [productos, setProductos] = useState<(Producto & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()

  useEffect(() => {
    fetchProductos()
  }, [])

  const fetchProductos = async () => {
    try {
      const q = query(
        collection(db, 'productos'),
        where('destacado', '==', true)
      )
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as (Producto & { id: string })[]
      const filtrados = data.filter((p) => p.disponible === true)
      setProductos(filtrados.slice(0, 4))
    } catch (error) {
      console.error('Error fetching productos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAgregar = (producto: Producto & { id: string }) => {
    addItem(producto, 1)
    toast.success(`${producto.nombre} agregado al carrito`)
  }

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-4xl font-bold mb-8">Productos Destacados</h2>
        <div className="text-center py-12">
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-4xl font-bold mb-8">Productos Destacados</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {productos.map((producto) => (
          <div
            key={producto.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
          >
            {producto.imagenUrl ? (
              <img
                src={producto.imagenUrl}
                alt={producto.nombre}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="bg-gradient-to-br from-green-100 to-green-200 h-48 flex items-center justify-center text-6xl">
                {categoryLabels[producto.categoria] || 'Otros'}
              </div>
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{producto.nombre}</h3>
                <button
                  onClick={() => {
                    if (isInWishlist(producto.id)) {
                      removeFromWishlist(producto.id)
                      toast.success('Eliminado de favoritos')
                    } else {
                      addToWishlist(producto)
                      toast.success('Agregado a favoritos')
                    }
                  }}
                  className={`p-2 rounded transition ${
                    isInWishlist(producto.id)
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-400 hover:text-red-600'
                  }`}
                >
                  <FiHeart size={20} fill={isInWishlist(producto.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
              <p className="text-gray-600 text-sm mb-3">{producto.descripcion}</p>
              <div className="flex justify-between items-center">
                <span className="text-green-600 font-bold text-lg">
                  ${producto.precio.toLocaleString('es-CL')}
                </span>
                <button
                  onClick={() => handleAgregar(producto)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition text-sm"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-8">
        <Link
          href="/catalogo"
          className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition"
        >
          Ver Todos los Productos
        </Link>
      </div>
    </section>
  )
}
