import { useEffect, useRef } from 'react'
import { useCart } from './useCart'
import toast from 'react-hot-toast'

const CART_EXPIRATION_TIME = 10 * 60 * 1000 // 10 minutos

export function useCartExpiration() {
  const { items, clearCart } = useCart()
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const warningShownRef = useRef(false)

  useEffect(() => {
    // Si el carrito está vacío, limpiar
    if (items.length === 0) {
      warningShownRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }

    // Limpiar el timer anterior
    if (timerRef.current) clearTimeout(timerRef.current)

    // Mostrar advertencia a los 8 minutos
    const warningTimer = setTimeout(() => {
      if (!warningShownRef.current) {
        toast.error('Tu carrito expirará en 2 minutos para liberar stock.', {
          duration: 5000,
          icon: '⏰',
        })
        warningShownRef.current = true
      }
    }, 8 * 60 * 1000)

    // Limpiar carrito a los 10 minutos
    timerRef.current = setTimeout(() => {
      clearCart()
      toast.error('Tu carrito ha expirado. Por favor, agrega nuevamente los productos.', {
        duration: 5000,
        icon: '🗑️',
      })
      warningShownRef.current = false
    }, CART_EXPIRATION_TIME)

    return () => {
      if (warningTimer) clearTimeout(warningTimer)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [items.length])
}
