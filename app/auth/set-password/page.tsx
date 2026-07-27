'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { FiEye, FiEyeOff } from 'react-icons/fi'

function SetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = decodeURIComponent(searchParams.get('email') || '')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const validatePassword = () => {
    const newErrors: string[] = []

    if (!password) {
      newErrors.push('La contraseña es requerida')
    } else {
      if (password.length < 8) {
        newErrors.push('Mínimo 8 caracteres')
      }
      if (!/[A-Z]/.test(password)) {
        newErrors.push('Debe contener una letra mayúscula')
      }
      if (!/[a-z]/.test(password)) {
        newErrors.push('Debe contener una letra minúscula')
      }
      if (!/[0-9]/.test(password)) {
        newErrors.push('Debe contener un número')
      }
      if (!/[!@#$%^&*]/.test(password)) {
        newErrors.push('Debe contener un carácter especial (!@#$%^&*)')
      }
    }

    if (!confirmPassword) {
      newErrors.push('Confirma tu contraseña')
    } else if (password !== confirmPassword) {
      newErrors.push('Las contraseñas no coinciden')
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePassword()) {
      return
    }

    if (!email) {
      toast.error('Email no encontrado')
      return
    }

    setLoading(true)

    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Actualizar documento en Firestore
      await updateDoc(doc(db, 'users', email), {
        uid: user.uid,
        status: 'active',
        passwordCreatedAt: new Date(),
      })

      toast.success('¡Contraseña creada correctamente!')

      setTimeout(() => {
        router.push('/auth/login?registered=true')
      }, 1500)
    } catch (error: any) {
      console.error('Error creating password:', error)
      const errorMessage = error.message || 'Error al crear la contraseña'

      if (error.code === 'auth/email-already-in-use') {
        toast.error('Este email ya está registrado')
      } else if (error.code === 'auth/weak-password') {
        toast.error('La contraseña es muy débil')
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Email no encontrado</h1>
          <p className="text-gray-600 mb-6">Por favor, completa el registro nuevamente.</p>
          <Link
            href="/auth/register"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            Volver al Registro
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-2"></div>
          <h1 className="text-3xl font-bold text-gray-900">Crear Contraseña</h1>
          <p className="text-gray-600 mt-2">Paso 2 de 2: Asegura tu cuenta</p>
          <p className="text-xs text-gray-500 mt-3 bg-green-50 py-2 px-3 rounded">
            Email: <strong>{email}</strong>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Crea una contraseña segura"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Confirma tu contraseña"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
              >
                {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          {/* Validation Requirements */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm">
            <p className="font-bold text-blue-900 mb-2">La contraseña debe tener:</p>
            <ul className="space-y-1 text-blue-800 text-xs">
              <li>✓ Mínimo 8 caracteres</li>
              <li>✓ Una letra mayúscula (A-Z)</li>
              <li>✓ Una letra minúscula (a-z)</li>
              <li>✓ Un número (0-9)</li>
              <li>✓ Un carácter especial (!@#$%^&*)</li>
            </ul>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 p-3 rounded">
              {errors.map((error, index) => (
                <p key={index} className="text-red-700 text-sm">
                  ❌ {error}
                </p>
              ))}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            {loading ? 'Creando contraseña...' : 'Crear Contraseña'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 border-t border-gray-300"></div>

        {/* Login Link */}
        <p className="text-center text-gray-600 text-sm">
          ¿Ya tienes contraseña?{' '}
          <Link href="/auth/login" className="text-green-600 font-bold hover:text-green-700">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <SetPasswordContent />
    </Suspense>
  )
}
