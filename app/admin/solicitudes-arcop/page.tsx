'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase'
import { collection, getDocs, updateDoc, doc, query } from 'firebase/firestore'
import Link from 'next/link'
import { FiArrowLeft, FiCheck, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface SolicitudARCOP {
  id: string
  nombre: string
  email: string
  tipo: 'acceso' | 'rectificacion' | 'cancelacion' | 'oposicion' | 'portabilidad'
  descripcion: string
  estado: 'pendiente' | 'procesada' | 'rechazada'
  userId?: string
  createdAt: any
  respondidoAt?: any
}

const tipoLabels: { [key: string]: string } = {
  acceso: 'Acceso (A)',
  rectificacion: 'Rectificación (R)',
  cancelacion: 'Cancelación (C)',
  oposicion: 'Oposición (O)',
  portabilidad: 'Portabilidad (P)',
}

const estadoColors: { [key: string]: string } = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  procesada: 'bg-green-100 text-green-800',
  rechazada: 'bg-red-100 text-red-800',
}

const estadoLabels: { [key: string]: string } = {
  pendiente: 'Pendiente',
  procesada: 'Procesada',
  rechazada: 'Rechazada',
}

export default function SolicitudesARCOPPage() {
  const { isAdmin, isAuthenticated } = useAuth()
  const [solicitudes, setSolicitudes] = useState<SolicitudARCOP[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<string>('todos')
  const [actualizando, setActualizando] = useState<string | null>(null)

  const loadSolicitudes = async () => {
    try {
      setLoading(true)
      const q = query(collection(db, 'solicitudesARCOP'))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SolicitudARCOP[]
      // Ordenar por fecha descendente
      data.sort((a, b) => {
        const dateA = new Date(a.createdAt?.toDate?.() || a.createdAt).getTime()
        const dateB = new Date(b.createdAt?.toDate?.() || b.createdAt).getTime()
        return dateB - dateA
      })
      setSolicitudes(data)
    } catch (error) {
      console.error('Error loading solicitudes:', error)
      toast.error('Error al cargar solicitudes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadSolicitudes()
    }
  }, [isAdmin])

  const cambiarEstado = async (solicitudId: string, nuevoEstado: string) => {
    try {
      setActualizando(solicitudId)
      await updateDoc(doc(db, 'solicitudesARCOP', solicitudId), {
        estado: nuevoEstado,
        respondidoAt: new Date(),
      })

      setSolicitudes((prev) =>
        prev.map((s) =>
          s.id === solicitudId
            ? { ...s, estado: nuevoEstado as any, respondidoAt: new Date() }
            : s
        )
      )

      toast.success(`Solicitud marcada como ${estadoLabels[nuevoEstado]}`)
    } catch (error) {
      console.error('Error updating solicitud:', error)
      toast.error('Error al actualizar solicitud')
    } finally {
      setActualizando(null)
    }
  }

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

  const solicitudesFiltradas = solicitudes.filter((s) =>
    filtro === 'todos' ? true : s.estado === filtro
  )

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Solicitudes ARCOP</h1>
            <p className="text-gray-600 mt-2">Gestión de derechos ARCOP (Ley 21.719)</p>
          </div>
          <Link
            href="/admin/productos"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft size={20} />
            Volver
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Filtrar por estado:</h3>
            <div className="flex flex-wrap gap-2">
              {['todos', 'pendiente', 'procesada', 'rechazada'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFiltro(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filtro === status
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status === 'todos' ? 'Todas' : estadoLabels[status]}
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Total: <span className="font-bold text-green-600">{solicitudesFiltradas.length} solicitudes</span>
          </p>
        </div>

        {/* Lista de solicitudes */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Cargando solicitudes...</p>
          </div>
        ) : solicitudesFiltradas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">
              No hay solicitudes ARCOP con el estado seleccionado
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {solicitudesFiltradas.map((solicitud) => (
              <div
                key={solicitud.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Tipo de Solicitud</p>
                    <p className="font-bold text-gray-900">{tipoLabels[solicitud.tipo]}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nombre</p>
                    <p className="font-bold text-gray-900">{solicitud.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-bold text-gray-900 text-sm">{solicitud.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                        estadoColors[solicitud.estado]
                      }`}
                    >
                      {estadoLabels[solicitud.estado]}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Detalles:</p>
                  <p className="text-gray-700 text-sm">
                    {solicitud.descripcion || '(Sin detalles adicionales)'}
                  </p>
                </div>

                <div className="border-t pt-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-4 text-sm text-gray-600">
                    <div>
                      <p className="text-xs text-gray-500">Solicitado:</p>
                      <p className="font-medium">
                        {new Date(solicitud.createdAt?.toDate?.() || solicitud.createdAt).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                    {solicitud.respondidoAt && (
                      <div>
                        <p className="text-xs text-gray-500">Respondido:</p>
                        <p className="font-medium">
                          {new Date(solicitud.respondidoAt?.toDate?.() || solicitud.respondidoAt).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => cambiarEstado(solicitud.id, 'procesada')}
                      disabled={actualizando === solicitud.id || solicitud.estado === 'procesada'}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition"
                    >
                      <FiCheck size={16} />
                      Procesar
                    </button>
                    <button
                      onClick={() => cambiarEstado(solicitud.id, 'rechazada')}
                      disabled={actualizando === solicitud.id || solicitud.estado === 'rechazada'}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition"
                    >
                      <FiX size={16} />
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
