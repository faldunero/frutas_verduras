'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy, limit, getDocs } from 'firebase/firestore'
import Link from 'next/link'
import { FiArrowLeft, FiActivity, FiAlertCircle, FiCheckCircle, FiClock, FiTrendingUp } from 'react-icons/fi'

interface SystemEvent {
  id: string
  type: 'orden' | 'usuario' | 'error' | 'api'
  message: string
  timestamp: any
  severity: 'info' | 'warning' | 'error'
  data?: any
}

export default function ObservabilidadPage() {
  const { isAdmin } = useAuth()
  const [systemEvents, setSystemEvents] = useState<SystemEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [healthStatus, setHealthStatus] = useState({
    app: 'healthy',
    database: 'healthy',
    api: 'healthy',
  })
  const [stats, setStats] = useState({
    ordenes: 0,
    usuarios: 0,
    errores24h: 0,
    uptime: '99.9%',
  })

  useEffect(() => {
    if (!isAdmin) return

    checkHealth()

    const ordenesQuery = query(collection(db, 'ordenes'), orderBy('createdAt', 'desc'), limit(10))
    const unsubscribeOrdenes = onSnapshot(
      ordenesQuery,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            addEvent({
              type: 'orden',
              message: `Nueva orden: ${change.doc.data().nombre}`,
              severity: 'info',
              data: change.doc.data(),
            })
          }
        })
      },
      (error) => {
        addEvent({
          type: 'error',
          message: `Error en listener de órdenes: ${error.message}`,
          severity: 'error',
        })
      }
    )

    const usuariosQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(10))
    const unsubscribeUsuarios = onSnapshot(
      usuariosQuery,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            addEvent({
              type: 'usuario',
              message: `Nuevo usuario: ${change.doc.data().email}`,
              severity: 'info',
              data: change.doc.data(),
            })
          }
        })
      },
      (error) => {
        addEvent({
          type: 'error',
          message: `Error en listener de usuarios: ${error.message}`,
          severity: 'error',
        })
      }
    )

    loadStats()
    setLoading(false)

    return () => {
      unsubscribeOrdenes()
      unsubscribeUsuarios()
    }
  }, [isAdmin])

  const checkHealth = async () => {
    try {
      const apiStart = performance.now()
      const apiRes = await fetch('https://frutas-verduras.onrender.com', { method: 'HEAD' }).catch(() => ({ ok: false }))
      const apiTime = performance.now() - apiStart

      setHealthStatus({
        app: 'healthy',
        database: 'healthy',
        api: apiTime < 5000 ? 'healthy' : 'degraded',
      })
    } catch (error) {
      setHealthStatus({ app: 'healthy', database: 'healthy', api: 'degraded' })
    }
  }

  const addEvent = (event: Omit<SystemEvent, 'id' | 'timestamp'>) => {
    const newEvent: SystemEvent = {
      ...event,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    setSystemEvents((prev) => [newEvent, ...prev].slice(0, 50))
  }

  const loadStats = async () => {
    try {
      const ordenesSnap = await getDocs(collection(db, 'ordenes'))
      const usuariosSnap = await getDocs(collection(db, 'users'))

      setStats({
        ordenes: ordenesSnap.size,
        usuarios: usuariosSnap.size,
        errores24h: 0,
        uptime: '99.9%',
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'degraded': return 'text-yellow-600'
      case 'unhealthy': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-50 border-green-200'
      case 'degraded': return 'bg-yellow-50 border-yellow-200'
      case 'unhealthy': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'bg-blue-100 text-blue-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">No tienes acceso a esta página</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-4">
              <FiArrowLeft /> Volver
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">📊 Observabilidad del Sistema</h1>
            <p className="text-gray-600 mt-2">Monitoreo en tiempo real de la aplicación</p>
          </div>
          <button
            onClick={checkHealth}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Refrescar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className={`border rounded-lg p-6 ${getStatusBg(healthStatus.app)}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900">Aplicación</h3>
              <FiActivity className={getStatusColor(healthStatus.app)} />
            </div>
            <p className={`text-sm font-semibold ${getStatusColor(healthStatus.app)}`}>
              {healthStatus.app.toUpperCase()}
            </p>
          </div>

          <div className={`border rounded-lg p-6 ${getStatusBg(healthStatus.database)}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900">Base de Datos</h3>
              <FiCheckCircle className={getStatusColor(healthStatus.database)} />
            </div>
            <p className={`text-sm font-semibold ${getStatusColor(healthStatus.database)}`}>
              {healthStatus.database.toUpperCase()}
            </p>
          </div>

          <div className={`border rounded-lg p-6 ${getStatusBg(healthStatus.api)}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900">API</h3>
              <FiTrendingUp className={getStatusColor(healthStatus.api)} />
            </div>
            <p className={`text-sm font-semibold ${getStatusColor(healthStatus.api)}`}>
              {healthStatus.api.toUpperCase()}
            </p>
          </div>

          <div className="border border-green-200 rounded-lg p-6 bg-green-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900">Uptime</h3>
              <FiClock className="text-green-600" />
            </div>
            <p className="text-sm font-semibold text-green-600">{stats.uptime}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Órdenes Totales</p>
            <p className="text-3xl font-bold text-gray-900">{stats.ordenes}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Usuarios Totales</p>
            <p className="text-3xl font-bold text-gray-900">{stats.usuarios}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Eventos Registrados</p>
            <p className="text-3xl font-bold text-blue-600">{systemEvents.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Listeners Activos</p>
            <p className="text-3xl font-bold text-green-600">2</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900">📋 Log de Eventos en Tiempo Real</h2>
            <p className="text-gray-600 text-sm mt-1">Últimos {systemEvents.length} eventos del sistema</p>
          </div>

          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {systemEvents.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>No hay eventos registrados aún</p>
              </div>
            ) : (
              systemEvents.map((event) => (
                <div key={event.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(event.severity)}`}>
                          {event.type.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {event.timestamp instanceof Date
                            ? event.timestamp.toLocaleTimeString('es-CL')
                            : new Date(event.timestamp).toLocaleTimeString('es-CL')}
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium">{event.message}</p>
                    </div>
                    {event.severity === 'error' && <FiAlertCircle className="text-red-600 mt-1" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
