import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, onSnapshot } from 'firebase/firestore'

export interface Config {
  categorias: string[]
  estados: string[]
  roles: string[]
  comunas: string[]
  metodosPago: string[]
  tiposVenta: string[]
}

const DEFAULT_CONFIG: Config = {
  categorias: ['frutas', 'verduras', 'organico', 'carnes', 'embutidos', 'otro'],
  estados: ['pendiente', 'confirmada', 'entregada', 'cancelada'],
  roles: ['user', 'admin'],
  comunas: ['Las Condes', 'Vitacura', 'Lo Barnechea', 'Providencia', 'La Reina', 'Ñuñoa'],
  metodosPago: ['transferencia', 'transbank'],
  tiposVenta: ['unidad', 'kilo'],
}

export function useConfig() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Intentar cargar de Firestore, si falla usar valores por defecto
    const unsubscribe = onSnapshot(
      collection(db, 'config'),
      (snapshot) => {
        try {
          const configDoc = snapshot.docs.find((doc) => doc.id === 'general')
          if (configDoc?.exists()) {
            setConfig(configDoc.data() as Config)
          }
        } catch (error) {
          console.error('Error loading config:', error)
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error subscribing to config:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { config, loading }
}
