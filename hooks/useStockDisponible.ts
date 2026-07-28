import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

export function useStockDisponible(productoId: string, stockTotal: number) {
  const [stockDisponible, setStockDisponible] = useState(stockTotal)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const calcularStockDisponible = async () => {
      try {
        console.log('[useStockDisponible] Calculating for product:', productoId, 'total:', stockTotal)

        // Obtener todas las órdenes pendientes con reserva activa
        const ahora = new Date()
        const ordenesRef = collection(db, 'ordenes')
        const q = query(
          ordenesRef,
          where('estado', '==', 'pendiente'),
          where('reservadoHasta', '>', ahora)
        )

        const snapshot = await getDocs(q)
        console.log('[useStockDisponible] Found pending orders:', snapshot.size)
        let totalReservado = 0

        // Sumar cantidad reservada de este producto
        snapshot.docs.forEach((doc) => {
          const orden = doc.data()
          console.log('[useStockDisponible] Order:', doc.id, 'items:', orden.items)
          const itemReservado = orden.items?.find((item: any) => item.productoId === productoId)
          if (itemReservado) {
            console.log('[useStockDisponible] Found reserved item:', itemReservado.cantidad)
            totalReservado += itemReservado.cantidad
          }
        })

        console.log('[useStockDisponible] Total reserved:', totalReservado, 'available:', stockTotal - totalReservado)

        // Stock disponible = total - reservado
        const disponible = Math.max(0, stockTotal - totalReservado)
        setStockDisponible(disponible)
      } catch (error) {
        console.error('[useStockDisponible] Error:', error)
        setStockDisponible(stockTotal)
      } finally {
        setLoading(false)
      }
    }

    calcularStockDisponible()

    // Recalcular cada 10 segundos (para reflejar nuevas reservas)
    const interval = setInterval(calcularStockDisponible, 10000)
    return () => clearInterval(interval)
  }, [productoId, stockTotal])

  return { stockDisponible, loading }
}
