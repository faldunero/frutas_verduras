'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface PerfilData {
  nombre: string
  telefono: string
  direccion: string
}

export default function PerfilPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [perfil, setPerfil] = useState<PerfilData>({
    nombre: '',
    telefono: '',
    direccion: '',
  })

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login')
      } else if (user) {
        fetchPerfil()
      }
    }
  }, [isAuthenticated, user, authLoading, router])

  const fetchPerfil = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'users', user?.uid!))
      if (docSnap.exists()) {
        const data = docSnap.data()
        setPerfil({
          nombre: data.nombre || '',
          telefono: data.telefono || '',
          direccion: data.direccion || '',
        })
      }
    } catch (error) {
      console.error('Error fetching perfil:', error)
      toast.error('Error al cargar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPerfil((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setSaving(true)

    try {
      await updateDoc(doc(db, 'users', user?.uid!), {
        nombre: perfil.nombre,
        telefono: perfil.telefono,
        direccion: perfil.direccion,
      })

      toast.success('Perfil actualizado')
    } catch (error) {
      console.error('Error updating perfil:', error)
      toast.error('Error al actualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

        <div className="bg-white rounded-lg shadow p-8">
          {/* Información de Cuenta */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-xl font-bold mb-4">Información de Cuenta</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ID de Usuario</p>
                <p className="font-mono text-sm text-gray-700">{user?.uid}</p>
              </div>
            </div>
          </div>

          {/* Formulario de Perfil */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                name="nombre"
                value={perfil.nombre}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={perfil.telefono}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="+56 9 1234 5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <textarea
                name="direccion"
                value={perfil.direccion}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Tu dirección de envío"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <Link
                href="/"
                className="flex-1 border-2 border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-50 text-center transition"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>

        {/* Enlaces útiles */}
        <div className="mt-8 bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-bold mb-4">Enlaces Útiles</h2>
          <div className="space-y-2">
            <Link href="/ordenes" className="block text-green-600 hover:text-green-700">
              → Mis Órdenes
            </Link>
            <Link href="/wishlist" className="block text-green-600 hover:text-green-700">
              → Mi Wishlist
            </Link>
            <Link href="/privacidad-datos" className="block text-green-600 hover:text-green-700">
              → Gestionar Privacidad y Datos (ARCOP)
            </Link>
            <Link href="/" className="block text-green-600 hover:text-green-700">
              → Volver a Inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
