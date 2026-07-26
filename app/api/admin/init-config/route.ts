import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'

export const dynamic = 'force-dynamic'

const DEFAULT_CONFIG = {
  categorias: ['frutas', 'verduras', 'organico', 'carnes', 'embutidos', 'otro'],
  estados: ['pendiente', 'confirmada', 'entregada', 'cancelada'],
  roles: ['user', 'admin'],
  comunas: ['Las Condes', 'Vitacura', 'Lo Barnechea', 'Providencia', 'La Reina', 'Ñuñoa'],
  metodosPago: ['transferencia', 'transbank'],
  tiposVenta: ['unidad', 'kilo'],
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adminKey } = body

    // Simple protection
    if (adminKey !== process.env.SEED_ADMIN_KEY) {
      return NextResponse.json(
        { error: 'Clave de administrador inválida' },
        { status: 403 }
      )
    }

    await setDoc(doc(db, 'config', 'general'), DEFAULT_CONFIG)

    return NextResponse.json(
      { success: true, message: 'Configuración inicializada correctamente', config: DEFAULT_CONFIG },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error initializing config:', error)
    return NextResponse.json(
      { error: 'Error al inicializar configuración' },
      { status: 500 }
    )
  }
}
