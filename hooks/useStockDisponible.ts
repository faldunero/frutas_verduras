import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

export function useStockDisponible(productoId: string, stockTotal: number) {
  const [stockDisponible, setStockDisponible] = useState(stockTotal)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      // Real-time listener para órdenes pendientes
      const ahora = new Date()
      const ordenesRef = collection(db, 'ordenes')
      const q = query(
        ordenesRef,
        where('estado', '==', 'pendiente'),
        where('reservadoHasta', '>', ahora)
      )

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          let totalReservado = 0

          // Sumar cantidad reservada de este producto
          snapshot.docs.forEach((doc) => {
            const orden = doc.data()
            const itemReservado = orden.items?.find((item: any) => item.productoId === productoId)
            if (itemReservado) {
              totalReservado += itemReservado.cantidad
            }
          })

          const disponible = Math.max(0, stockTotal - totalReservado)
          setStockDisponible(disponible)
          setLoading(false)
        },
        (error) => {
          console.error('Error en useStockDisponible:', error)
          setStockDisponible(stockTotal)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (error) {
      console.error('Error iniciando useStockDisponible:', error)
      setStockDisponible(stockTotal)
      setLoading(false)
    }
  }, [productoId, stockTotal])

  return { stockDisponible, loading }
}
