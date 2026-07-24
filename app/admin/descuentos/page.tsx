'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AdminGuard } from '@/components/AdminGuard'
import { db } from '@/lib/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { FiTrash2, FiEdit2, FiPlus } from 'react-icons/fi'

interface Descuento {
  id: string
  nombre: string
  porcentaje: number
  descripcion: string
  fechaInicio: string
  horaInicio: string
  fechaTermino: string
  horaTermino: string
  activo: boolean
}

export default function DescuentosPage() {
  const [descuentos, setDescuentos] = useState<Descuento[]>([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<string | null>(null)
  const [formData, setFormData] = useState<Omit<Descuento, 'id'>>({
    nombre: '',
    porcentaje: 0,
    descripcion: '',
    fechaInicio: '',
    horaInicio: '00:00',
    fechaTermino: '',
    horaTermino: '23:59',
    activo: true,
  })

  useEffect(() => {
    fetchDescuentos()
  }, [])

  const fetchDescuentos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'descuentos'))
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Descuento[]
      setDescuentos(data.sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime()))
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar descuentos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre || !formData.fechaInicio || !formData.fechaTermino || formData.porcentaje <= 0) {
      toast.error('Completa todos los campos requeridos')
      return
    }

    if (formData.porcentaje > 100) {
      toast.error('El descuento no puede ser mayor a 100%')
      return
    }

    try {
      if (editando) {
        await updateDoc(doc(db, 'descuentos', editando), formData)
        toast.success('Descuento actualizado')
      } else {
        await addDoc(collection(db, 'descuentos'), formData)
        toast.success('Descuento creado')
      }

      setFormData({
        nombre: '',
        porcentaje: 0,
        descripcion: '',
        fechaInicio: '',
        horaInicio: '00:00',
        fechaTermino: '',
        horaTermino: '23:59',
        activo: true,
      })
      setEditando(null)
      fetchDescuentos()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar descuento')
    }
  }

  const handleEditar = (desc: Descuento) => {
    setFormData({
      nombre: desc.nombre,
      porcentaje: desc.porcentaje,
      descripcion: desc.descripcion,
      fechaInicio: desc.fechaInicio,
      horaInicio: desc.horaInicio,
      fechaTermino: desc.fechaTermino,
      horaTermino: desc.horaTermino,
      activo: desc.activo,
    })
    setEditando(desc.id)
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este descuento?')) return

    try {
      await deleteDoc(doc(db, 'descuentos', id))
      toast.success('Descuento eliminado')
      fetchDescuentos()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar descuento')
    }
  }

  const isActivo = (desc: Descuento) => {
    const ahora = new Date()
    const inicio = new Date(`${desc.fechaInicio}T${desc.horaInicio}`)
    const termino = new Date(`${desc.fechaTermino}T${desc.horaTermino}`)
    return desc.activo && ahora >= inicio && ahora <= termino
  }

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Cargando descuentos...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Descuentos Cyber</h1>
            <p className="text-gray-600 mt-2">Gestiona descuentos globales para toda la tienda</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          {/* Formulario */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold mb-6">
              {editando ? 'Editar Descuento' : 'Crear Nuevo Descuento'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Descuento *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Black Friday 2026"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descuento (%) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.porcentaje}
                    onChange={(e) => setFormData({ ...formData, porcentaje: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  placeholder="Descripción opcional..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora de Inicio
                  </label>
                  <input
                    type="time"
                    value={formData.horaInicio}
                    onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Término *
                  </label>
                  <input
                    type="date"
                    value={formData.fechaTermino}
                    onChange={(e) => setFormData({ ...formData, fechaTermino: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora de Término
                  </label>
                  <input
                    type="time"
                    value={formData.horaTermino}
                    onChange={(e) => setFormData({ ...formData, horaTermino: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="ml-2 text-gray-700">Descuento Activo</span>
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg"
                >
                  {editando ? 'Actualizar' : 'Crear'} Descuento
                </button>
                {editando && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditando(null)
                      setFormData({
                        nombre: '',
                        porcentaje: 0,
                        descripcion: '',
                        fechaInicio: '',
                        horaInicio: '00:00',
                        fechaTermino: '',
                        horaTermino: '23:59',
                        activo: true,
                      })
                    }}
                    className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Lista de Descuentos */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold">Descuentos Registrados</h2>
            </div>

            {descuentos.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-600 text-lg">No hay descuentos creados aún</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Nombre</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Descuento</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Inicio</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Término</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Estado</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {descuentos.map((desc) => {
                      const activo = isActivo(desc)
                      return (
                        <tr key={desc.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-bold text-gray-900">{desc.nombre}</p>
                              <p className="text-sm text-gray-600">{desc.descripcion}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xl font-bold text-green-600">{desc.porcentaje}%</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {desc.fechaInicio} {desc.horaInicio}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {desc.fechaTermino} {desc.horaTermino}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                activo
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {activo ? '🔴 EN VIVO' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm space-x-2">
                            <button
                              onClick={() => handleEditar(desc)}
                              className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                            >
                              <FiEdit2 size={16} /> Editar
                            </button>
                            <button
                              onClick={() => handleEliminar(desc.id)}
                              className="text-red-600 hover:text-red-800 font-medium inline-flex items-center gap-1"
                            >
                              <FiTrash2 size={16} /> Eliminar
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

          {/* Botón Volver */}
          <div className="mt-8">
            <Link
              href="/admin/productos"
              className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              ← Volver
            </Link>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
