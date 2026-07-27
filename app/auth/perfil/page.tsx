'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { getAuth, sendEmailVerification } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function PerfilPage() {
  const router = useRouter()
  const auth = getAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sendingVerification, setSendingVerification] = useState(false)
  const [usuario, setUsuario] = useState<any>(null)
  const [telefono, setTelefono] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/auth/login')
        return
      }

      setCurrentUser(user)

      try {
        const userRef = doc(db, 'users', user.uid)
        const userDoc = await getDoc(userRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          setUsuario(userData)
          setTelefono(userData.telefono || '')
        } else {
          // Si no existe en Firestore, usar datos de Auth
          setUsuario({
            nombre: user.displayName || 'Usuario',
            email: user.email || '',
            role: 'usuario',
            emailVerified: user.emailVerified,
          })
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

  const handleSendVerificationEmail = async () => {
    if (!currentUser) return

    setSendingVerification(true)
    try {
      await sendEmailVerification(currentUser)
      toast.success('Email de verificación enviado. Revisa tu buzón.')
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Error al enviar email de verificación')
    } finally {
      setSendingVerification(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4"></div>
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
            {/* Rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <input
                type="text"
                value={usuario?.role === 'admin' ? 'Administrador' : 'Usuario'}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">Tu rol en el sistema</p>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                value={usuario?.nombre || ''}
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
              <div className="flex gap-2">
                <input
                  type="email"
                  value={usuario?.email || currentUser?.email || ''}
                  disabled
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
                <span className={`px-3 py-2 rounded-lg text-sm font-medium ${currentUser?.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {currentUser?.emailVerified ? '✓ Verificado' : '⚠ No verificado'}
                </span>
              </div>
              {!currentUser?.emailVerified && (
                <button
                  type="button"
                  onClick={handleSendVerificationEmail}
                  disabled={sendingVerification}
                  className="mt-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded transition"
                >
                  {sendingVerification ? 'Enviando...' : 'Enviar email de verificación'}
                </button>
              )}
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
