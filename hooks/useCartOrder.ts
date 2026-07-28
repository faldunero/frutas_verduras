'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { CONFIG } from '@/lib/config'
import { doc, setDoc, deleteDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore'
import { useCart } from './useCart'
import { useAuth } from './useAuth'

interface CartItem {
  id: string
  cantidad: number
}

export function useCartOrder() {
  const { items } = useCart()
  const { user, isAuthenticated } = useAuth()
  const [ordenId, setOrdenId] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [previousItems, setPreviousItems] = useState<CartItem[]>([])

  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      setOrdenId(null)
      setPreviousItems([])
      return
    }

    const syncCartToOrder = async () => {
      try {
        setSyncing(true)

        const currentItems = items.map(item => ({ id: item.id, cantidad: item.cantidad }))

        // AJUSTAR STOCK: items removidos o cantidad reducida -> incrementar stock
        for (const prevItem of previousItems) {
          const currentItem = currentItems.find(i => i.id === prevItem.id)
          if (!currentItem) {
            // Item removido: restaurar stock
            const productoRef = doc(db, 'productos', prevItem.id)
            await updateDoc(productoRef, {
              unidades: increment(prevItem.cantidad),
              stock: increment(prevItem.cantidad),
            })
          } else if (currentItem.cantidad < prevItem.cantidad) {
            // Cantidad reducida: restaurar diferencia
            const diff = prevItem.cantidad - currentItem.cantidad
            const productoRef = doc(db, 'productos', prevItem.id)
            await updateDoc(productoRef, {
              unidades: increment(diff),
              stock: increment(diff),
            })
          }
        }

        // AJUSTAR STOCK: items nuevos o cantidad aumentada -> decrementar stock
        for (const currItem of currentItems) {
          const prevItem = previousItems.find(i => i.id === currItem.id)
          if (!prevItem) {
            // Item nuevo: decrementar stock
            const productoRef = doc(db, 'productos', currItem.id)
            await updateDoc(productoRef, {
              unidades: increment(-currItem.cantidad),
              stock: increment(-currItem.cantidad),
            })
          } else if (currItem.cantidad > prevItem.cantidad) {
            // Cantidad aumentada: decrementar diferencia
            const diff = currItem.cantidad - prevItem.cantidad
            const productoRef = doc(db, 'productos', currItem.id)
            await updateDoc(productoRef, {
              unidades: increment(-diff),
              stock: increment(-diff),
            })
          }
        }

        // ELIMINAR ORDEN si carrito vacío
        if (items.length === 0) {
          if (ordenId) {
            await deleteDoc(doc(db, 'ordenes', ordenId))
            setOrdenId(null)
          }
          setPreviousItems([])
          return
        }

        // CREAR/ACTUALIZAR ORDEN
        const reservadoHasta = new Date(Date.now() + CONFIG.RESERVATION_DURATION_MINUTES * 60 * 1000)
        const ordenData = {
          usuarioId: user.uid,
          usuarioEmail: user.email,
          items: items.map((item) => ({
            productoId: item.id,
            nombre: item.nombre,
            precio: item.precio,
            cantidad: item.cantidad,
            imagen: item.imagenUrl,
          })),
          estado: 'pendiente',
          reservadoHasta,
          updatedAt: serverTimestamp(),
          ...(ordenId === null && { createdAt: serverTimestamp() }),
        }

        if (ordenId) {
          await setDoc(doc(db, 'ordenes', ordenId), ordenData, { merge: true })
        } else {
          const newOrdenId = `${user.uid}_${Date.now()}`
          await setDoc(doc(db, 'ordenes', newOrdenId), ordenData)
          setOrdenId(newOrdenId)
        }

        setPreviousItems(currentItems)
      } catch (error: any) {
        console.error('[useCartOrder] Error:', error.message)
      } finally {
        setSyncing(false)
      }
    }

    const debounceTimer = setTimeout(syncCartToOrder, 500)
    return () => clearTimeout(debounceTimer)
  }, [items, user, isAuthenticated, ordenId])

  return { ordenId, syncing }
}
