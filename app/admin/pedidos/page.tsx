'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useConfig } from '@/hooks/useConfig'
import { db } from '@/lib/firebase'
import { collection, getDocs, query } from 'firebase/firestore'
import { FiFilter, FiRefreshCw } from 'react-icons/fi'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Orden {
  id: string
  nombre: string
  email: string
  telefono: string
  calle: string
  numero: string
  anexo: string
  comuna: string
  metodoPago: string
  estado: string
  subtotal: number
  impuestos: number
  envio: number
  total: number
  items: Array<{
    productoId: string
    nombre: string
    cantidad: number
    precioUnitario: number
    subtotal: number
  }>
  createdAt: any
}

const DEFAULT_STATUS_COLORS: { [key: string]: string } = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  confirmada: 'bg-blue-100 text-blue-800',
  despachada: 'bg-purple-100 text-purple-800',
  entregada: 'bg-green-100 text-green-800',
  cancelada: 'bg-red-100 text-red-800',
}

const DEFAULT_STATUS_LABELS: { [key: string]: string } = {
  pendiente: 'Pendiente de Pago',
  confirmada: 'Confirmada',
  despachada: 'Despachada',
  entregada: 'Entregada',
  cancelada: 'Cancelada',
}

export default function PedidosPage() {
  const { isAdmin, isAuthenticated } = useAuth()
  const { config = { estados: [] } } = useConfig()
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<string>('todos')
  const [fechaDesde, setFechaDesde] = useState<string>('')
  const [fechaHasta, setFechaHasta] = useState<string>('')
  const [busquedaUsuario, setBusquedaUsuario] = useState<string>('')
  const [busquedaOrden, setBusquedaOrden] = useState<string>('')
  const [itemsPorPagina, setItemsPorPagina] = useState(20)
  const [paginaActual, setPaginaActual] = useState(1)

  // Crear mapeos de colores y etiquetas basados en config
  const statusColors: { [key: string]: string } = (config?.estados || []).reduce((acc, estado) => ({
    ...acc,
    [estado]: DEFAULT_STATUS_COLORS[estado] || 'bg-gray-100 text-gray-800',
  }), {})

  const statusLabels: { [key: string]: string } = (config?.estados || []).reduce((acc, estado) => ({
    ...acc,
    [estado]: DEFAULT_STATUS_LABELS[estado] || estado.charAt(0).toUpperCase() + estado.slice(1),
  }), {})

  const loadOrdenes = async () => {
    try {
      setLoading(true)
      const q = query(collection(db, 'ordenes'))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Orden[]
      // Ordenar por fecha descendente en el cliente
      data.sort((a, b) => {
        const dateA = new Date(a.createdAt?.toDate?.() || a.createdAt).getTime()
        const dateB = new Date(b.createdAt?.toDate?.() || b.createdAt).getTime()
        return dateB - dateA
      })
      setOrdenes(data)
    } catch (error) {
      console.error('Error loading ordenes:', error)
      toast.error('Error al cargar pedidos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadOrdenes()
    }
  }, [isAdmin])

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-2xl font-bold mb-2">Acceso denegado</h1>
            <p className="text-gray-600">
              Solo los administradores pueden ver esta página
            </p>
          </div>
        </div>
      </div>
    )
  }

  const ordenesFiltradas = ordenes
    .filter((o) => (filtro === 'todos' ? true : o.estado === filtro))
    .filter((o) => {
      if (!busquedaUsuario) return true
      return (
        o.nombre.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
        o.email.toLowerCase().includes(busquedaUsuario.toLowerCase())
      )
    })
    .filter((o) => {
      if (!busquedaOrden) return true
      return o.id.toLowerCase().includes(busquedaOrden.toLowerCase())
    })
    .filter((o) => {
      if (!fechaDesde && !fechaHasta) return true
      const fechaOrden = new Date(o.createdAt?.toDate?.() || o.createdAt)
      if (fechaDesde) {
        const desde = new Date(fechaDesde)
        desde.setHours(0, 0, 0, 0)
        if (fechaOrden < desde) return false
      }
      if (fechaHasta) {
        const hasta = new Date(fechaHasta)
        hasta.setHours(23, 59, 59, 999)
        if (fechaOrden > hasta) return false
      }
      return true
    })

  // Paginación
  const totalPaginas = Math.ceil(ordenesFiltradas.length / itemsPorPagina)
  const inicio = (paginaActual - 1) * itemsPorPagina
  const fin = inicio + itemsPorPagina
  const ordenesPaginadas = ordenesFiltradas.slice(inicio, fin)

  // Reset paginación cuando cambian filtros
  useEffect(() => {
    setPaginaActual(1)
  }, [filtro, fechaDesde, fechaHasta, busquedaUsuario, busquedaOrden])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Gestión de Pedidos</h1>
          <button
            onClick={loadOrdenes}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <FiRefreshCw size={20} />
            Actualizar
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FiFilter size={20} />
            <span className="font-bold">Filtros:</span>
          </div>

          {/* Filtro por Estado */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Por estado:</h3>
            <div className="flex flex-wrap gap-2">
              {['todos', ...(config?.estados || [])].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setFiltro(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      filtro === status
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {status === 'todos' ? 'Todos' : statusLabels[status]}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Búsqueda */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Búsqueda:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Usuario (nombre o email):</label>
                <input
                  type="text"
                  placeholder="Buscar usuario..."
                  value={busquedaUsuario}
                  onChange={(e) => setBusquedaUsuario(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Número de orden:</label>
                <input
                  type="text"
                  placeholder="Buscar orden..."
                  value={busquedaOrden}
                  onChange={(e) => setBusquedaOrden(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            </div>
            {(busquedaUsuario || busquedaOrden) && (
              <button
                onClick={() => {
                  setBusquedaUsuario('')
                  setBusquedaOrden('')
                }}
                className="mt-2 text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>

          {/* Filtro por Fecha */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Por fecha:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Desde:</label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Hasta:</label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            </div>
            {(fechaDesde || fechaHasta) && (
              <button
                onClick={() => {
                  setFechaDesde('')
                  setFechaHasta('')
                }}
                className="text-sm text-green-600 hover:text-green-700 mt-2 font-medium"
              >
                Limpiar fechas
              </button>
            )}
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Total: {ordenesFiltradas.length} pedidos
            </p>
            {ordenesFiltradas.length > 0 && (
              <select
                value={itemsPorPagina}
                onChange={(e) => {
                  setItemsPorPagina(Number(e.target.value))
                  setPaginaActual(1)
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
              >
                <option value={20}>20 por página</option>
                <option value={40}>40 por página</option>
                <option value={100}>100 por página</option>
              </select>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Cargando pedidos...</p>
          </div>
        ) : ordenesFiltradas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">
              No hay pedidos con el filtro seleccionado
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6">
              {ordenesPaginadas.map((orden) => (
              <Link
                key={orden.id}
                href={`/orden-confirmada/${orden.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="grid md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Orden</p>
                    <p className="font-mono font-bold text-sm break-all">{orden.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cliente</p>
                    <p className="font-bold">{orden.nombre}</p>
                    <p className="text-sm text-gray-600">{orden.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-xl font-bold text-green-600">
                      ${orden.total.toLocaleString('es-CL')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <p
                      className={`font-bold px-3 py-1 rounded-full text-sm w-fit ${
                        statusColors[orden.estado]
                      }`}
                    >
                      {statusLabels[orden.estado]}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha</p>
                    <p className="font-medium">
                      {new Date(
                        orden.createdAt?.toDate?.() || orden.createdAt
                      ).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-bold text-gray-700 mb-2">Dirección:</p>
                      <p className="text-sm">
                        {orden.calle} {orden.numero}
                        {orden.anexo && ` ${orden.anexo}`}, {orden.comuna}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-700 mb-2">Contacto:</p>
                      <p className="text-sm">📞 {orden.telefono}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-bold text-gray-700 mb-2">
                      Productos ({orden.items.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {orden.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-100 px-2 py-1 rounded text-xs"
                        >
                          {item.nombre} x{item.cantidad}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
              ))}
            </div>

            {/* Paginación */}
            {ordenesFiltradas.length > itemsPorPagina && (
              <div className="mt-8 flex flex-col sm:flex-row justify-between items-center bg-white rounded-lg shadow p-4 gap-4">
                <div className="text-sm text-gray-600">
                  Mostrando {inicio + 1}-{Math.min(fin, ordenesFiltradas.length)} de{' '}
                  {ordenesFiltradas.length} órdenes
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                    disabled={paginaActual === 1}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg font-medium transition"
                  >
                    ← Anterior
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-700">
                    Página {paginaActual} de {totalPaginas}
                  </span>
                  <button
                    onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                    disabled={paginaActual === totalPaginas}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg font-medium transition"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
