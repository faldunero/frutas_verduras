import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, updateDoc, doc, increment } from 'firebase/firestore'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    // Obtener todas las órdenes pendientes con reserva expirada
    const ahora = new Date()
    const ordenesRef = collection(db, 'ordenes')
    const q = query(
      ordenesRef,
      where('estado', '==', 'pendiente'),
      where('reservadoHasta', '<', ahora)
    )

    const snapshot = await getDocs(q)
    let liberadas = 0

    // Liberar cada reserva expirada
    for (const docSnap of snapshot.docs) {
      const orden = docSnap.data()

      // Devolver stock de cada item
      for (const item of orden.items || []) {
        try {
          const productoRef = doc(db, 'productos', item.productoId)
          await updateDoc(productoRef, {
            unidades: increment(item.cantidad),
            stock: increment(item.cantidad),
          })
        } catch (error) {
          console.error(`Error liberando stock para ${item.productoId}:`, error)
        }
      }

      // Marcar orden como "expirada"
      await updateDoc(doc(db, 'ordenes', docSnap.id), {
        estado: 'expirada',
      })

      liberadas++
    }

    console.log(`✅ Liberadas ${liberadas} reservas expiradas`)
    return NextResponse.json({ liberadas, success: true })
  } catch (error) {
    console.error('Error liberando reservas:', error)
    return NextResponse.json({ error: 'Error al liberar reservas' }, { status: 500 })
  }
}
