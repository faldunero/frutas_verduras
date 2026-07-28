import { useEffect } from 'react'
import { CONFIG } from '@/lib/config'

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

    // Ejecutar cada X minutos (configurado en CONFIG)
    const interval = setInterval(liberarReservas, CONFIG.CLEANUP_INTERVAL_MINUTES * 60 * 1000)

    return () => clearInterval(interval)
  }, [])
}
