import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

export function useStockDisponible(productoId: string, stockTotal: number) {
  const [stockDisponible, setStockDisponible] = useState(stockTotal)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const calcularStockDisponible = async () => {
      try {
        // Obtener todas las órdenes pendientes con reserva activa
        const ahora = new Date()
        const ordenesRef = collection(db, 'ordenes')
        const q = query(
          ordenesRef,
          where('estado', '==', 'pendiente'),
          where('reservadoHasta', '>', ahora)
        )

        const snapshot = await getDocs(q)
        let totalReservado = 0

        // Sumar cantidad reservada de este producto
        snapshot.docs.forEach((doc) => {
          const orden = doc.data()
          const itemReservado = orden.items?.find((item: any) => item.productoId === productoId)
          if (itemReservado) {
            totalReservado += itemReservado.cantidad
          }
        })

        // Stock disponible = total - reservado
        const disponible = Math.max(0, stockTotal - totalReservado)
        setStockDisponible(disponible)
      } catch (error) {
        console.error('Error calculando stock disponible:', error)
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
