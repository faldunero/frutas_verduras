import { db } from '@/lib/firebase'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { confirm } = await req.json()

    // Obtener todas las órdenes
    const ordenesRef = collection(db, 'ordenes')
    const snapshot = await getDocs(ordenesRef)

    // Filtrar órdenes sin usuarioId
    const ordenesViejas = snapshot.docs
      .map(doc => ({
        id: doc.id,
        data: doc.data()
      }))
      .filter(orden => !orden.data.usuarioId)

    console.log(`[Cleanup] Encontradas ${ordenesViejas.length} órdenes sin usuarioId`)

    // Si solo queremos listar, retornar
    if (!confirm) {
      return NextResponse.json({
        ordenesAEliminar: ordenesViejas.length,
        ordenes: ordenesViejas.map(o => ({
          id: o.id,
          estado: o.data.estado,
          email: o.data.email,
          createdAt: o.data.createdAt
        })),
        message: 'Usa confirm: true para eliminarlas'
      })
    }

    // Eliminar órdenes viejas
    let eliminadas = 0
    for (const orden of ordenesViejas) {
      try {
        await deleteDoc(doc(db, 'ordenes', orden.id))
        eliminadas++
      } catch (error) {
        console.error(`Error eliminando orden ${orden.id}:`, error)
      }
    }

    console.log(`[Cleanup] Eliminadas ${eliminadas} órdenes viejas`)
    return NextResponse.json({
      success: true,
      eliminadas,
      message: `${eliminadas} órdenes eliminadas. Ahora puedes aplicar las nuevas reglas de seguridad.`
    })
  } catch (error: any) {
    console.error('[Cleanup] Error completo:', error)
    console.error('[Cleanup] Error message:', error.message)
    console.error('[Cleanup] Error code:', error.code)
    return NextResponse.json({
      error: 'Error al limpiar órdenes',
      details: error.message,
      code: error.code
    }, { status: 500 })
  }
}
