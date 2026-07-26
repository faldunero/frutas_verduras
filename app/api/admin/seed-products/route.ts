import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

export const dynamic = 'force-dynamic'

const PRODUCTS_TO_ADD = [
  // CARNES - VACUNO
  {
    nombre: 'Filete Vacuno',
    categoria: 'carnes',
    peso: '500g',
    precio: 8990,
    descripcion: 'Filete de vacuno Premium',
    disponible: true,
    destacado: false,
    stock: 0,
  },
  {
    nombre: 'Costilla Vacuno',
    categoria: 'carnes',
    peso: '1kg',
    precio: 6990,
    descripcion: 'Costilla fresca de vacuno',
    disponible: true,
    destacado: false,
    stock: 0,
  },
  {
    nombre: 'Punta de Pecho',
    categoria: 'carnes',
    peso: '1kg',
    precio: 5990,
    descripcion: 'Punta de pecho para guiso',
    disponible: true,
    destacado: false,
    stock: 0,
  },
  {
    nombre: 'Asado Vacuno',
    categoria: 'carnes',
    peso: '1kg',
    precio: 7990,
    descripcion: 'Asado de tira para parrilla',
    disponible: true,
    destacado: true,
    stock: 0,
  },
  {
    nombre: 'Patas de Vacuno',
    categoria: 'carnes',
    peso: '1kg',
    precio: 3990,
    descripcion: 'Patas para caldo',
    disponible: true,
    destacado: false,
    stock: 0,
  },

  // CARNES - AVE
  {
    nombre: 'Pechuga de Pollo',
    categoria: 'carnes',
    peso: '500g',
    precio: 3990,
    descripcion: 'Pechuga de pollo fresca',
    disponible: true,
    destacado: false,
    stock: 0,
  },
  {
    nombre: 'Muslos de Pollo',
    categoria: 'carnes',
    peso: '1kg',
    precio: 2990,
    descripcion: 'Muslos frescos de pollo',
    disponible: true,
    destacado: false,
    stock: 0,
  },
  {
    nombre: 'Alitas de Pollo',
    categoria: 'carnes',
    peso: '500g',
    precio: 1990,
    descripcion: 'Alitas para alas BBQ',
    disponible: true,
    destacado: false,
    stock: 0,
  },
  {
    nombre: 'Pollo Entero',
    categoria: 'carnes',
    peso: '2kg',
    precio: 7990,
    descripcion: 'Pollo fresco completo',
    disponible: true,
    destacado: false,
    stock: 0,
  },
  {
    nombre: 'Pavo Entero',
    categoria: 'carnes',
    peso: '3kg',
    precio: 14990,
    descripcion: 'Pavo fresco para ocasiones especiales',
    disponible: true,
    destacado: false,
    stock: 0,
  },

  // EMBUTIDOS - JAMONES
  {
    nombre: 'Jamón York',
    categoria: 'embutidos',
    peso: '500g',
    precio: 4990,
    descripcion: 'Jamón york rebanado premium',
    disponible: true,
    destacado: false,
    stock: 0,
  },
  {
    nombre: 'Jamón Serrano',
    categoria: 'embutidos',
    peso: '200g',
    precio: 6990,
    descripcion: 'Jamón serrano importado',
    disponible: true,
    destacado: true,
    stock: 0,
  },
  {
    nombre: 'Jamón Ibérico',
    categoria: 'embutidos',
    peso: '100g',
    precio: 8990,
    descripcion: 'Jamón ibérico delicado',
    disponible: true,
    destacado: false,
    stock: 0,
  },

  // EMBUTIDOS - SALCHICHAS
  {
    nombre: 'Salchicha Viena',
    categoria: 'embutidos',
    peso: '400g',
    precio: 2990,
    descripcion: 'Salchichas tipo viena clásicas',
    disponible: true,
    destacado: false,
    stock: 0,
  },
  {
    nombre: 'Salchicha de Pavo',
    categoria: 'embutidos',
    peso: '400g',
    precio: 3490,
    descripcion: 'Salchichas bajas en grasa',
    disponible: true,
    destacado: false,
    stock: 0,
  },
  {
    nombre: 'Salchicha de Pollo',
    categoria: 'embutidos',
    peso: '400g',
    precio: 3290,
    descripcion: 'Salchichas de pollo fresco',
    disponible: true,
    destacado: false,
    stock: 0,
  },
  {
    nombre: 'Hot Dog Premium',
    categoria: 'embutidos',
    peso: '500g',
    precio: 3990,
    descripcion: 'Salchichas para hot dog',
    disponible: true,
    destacado: false,
    stock: 0,
  },

  // EMBUTIDOS - PARA UNTAR
  {
    nombre: 'Paté Tradicional',
    categoria: 'embutidos',
    peso: '250g',
    precio: 2490,
    descripcion: 'Paté casero de hígado',
    disponible: true,
    destacado: false,
    stock: 0,
  },
  {
    nombre: 'Mortadela',
    categoria: 'embutidos',
    peso: '500g',
    precio: 2990,
    descripcion: 'Mortadela tipo italiano',
    disponible: true,
    destacado: false,
    stock: 0,
  },
  {
    nombre: 'Queso para Untar',
    categoria: 'embutidos',
    peso: '200g',
    precio: 1990,
    descripcion: 'Queso untable cremoso',
    disponible: true,
    destacado: false,
    stock: 0,
  },

  // EMBUTIDOS - CHORIZOS
  {
    nombre: 'Chorizo Español',
    categoria: 'embutidos',
    peso: '500g',
    precio: 4490,
    descripcion: 'Chorizo tradicional español',
    disponible: true,
    destacado: false,
    stock: 0,
  },
  {
    nombre: 'Chorizo Parrillero',
    categoria: 'embutidos',
    peso: '600g',
    precio: 3990,
    descripcion: 'Chorizo para parrilla',
    disponible: true,
    destacado: true,
    stock: 0,
  },

  // EMBUTIDOS - OTROS
  {
    nombre: 'Tocino',
    categoria: 'embutidos',
    peso: '300g',
    precio: 2490,
    descripcion: 'Tocino para desayuno',
    disponible: true,
    destacado: false,
    stock: 0,
  },
  {
    nombre: 'Panceta',
    categoria: 'embutidos',
    peso: '400g',
    precio: 3490,
    descripcion: 'Panceta fresca ahumada',
    disponible: true,
    destacado: false,
    stock: 0,
  },
]

export async function POST(request: NextRequest) {
  try {
    const auth = getAuth()
    const user = auth.currentUser

    // Solo admin puede hacer seed
    if (!user) {
      return NextResponse.json(
        { error: 'No estás autenticado' },
        { status: 401 }
      )
    }

    // Verificar que sea admin (opcional, depende de tu implementación)
    const body = await request.json()
    const { adminKey } = body

    // Simple protection - usar una clave
    if (adminKey !== process.env.SEED_ADMIN_KEY) {
      return NextResponse.json(
        { error: 'Clave de administrador inválida' },
        { status: 403 }
      )
    }

    let addedCount = 0
    let skippedCount = 0

    for (const product of PRODUCTS_TO_ADD) {
      // Verificar si el producto ya existe
      const q = query(
        collection(db, 'productos'),
        where('nombre', '==', product.nombre)
      )
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        // Agregar producto
        await addDoc(collection(db, 'productos'), {
          ...product,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        addedCount++
      } else {
        skippedCount++
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Productos agregados: ${addedCount}, Omitidos: ${skippedCount}`,
        added: addedCount,
        skipped: skippedCount,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in seed-products:', error)
    return NextResponse.json(
      { error: 'Error al agregar productos' },
      { status: 500 }
    )
  }
}
