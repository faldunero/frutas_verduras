'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AdminGuard } from '@/components/AdminGuard'
import { db } from '@/lib/firebase'
import { collection, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore'
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
}

const productosIniciales = [
  { nombre: 'Manzana Roja', categoria: 'frutas', peso: '1 kg', descripcion: 'Manzanas rojas frescas' },
  { nombre: 'Manzana Verde', categoria: 'frutas', peso: '1 kg', descripcion: 'Manzanas verdes ácidas' },
  { nombre: 'Manzana Royal Gala', categoria: 'frutas', peso: '1 kg', descripcion: 'Manzana royal gala dulce' },
  { nombre: 'Manzana Fuji', categoria: 'frutas', peso: '1 kg', descripcion: 'Manzana fuji crujiente' },
  { nombre: 'Manzana Pink Lady', categoria: 'frutas', peso: '1 kg', descripcion: 'Manzana pink lady agridulce' },
  { nombre: 'Plátano', categoria: 'frutas', peso: '1 kg', descripcion: 'Plátanos maduros' },
  { nombre: 'Naranja Valencia', categoria: 'frutas', peso: '1 kg', descripcion: 'Naranjas jugosas' },
  { nombre: 'Limón', categoria: 'frutas', peso: '500 g', descripcion: 'Limones frescos' },
  { nombre: 'Fresa', categoria: 'frutas', peso: '250 g', descripcion: 'Fresas rojas dulces' },
  { nombre: 'Arándano', categoria: 'frutas', peso: '200 g', descripcion: 'Arándanos frescos' },
  { nombre: 'Pera', categoria: 'frutas', peso: '1 kg', descripcion: 'Peras dulces' },
  { nombre: 'Sandía', categoria: 'frutas', peso: '4 kg', descripcion: 'Sandía refrescante' },
  { nombre: 'Melón', categoria: 'frutas', peso: '2 kg', descripcion: 'Melón aromático' },
  { nombre: 'Melón Calampeño', categoria: 'frutas', peso: '2 kg', descripcion: 'Melón calampeño fresco' },
  { nombre: 'Melón Tuna', categoria: 'frutas', peso: '2 kg', descripcion: 'Melón tuna dulce' },
  { nombre: 'Uva Verde', categoria: 'frutas', peso: '500 g', descripcion: 'Uvas verdes' },
  { nombre: 'Uva Roja', categoria: 'frutas', peso: '500 g', descripcion: 'Uvas rojas' },
  { nombre: 'Palta Hass', categoria: 'frutas', peso: '500 g', descripcion: 'Palta Hass cremosa' },
  { nombre: 'Palta Negra de la Cruz', categoria: 'frutas', peso: '500 g', descripcion: 'Palta negra de la cruz' },
  { nombre: 'Palta Fuerte', categoria: 'frutas', peso: '500 g', descripcion: 'Palta fuerte' },
  { nombre: 'Lechuga', categoria: 'verduras', peso: '300 g', descripcion: 'Lechuga fresca' },
  { nombre: 'Tomate', categoria: 'verduras', peso: '1 kg', descripcion: 'Tomates rojos' },
  { nombre: 'Zanahoria', categoria: 'verduras', peso: '1 kg', descripcion: 'Zanahorias dulces' },
  { nombre: 'Brócoli', categoria: 'verduras', peso: '400 g', descripcion: 'Brócoli fresco' },
  { nombre: 'Coliflor', categoria: 'verduras', peso: '400 g', descripcion: 'Coliflor blanca' },
  { nombre: 'Cebolla Blanca', categoria: 'verduras', peso: '1 kg', descripcion: 'Cebollas blancas' },
  { nombre: 'Cebolla Morada', categoria: 'verduras', peso: '1 kg', descripcion: 'Cebollas moradas' },
  { nombre: 'Ajo', categoria: 'verduras', peso: '500 g', descripcion: 'Ajo fresco' },
  { nombre: 'Pimiento Rojo', categoria: 'verduras', peso: '500 g', descripcion: 'Pimientos rojos' },
  { nombre: 'Pimiento Verde', categoria: 'verduras', peso: '500 g', descripcion: 'Pimientos verdes' },
  { nombre: 'Espinaca', categoria: 'verduras', peso: '200 g', descripcion: 'Espinaca fresca' },
  { nombre: 'Acelga', categoria: 'verduras', peso: '300 g', descripcion: 'Acelga fresca' },
  { nombre: 'Papas', categoria: 'verduras', peso: '2 kg', descripcion: 'Papas blancas' },
  { nombre: 'Choclo', categoria: 'verduras', peso: '500 g', descripcion: 'Choclo fresco' },
  { nombre: 'Tomate Orgánico', categoria: 'organico', peso: '500 g', descripcion: 'Tomate orgánico' },
  { nombre: 'Lechuga Orgánica', categoria: 'organico', peso: '250 g', descripcion: 'Lechuga orgánica' },
  { nombre: 'Zanahoria Orgánica', categoria: 'organico', peso: '500 g', descripcion: 'Zanahoria orgánica' },
  { nombre: 'Brócoli Orgánico', categoria: 'organico', peso: '300 g', descripcion: 'Brócoli orgánico' },
  { nombre: 'Espinaca Orgánica', categoria: 'organico', peso: '200 g', descripcion: 'Espinaca orgánica' },
  { nombre: 'Manzana Orgánica', categoria: 'organico', peso: '1 kg', descripcion: 'Manzana orgánica' },
  { nombre: 'Plátano Orgánico', categoria: 'organico', peso: '1 kg', descripcion: 'Plátano orgánico' },
  { nombre: 'Fresas Orgánicas', categoria: 'organico', peso: '250 g', descripcion: 'Fresas orgánicas' },
  { nombre: 'Huevos Camperos', categoria: 'otro', peso: '6 unidades', descripcion: 'Huevos camperos' },
  { nombre: 'Queso Fresco', categoria: 'otro', peso: '250 g', descripcion: 'Queso fresco' },
  { nombre: 'Queso Cheddar', categoria: 'otro', peso: '200 g', descripcion: 'Queso cheddar' },
  { nombre: 'Almendras', categoria: 'otro', peso: '200 g', descripcion: 'Almendras naturales' },
  { nombre: 'Nueces', categoria: 'otro', peso: '200 g', descripcion: 'Nueces frescas' },
  { nombre: 'Avellanas', categoria: 'otro', peso: '150 g', descripcion: 'Avellanas selectas' },
]

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
                  <input
                    type="text"
                    placeholder="Ej: Manzana, Tomate..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
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
