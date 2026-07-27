'use client'

import { useState } from 'react'
import Link from 'next/link'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import toast from 'react-hot-toast'

export default function RecuperarPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await sendPasswordResetEmail(auth, email)
      setEnviado(true)
      toast.success('Email de recuperación enviado')
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        toast.error('No existe una cuenta con este email')
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Email inválido')
      } else {
        toast.error('Error al enviar email de recuperación')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-2"></div>
          <h1 className="text-3xl font-bold text-gray-900">Frutas & Verduras</h1>
          <p className="text-gray-600 mt-2">Recuperar Contraseña</p>
        </div>

        {enviado ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">✓</div>
            <h2 className="text-lg font-bold text-green-900 mb-2">Email Enviado</h2>
            <p className="text-green-800 mb-6">
              Hemos enviado un email a <strong>{email}</strong> con las instrucciones para recuperar tu contraseña.
            </p>
            <p className="text-sm text-green-700 mb-6">
              Por favor revisa tu bandeja de entrada (y spam si es necesario). El link expira en 1 hora.
            </p>
            <Link
              href="/auth/login"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg"
            >
              Volver al Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-gray-600 text-sm mb-6">
              Ingresa tu email y te enviaremos un link para recuperar tu contraseña.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="tu@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              {loading ? 'Enviando...' : 'Enviar Email de Recuperación'}
            </button>

            <div className="text-center mt-6">
              <Link href="/auth/login" className="text-green-600 hover:text-green-700 font-medium text-sm">
                ← Volver al Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
