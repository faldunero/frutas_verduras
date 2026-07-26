'use client'

import { useState, useEffect } from 'react'
import { AdminGuard } from '@/components/AdminGuard'
import { db } from '@/lib/firebase'
import { collection, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore'
import toast from 'react-hot-toast'

interface OrdenAnalisis {
  orderId: string
  nombreCliente: string
  idCliente: string
  costo: number
  venta: number
  fecha: string
  margen: number
  ganancia: number
  items: number
}

export default function CuadraturePage() {
  const [ordenes, setOrdenes] = useState<OrdenAnalisis[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [totales, setTotales] = useState({ costo: 0, venta: 0, ganancia: 0 })

  useEffect(() => {
    fetchOrdenes()
  }, [])

  const fetchOrdenes = async () => {
    try {
      const ordenesSnapshot = await getDocs(collection(db, 'ordenes'))
      const ordenesData: OrdenAnalisis[] = []

      console.log('Total órdenes encontradas:', ordenesSnapshot.size)

      for (const ordenDoc of ordenesSnapshot.docs) {
        const orden = ordenDoc.data()
        console.log('Procesando orden:', ordenDoc.id, orden)

        try {
          // Obtener datos del cliente - intentar con userId o clientId
          const userId = orden.userId || orden.clientId
          if (!userId) {
            console.warn('No se encontró userId para orden:', ordenDoc.id)
            continue
          }

          const clienteDoc = await getDoc(doc(db, 'users', userId))
          const nombreCliente = clienteDoc.exists()
            ? clienteDoc.data().nombre
            : 'Cliente desconocido'

          // Calcular costo y venta
          let costoTotal = 0
          let ventaTotal = orden.total || 0

          if (orden.items && Array.isArray(orden.items)) {
            for (const item of orden.items) {
              try {
                // Intentar obtener el costo del producto
                const productoDoc = await getDoc(doc(db, 'productos', item.id))
                if (productoDoc.exists()) {
                  const producto = productoDoc.data()
                  // Si existe costo, usarlo; si no, usar el precio como aproximación
                  const costo = producto.costo || producto.precio * 0.6
                  costoTotal += costo * (item.cantidad || 1)
                } else {
                  // Si no existe el producto, usar el precio del item * 60% como estimado
                  costoTotal += (item.precio || 0) * 0.6 * (item.cantidad || 1)
                }
              } catch (itemError) {
                console.error('Error procesando item:', itemError)
                costoTotal += (item.precio || 0) * 0.6 * (item.cantidad || 1)
              }
            }
          }

          const ganancia = ventaTotal - costoTotal
          const margen = ventaTotal > 0 ? ((ganancia / ventaTotal) * 100).toFixed(2) : '0'

          // Procesar fecha
          let fechaFormato = '-'
          if (orden.createdAt) {
            try {
              const fecha = typeof orden.createdAt === 'object' && orden.createdAt.toDate
                ? orden.createdAt.toDate()
                : new Date(orden.createdAt)
              fechaFormato = fecha.toLocaleDateString('es-CL')
            } catch (dateError) {
              console.error('Error procesando fecha:', dateError)
              fechaFormato = '-'
            }
          }

          ordenesData.push({
            orderId: ordenDoc.id,
            nombreCliente,
            idCliente: orden.clientId || orden.userId || '-',
            costo: costoTotal,
            venta: ventaTotal,
            fecha: fechaFormato,
            margen: parseFloat(margen),
            ganancia,
            items: orden.items?.length || 0,
          })
        } catch (ordenError) {
          console.error('Error procesando orden:', ordenError)
        }
      }

      // Ordenar por fecha descendente (solo órdenes con fecha válida)
      ordenesData.sort((a, b) => {
        if (a.fecha === '-' || b.fecha === '-') return 0
        const dateA = new Date(a.fecha).getTime()
        const dateB = new Date(b.fecha).getTime()
        return dateB - dateA
      })

      console.log('Órdenes procesadas exitosamente:', ordenesData.length)
      setOrdenes(ordenesData)

      // Calcular totales
      const totalCosto = ordenesData.reduce((sum, o) => sum + o.costo, 0)
      const totalVenta = ordenesData.reduce((sum, o) => sum + o.venta, 0)
      const totalGanancia = ordenesData.reduce((sum, o) => sum + o.ganancia, 0)

      setTotales({
        costo: totalCosto,
        venta: totalVenta,
        ganancia: totalGanancia,
      })
    } catch (error) {
      console.error('Error cargando órdenes:', error)
      toast.error(`Error al cargar órdenes: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setLoading(false)
    }
  }

  const ordenesFiltradas = ordenes.filter((orden) => {
    const coincideBusqueda =
      orden.nombreCliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      orden.idCliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      orden.orderId.toLowerCase().includes(busqueda.toLowerCase())
    return coincideBusqueda
  })

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Cargando cuadratura...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Cuadratura de Órdenes</h1>
            <p className="text-gray-600 mt-2">Análisis de rentabilidad por orden y cliente</p>
          </div>
        </div>

        {/* Resumen */}
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Total Órdenes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{ordenesFiltradas.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Costo Total</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                ${totales.costo.toLocaleString('es-CL', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Venta Total</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                ${totales.venta.toLocaleString('es-CL', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Ganancia Total</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ${totales.ganancia.toLocaleString('es-CL', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>

        {/* Filtro */}
        {ordenes.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow p-4">
              <input
                type="text"
                placeholder="Buscar por nombre, ID cliente u orden..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          </div>
        )}

        {/* Tabla */}
        {ordenes.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {ordenesFiltradas.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600 text-lg">No hay órdenes que coincidan con la búsqueda</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Orden ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        ID Cliente
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                        Costo
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                        Venta
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                        Ganancia
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                        Margen %
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Fecha
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {ordenesFiltradas.map((orden) => (
                      <tr key={orden.orderId} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono text-gray-900">{orden.orderId.slice(0, 8)}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{orden.nombreCliente}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{orden.idCliente}</td>
                        <td className="px-6 py-4 text-right text-sm text-red-600 font-medium">
                          ${orden.costo.toLocaleString('es-CL', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-blue-600 font-medium">
                          ${orden.venta.toLocaleString('es-CL', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <span
                            className={`px-3 py-1 rounded ${
                              orden.ganancia > 0
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            ${orden.ganancia.toLocaleString('es-CL', { maximumFractionDigits: 0 })}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <span
                            className={`px-3 py-1 rounded ${
                              orden.margen > 20
                                ? 'bg-green-100 text-green-800'
                                : orden.margen > 10
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {orden.margen.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{orden.fecha}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Sin órdenes */}
        {ordenes.length === 0 && (
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600 text-lg">No hay órdenes disponibles</p>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  )
}
