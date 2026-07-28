'use client'

import { useStockDisponible } from '@/hooks/useStockDisponible'
import { Producto } from '@/lib/firebase'

export function StockBadge({ producto }: { producto: Producto & { id: string } }) {
  const stockTotal = (producto.unidades || producto.stock || 0) as number
  const { stockDisponible } = useStockDisponible(producto.id, stockTotal)

  const label = producto.unidadVenta === 'kilo'
    ? `Kilos: ${stockDisponible}`
    : `Unidades: ${stockDisponible}`

  return (
    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
      {label}
    </span>
  )
}
