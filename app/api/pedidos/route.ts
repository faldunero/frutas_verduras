import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore'
import { sendEmail, emailConfirmacionPedido, emailCambioEstado } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { usuarioId, usuarioEmail, usuarioNombre, items, total, direccion, telefono } = await request.json()

    if (!usuarioId || !usuarioEmail || !items || !total) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    // Crear pedido
    const docRef = await addDoc(collection(db, 'pedidos'), {
      usuarioId,
      usuarioEmail,
      usuarioNombre,
      items,
      total,
      direccion,
      telefono,
      estado: 'pendiente', // Server-side default - matches config.estados[0]
      fechaCreacion: serverTimestamp(),
    })

    // Enviar email de confirmación
    try {
      await sendEmail(
        usuarioEmail,
        'Tu pedido ha sido confirmado',
        emailConfirmacionPedido(usuarioNombre, docRef.id, total, items, direccion || 'No especificada')
      )
    } catch (emailError) {
      console.error('Error enviando email:', emailError)
    }

    // Reducir stock
    for (const item of items) {
      const productoRef = doc(db, 'productos', item.id)
      const productoDoc = await getDoc(productoRef)
      if (productoDoc.exists()) {
        await updateDoc(productoRef, {
          stock: Math.max(0, productoDoc.data().stock - item.cantidad),
        })
      }
    }

    return NextResponse.json({ success: true, pedidoId: docRef.id })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { pedidoId, nuevoEstado, usuarioEmail, usuarioNombre } = await request.json()

    if (!pedidoId || !nuevoEstado) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    // Actualizar estado
    const pedidoRef = doc(db, 'pedidos', pedidoId)
    await updateDoc(pedidoRef, { estado: nuevoEstado })

    // Enviar email de cambio de estado
    try {
      if (usuarioEmail && usuarioNombre) {
        await sendEmail(
          usuarioEmail,
          'Tu pedido ha sido actualizado',
          emailCambioEstado(usuarioNombre, pedidoId, nuevoEstado)
        )
      }
    } catch (emailError) {
      console.error('Error enviando email:', emailError)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
