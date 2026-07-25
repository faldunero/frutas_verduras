'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AdminGuard } from '@/components/AdminGuard'
import { db } from '@/lib/firebase'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { FiTrash2, FiEdit2 } from 'react-icons/fi'

interface Producto {
  id: string
  nombre: string
  categoria: 'frutas' | 'verduras' | 'organico' | 'otro'
  peso: string
  precio: number
  descripcion: string
  disponible: boolean
  destacado: boolean
  stock: number
  updatedAt?: any
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [cargando, setCargando] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('')
  const [filtroDisponible, setFiltroDisponible] = useState<string>('')

  useEffect(() => {
    fetchProductos()
  }, [])

  const fetchProductos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'productos'))
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Producto[]
      setProductos(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return

    try {
      await deleteDoc(doc(db, 'productos', id))
      setProductos(productos.filter((p) => p.id !== id))
      toast.success('Producto eliminado')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar producto')
    }
  }

  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = filtroCategoria === '' || producto.categoria === filtroCategoria
    const coincideDisponible =
      filtroDisponible === '' ||
      (filtroDisponible === 'si' && producto.disponible) ||
      (filtroDisponible === 'no' && !producto.disponible)

    return coincideBusqueda && coincideCategoria && coincideDisponible
  })

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Cargando productos...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
              <Link
                href="/admin/productos/nuevo"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                + Nuevo Producto
              </Link>
            </div>
            <p className="text-gray-600">Total: {productosFiltrados.length} de {productos.length} productos</p>
          </div>
        </div>

        {/* Filtros */}
        {productos.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar Producto
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ej: Manzana, Tomate..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 pr-10"
                    />
                    {busqueda && (
                      <button
                        onClick={() => setBusqueda('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    <option value="">Todas las categorías</option>
                    <option value="frutas">Frutas</option>
                    <option value="verduras">Verduras</option>
                    <option value="organico">Orgánico</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disponibilidad
                  </label>
                  <select
                    value={filtroDisponible}
                    onChange={(e) => setFiltroDisponible(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    <option value="">Todos</option>
                    <option value="si">Disponible (Sí)</option>
                    <option value="no">No Disponible (No)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {productos.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {productosFiltrados.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600 text-lg">No hay productos que coincidan con los filtros</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Disponible
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                        ⭐ Destacado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Última Actualización
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {productosFiltrados.map((producto) => (
                      <tr key={producto.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{producto.nombre}</p>
                            <p className="text-sm text-gray-600">{producto.descripcion}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          ${producto.precio.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          <span
                            className={`px-3 py-1 rounded text-sm font-medium ${
                              producto.stock > 0
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {producto.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-900 capitalize text-sm">
                          {producto.categoria}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded text-sm font-medium ${
                              producto.disponible
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {producto.disponible ? 'Sí' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-xl">
                            {producto.destacado ? '⭐' : '☆'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {producto.updatedAt ? (
                            <div>
                              <p>{new Date(producto.updatedAt?.toDate?.() || producto.updatedAt).toLocaleDateString('es-CL')}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(producto.updatedAt?.toDate?.() || producto.updatedAt).toLocaleTimeString('es-CL', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <Link
                            href={`/admin/productos/${producto.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                          >
                            <FiEdit2 size={16} /> Editar
                          </Link>
                          <button
                            onClick={() => handleDelete(producto.id)}
                            className="text-red-600 hover:text-red-800 font-medium inline-flex items-center gap-1"
                          >
                            <FiTrash2 size={16} /> Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Botón Ver Pedidos */}
        {productos.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <Link
              href="/admin/pedidos"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              📋 Ver Pedidos
            </Link>
          </div>
        )}
      </div>
    </AdminGuard>
  )
}
