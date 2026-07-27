'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function SetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error('Email no proporcionado')
      return
    }

    if (!password || !confirmPassword) {
      toast.error('Completa todos los campos')
      return
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    try {
      const auth = getAuth()
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      await updateDoc(doc(db, 'users', email), {
        uid: userCredential.user.uid,
        emailVerified: true,
        status: 'active',
      })

      toast.success('Cuenta creada correctamente')
      setTimeout(() => {
        router.push('/auth/login')
      }, 1500)
    } catch (error: any) {
      console.error('Error:', error)
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Este email ya está registrado')
      } else {
        toast.error(error.message || 'Error al crear la cuenta')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-2"></div>
          <h1 className="text-3xl font-bold text-gray-900">Frutas & Verduras</h1>
          <p className="text-gray-600 mt-2">Crea tu contraseña</p>
          <p className="text-xs text-gray-500 mt-3 bg-green-50 py-2 px-3 rounded">
            Paso 2 de 2: Establece tu contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
            />
            <p className="text-xs text-gray-500 mt-1">No se puede modificar</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Contraseña *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Repite tu contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="my-6 border-t border-gray-300"></div>

        <p className="text-center text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="text-green-600 font-bold hover:text-green-700">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
