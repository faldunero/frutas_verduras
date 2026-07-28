import { useEffect } from 'react'

export function useCleanupExpiredOrders() {
  useEffect(() => {
    const liberarReservas = async () => {
      try {
        const response = await fetch('/api/liberar-reservas-expiradas', {
          method: 'POST',
        })

        if (response.ok) {
          const data = await response.json()
          if (data.liberadas > 0) {
            console.log(`[Cleanup] Liberadas ${data.liberadas} órdenes expiradas`)
          }
        }
      } catch (error) {
        console.error('[Cleanup] Error liberando reservas:', error)
      }
    }

    // Ejecutar inmediatamente al montar
    liberarReservas()

    // Ejecutar cada 2 minutos
    const interval = setInterval(liberarReservas, 2 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])
}
