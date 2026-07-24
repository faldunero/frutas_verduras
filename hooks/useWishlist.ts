'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Producto } from '@/lib/firebase'

interface WishlistItem extends Producto {
  id: string
}

interface WishlistStore {
  items: WishlistItem[]
  addItem: (producto: Producto & { id: string }) => void
  removeItem: (id: string) => void
  isInWishlist: (id: string) => boolean
  clearWishlist: () => void
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (producto) => {
        const { items } = get()
        if (!items.find((item) => item.id === producto.id)) {
          set({ items: [...items, producto] })
        }
      },
      removeItem: (id) => {
        const { items } = get()
        set({ items: items.filter((item) => item.id !== id) })
      },
      isInWishlist: (id) => {
        const { items } = get()
        return items.some((item) => item.id === id)
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-storage',
    }
  )
)
