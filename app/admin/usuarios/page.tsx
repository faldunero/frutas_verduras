'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminGuard } from '@/components/AdminGuard'
import { db } from '@/lib/firebase'
import { collection, getDocs, deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import toast from 'react-hot-toast'
import { FiTrash2, FiEdit2, FiPlus } from 'react-icons/fi'
import { COMUNAS_PERMITIDAS } from '@/lib/constants'

interface Usuario {
  id: string
  email: string
  nombre: string
  telefono?: string
  calle?: string
  numero?: string
  anexo?: string
  comuna?: string
  rol: 'user' | 'admin'
  bloqueado?: boolean
  createdAt?: any
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroComuna, setFiltroComuna] = useState<string>('')
  const [filtroRol, setFiltroRol] = useState<string>('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<Usuario>>({
    email: '',
    nombre: '',
    telefono: '',
    calle: '',
    numero: '',
    anexo: '',
    comuna: '',
    rol: 'user',
  })

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const fetchUsuarios = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'))
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Usuario[]
      setUsuarios(data.sort((a, b) => {
        const dateA = new Date(a.createdAt?.toDate?.() || a.createdAt).getTime()
        const dateB = new Date(b.createdAt?.toDate?.() || b.createdAt).getTime()
        return dateB - dateA
      }))
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBloqueado = async (id: string, bloqueado: boolean) => {
    const accion = bloqueado ? 'desbloquear' : 'bloquear'
    if (!confirm(`¿Estás seguro de ${accion} este usuario?`)) return

    try {
      await updateDoc(doc(db, 'users', id), {
        bloqueado: !bloqueado,
      })
      setUsuarios(
        usuarios.map((u) =>
          u.id === id ? { ...u, bloqueado: !bloqueado } : u
        )
      )
      toast.success(`Usuario ${accion}do`)
    } catch (error) {
      console.error('Error:', error)
      toast.error(`Error al ${accion} usuario`)
    }
  }

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`¿Estás seguro de ELIMINAR PERMANENTEMENTE a ${email}? Esta acción no se puede deshacer.`)) return

    try {
      await deleteDoc(doc(db, 'users', id))
      setUsuarios(usuarios.filter((u) => u.id !== id))
      toast.success('Usuario eliminado permanentemente')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar usuario')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.nombre || !formData.comuna) {
      toast.error('Completa email, nombre y comuna')
      return
    }

    if (!COMUNAS_PERMITIDAS.includes(formData.comuna)) {
      toast.error('Comuna no permitida')
      return
    }

    try {
      if (editingId) {
        // Editar usuario existente
        await updateDoc(doc(db, 'users', editingId), {
          nombre: formData.nombre,
          telefono: formData.telefono || '',
          calle: formData.calle || '',
          numero: formData.numero || '',
          anexo: formData.anexo || '',
          comuna: formData.comuna,
          rol: formData.rol,
        })
        setUsuarios(
          usuarios.map((u) =>
            u.id === editingId ? { ...u, ...formData } : u
          )
        )
        toast.success('Usuario actualizado')
      } else {
        // Crear usuario nuevo
        const auth = getAuth()
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          'TempPassword123!' // Contraseña temporal - el usuario debe cambiarla
        )

        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: formData.email,
          nombre: formData.nombre,
          telefono: formData.telefono || '',
          calle: formData.calle || '',
          numero: formData.numero || '',
          anexo: formData.anexo || '',
          comuna: formData.comuna,
          rol: formData.rol,
          createdAt: new Date(),
        })

        toast.success(`Usuario creado. Contraseña temporal: TempPassword123!`)
        fetchUsuarios()
      }

      setShowForm(false)
      setEditingId(null)
      setFormData({
        email: '',
        nombre: '',
        telefono: '',
        calle: '',
        numero: '',
        anexo: '',
        comuna: '',
        rol: 'user',
      })
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Error al guardar usuario')
    }
  }

  const handleEdit = (usuario: Usuario) => {
    setEditingId(usuario.id)
    setFormData(usuario)
    setShowForm(true)
  }

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const coincideBusqueda =
      usuario.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.nombre.toLowerCase().includes(busqueda.toLowerCase())

    const coincideComuna =
      filtroComuna === '' || usuario.comuna === filtroComuna
    const coincideRol = filtroRol === '' || usuario.rol === filtroRol

    return coincideBusqueda && coincideComuna && coincideRol
  })

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Cargando usuarios...</p>
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
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
              <button
                onClick={() => {
                  setShowForm(!showForm)
                  setEditingId(null)
                  setFormData({
                    email: '',
                    nombre: '',
                    telefono: '',
                    calle: '',
                    numero: '',
                    anexo: '',
                    comuna: '',
                    rol: 'user',
                  })
                }}
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center gap-2"
              >
                <FiPlus /> Nuevo Usuario
              </button>
            </div>
            <p className="text-gray-600">
              Total: {usuariosFiltrados.length} de {usuarios.length} usuarios
            </p>
          </div>
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">
                {editingId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email {!editingId && '*'}
                    </label>
                    <input
                      type="email"
                      disabled={!!editingId}
                      value={formData.email || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100"
                      placeholder="usuario@ejemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.nombre || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, nombre: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.telefono || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, telefono: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                      placeholder="+56912345678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rol *
                    </label>
                    <select
                      value={formData.rol || 'user'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rol: e.target.value as 'user' | 'admin',
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    >
                      <option value="user">Cliente</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calle
                    </label>
                    <input
                      type="text"
                      value={formData.calle || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, calle: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                      placeholder="Av. Apoquindo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número
                    </label>
                    <input
                      type="text"
                      value={formData.numero || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, numero: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                      placeholder="4500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Anexo / Depto
                    </label>
                    <input
                      type="text"
                      value={formData.anexo || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, anexo: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                      placeholder="Dpto 302"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comuna *
                    </label>
                    <select
                      value={formData.comuna || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, comuna: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    >
                      <option value="">Seleccionar comuna</option>
                      {COMUNAS_PERMITIDAS.map((comuna) => (
                        <option key={comuna} value={comuna}>
                          {comuna}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg"
                  >
                    {editingId ? 'Actualizar' : 'Crear'} Usuario
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingId(null)
                      setFormData({
                        email: '',
                        nombre: '',
                        telefono: '',
                        calle: '',
                        numero: '',
                        anexo: '',
                        comuna: '',
                        rol: 'user',
                      })
                    }}
                    className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filtros */}
        {usuarios.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar
                  </label>
                  <input
                    type="text"
                    placeholder="Email o nombre..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comuna
                  </label>
                  <select
                    value={filtroComuna}
                    onChange={(e) => setFiltroComuna(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    <option value="">Todas</option>
                    {COMUNAS_PERMITIDAS.map((comuna) => (
                      <option key={comuna} value={comuna}>
                        {comuna}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol
                  </label>
                  <select
                    value={filtroRol}
                    onChange={(e) => setFiltroRol(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    <option value="">Todos</option>
                    <option value="user">Cliente</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabla */}
        {usuarios.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {usuariosFiltrados.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600 text-lg">No hay usuarios que coincidan</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Teléfono
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Comuna
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Registro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {usuariosFiltrados.map((usuario) => (
                      <tr key={usuario.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900 text-sm">{usuario.email}</td>
                        <td className="px-6 py-4 text-gray-900">
                          <div>
                            <p className="font-medium">{usuario.nombre}</p>
                            {usuario.calle && (
                              <p className="text-xs text-gray-600">
                                {usuario.calle} {usuario.numero} {usuario.anexo && `- ${usuario.anexo}`}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{usuario.telefono || '-'}</td>
                        <td className="px-6 py-4 text-gray-900 text-sm">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {usuario.comuna || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              usuario.rol === 'admin'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {usuario.rol === 'admin' ? 'Admin' : 'Cliente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              usuario.bloqueado
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {usuario.bloqueado ? '🔒 Bloqueado' : '✓ Activo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-xs">
                          {usuario.createdAt ? (
                            new Date(usuario.createdAt?.toDate?.() || usuario.createdAt).toLocaleDateString('es-CL')
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <button
                            onClick={() => handleEdit(usuario)}
                            className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                          >
                            <FiEdit2 size={16} /> Editar
                          </button>
                          <button
                            onClick={() => handleToggleBloqueado(usuario.id, usuario.bloqueado || false)}
                            className={`font-medium inline-flex items-center gap-1 ${
                              usuario.bloqueado
                                ? 'text-green-600 hover:text-green-800'
                                : 'text-yellow-600 hover:text-yellow-800'
                            }`}
                          >
                            {usuario.bloqueado ? '🔓 Desbloquear' : '🔒 Bloquear'}
                          </button>
                          {usuario.bloqueado && (
                            <button
                              onClick={() => handleDelete(usuario.id, usuario.email)}
                              className="text-red-600 hover:text-red-800 font-medium inline-flex items-center gap-1"
                            >
                              <FiTrash2 size={16} /> Eliminar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Botón Volver */}
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/admin"
            className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            ← Volver al Admin
          </Link>
        </div>
      </div>
    </AdminGuard>
  )
}
