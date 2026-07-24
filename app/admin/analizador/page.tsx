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

  useEffect(() => {
    if (isAdmin) {
      loadProductos()
    }
  }, [isAdmin])

  const loadProductos = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'productos'))
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Producto[]
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/productos" className="text-green-600 hover:text-green-700">
            <FiArrowLeft size={24} />
          </Link>
          <h1 className="text-4xl font-bold">Analizador de Venta</h1>
        </div>

        {/* Margen Global */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Configuración General</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Margen General (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={margenGlobal}
                  onChange={(e) => setMargenGlobal(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
                <span className="text-sm font-bold text-green-600">%</span>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Margen aplicado</p>
              <p className="text-2xl font-bold text-green-600">{margenGlobal}%</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Cargando productos...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {productos.map((producto) => {
              const promedioCompetencia = calcularPromedioCompetencia(producto)
              const precioSugerido = calcularPrecioSugerido(producto)
              const esCompetitivo = precioSugerido <= promedioCompetencia && promedioCompetencia > 0

              return (
                <div
                  key={producto.id}
                  className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600"
                >
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Info Producto */}
                    <div>
                      <h3 className="text-xl font-bold mb-2">{producto.nombre}</h3>
                      <p className="text-sm text-gray-600 mb-4">{producto.categoria}</p>

                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Precio Actual:
                          </label>
                          <p className="text-2xl font-bold text-green-600">
                            ${producto.precio.toLocaleString('es-CL')}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Costo del Producto:
                          </label>
                          <input
                            type="number"
                            value={producto.costo || ''}
                            onChange={(e) =>
                              handleCostoChange(producto.id, parseFloat(e.target.value) || 0)
                            }
                            placeholder="Ingresa el costo"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Análisis */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-bold mb-4">Análisis de Precio</h4>

                      {promedioCompetencia > 0 && (
                        <div className="mb-4 pb-4 border-b">
                          <p className="text-sm text-gray-600">Promedio Competencia:</p>
                          <p className="text-2xl font-bold text-blue-600">
                            ${Math.round(promedioCompetencia).toLocaleString('es-CL')}
                          </p>
                        </div>
                      )}

                      {producto.costo && (
                        <div>
                          <p className="text-sm text-gray-600">Precio Sugerido ({margenGlobal}%):</p>
                          <p className="text-2xl font-bold text-green-600 mb-2">
                            ${precioSugerido.toLocaleString('es-CL')}
                          </p>

                          {promedioCompetencia > 0 && (
                            <div
                              className={`text-sm font-bold px-3 py-1 rounded inline-block ${
                                esCompetitivo
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {esCompetitivo
                                ? `✓ Competitivo (${(precioSugerido - promedioCompetencia).toLocaleString('es-CL')} más bajo)`
                                : `✗ Más caro (${(precioSugerido - promedioCompetencia).toLocaleString('es-CL')} más alto)`}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Competencia */}
                  <div className="border-t pt-6">
                    <h4 className="font-bold mb-4">Precios de Competencia</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[0, 1].map((idx) => (
                        <div key={idx} className="border rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-600 mb-3">
                            Competencia {idx + 1}
                          </p>
                          <input
                            type="text"
                            placeholder="Empresa"
                            value={producto.competencia?.[idx]?.empresa || ''}
                            onChange={(e) =>
                              handleCompetenciaChange(producto.id, idx, 'empresa', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                          />
                          <input
                            type="number"
                            placeholder="Precio"
                            value={producto.competencia?.[idx]?.precio || ''}
                            onChange={(e) =>
                              handleCompetenciaChange(producto.id, idx, 'precio', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botón Guardar */}
                  <button
                    onClick={() => guardarProducto(producto)}
                    disabled={saving}
                    className="mt-6 flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
                  >
                    <FiSave size={18} />
                    {saving ? 'Guardando...' : 'Guardar Análisis'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
