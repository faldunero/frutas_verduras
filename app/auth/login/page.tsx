'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { FiEye, FiEyeOff } from 'react-icons/fi'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [recordarCuenta, setRecordarCuenta] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const { login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const emailGuardado = localStorage.getItem('frutasVerduras_emailRecordado')
    if (emailGuardado) {
      setEmail(emailGuardado)
      setRecordarCuenta(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      if (!email || !password) {
        setErrorMessage('Por favor completa todos los campos')
        setLoading(false)
        return
      }

      if (recordarCuenta) {
        localStorage.setItem('frutasVerduras_emailRecordado', email)
      } else {
        localStorage.removeItem('frutasVerduras_emailRecordado')
      }

      await login(email, password)
      toast.success('¡Bienvenido!')
    } catch (error: any) {
      // Mensajes de error específicos
      const errorCode = error.code || ''
      let mensaje = 'Error al iniciar sesión'

      if (errorCode === 'auth/user-not-found') {
        mensaje = 'El email no está registrado. ¿Quieres registrarte?'
      } else if (errorCode === 'auth/wrong-password') {
        mensaje = 'Contraseña incorrecta'
      } else if (errorCode === 'auth/invalid-email') {
        mensaje = 'Email inválido'
      } else if (errorCode === 'auth/user-disabled') {
        mensaje = 'Esta cuenta ha sido desactivada'
      } else if (error.message?.includes('user-not-found')) {
        mensaje = 'El email no está registrado'
      } else if (error.message?.includes('wrong-password')) {
        mensaje = 'Contraseña incorrecta'
      }

      setErrorMessage(mensaje)
      toast.error(mensaje)
    } finally {
      setLoading(false)
    }
  }

  const handleLimpiarEmail = () => {
    setEmail('')
    setRecordarCuenta(false)
    localStorage.removeItem('frutasVerduras_emailRecordado')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🥬</div>
          <h1 className="text-3xl font-bold text-gray-900">Frutas & Verduras</h1>
          <p className="text-gray-600 mt-2">Inicia sesión en tu cuenta</p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <Link href="/auth/recuperar" className="text-xs text-green-600 hover:text-green-700 font-medium">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <input
                type={mostrarContrasena ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setMostrarContrasena(!mostrarContrasena)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {mostrarContrasena ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={recordarCuenta}
                onChange={(e) => setRecordarCuenta(e.target.checked)}
                className="w-4 h-4 text-green-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Recordar esta cuenta</span>
            </label>
            {email && (
              <button
                type="button"
                onClick={handleLimpiarEmail}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Limpiar
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 border-t border-gray-300"></div>

        {/* Sign Up Link */}
        <p className="text-center text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link href="/auth/register" className="text-green-600 font-bold hover:text-green-700">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
