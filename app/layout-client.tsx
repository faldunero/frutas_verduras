'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  const isHome = pathname === '/'

  return (
    <>
      {!isAdmin && !isHome && <Header />}
      <main className={isAdmin ? '' : 'min-h-screen'}>
        {children}
      </main>
      {!isAdmin && !isHome && <Footer />}
    </>
  )
}
