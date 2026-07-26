'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3'

function RegisterForm() {
  const [email, setEmail] = useState('')
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { executeRecaptcha } = useGoogleReCaptcha()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre || !email) {
      toast.error('Completa todos los campos')
      return
    }

    setLoading(true)

    try {
      // Ejecutar reCAPTCHA
      if (!executeRecaptcha) {
        throw new Error('reCAPTCHA no está disponible')
      }

      const recaptchaToken = await executeRecaptcha('register')

      // Enviar email de verificación
      const response = await fetch('/api/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          recaptchaToken,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar email de verificación')
      }

      toast.success('Email de verificación enviado. Revisa tu correo.')
      setSubmitted(true)
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Revisa tu Email</h1>
          <p className="text-gray-600 mb-6">
            Enviamos un link de verificación a <strong>{email}</strong>. Haz clic en el link para completar tu registro.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            El link expira en 24 horas.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            ← Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🥬</div>
          <h1 className="text-3xl font-bold text-gray-900">Frutas & Verduras</h1>
          <p className="text-gray-600 mt-2">Crea tu cuenta</p>
          <p className="text-xs text-gray-500 mt-3 bg-green-50 py-2 px-3 rounded">
            Paso 1 de 2: Verifica tu email
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="tu@email.com"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm text-blue-800">
            <strong>¿Cómo funciona?</strong><br/>
            Te enviaremos un email de verificación. Haz clic en el link para completar tu registro, crear contraseña y llenar tus datos de envío.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            {loading ? 'Enviando email...' : 'Enviar email de verificación'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 border-t border-gray-300"></div>

        {/* Login Link */}
        <p className="text-center text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="text-green-600 font-bold hover:text-green-700">
            Inicia sesión
          </Link>
        </p>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center mt-6">
          Al registrarte, aceptas nuestros términos de servicio y política de
          privacidad
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  if (!siteKey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">Error: reCAPTCHA no está configurado</p>
      </div>
    )
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={siteKey}>
      <RegisterForm />
    </GoogleReCaptchaProvider>
  )
}
