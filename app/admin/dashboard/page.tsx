'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, onSnapshot } from 'firebase/firestore'
import Link from 'next/link'
import { FiArrowLeft, FiTrendingUp, FiShoppingCart, FiUsers, FiMap } from 'react-icons/fi'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import toast from 'react-hot-toast'

interface Orden {
  id: string
  nombre: string
  email: string
  total: number
  subtotal: number
  comuna: string
  items: any[]
  createdAt: any
}

interface AnalisisHistorico {
  id: string
  productoId: string
  nombre: string
  precioAnterior: number
  precioSugerido: number
  timestamp: any
}

export default function DashboardPage() {
  const { isAdmin, isAuthenticated } = useAuth()
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [analisisHistorico, setAnalisisHistorico] = useState<AnalisisHistorico[]>([])
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState<'diario' | 'semanal' | 'mensual'>('diario')

useEffect(() => {
    if (!isAdmin) return

    setLoading(true)

    // Listener en tiempo real para órdenes
    const q = query(collection(db, 'ordenes'))
    const unsubscribeOrdenes = onSnapshot(q, (snapshot) => {
      try {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Orden[]
        setOrdenes(data)
      } catch (error) {
        console.error('Error loading ordenes:', error)
        toast.error('Error al cargar órdenes')
      }
    })

    // Listener en tiempo real para análisis
    const qAnalisis = query(collection(db, 'analisisHistorico'))
    const unsubscribeAnalisis = onSnapshot(qAnalisis, (snapshot) => {
      try {
        const dataAnalisis = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AnalisisHistorico[]
        setAnalisisHistorico(dataAnalisis)
        setLoading(false)
      } catch (error) {
        console.error('Error loading analisis:', error)
        toast.error('Error al cargar análisis')
        setLoading(false)
      }
    })

    // Cleanup: desuscribirse cuando se desmonta
    return () => {
      unsubscribeOrdenes()
      unsubscribeAnalisis()
    }
  }, [isAdmin])

  // Calcular estadísticas
  const calcularEstadisticas = () => {
    const totalVentas = ordenes.reduce((sum, o) => sum + o.total, 0)
    const totalOrdenes = ordenes.length
    const totalClientes = new Set(ordenes.map((o) => o.email)).size
    const ventasPromedio = ordenes.length > 0 ? totalVentas / ordenes.length : 0

    return {
      totalVentas,
      totalOrdenes,
      totalClientes,
      ventasPromedio,
    }
  }

  // Ventas por período
  const calcularVentasPorPeriodo = () => {
    const datos: { [key: string]: number } = {}

    ordenes.forEach((orden) => {
      const fecha = new Date(orden.createdAt?.toDate?.() || orden.createdAt)
      let key = ''

      if (periodo === 'diario') {
        key = fecha.toLocaleDateString('es-CL')
      } else if (periodo === 'semanal') {
        const semana = Math.floor((fecha.getDate() - fecha.getDay() + 6) / 7)
        key = `Sem ${semana}`
      } else if (periodo === 'mensual') {
        key = fecha.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
      }

      datos[key] = (datos[key] || 0) + orden.total
    })

    return Object.entries(datos)
      .map(([periodo, total]) => ({
        periodo,
        total: Math.round(total),
      }))
      .sort((a, b) => a.periodo.localeCompare(b.periodo))
  }

  // Ventas por usuario (top 10)
  const calcularVentasPorUsuario = () => {
    const datos: { [key: string]: { email: string; total: number; ordenes: number } } = {}

    ordenes.forEach((orden) => {
      if (!datos[orden.email]) {
        datos[orden.email] = { email: orden.email, total: 0, ordenes: 0 }
      }
      datos[orden.email].total += orden.total
      datos[orden.email].ordenes += 1
    })

    return Object.values(datos)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
  }

  // Ventas por comuna
  const calcularVentasPorComuna = () => {
    const datos: { [key: string]: number } = {}

    ordenes.forEach((orden) => {
      datos[orden.comuna] = (datos[orden.comuna] || 0) + orden.total
    })

    return Object.entries(datos)
      .map(([nombre, value]) => ({
        name: nombre || 'Sin especificar',
        value: Math.round(value),
      }))
      .sort((a, b) => b.value - a.value)
  }

  // Productos más vendidos
  const calcularProductosMasVendidos = () => {
    const datos: { [key: string]: { nombre: string; cantidad: number; total: number } } = {}

    ordenes.forEach((orden) => {
      orden.items?.forEach((item: any) => {
        if (!datos[item.productoId]) {
          datos[item.productoId] = { nombre: item.nombre, cantidad: 0, total: 0 }
        }
        datos[item.productoId].cantidad += item.cantidad
        datos[item.productoId].total += item.subtotal
      })
    })

    return Object.values(datos)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 8)
  }

  // Variación de precios
  const calcularVariacionPrecios = () => {
    const datos: { [key: string]: { nombre: string; precios: number[] } } = {}

    analisisHistorico.forEach((analisis) => {
      if (!datos[analisis.productoId]) {
        datos[analisis.productoId] = { nombre: analisis.nombre, precios: [] }
      }
      datos[analisis.productoId].precios.push(analisis.precioSugerido)
    })

    return Object.entries(datos)
      .map(([_, data]) => {
        const precioMin = Math.min(...data.precios)
        const precioMax = Math.max(...data.precios)
        const variacion = precioMax - precioMin
        const porcentajeVariacion = (variacion / precioMin) * 100
        return {
          nombre: data.nombre,
          minimo: precioMin,
          maximo: precioMax,
          variacion: Math.round(variacion),
          porcentaje: porcentajeVariacion.toFixed(1),
        }
      })
      .filter((p) => p.variacion > 0)
      .sort((a, b) => b.variacion - a.variacion)
      .slice(0, 8)
  }

  // Comparativa períodos
  const calcularComparativaPeriodos = () => {
    const hoy = new Date()
    const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000)
    const hace60Dias = new Date(hoy.getTime() - 60 * 24 * 60 * 60 * 1000)

    const ventasUltimos30 = ordenes
      .filter((o) => new Date(o.createdAt?.toDate?.() || o.createdAt) >= hace30Dias)
      .reduce((sum, o) => sum + o.total, 0)

    const ventasAntes30Dias = ordenes
      .filter((o) => {
        const fecha = new Date(o.createdAt?.toDate?.() || o.createdAt)
        return fecha >= hace60Dias && fecha < hace30Dias
      })
      .reduce((sum, o) => sum + o.total, 0)

    const variacion = ventasUltimos30 - ventasAntes30Dias
    const porcentaje = ventasAntes30Dias > 0 ? (variacion / ventasAntes30Dias) * 100 : 0

    return {
      actual: ventasUltimos30,
      anterior: ventasAntes30Dias,
      variacion,
      porcentaje: porcentaje.toFixed(1),
    }
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16']

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

  const stats = calcularEstadisticas()
  const ventasPorPeriodo = calcularVentasPorPeriodo()
  const ventasPorUsuario = calcularVentasPorUsuario()
  const ventasPorComuna = calcularVentasPorComuna()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Análisis de ventas y comportamiento</p>
          </div>
          <Link
            href="/admin/productos"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft size={18} />
            Volver
          </Link>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Ventas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${stats.totalVentas.toLocaleString('es-CL')}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FiTrendingUp className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Órdenes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrdenes}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FiShoppingCart className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Clientes Únicos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalClientes}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FiUsers className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Venta Promedio</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${Math.round(stats.ventasPromedio).toLocaleString('es-CL')}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <FiMap className="text-orange-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Ventas por período */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">Ventas por Período</h2>
              <div className="flex gap-2 mt-3">
                {['diario', 'semanal', 'mensual'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriodo(p as any)}
                    className={`px-3 py-1 text-sm rounded font-medium transition ${
                      periodo === p
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {loading ? (
              <div className="h-80 flex items-center justify-center text-gray-500">Cargando...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ventasPorPeriodo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="periodo" />
                  <YAxis />
                  <Tooltip formatter={(value) => value ? `$${Number(value).toLocaleString('es-CL')}` : '-'} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Ventas por comuna */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Ventas por Comuna</h2>
            {loading ? (
              <div className="h-80 flex items-center justify-center text-gray-500">Cargando...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ventasPorComuna}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ventasPorComuna.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value ? `$${Number(value).toLocaleString('es-CL')}` : '-'} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top clientes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Top 10 Clientes</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Órdenes</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ventasPorUsuario.map((usuario, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-900">{usuario.email}</td>
                      <td className="px-4 py-2 text-gray-600">{usuario.ordenes}</td>
                      <td className="px-4 py-2 font-bold text-green-600">
                        ${usuario.total.toLocaleString('es-CL')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Comparativa períodos */}
        <div className="grid md:grid-cols-3 gap-4 mt-6 mb-6">
          {(() => {
            const comparativa = calcularComparativaPeriodos()
            return (
              <>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm text-gray-600 mb-2">Últimos 30 días</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    ${comparativa.actual.toLocaleString('es-CL')}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm text-gray-600 mb-2">30 días anteriores</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    ${comparativa.anterior.toLocaleString('es-CL')}
                  </p>
                </div>
                <div className={`bg-white rounded-lg shadow p-6 ${comparativa.variacion >= 0 ? 'border-l-4 border-green-600' : 'border-l-4 border-red-600'}`}>
                  <h3 className="text-sm text-gray-600 mb-2">Variación</h3>
                  <p className={`text-2xl font-bold ${comparativa.variacion >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {comparativa.variacion >= 0 ? '+' : ''}{comparativa.porcentaje}%
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    ${comparativa.variacion.toLocaleString('es-CL')}
                  </p>
                </div>
              </>
            )
          })()}
        </div>

        {/* Productos más vendidos */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-3">Productos Más Vendidos</h2>
          {loading ? (
            <div className="text-center py-6 text-gray-500 text-sm">Cargando...</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={calcularProductosMasVendidos()} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#10b981" name="Cantidad" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Variación de precios */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-base font-bold text-gray-900 mb-3">Variación de Precios por Producto</h2>
          {loading ? (
            <div className="text-center py-6 text-gray-500 text-sm">Cargando...</div>
          ) : calcularVariacionPrecios().length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm">No hay datos de variación disponibles</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Producto</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Mínimo</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Máximo</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Variación $</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Variación %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {calcularVariacionPrecios().map((producto, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-1 text-gray-900 font-medium">{producto.nombre}</td>
                      <td className="px-3 py-1 text-gray-600">${producto.minimo.toLocaleString('es-CL')}</td>
                      <td className="px-3 py-1 text-gray-600">${producto.maximo.toLocaleString('es-CL')}</td>
                      <td className="px-3 py-1 font-bold text-blue-600">
                        ${producto.variacion.toLocaleString('es-CL')}
                      </td>
                      <td className="px-3 py-1 font-bold text-orange-600">{producto.porcentaje}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
