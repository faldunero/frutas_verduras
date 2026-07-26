'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { getAuth } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function PerfilPage() {
  const router = useRouter()
  const auth = getAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [usuario, setUsuario] = useState<any>(null)
  const [telefono, setTelefono] = useState('')

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/auth/login')
        return
      }

      try {
        const userRef = doc(db, 'users', user.uid)
        const userDoc = await getDoc(userRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          setUsuario(userData)
          setTelefono(userData.telefono || '')
        }
      } catch (error) {
        console.error('Error loading user:', error)
        toast.error('Error al cargar datos del perfil')
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [auth, router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!telefono) {
      toast.error('El teléfono es requerido')
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/update-user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefono }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar')
      }

      toast.success('Perfil actualizado correctamente')
      setUsuario({ ...usuario, telefono })
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Error al guardar cambios')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar perfil</p>
          <Link href="/auth/login" className="text-green-600 hover:text-green-700 font-medium">
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Datos Personales</h1>
            <p className="text-gray-600 mt-2">Gestiona tu información de cuenta</p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                value={usuario.nombre || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">No se puede modificar</p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={usuario.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">No se puede modificar</p>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej: +56912345678"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                required
              />
            </div>

            {/* Comuna */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comuna
              </label>
              <input
                type="text"
                value={usuario.comuna || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">No se puede modificar</p>
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                value={usuario.direccion || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">No se puede modificar</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <Link
                href="/auth/login"
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-2 px-4 rounded-lg transition text-center"
              >
                Volver
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
