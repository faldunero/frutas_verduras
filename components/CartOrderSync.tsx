'use client'

import { useCartOrder } from '@/hooks/useCartOrder'

export function CartOrderSync() {
  // Este componente solo sincroniza, no renderiza nada
  useCartOrder()
  return null
}
