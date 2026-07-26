'use client'

import { useState, useEffect, useRef } from 'react'
import { AdminGuard } from '@/components/AdminGuard'
import { useConfig } from '@/hooks/useConfig'
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
  const { config = {} } = useConfig()
  const isMountedRef = useRef(true)
  const [ordenes, setOrdenes] = useState<OrdenAnalisis[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [totales, setTotales] = useState({ costo: 0, venta: 0, ganancia: 0 })
  const [itemsPorPagina, setItemsPorPagina] = useState(20)
  const [paginaActual, setPaginaActual] = useState(1)

  useEffect(() => {
    // Indicar que el componente está montado
    isMountedRef.current = true

    // Cargar órdenes solo si el componente está montado
    if (isMountedRef.current) {
      fetchOrdenes()
    }

    // Cleanup: marcar como desmontado para prevenir memory leaks
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const fetchOrdenes = async () => {
    try {
      // Valor por defecto del margen (30%)
      const MARGEN_DEFECTO = 0.30

      // Cargar margen global desde config
      let margenGlobal = MARGEN_DEFECTO
      try {
        const configDoc = await getDoc(doc(db, 'config', 'general'))
        if (configDoc.exists()) {
          const margenValue = configDoc.data().margen
          // El margen se guarda como número (30), convertir a decimal (0.30)
          margenGlobal = typeof margenValue === 'number' ? margenValue / 100 : MARGEN_DEFECTO
          console.log('Margen cargado desde config:', margenGlobal)
        }
      } catch (configError) {
        console.log('Config no encontrado, usando margen por defecto:', MARGEN_DEFECTO)
      }

      const obtenerMargen = (): number => {
        return margenGlobal
      }

      const ordenesSnapshot = await getDocs(collection(db, 'ordenes'))
      const ordenesData: OrdenAnalisis[] = []

      console.log('Total órdenes encontradas:', ordenesSnapshot.size)

      // Procesar órdenes
      for (const ordenDoc of ordenesSnapshot.docs) {
        const orden = ordenDoc.data()
        console.log('Procesando orden:', ordenDoc.id)

        try {
          // Obtener datos del cliente
          const userId = orden.userId || orden.clientId
          let nombreCliente = 'Cliente desconocido'

          if (userId) {
            try {
              const clienteDoc = await getDoc(doc(db, 'users', userId))
              if (clienteDoc.exists()) {
                nombreCliente = clienteDoc.data().nombre || nombreCliente
              }
            } catch (userError) {
              // Continuar sin datos del cliente
            }
          }

          // Procesar fecha de la orden
          let fechaOrden = new Date()
          let fechaFormato = '-'
          if (orden.createdAt) {
            try {
              fechaOrden = typeof orden.createdAt === 'object' && orden.createdAt.toDate
                ? orden.createdAt.toDate()
                : new Date(orden.createdAt)
              fechaFormato = fechaOrden.toLocaleDateString('es-CL')
            } catch (dateError) {
              fechaFormato = '-'
            }
          }

          // Obtener margen vigente
          const margenOrden = obtenerMargen()

          // Calcular costo y venta usando margen histórico
          let costoTotal = 0
          let ventaTotal = orden.total || 0

          if (orden.items && Array.isArray(orden.items)) {
            for (const item of orden.items) {
              const precio = typeof item.precio === 'number' ? item.precio : 0
              const cantidad = typeof item.cantidad === 'number' ? item.cantidad : 1
              costoTotal += precio * (1 - margenOrden) * cantidad
            }
          }

          const ganancia = ventaTotal - costoTotal
          const margen = ventaTotal > 0 ? ((ganancia / ventaTotal) * 100).toFixed(2) : '0'

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

      // Solo actualizar estado si el componente sigue montado
      if (!isMountedRef.current) return

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
      if (isMountedRef.current) {
        toast.error(`Error al cargar órdenes: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }

  const ordenesFiltradas = ordenes.filter((orden) => {
    const coincideBusqueda =
      orden.nombreCliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      orden.idCliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      orden.orderId.toLowerCase().includes(busqueda.toLowerCase())

    let coincideFecha = true
    if ((fechaInicio || fechaFin) && orden.fecha && orden.fecha !== '-') {
      try {
        const inicioMatch = fechaInicio.match(/(\d+)\/(\d+)\/(\d+)/)
        const finMatch = fechaFin.match(/(\d+)\/(\d+)\/(\d+)/)
        const ordenMatch = orden.fecha.match(/(\d+)\/(\d+)\/(\d+)/)

        if (inicioMatch) {
          const [, diaInicio, mesInicio, añoInicio] = inicioMatch
          const inicio = new Date(parseInt(añoInicio), parseInt(mesInicio) - 1, parseInt(diaInicio))

          if (ordenMatch) {
            const [, diaOrden, mesOrden, añoOrden] = ordenMatch
            const ordenDate = new Date(parseInt(añoOrden), parseInt(mesOrden) - 1, parseInt(diaOrden))
            if (ordenDate < inicio) coincideFecha = false
          }
        }

        if (finMatch && coincideFecha) {
          const [, diaFin, mesFin, añoFin] = finMatch
          const fin = new Date(parseInt(añoFin), parseInt(mesFin) - 1, parseInt(diaFin))

          if (ordenMatch) {
            const [, diaOrden, mesOrden, añoOrden] = ordenMatch
            const ordenDate = new Date(parseInt(añoOrden), parseInt(mesOrden) - 1, parseInt(diaOrden))
            if (ordenDate > fin) coincideFecha = false
          }
        }
      } catch (dateFilterError) {
        // Si hay error en el filtro de fecha, mostrar la orden
        coincideFecha = true
      }
    }

    return coincideBusqueda && coincideFecha
  })

  // Recalcular totales según filtros
  useEffect(() => {
    const totalCosto = ordenesFiltradas.reduce((sum, o) => sum + o.costo, 0)
    const totalVenta = ordenesFiltradas.reduce((sum, o) => sum + o.venta, 0)
    const totalGanancia = ordenesFiltradas.reduce((sum, o) => sum + o.ganancia, 0)

    setTotales({
      costo: totalCosto,
      venta: totalVenta,
      ganancia: totalGanancia,
    })
    setPaginaActual(1) // Reset paginación al filtrar
  }, [ordenesFiltradas])

  // Paginación
  const totalPaginas = Math.ceil(ordenesFiltradas.length / itemsPorPagina)
  const inicio = (paginaActual - 1) * itemsPorPagina
  const fin = inicio + itemsPorPagina
  const ordenesPaginadas = ordenesFiltradas.slice(inicio, fin)

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

        {/* Filtros */}
        {ordenes.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Búsqueda */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Búsqueda
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre, ID o Orden..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>

                {/* Fecha Inicio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desde
                  </label>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>

                {/* Fecha Fin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hasta
                  </label>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>

                {/* Limpiar Filtros */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setBusqueda('')
                      setFechaInicio('')
                      setFechaFin('')
                    }}
                    className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg transition"
                  >
                    🔄 Limpiar
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Mostrando {ordenesFiltradas.length} de {ordenes.length} órdenes
              </p>
            </div>
          </div>
        )}

        {/* NO MOSTRAR TABLA - Solo totales y filtros */}
        {!loading && ordenes.length === 0 && (
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600 text-lg">No hay órdenes para analizar</p>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  )
}
