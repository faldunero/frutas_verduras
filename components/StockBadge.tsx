'use client'

import { Producto } from '@/lib/firebase'

export function StockBadge({ producto }: { producto: Producto & { id: string } }) {
  const stockActual = (producto.unidades || 0) as number

  const label = producto.unidadVenta === 'kilo'
    ? `Kilos: ${stockActual}`
    : `Unidades: ${stockActual}`

  return (
    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
      {label}
    </span>
  )
}
