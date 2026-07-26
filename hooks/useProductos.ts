import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { clientCache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'

export interface Producto {
  id: string
  nombre: string
  descripcion: string
  precio: number
  stock: number
  categoria: string
  imagenUrl?: string
  disponible: boolean
  destacado: boolean
  peso?: string
  unidadVenta: 'unidad' | 'kilo'
  conIVA?: boolean
  costo?: number
  createdAt?: any
  updatedAt?: any
}

export function useProductos(filtroCategoria?: string) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Generar key de cache basado en filtro
    const cacheKey = filtroCategoria
      ? `${CACHE_KEYS.PRODUCTOS}:${filtroCategoria}`
      : CACHE_KEYS.PRODUCTOS

    // 1. Intentar cargar desde cache local
    const cachedProductos = clientCache.get<Producto[]>(cacheKey)
    if (cachedProductos) {
      setProductos(cachedProductos)
      setLoading(false)
    }

    // 2. Suscribirse a Firestore en tiempo real
    const q = filtroCategoria
      ? query(collection(db, 'productos'), where('categoria', '==', filtroCategoria))
      : collection(db, 'productos')

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const productosData: Producto[] = []
          snapshot.forEach((doc) => {
            productosData.push({
              id: doc.id,
              ...doc.data(),
            } as Producto)
          })
          setProductos(productosData)
          // Cachear en cliente (30 minutos para productos)
          clientCache.set(cacheKey, productosData, CACHE_TTL.MEDIUM)
        } catch (error) {
          console.error('Error loading productos:', error)
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error subscribing to productos:', error)
        // Si falla, intentar usar cache
        const cached = clientCache.get<Producto[]>(cacheKey)
        if (cached) {
          setProductos(cached)
        }
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [filtroCategoria])

  return { productos, loading }
}
