'use client'

import { useCleanupExpiredOrders } from '@/hooks/useCleanupExpiredOrders'

export function CleanupExpiredOrders() {
  useCleanupExpiredOrders()
  return null
}
