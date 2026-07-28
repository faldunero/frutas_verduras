'use client'

import { ReactNode } from 'react'
import { CartOrderSync } from './CartOrderSync'
import { CleanupExpiredOrders } from './CleanupExpiredOrders'

export function LayoutClient({ children }: { children: ReactNode }) {
  return (
    <>
      <CartOrderSync />
      <CleanupExpiredOrders />
      {children}
    </>
  )
}
