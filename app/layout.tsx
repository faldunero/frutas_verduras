import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Toaster } from 'react-hot-toast'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Frutas & Verduras - Compra Online',
  description:
    'Compra frutas y verduras frescas con entrega a domicilio en Chile',
  keywords: 'frutas, verduras, compra online, delivery, Chile',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            success: {
              duration: 3000,
            },
            error: {
              duration: 3000,
            },
          }}
        />
      </body>
    </html>
  )
}
