import { db } from '@/lib/firebase'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { fix } = await req.json()

    // Obtener todos los productos
    const productosRef = collection(db, 'productos')
    const snapshot = await getDocs(productosRef)

    // Filtrar productos con stock negativo
    const productosNegativos = snapshot.docs
      .map(doc => ({
        id: doc.id,
        nombre: doc.data().nombre,
        stock: doc.data().stock,
        unidades: doc.data().unidades,
      }))
      .filter(p => (p.stock && p.stock < 0) || (p.unidades && p.unidades < 0))

    console.log(`[Cleanup Stock] Encontrados ${productosNegativos.length} productos con stock negativo`)

    // Si solo queremos listar, retornar
    if (!fix) {
      return NextResponse.json({
        productosConStock: productosNegativos.length,
        productos: productosNegativos,
        message: 'Usa fix: true para corregirlos a 0'
      })
    }

    // Corregir productos con stock negativo
    let corregidos = 0
    for (const producto of productosNegativos) {
      try {
        const updateData: any = {}
        if (producto.stock && producto.stock < 0) updateData.stock = 0
        if (producto.unidades && producto.unidades < 0) updateData.unidades = 0

        await updateDoc(doc(db, 'productos', producto.id), updateData)
        corregidos++
      } catch (error) {
        console.error(`Error corrigiendo ${producto.id}:`, error)
      }
    }

    console.log(`[Cleanup Stock] Corregidos ${corregidos} productos`)
    return NextResponse.json({
      success: true,
      corregidos,
      message: `${corregidos} productos corregidos a stock 0`
    })
  } catch (error: any) {
    console.error('[Cleanup Stock] Error:', error.message)
    return NextResponse.json({
      error: 'Error al limpiar stock',
      details: error.message
    }, { status: 500 })
  }
}
