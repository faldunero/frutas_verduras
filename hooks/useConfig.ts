import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import { clientCache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'

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
    // 1. Intentar cargar desde cache local (más rápido)
    const cachedConfig = clientCache.get<Config>(CACHE_KEYS.CONFIG)
    if (cachedConfig) {
      setConfig(cachedConfig)
      setLoading(false)
      // Pero aún actualiza desde BD en background
    }

    // 2. Suscribirse a Firestore en tiempo real (para cambios)
    const unsubscribe = onSnapshot(
      doc(db, 'config', 'general'),
      (docSnap) => {
        try {
          if (docSnap.exists()) {
            const newConfig = docSnap.data() as Config
            setConfig(newConfig)
            // Cachear en cliente (1 hora)
            clientCache.set(CACHE_KEYS.CONFIG, newConfig, CACHE_TTL.LONG)
          } else {
            // Si no existe en BD, usar default
            setConfig(DEFAULT_CONFIG)
            clientCache.set(CACHE_KEYS.CONFIG, DEFAULT_CONFIG, CACHE_TTL.LONG)
          }
        } catch (error) {
          console.error('Error loading config:', error)
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error subscribing to config:', error)
        // Si falla la conexión, usar cache o default
        const cached = clientCache.get<Config>(CACHE_KEYS.CONFIG)
        if (cached) {
          setConfig(cached)
        }
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { config, loading }
}
