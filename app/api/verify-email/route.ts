import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, deleteDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, email, password, nombre, telefono, comuna, direccion } = body

    if (!token || !email || !password || !nombre || !telefono || !comuna || !direccion) {
      return NextResponse.json(
        { error: 'Parámetros requeridos faltantes' },
        { status: 400 }
      )
    }

    // Verificar que el token existe y es válido
    const verificationRef = doc(db, 'emailVerifications', email)
    const verificationDoc = await getDoc(verificationRef)

    if (!verificationDoc.exists()) {
      return NextResponse.json(
        { error: 'Token de verificación no válido o expirado' },
        { status: 400 }
      )
    }

    const verificationData = verificationDoc.data()

    // Verificar que el token coincide
    if (verificationData.token !== token) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 400 }
      )
    }

    // Verificar que no ha expirado
    if (new Date() > verificationData.expiresAt.toDate()) {
      await deleteDoc(verificationRef)
      return NextResponse.json(
        { error: 'Token expirado. Solicita uno nuevo' },
        { status: 400 }
      )
    }

    // Crear usuario en Firebase Auth
    const auth = getAuth()
    let uid: string

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      uid = userCredential.user.uid
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        return NextResponse.json(
          { error: 'Este email ya está registrado' },
          { status: 400 }
        )
      }
      throw error
    }

    // Crear documento del usuario en Firestore
    const userRef = doc(db, 'users', uid)
    const now = new Date()

    await require('firebase/firestore').setDoc(userRef, {
      uid,
      email,
      nombre,
      telefono,
      comuna,
      direccion,
      emailVerified: true,
      bloqueado: false,
      rol: 'user',
      createdAt: now,
      updatedAt: now,
    })

    // Eliminar documento de verificación
    await deleteDoc(verificationRef)

    return NextResponse.json(
      { success: true, message: 'Email verificado. Cuenta creada exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in verify-email:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
