'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'

export default function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = searchParams.get('token')
        const emailParam = searchParams.get('email')

        if (!token || !emailParam) {
          throw new Error('Token o email no proporcionados')
        }

        setEmail(decodeURIComponent(emailParam))

        const verificationRef = doc(db, 'emailVerifications', emailParam)
        const verificationDoc = await getDoc(verificationRef)

        if (!verificationDoc.exists()) {
          throw new Error('Token de verificación no encontrado')
        }

        const verificationData = verificationDoc.data()

        if (verificationData.token !== token) {
          throw new Error('Token inválido')
        }

        const expiresAt = verificationData.expiresAt?.toDate?.() || new Date(verificationData.expiresAt)
        if (new Date() > expiresAt) {
          throw new Error('Token expirado. Solicita un nuevo email de verificación.')
        }

        await updateDoc(verificationRef, {
          verified: true,
          verifiedAt: new Date(),
        })

        const userRef = doc(db, 'users', emailParam)
        const userDoc = await getDoc(userRef)

        if (!userDoc.exists()) {
          await setDoc(userRef, {
            email: emailParam,
            emailVerified: true,
            role: 'usuario',
            createdAt: new Date(),
            status: 'pending_password',
          })
        } else {
          await updateDoc(userRef, {
            emailVerified: true,
            status: 'pending_password',
          })
        }

        setVerified(true)
        toast.success('Email verificado correctamente')

        setTimeout(() => {
          router.push(`/auth/set-password?email=${encodeURIComponent(emailParam)}`)
        }, 2000)
      } catch (err: any) {
        console.error('Error verifying email:', err)
        setError(err.message || 'Error al verificar email')
        toast.error(err.message || 'Error al verificar email')
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
          <div className="animate-spin text-4xl mb-4"></div>
          <p className="text-gray-600">Verificando tu email...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error de Verificación</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/auth/register"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            Volver a Registrarse
          </Link>
        </div>
      </div>
    )
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verificado</h1>
          <p className="text-gray-600 mb-2">
            Tu email <strong>{email}</strong> ha sido verificado correctamente.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Redirigiendo a crear contraseña...
          </p>
        </div>
      </div>
    )
  }

  return null
}
