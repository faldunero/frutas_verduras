'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
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

interface ConfigContextType {
  config: Config
  loading: boolean
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined)

// Flag global para evitar múltiples listeners
let listenerActive = false
let configState: Config = DEFAULT_CONFIG

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(false) // False por defecto (cache prioritario)

  useEffect(() => {
    // 1. Cargar desde cache inmediatamente
    const cachedConfig = clientCache.get<Config>(CACHE_KEYS.CONFIG)
    if (cachedConfig) {
      setConfig(cachedConfig)
      configState = cachedConfig
      setLoading(false)
      return // No necesita cargar de BD si cache es fresco
    }

    // 2. Solo una conexión a Firestore por aplicación
    if (listenerActive) return

    listenerActive = true
    setLoading(true)

    const unsubscribe = onSnapshot(
      doc(db, 'config', 'general'),
      (docSnap) => {
        try {
          if (docSnap.exists()) {
            const newConfig = docSnap.data() as Config
            setConfig(newConfig)
            configState = newConfig
            clientCache.set(CACHE_KEYS.CONFIG, newConfig, CACHE_TTL.LONG)
          }
        } catch (error) {
          console.error('Error loading config:', error)
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error subscribing to config:', error)
        setLoading(false)
        // Usar cache o default si BD falla
        const cached = clientCache.get<Config>(CACHE_KEYS.CONFIG)
        if (cached) {
          setConfig(cached)
          configState = cached
        }
      }
    )

    return () => {
      unsubscribe()
      listenerActive = false
    }
  }, [])

  return (
    <ConfigContext.Provider value={{ config, loading }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  const context = useContext(ConfigContext)
  if (context === undefined) {
    throw new Error('useConfig debe ser usado dentro de ConfigProvider')
  }
  return context
}

export function getConfigSync(): Config {
  return configState
}
