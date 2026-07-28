import { db } from '@/lib/firebase'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { preview } = await req.json()

    // Obtener todos los productos
    const productosRef = collection(db, 'productos')
    const snapshot = await getDocs(productosRef)

    const cambios = []
    let migrando = 0

    // Analizar qué necesita cambiar
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data()
      const unidades = data.unidades
      const stock = data.stock

      // Si unidades no existe o es 0, pero stock existe y tiene valor
      if ((!unidades || unidades === 0) && stock && stock !== 0) {
        cambios.push({
          id: docSnap.id,
          nombre: data.nombre,
          accion: 'copiar stock → unidades',
          de: { unidades, stock },
          a: { unidades: stock, stock: null }
        })
        migrando++
      }
      // Si ambos existen y son diferentes
      else if (unidades && stock && unidades !== stock) {
        cambios.push({
          id: docSnap.id,
          nombre: data.nombre,
          accion: 'stock es redundante (unidades tiene valor)',
          de: { unidades, stock },
          a: { stock: null }
        })
        migrando++
      }
      // Si stock es negativo pero unidades es válido
      else if (stock && stock < 0 && unidades && unidades > 0) {
        cambios.push({
          id: docSnap.id,
          nombre: data.nombre,
          accion: 'remover stock negativo',
          de: { unidades, stock },
          a: { stock: null }
        })
        migrando++
      }
    }

    // Si solo preview, retornar cambios
    if (preview) {
      return NextResponse.json({
        preview: true,
        productosAMigrar: migrando,
        cambios: cambios.slice(0, 20), // Mostrar primeros 20
        total: cambios.length,
        message: `Se migrarán ${migrando} productos. Usa preview: false para aplicar.`
      })
    }

    // Aplicar cambios
    let migrados = 0
    for (const cambio of cambios) {
      try {
        const updateData: any = {}

        // Si stock tiene valor y unidades no, copiar stock
        if ((!cambio.de.unidades || cambio.de.unidades === 0) && cambio.de.stock) {
          updateData.unidades = cambio.de.stock
        }

        // Remover stock (siempre)
        updateData.stock = null

        await updateDoc(doc(db, 'productos', cambio.id), updateData)
        migrados++
      } catch (error) {
        console.error(`Error migrando ${cambio.id}:`, error)
      }
    }

    console.log(`[Migrate] Migraron ${migrados} productos`)
    return NextResponse.json({
      success: true,
      migrados,
      message: `${migrados} productos migrados. Campo 'stock' eliminado.`
    })
  } catch (error: any) {
    console.error('[Migrate] Error:', error.message)
    return NextResponse.json({
      error: 'Error en migración',
      details: error.message
    }, { status: 500 })
  }
}
