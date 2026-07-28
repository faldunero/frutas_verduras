import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
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

    // Verificar estado
    if (orden.estado === 'pagada') {
      return NextResponse.json({ error: 'Orden ya fue pagada' }, { status: 400 })
    }

    if (orden.estado === 'cancelada') {
      return NextResponse.json({ error: 'Orden está cancelada' }, { status: 400 })
    }

    // NOTA: El stock YA fue decrementado cuando se agregó al carrito
    // Aquí solo marcamos la orden como pagada

    // Actualizar estado de la orden a pagada
    await updateDoc(ordenRef, {
      estado: 'pagada',
      pagadoEn: new Date(),
    })

    console.log(`✅ Orden ${ordenId} confirmada como pagada`)
    return NextResponse.json({ success: true, message: 'Pago confirmado' })
  } catch (error) {
    console.error('Error confirmando pago:', error)
    return NextResponse.json({ error: 'Error al confirmar pago' }, { status: 500 })
  }
}
