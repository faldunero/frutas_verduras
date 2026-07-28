'use client'

import { useEffect, useState, useMemo } from 'react'
import { db, Producto } from '@/lib/firebase'
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore'
import { useCart } from '@/hooks/useCart'
import { useConfig } from '@/hooks/useConfig'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { FiSearch } from 'react-icons/fi'
import { StockBadge } from '@/components/StockBadge'


export default function CatalogoPage() {
  const { config } = useConfig()
  const [productos, setProductos] = useState<(Producto & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [categoria, setCategoria] = useState<string>('todos')
  const [busqueda, setBusqueda] = useState<string>('')
  const [precioMin, setPrecioMin] = useState<number>(0)
  const [precioMax, setPrecioMax] = useState<number>(50000)
  const [soloDisponibles, setSoloDisponibles] = useState<boolean>(true)
  const [ordenar, setOrdenar] = useState<'relevancia' | 'precio-asc' | 'precio-desc' | 'nombre'>('relevancia')
  const [selectedProduct, setSelectedProduct] = useState<(Producto & { id: string }) | null>(null)
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState<number>(1)
  const { addItem } = useCart()

  // Filtrar y ordenar productos
  const productosFiltrados = useMemo(() => {
    let resultado = productos.filter((p) => {
      const coincideBusqueda =
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(busqueda.toLowerCase())

      const coincidePrecio = p.precio >= precioMin && p.precio <= precioMax

      const cantidadDisponible = (p.unidades || 0) as number
      const coincideDisponibilidad = !soloDisponibles || cantidadDisponible > 0

      return coincideBusqueda && coincidePrecio && coincideDisponibilidad
    })

    // Aplicar ordenamiento
    switch (ordenar) {
      case 'precio-asc':
        resultado.sort((a, b) => a.precio - b.precio)
        break
      case 'precio-desc':
        resultado.sort((a, b) => b.precio - a.precio)
        break
      case 'nombre':
        resultado.sort((a, b) => a.nombre.localeCompare(b.nombre))
        break
      case 'relevancia':
      default:
        // Mantener orden por defecto
        break
    }

    return resultado
  }, [productos, busqueda, precioMin, precioMax, soloDisponibles, ordenar])

  useEffect(() => {
    setLoading(true)
    let q

    if (categoria === 'todos') {
      q = query(collection(db, 'productos'))
    } else {
      q = query(
        collection(db, 'productos'),
        where('categoria', '==', categoria)
      )
    }

    // Listener en tiempo real
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      try {
        const data = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as any),
          })) as (Producto & { id: string })[]
        setProductos(data)
        setLoading(false)
      } catch (error) {
        console.error('Error processing productos:', error)
        toast.error('Error al cargar productos')
        setLoading(false)
      }
    })

    // Cleanup: desuscribirse cuando se desmonta o cambia categoría
    return () => unsubscribe()
  }, [categoria])

  const handleAgregar = (producto: Producto & { id: string }) => {
    setSelectedProduct(producto)
    setCantidadSeleccionada(1)
  }

  const handleConfirmarAgregar = () => {
    if (!selectedProduct) return

    // Validar que hay suficiente stock
    const stockActual = (selectedProduct.unidades || 0) as number
    if (cantidadSeleccionada > stockActual) {
      toast.error(
        `Stock insuficiente. Disponible: ${stockActual}, Solicitado: ${cantidadSeleccionada}`
      )
      return
    }

    addItem(selectedProduct, cantidadSeleccionada)
    toast.success(`${selectedProduct.nombre} agregado al carrito`)
    setSelectedProduct(null)
    setCantidadSeleccionada(1)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Catálogo de Productos</h1>
          <p className="text-gray-600 text-lg">
            Explora nuestros productos frescos y de calidad
          </p>
        </div>

        {/* Búsqueda */}
        <div className="mb-8">
          <div className="relative">
            <FiSearch className="absolute left-4 top-3 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
        </div>

        {/* Ordenamiento */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Ordenar por:</h2>
          <select
            value={ordenar}
            onChange={(e) => setOrdenar(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="relevancia">Relevancia</option>
            <option value="precio-asc">Precio: Menor a Mayor</option>
            <option value="precio-desc">Precio: Mayor a Menor</option>
            <option value="nombre">Nombre: A-Z</option>
          </select>
        </div>

        {/* Filtros */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="grid md:grid-cols-4 gap-6">
            {/* Categoría */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Categoría</h3>
              <div className="space-y-2">
                {['todos', ...config.categorias].map((cat) => (
                  <label key={cat} className="flex items-center">
                    <input
                      type="radio"
                      name="categoria"
                      value={cat}
                      checked={categoria === cat}
                      onChange={(e) => setCategoria(e.target.value)}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="ml-2 text-gray-700 capitalize">
                      {cat === 'todos' ? 'Todos' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Precio */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Rango de Precio</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    value={precioMin}
                    onChange={(e) => setPrecioMin(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Máximo</label>
                  <input
                    type="number"
                    value={precioMax}
                    onChange={(e) => setPrecioMax(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <p className="text-sm text-gray-700 font-medium">
                  ${precioMin.toLocaleString()} - ${precioMax.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Disponibilidad */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Disponibilidad</h3>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={soloDisponibles}
                  onChange={(e) => setSoloDisponibles(e.target.checked)}
                  className="w-4 h-4 text-green-600 rounded"
                />
                <span className="ml-2 text-gray-700">Solo disponibles</span>
              </label>
            </div>

            {/* Resumen */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Resultados</h3>
              <p className="text-3xl font-bold text-green-600">{productosFiltrados.length}</p>
              <p className="text-sm text-gray-600">productos encontrados</p>
              {(busqueda || precioMin > 0 || precioMax < 50000 || !soloDisponibles || categoria !== 'todos') && (
                <button
                  onClick={() => {
                    setBusqueda('')
                    setCategoria('todos')
                    setPrecioMin(0)
                    setPrecioMax(50000)
                    setSoloDisponibles(true)
                  }}
                  className="text-green-600 hover:text-green-700 text-sm font-medium mt-2"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Productos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando productos...</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 text-lg mb-4">
              {productos.length === 0
                ? 'No hay productos disponibles'
                : 'No hay productos que coincidan con tus filtros'}
            </p>
            <button
              onClick={() => {
                setBusqueda('')
                setCategoria('todos')
                setPrecioMin(0)
                setPrecioMax(50000)
                setSoloDisponibles(true)
              }}
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {productosFiltrados.map((producto) => (
              <div
                key={producto.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition flex flex-col h-full"
              >
                <Link href={`/producto/${producto.id}`} className="flex-1 flex flex-col">
                  {producto.imagenUrl ? (
                    <img
                      src={producto.imagenUrl}
                      alt={producto.nombre}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-green-100 to-green-200 h-48 flex items-center justify-center">
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg mb-1">{producto.nombre}</h3>
                    <p className="text-gray-600 text-sm mb-2">{producto.descripcion}</p>
                    <p className="text-gray-500 text-xs mb-3">Peso: {producto.peso}</p>

                    <div className="mt-auto">
                      {(producto.unidades || 0) > 0 ? (
                        <div className="flex justify-between items-center">
                          <span className="text-green-600 font-bold text-lg">
                            ${producto.precio.toLocaleString('es-CL')}
                          </span>
                          <StockBadge producto={producto} />
                        </div>
                      ) : (
                        <div className="text-center py-2 bg-gray-100 rounded text-gray-600 font-medium">
                          Agotado
                        </div>
                      )}
                    </div>
                  </div>
                </Link>

                <div className="p-4 pt-0">
                  {(producto.unidades || 0) > 0 ? (
                    <button
                      onClick={() => handleAgregar(producto)}
                      className="w-full bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition font-medium"
                    >
                      Agregar
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-400 text-white px-3 py-2 rounded cursor-not-allowed font-medium"
                    >
                      Fuera de stock
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to home */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-block text-green-600 hover:text-green-700 font-medium"
          >
            ← Volver a inicio
          </Link>
        </div>
      </div>

      {/* Modal de cantidad */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">{selectedProduct.nombre}</h2>

            <p className="text-gray-600 mb-6">
              {selectedProduct.unidadVenta === 'kilo'
                ? '¿Cuántos kilos deseas?'
                : '¿Cuántas unidades deseas?'}
            </p>

            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setCantidadSeleccionada(Math.max(1, cantidadSeleccionada - (selectedProduct.unidadVenta === 'kilo' ? 0.5 : 1)))}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded font-bold"
              >
                −
              </button>

              <input
                type="number"
                value={cantidadSeleccionada}
                onChange={(e) => setCantidadSeleccionada(Math.max(0, parseFloat(e.target.value) || 0))}
                step={selectedProduct.unidadVenta === 'kilo' ? '0.5' : '1'}
                min="0"
                className="flex-1 text-center px-3 py-2 border-2 border-green-600 rounded text-lg font-bold"
              />

              <button
                onClick={() => setCantidadSeleccionada(cantidadSeleccionada + (selectedProduct.unidadVenta === 'kilo' ? 0.5 : 1))}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded font-bold"
              >
                +
              </button>
            </div>

            <p className="text-lg font-bold text-green-600 mb-6">
              ${(selectedProduct.precio * cantidadSeleccionada).toLocaleString('es-CL')}
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setSelectedProduct(null)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-2 px-4 rounded transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarAgregar}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition"
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
