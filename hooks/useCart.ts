import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Producto } from '@/lib/firebase'

export interface CartItem extends Producto {
  cantidad: number
}

interface CartStore {
  items: CartItem[]
  addItem: (producto: Producto & { id: string }, cantidad: number) => void
  removeItem: (productoId: string) => void
  updateQuantity: (productoId: string, cantidad: number) => void
  clearCart: () => void
  getTotal: () => number
  getSubtotal: () => number
}

export const useCart = create<CartStore>(
  persist(
    (set, get): CartStore => ({
  items: [],

  addItem: (producto, cantidad) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.id === producto.id)

      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.id === producto.id
              ? { ...item, cantidad: item.cantidad + cantidad }
              : item
          ),
        }
      }

      return {
        items: [...state.items, { ...producto, cantidad }],
      }
    })
  },

  removeItem: (productoId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== productoId),
    }))
  },

  updateQuantity: (productoId, cantidad) => {
    if (cantidad <= 0) {
      get().removeItem(productoId)
      return
    }

    set((state) => ({
      items: state.items.map((item) =>
        item.id === productoId ? { ...item, cantidad } : item
      ),
    }))
  },

  clearCart: () => {
    set({ items: [] })
  },

  getSubtotal: () => {
    return get().items.reduce((total, item) => total + item.precio * item.cantidad, 0)
  },

  getTotal: () => {
    const subtotal = get().getSubtotal()
    // Agregar 19% de impuesto (IVA Chile)
    return Math.round(subtotal * 1.19)
  },
    }),
    {
      name: 'cart-storage',
    }
  )
)
