import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente del servidor con service role (solo para operaciones admin)
export const supabaseAdmin = () => {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          nombre: string
          rol: 'client' | 'admin'
          direccion: string | null
          telefono: string | null
          created_at: string
        }
      }
      productos: {
        Row: {
          id: string
          nombre: string
          descripcion: string
          precio: number
          stock: number
          categoria: string
          imagen_url: string | null
          peso: string
          disponible: boolean
          destacado: boolean
          created_at: string
          updated_at: string
        }
      }
      ordenes: {
        Row: {
          id: string
          user_id: string
          estado: 'pendiente' | 'pagada' | 'enviada' | 'entregada'
          total: number
          subtotal: number
          impuestos: number
          envio: number
          direccion_entrega: string
          metodo_pago: string
          referencia_pago: string
          created_at: string
          updated_at: string
        }
      }
      faqs: {
        Row: {
          id: string
          pregunta: string
          respuesta: string
          orden: number
          activo: boolean
          created_at: string
        }
      }
    }
  }
}
