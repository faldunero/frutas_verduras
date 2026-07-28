'use client'

import { ReactNode } from 'react'
import { CartOrderSync } from './CartOrderSync'

export function LayoutClient({ children }: { children: ReactNode }) {
  return (
    <>
      <CartOrderSync />
      {children}
    </>
  )
}
