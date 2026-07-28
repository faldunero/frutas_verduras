import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { ordenId } = await req.json()

    if (!ordenId) {
      return NextResponse.json({ error: 'Falta ordenId' }, { status: 400 })
    }

    // Obtener la orden
    const ordenRef = doc(db, 'ordenes', ordenId)
    const ordenSnap = await getDoc(ordenRef)

    if (!ordenSnap.exists()) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    const orden = ordenSnap.data()

    // Verificar que la orden aún está dentro del tiempo de reserva
    if (orden.reservadoHasta && new Date() > orden.reservadoHasta.toDate?.()) {
      return NextResponse.json({ error: 'Reserva expirada' }, { status: 400 })
    }

    // Descontar stock de cada producto
    for (const item of orden.items || []) {
      try {
        const productoRef = doc(db, 'productos', item.productoId)
        await updateDoc(productoRef, {
          unidades: increment(-item.cantidad),
          stock: increment(-item.cantidad),
        })
      } catch (error) {
        console.error(`Error descontando stock para ${item.productoId}:`, error)
        throw error
      }
    }

    // Actualizar estado de la orden
    await updateDoc(ordenRef, {
      estado: 'pagada',
      pagadoEn: new Date(),
    })

    console.log(`✅ Orden ${ordenId} confirmada y stock descontado`)
    return NextResponse.json({ success: true, message: 'Orden confirmada' })
  } catch (error) {
    console.error('Error confirmando pago:', error)
    return NextResponse.json({ error: 'Error al confirmar pago' }, { status: 500 })
  }
}
