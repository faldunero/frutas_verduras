'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'

interface ZoomControlProps {
  children: React.ReactNode
  backLink?: string
  backLabel?: string
}

export function ZoomControl({ children, backLink, backLabel = 'Volver' }: ZoomControlProps) {
  const [zoom, setZoom] = useState<number>(100)

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontSize: `${zoom}%` }}>
      {/* Zoom Control Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-300">
              <button
                onClick={() => setZoom(Math.max(80, zoom - 10))}
                className="text-gray-600 hover:text-gray-900 font-bold text-lg"
                title="Zoom out"
              >
                −
              </button>
              <span className="text-sm font-medium min-w-12 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(150, zoom + 10))}
                className="text-gray-600 hover:text-gray-900 font-bold text-lg"
                title="Zoom in"
              >
                +
              </button>
            </div>
            {backLink && (
              <Link
                href={backLink}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <FiArrowLeft size={18} />
                {backLabel}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  )
}
