'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface PerfilData {
  nombre: string
  telefono: string
  calle: string
  numero: string
  anexo: string
  comuna: string
}

interface DatosCompra {
  fecha: string
  total: number
}

export default function PerfilPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [datosCompras, setDatosCompras] = useState<DatosCompra[]>([])
  const [perfil, setPerfil] = useState<PerfilData>({
    nombre: '',
    telefono: '',
    calle: '',
    numero: '',
    anexo: '',
    comuna: '',
  })

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login')
      } else if (user) {
        fetchPerfil()
        fetchOrdenes()
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
          calle: data.calle || '',
          numero: data.numero || '',
          anexo: data.anexo || '',
          comuna: data.comuna || '',
        })
      }
    } catch (error) {
      console.error('Error fetching perfil:', error)
      toast.error('Error al cargar perfil')
    } finally {
      setLoading(false)
    }
  }

  const fetchOrdenes = async () => {
    try {
      const q = query(collection(db, 'ordenes'), where('userId', '==', user?.uid))
      const snapshot = await getDocs(q)
      const ordenes = snapshot.docs.map((doc) => ({
        fecha: new Date(doc.data().createdAt?.toDate?.() || doc.data().createdAt).toLocaleDateString('es-CL'),
        total: doc.data().total,
      }))
      // Agrupar por fecha y sumar totales
      const comprasAgrupadas: { [key: string]: number } = {}
      ordenes.forEach((orden) => {
        comprasAgrupadas[orden.fecha] = (comprasAgrupadas[orden.fecha] || 0) + orden.total
      })

      const datos = Object.entries(comprasAgrupadas)
        .map(([fecha, total]) => ({ fecha, total: Math.round(total) }))
        .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

      setDatosCompras(datos)
    } catch (error) {
      console.error('Error fetching ordenes:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        calle: perfil.calle,
        numero: perfil.numero,
        anexo: perfil.anexo,
        comuna: perfil.comuna,
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

          {/* Gráfico de Historial de Compras */}
          {datosCompras.length > 0 && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h2 className="text-lg font-bold mb-4">Historial de Compras</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={datosCompras}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString('es-CL')}`} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Formulario de Despacho */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-bold mb-6">Datos de Despacho</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                name="nombre"
                value={perfil.nombre}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Tu nombre completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                name="telefono"
                value={perfil.telefono}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="+56 9 1234 5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calle *
              </label>
              <input
                type="text"
                name="calle"
                value={perfil.calle}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Nombre de la calle"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número *
                </label>
                <input
                  type="text"
                  name="numero"
                  value={perfil.numero}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="Ej: 1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anexo/Departamento
                </label>
                <input
                  type="text"
                  name="anexo"
                  value={perfil.anexo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="Ej: Dpto 4B (opcional)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comuna *
              </label>
              <select
                name="comuna"
                value={perfil.comuna}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="">Selecciona tu comuna</option>
                <option value="Las Condes">Las Condes</option>
                <option value="Providencia">Providencia</option>
                <option value="Vitacura">Vitacura</option>
                <option value="Lo Barnechea">Lo Barnechea</option>
                <option value="Ñuñoa">Ñuñoa</option>
              </select>
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
