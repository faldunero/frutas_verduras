'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminGuard } from '@/components/AdminGuard'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'

interface PedidoItem {
  id: string
  nombre: string
  precio: number
  cantidad: number
}

interface Pedido {
  id: string
  usuarioId: string
  usuarioEmail: string
  usuarioNombre: string
  items: PedidoItem[]
  total: number
  estado: 'pendiente' | 'completado' | 'cancelado'
  fechaCreacion: any
  direccion?: string
  telefono?: string
}

export default function PedidosAdminPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroUsuario, setFiltroUsuario] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<'' | 'pendiente' | 'completado' | 'cancelado'>('')
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('')
  const [filtroFechaFin, setFiltroFechaFin] = useState('')
  const [updatingPedido, setUpdatingPedido] = useState<string | null>(null)

  useEffect(() => {
    fetchPedidos()
  }, [])

  const fetchPedidos = async () => {
    try {
      const q = query(collection(db, 'pedidos'), orderBy('fechaCreacion', 'desc'))
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Pedido[]
      setPedidos(data)
    } catch (error) {
      console.error('Error fetching pedidos:', error)
      toast.error('Error al cargar pedidos')
    } finally {
      setLoading(false)
    }
  }

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const coincideUsuario =
      filtroUsuario === '' ||
      pedido.usuarioEmail.toLowerCase().includes(filtroUsuario.toLowerCase()) ||
      pedido.usuarioNombre.toLowerCase().includes(filtroUsuario.toLowerCase())
    const coincideEstado = filtroEstado === '' || pedido.estado === filtroEstado

    let coincideFecha = true
    if (filtroFechaInicio || filtroFechaFin) {
      const fechaPedido = pedido.fechaCreacion?.toDate?.() || new Date(0)
      if (filtroFechaInicio) {
        const inicio = new Date(filtroFechaInicio)
        inicio.setHours(0, 0, 0, 0)
        coincideFecha = coincideFecha && fechaPedido >= inicio
      }
      if (filtroFechaFin) {
        const fin = new Date(filtroFechaFin)
        fin.setHours(23, 59, 59, 999)
        coincideFecha = coincideFecha && fechaPedido <= fin
      }
    }

    return coincideUsuario && coincideEstado && coincideFecha
  })

  const cambiarEstado = async (pedidoId: string, nuevoEstado: 'pendiente' | 'completado' | 'cancelado') => {
    const pedido = pedidos.find(p => p.id === pedidoId)
    if (!pedido) return

    setUpdatingPedido(pedidoId)
    try {
      const response = await fetch('/api/pedidos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedidoId,
          nuevoEstado,
          usuarioEmail: pedido.usuarioEmail,
          usuarioNombre: pedido.usuarioNombre,
        }),
      })

      if (response.ok) {
        setPedidos(pedidos.map(p => p.id === pedidoId ? { ...p, estado: nuevoEstado } : p))
        toast.success('Estado actualizado y email enviado')
      } else {
        toast.error('Error al actualizar estado')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al actualizar estado')
    } finally {
      setUpdatingPedido(null)
    }
  }

  const exportarExcel = () => {
    try {
      const datos = pedidosFiltrados.map((pedido) => ({
        'ID Pedido': pedido.id,
        'Email Usuario': pedido.usuarioEmail,
        'Nombre Usuario': pedido.usuarioNombre,
        'Teléfono': pedido.telefono || '-',
        'Dirección': pedido.direccion || '-',
        'Cantidad de Items': pedido.items.length,
        'Total': `$${pedido.total.toLocaleString()}`,
        'Estado': pedido.estado,
        'Fecha': pedido.fechaCreacion?.toDate?.()?.toLocaleDateString('es-CL') || '-',
        'Detalles de Productos': pedido.items.map((item) => `${item.nombre} (${item.cantidad}x)`).join('; '),
      }))

      const worksheet = XLSX.utils.json_to_sheet(datos)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos')

      // Ajustar ancho de columnas
      const maxWidth = 50
      worksheet['!cols'] = [
        { wch: 15 }, // ID
        { wch: 25 }, // Email
        { wch: 20 }, // Nombre
        { wch: 15 }, // Teléfono
        { wch: 30 }, // Dirección
        { wch: 12 }, // Cantidad Items
        { wch: 12 }, // Total
        { wch: 12 }, // Estado
        { wch: 15 }, // Fecha
        { wch: maxWidth }, // Detalles
      ]

      XLSX.writeFile(workbook, `Pedidos_${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success('Archivo exportado exitosamente')
    } catch (error) {
      console.error('Error exporting:', error)
      toast.error('Error al exportar Excel')
    }
  }

  // Agrupar por usuario
  const pedidosPorUsuario = pedidosFiltrados.reduce((acc: Record<string, Pedido[]>, pedido) => {
    const key = pedido.usuarioEmail
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(pedido)
    return acc
  }, {})

  const usuariosUnicos = Object.keys(pedidosPorUsuario).sort()

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
                <p className="text-gray-600 mt-2">Total: {pedidosFiltrados.length} pedidos</p>
              </div>
              <div className="space-x-4">
                <button
                  onClick={exportarExcel}
                  disabled={pedidosFiltrados.length === 0}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                >
                  📥 Exportar Excel
                </button>
                <Link
                  href="/admin"
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded inline-block"
                >
                  ← Volver
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Filtros</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar por Email o Nombre
                </label>
                <input
                  type="text"
                  value={filtroUsuario}
                  onChange={(e) => setFiltroUsuario(e.target.value)}
                  placeholder="ej: usuario@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <option value="">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={filtroFechaInicio}
                  onChange={(e) => setFiltroFechaInicio(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={filtroFechaFin}
                  onChange={(e) => setFiltroFechaFin(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Cargando pedidos...</p>
            </div>
          ) : pedidosFiltrados.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600 text-lg">No hay pedidos que coincidan con los filtros</p>
            </div>
          ) : (
            <div className="space-y-8">
              {usuariosUnicos.map((email) => (
                <div key={email} className="bg-white rounded-lg shadow overflow-hidden">
                  {/* Encabezado Usuario */}
                  <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-green-100">Email</p>
                        <p className="font-semibold text-lg">{email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-green-100">Nombre</p>
                        <p className="font-semibold text-lg">{pedidosPorUsuario[email][0]?.usuarioNombre || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-green-100">Total Pedidos</p>
                        <p className="font-semibold text-lg">{pedidosPorUsuario[email].length}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tabla de Pedidos */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100 border-b">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                            ID Pedido
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                            Fecha
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                            Items
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                            Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pedidosPorUsuario[email].map((pedido) => (
                          <tr key={pedido.id} className="border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-mono text-sm text-gray-900">{pedido.id}</td>
                            <td className="px-6 py-4 text-gray-600 text-sm">
                              {pedido.fechaCreacion?.toDate?.()?.toLocaleDateString('es-CL') ||
                                'Fecha no disponible'}
                            </td>
                            <td className="px-6 py-4 text-gray-900">
                              <div className="text-sm space-y-1">
                                {pedido.items.slice(0, 2).map((item, idx) => (
                                  <p key={idx}>
                                    {item.nombre} <span className="text-gray-600">x{item.cantidad}</span>
                                  </p>
                                ))}
                                {pedido.items.length > 2 && (
                                  <p className="text-gray-600 text-xs">
                                    +{pedido.items.length - 2} más
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-semibold text-gray-900">
                              ${pedido.total.toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={pedido.estado}
                                onChange={(e) => cambiarEstado(pedido.id, e.target.value as any)}
                                disabled={updatingPedido === pedido.id}
                                className={`px-3 py-1 rounded text-xs font-medium border-0 cursor-pointer ${
                                  pedido.estado === 'completado'
                                    ? 'bg-green-100 text-green-800'
                                    : pedido.estado === 'pendiente'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                <option value="pendiente">Pendiente</option>
                                <option value="completado">Completado</option>
                                <option value="cancelado">Cancelado</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  )
}
