'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import Link from 'next/link'
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface Producto {
  id: string
  nombre: string
  precio: number
  costo?: number
  competencia?: Array<{ empresa: string; precio: number }>
  categoria: string
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
    await updateProducto(producto.id, {
      costo: producto.costo || 0,
      competencia: producto.competencia || [],
    })
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-2xl font-bold mb-2">Acceso denegado</h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-full px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/productos" className="text-green-600 hover:text-green-700">
            <FiArrowLeft size={24} />
          </Link>
          <h1 className="text-4xl font-bold">Analizador de Venta</h1>
        </div>

        {/* Filtros y Margen */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="grid md:grid-cols-3 gap-4 items-end">
            {/* Buscador */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar Producto</label>
              <input
                type="text"
                placeholder="Ej: Manzana, Tomate..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
              />
            </div>

            {/* Margen Global */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Margen General (%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={margenGlobal}
                  onChange={(e) => setMargenGlobal(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                />
                <span className="text-lg font-bold text-green-600 min-w-12">{margenGlobal}%</span>
              </div>
            </div>

            {/* Resultados */}
            <div className="text-right">
              <p className="text-sm text-gray-600">Total: <span className="font-bold text-green-600">{productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase())).length} productos</span></p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Cargando productos...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">Producto</th>
                  <th className="px-4 py-3 text-center font-bold">Precio Actual</th>
                  <th className="px-4 py-3 text-center font-bold">Costo</th>
                  <th className="px-4 py-3 text-center font-bold">Comp. 1</th>
                  <th className="px-4 py-3 text-center font-bold">Comp. 2</th>
                  <th className="px-4 py-3 text-center font-bold">Promedio Comp.</th>
                  <th className="px-4 py-3 text-center font-bold">Precio Sugerido</th>
                  <th className="px-4 py-3 text-center font-bold">Estado</th>
                  <th className="px-4 py-3 text-center font-bold">Guardar</th>
                </tr>
              </thead>
              <tbody>
                {productos
                  .filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
                  .map((producto, idx) => {
                  const promedioCompetencia = calcularPromedioCompetencia(producto)
                  const precioSugerido = calcularPrecioSugerido(producto)
                  const esCompetitivo =
                    precioSugerido <= promedioCompetencia && promedioCompetencia > 0

                  return (
                    <tr
                      key={producto.id}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      {/* Producto */}
                      <td className="px-4 py-3 font-bold">{producto.nombre}</td>

                      {/* Precio Actual */}
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-green-600">
                          ${producto.precio.toLocaleString('es-CL')}
                        </span>
                      </td>

                      {/* Costo */}
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={producto.costo || ''}
                          onChange={(e) =>
                            handleCostoChange(producto.id, parseFloat(e.target.value) || 0)
                          }
                          placeholder="0"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-600"
                        />
                      </td>

                      {/* Competencia 1 */}
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <input
                            type="text"
                            placeholder="Empresa"
                            value={producto.competencia?.[0]?.empresa || ''}
                            onChange={(e) =>
                              handleCompetenciaChange(producto.id, 0, 'empresa', e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-600"
                          />
                          <input
                            type="number"
                            placeholder="Precio"
                            value={producto.competencia?.[0]?.precio || ''}
                            onChange={(e) =>
                              handleCompetenciaChange(producto.id, 0, 'precio', e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-center focus:outline-none focus:ring-2 focus:ring-green-600"
                          />
                        </div>
                      </td>

                      {/* Competencia 2 */}
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <input
                            type="text"
                            placeholder="Empresa"
                            value={producto.competencia?.[1]?.empresa || ''}
                            onChange={(e) =>
                              handleCompetenciaChange(producto.id, 1, 'empresa', e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-600"
                          />
                          <input
                            type="number"
                            placeholder="Precio"
                            value={producto.competencia?.[1]?.precio || ''}
                            onChange={(e) =>
                              handleCompetenciaChange(producto.id, 1, 'precio', e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-center focus:outline-none focus:ring-2 focus:ring-green-600"
                          />
                        </div>
                      </td>

                      {/* Promedio */}
                      <td className="px-4 py-3 text-center">
                        {promedioCompetencia > 0 ? (
                          <span className="font-bold text-blue-600">
                            ${Math.round(promedioCompetencia).toLocaleString('es-CL')}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* Precio Sugerido */}
                      <td className="px-4 py-3 text-center">
                        {producto.costo ? (
                          <span className="font-bold text-green-600">
                            ${precioSugerido.toLocaleString('es-CL')}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3 text-center">
                        {promedioCompetencia > 0 && producto.costo ? (
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded ${
                              esCompetitivo
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {esCompetitivo ? '✓ Competitivo' : '✗ Caro'}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Guardar */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => guardarProducto(producto)}
                          disabled={saving}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:bg-gray-400 font-medium"
                        >
                          <FiSave size={16} />
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
