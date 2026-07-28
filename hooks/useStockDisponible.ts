import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

export function useStockDisponible(productoId: string, stockTotal: number) {
  const [stockDisponible, setStockDisponible] = useState(stockTotal)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('[useStockDisponible] INIT - producto:', productoId, 'total:', stockTotal)

    const calcularStockDisponible = async () => {
      try {
        console.log('[useStockDisponible] CALC START - producto:', productoId)

        // Obtener todas las órdenes pendientes con reserva activa
        const ahora = new Date()
        console.log('[useStockDisponible] Current time:', ahora.toISOString())

        const ordenesRef = collection(db, 'ordenes')
        const q = query(
          ordenesRef,
          where('estado', '==', 'pendiente'),
          where('reservadoHasta', '>', ahora)
        )

        console.log('[useStockDisponible] Querying orders...')
        const snapshot = await getDocs(q)
        console.log('[useStockDisponible] RESULT - found:', snapshot.size, 'orders')

        let totalReservado = 0

        // Sumar cantidad reservada de este producto
        snapshot.docs.forEach((doc) => {
          const orden = doc.data()
          const itemReservado = orden.items?.find((item: any) => item.productoId === productoId)
          if (itemReservado) {
            console.log('[useStockDisponible] FOUND RESERVED:', itemReservado.cantidad, 'for product', productoId)
            totalReservado += itemReservado.cantidad
          }
        })

        const disponible = Math.max(0, stockTotal - totalReservado)
        console.log('[useStockDisponible] FINAL - reserved:', totalReservado, 'available:', disponible)
        setStockDisponible(disponible)
        setLoading(false)
      } catch (error: any) {
        console.error('[useStockDisponible] ERROR:', error.message || error)
        setStockDisponible(stockTotal)
        setLoading(false)
      }
    }

    calcularStockDisponible()

    // Recalcular cada 10 segundos
    const interval = setInterval(() => {
      console.log('[useStockDisponible] RECALC - producto:', productoId)
      calcularStockDisponible()
    }, 10000)

    return () => {
      clearInterval(interval)
      console.log('[useStockDisponible] CLEANUP - producto:', productoId)
    }
  }, [productoId, stockTotal])

  return { stockDisponible, loading }
}
