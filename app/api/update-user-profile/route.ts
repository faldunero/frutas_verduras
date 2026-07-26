import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const auth = getAuth()
    const user = auth.currentUser

    if (!user) {
      return NextResponse.json(
        { error: 'No estás autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { telefono } = body

    if (!telefono) {
      return NextResponse.json(
        { error: 'Teléfono es requerido' },
        { status: 400 }
      )
    }

    // Validar formato básico de teléfono
    if (!/^\+?[0-9\s\-()]{8,}$/.test(telefono)) {
      return NextResponse.json(
        { error: 'Formato de teléfono inválido' },
        { status: 400 }
      )
    }

    // Actualizar documento del usuario en Firestore
    const userRef = doc(db, 'users', user.uid)
    await updateDoc(userRef, {
      telefono,
      updatedAt: new Date(),
    })

    return NextResponse.json(
      { success: true, message: 'Perfil actualizado correctamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in update-user-profile:', error)
    return NextResponse.json(
      { error: 'Error al actualizar perfil' },
      { status: 500 }
    )
  }
}
