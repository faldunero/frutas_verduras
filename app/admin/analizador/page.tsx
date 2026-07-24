'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase'
import { collection, getDocs, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore'
import Link from 'next/link'
import { FiSave } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface Producto {
  id: string
  nombre: string
  precio: number
  costo?: number
  competencia?: Array<{ empresa: string; precio: number }>
  categoria: string
  unidadVenta?: 'unidad' | 'kilo'
}

export default function AnalizadorPage() {
  const { isAdmin, isAuthenticated } = useAuth()
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [margenGlobal, setMargenGlobal] = useState<number>(30)
  const [saving, setSaving] = useState(false)
  const [busqueda, setBusqueda] = useState<string>('')

  useEffect(() => {
    if (isAdmin) {
      loadProductos()
    }
  }, [isAdmin])

  const loadProductos = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'productos'))
      const data = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre)) as Producto[]
      setProductos(data)
    } catch (error) {
      console.error('Error loading productos:', error)
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const updateProducto = async (productoId: string, updates: any) => {
    try {
      setSaving(true)
      await updateDoc(doc(db, 'productos', productoId), updates)
      setProductos((prev) =>
        prev.map((p) => (p.id === productoId ? { ...p, ...updates } : p))
      )
      toast.success('Producto actualizado')
    } catch (error) {
      console.error('Error updating producto:', error)
      toast.error('Error al actualizar producto')
    } finally {
      setSaving(false)
    }
  }

  const handleCostoChange = (productoId: string, costo: number) => {
    setProductos((prev) =>
      prev.map((p) => (p.id === productoId ? { ...p, costo } : p))
    )
  }

  const handleCompetenciaChange = (
    productoId: string,
    index: number,
    field: 'empresa' | 'precio',
    value: any
  ) => {
    setProductos((prev) =>
      prev.map((p) => {
        if (p.id === productoId) {
          const competencia = [...(p.competencia || [{ empresa: '', precio: 0 }, { empresa: '', precio: 0 }])]
          if (field === 'empresa') {
            competencia[index].empresa = value
          } else {
            competencia[index].precio = parseFloat(value) || 0
          }
          return { ...p, competencia: competencia.slice(0, 2) }
        }
        return p
      })
    )
  }

  const calcularPromedioCompetencia = (producto: Producto): number => {
    if (!producto.competencia || producto.competencia.length === 0) return 0
    const precios = producto.competencia
      .filter((c) => c.precio > 0)
      .map((c) => c.precio)
    return precios.length > 0 ? precios.reduce((a, b) => a + b, 0) / precios.length : 0
  }

  const calcularPrecioSugerido = (producto: Producto): number => {
    if (!producto.costo) return 0
    return Math.round(producto.costo * (1 + margenGlobal / 100))
  }

  const guardarProducto = async (producto: Producto) => {
    try {
      setSaving(true)
      const promedioCompetencia = calcularPromedioCompetencia(producto)
      const precioSugerido = calcularPrecioSugerido(producto)

      // Guardar en histórico
      await addDoc(collection(db, 'analisisHistorico'), {
        productoId: producto.id,
        nombre: producto.nombre,
        unidadVenta: producto.unidadVenta || 'kilo',
        precioAnterior: producto.precio,
        precioSugerido: precioSugerido,
        costo: producto.costo || 0,
        competencia: producto.competencia || [],
        promedioCompetencia: promedioCompetencia,
        margenGlobal: margenGlobal,
        timestamp: new Date(),
        createdAt: serverTimestamp(),
      })

      // Actualizar producto con precio sugerido y datos de análisis
      await updateDoc(doc(db, 'productos', producto.id), {
        precio: precioSugerido,
        costo: producto.costo || 0,
        competencia: producto.competencia || [],
        updatedAt: serverTimestamp(),
      })

      // Actualizar estado local y reiniciar campos
      setProductos((prev) =>
        prev.map((p) =>
          p.id === producto.id
            ? {
                ...p,
                precio: precioSugerido,
                costo: 0,
                competencia: [
                  { empresa: '', precio: 0 },
                  { empresa: '', precio: 0 },
                ],
              }
            : p
        )
      )

      toast.success('Análisis guardado y precio actualizado')
    } catch (error) {
      console.error('Error guardando análisis:', error)
      toast.error('Error al guardar análisis')
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-2xl font-bold mb-2">Acceso denegado</h1>
          </div>
        </div>
      </div>
    )
  }

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Analizador de Venta</h1>
            <Link href="/admin/productos" className="text-green-600 hover:text-green-700 font-medium">
              Volver
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Filtros y Margen */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Buscador */}
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

            {/* Margen Global */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Margen General (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={margenGlobal}
                  onChange={(e) => setMargenGlobal(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
                <span className="text-2xl font-bold text-green-600 min-w-16">{margenGlobal}%</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Total: <span className="font-bold text-green-600">{productosFiltrados.length} productos</span>
          </p>
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Cargando productos...</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">No hay productos que coincidan con tu búsqueda</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Producto</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Unidad</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Costo</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Comp 1</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Comp 2</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Promedio</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Sugerido</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Estado</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Guardar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productosFiltrados.map((producto, idx) => {
                    const promedioCompetencia = calcularPromedioCompetencia(producto)
                    const precioSugerido = calcularPrecioSugerido(producto)
                    const esCompetitivo =
                      precioSugerido <= promedioCompetencia && promedioCompetencia > 0

                    return (
                      <tr key={producto.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <p className="font-medium text-gray-900 text-sm">{producto.nombre}</p>
                        </td>

                        <td className="px-3 py-2 text-gray-900 text-xs">
                          <span className="bg-gray-200 px-2 py-0.5 rounded text-xs">
                            {producto.unidadVenta === 'unidad' ? 'U' : 'K'}
                          </span>
                        </td>

                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={producto.costo || ''}
                            onChange={(e) =>
                              handleCostoChange(producto.id, parseFloat(e.target.value) || 0)
                            }
                            placeholder="0"
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-600"
                          />
                        </td>

                        <td className="px-3 py-2">
                          <div className="space-y-0.5 w-24">
                            <input
                              type="text"
                              placeholder="Emp"
                              value={producto.competencia?.[0]?.empresa || ''}
                              onChange={(e) =>
                                handleCompetenciaChange(producto.id, 0, 'empresa', e.target.value)
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-600"
                            />
                            <input
                              type="number"
                              placeholder="$"
                              value={producto.competencia?.[0]?.precio || ''}
                              onChange={(e) =>
                                handleCompetenciaChange(producto.id, 0, 'precio', e.target.value)
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-600"
                            />
                          </div>
                        </td>

                        <td className="px-3 py-2">
                          <div className="space-y-0.5 w-24">
                            <input
                              type="text"
                              placeholder="Emp"
                              value={producto.competencia?.[1]?.empresa || ''}
                              onChange={(e) =>
                                handleCompetenciaChange(producto.id, 1, 'empresa', e.target.value)
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-600"
                            />
                            <input
                              type="number"
                              placeholder="$"
                              value={producto.competencia?.[1]?.precio || ''}
                              onChange={(e) =>
                                handleCompetenciaChange(producto.id, 1, 'precio', e.target.value)
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-600"
                            />
                          </div>
                        </td>

                        <td className="px-3 py-2 text-gray-900 text-sm">
                          {promedioCompetencia > 0 ? (
                            <span className="font-semibold text-blue-600">
                              ${Math.round(promedioCompetencia).toLocaleString('es-CL')}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                        <td className="px-3 py-2 text-gray-900 text-sm">
                          {producto.costo ? (
                            <span className="font-semibold text-green-600">
                              ${precioSugerido.toLocaleString('es-CL')}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                        <td className="px-3 py-2">
                          {promedioCompetencia > 0 && producto.costo ? (
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                esCompetitivo
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {esCompetitivo ? '✓ OK' : '✗'}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                        <td className="px-3 py-2">
                          <button
                            onClick={() => guardarProducto(producto)}
                            disabled={saving}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-1 px-2 rounded text-xs inline-flex items-center gap-1"
                          >
                            <FiSave size={14} />
                            Guardar
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
        )}
      </div>
    </div>
  )
}
