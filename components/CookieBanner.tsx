'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Mostrar banner si no hay consentimiento de cookies guardado
    const cookieConsent = localStorage.getItem('cookieConsent')
    if (!cookieConsent) {
      setShow(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    setShow(false)
  }

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-gray-100 p-6 shadow-lg border-t-4 border-green-600 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium mb-2">
              🍪 Uso de Cookies - Ley 21.719
            </p>
            <p className="text-xs text-gray-400">
              Utilizamos cookies para mejorar tu experiencia de navegación. Algunas cookies son técnicas (obligatorias) y otras son analíticas.
              <Link href="/privacidad" className="text-green-400 hover:text-green-300 font-medium ml-1">
                Conoce más sobre nuestro tratamiento de datos.
              </Link>
            </p>
          </div>

          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={handleReject}
              className="px-4 py-2 rounded border border-gray-600 hover:bg-gray-800 text-sm font-medium transition"
            >
              Rechazar
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
