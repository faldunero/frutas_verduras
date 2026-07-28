'use client'

import { useEffect } from 'react'
import { useCartOrder } from '@/hooks/useCartOrder'

export function CartOrderSync() {
  // Este componente solo sincroniza, no renderiza nada
  const { ordenId, syncing } = useCartOrder()

  useEffect(() => {
    console.log('[CartOrderSync] Component mounted, ordenId:', ordenId, 'syncing:', syncing)
  }, [ordenId, syncing])

  return null
}
