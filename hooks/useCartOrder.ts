'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { doc, setDoc, deleteDoc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore'
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

  // Sincronizar carrito con orden en Firebase
  useEffect(() => {
    console.log('[useCartOrder] Auth state:', { isAuthenticated, userId: user?.uid, itemsCount: items.length })

    if (!isAuthenticated || !user?.uid) {
      // Limpiar orden si se desautentica
      console.log('[useCartOrder] Clearing order - not authenticated')
      setOrdenId(null)
      setPreviousItems([])
      return
    }

    const syncCartToOrder = async () => {
      try {
        setSyncing(true)
        console.log('[useCartOrder] Syncing cart to order:', { itemsCount: items.length, ordenId })

        // Detectar cambios en items y ajustar stock
        const currentItems = items.map(item => ({ id: item.id, cantidad: item.cantidad }))

        // Items removidos - incrementar stock
        for (const prevItem of previousItems) {
          const currentItem = currentItems.find(i => i.id === prevItem.id)
          if (!currentItem) {
            // Item fue removido del carrito
            console.log('[useCartOrder] Item removed:', prevItem.id, 'quantity:', prevItem.cantidad)
            try {
              const productoRef = doc(db, 'productos', prevItem.id)
              await updateDoc(productoRef, {
                unidades: increment(prevItem.cantidad),
                stock: increment(prevItem.cantidad),
              })
            } catch (error) {
              console.error('[useCartOrder] Error restoring stock:', error)
            }
          } else if (currentItem.cantidad < prevItem.cantidad) {
            // Cantidad disminuyó
            const diff = prevItem.cantidad - currentItem.cantidad
            console.log('[useCartOrder] Item quantity reduced:', prevItem.id, 'by:', diff)
            try {
              const productoRef = doc(db, 'productos', prevItem.id)
              await updateDoc(productoRef, {
                unidades: increment(diff),
                stock: increment(diff),
              })
            } catch (error) {
              console.error('[useCartOrder] Error restoring stock:', error)
            }
          }
        }

        // Items nuevos o aumentados - decrementar stock
        for (const currItem of currentItems) {
          const prevItem = previousItems.find(i => i.id === currItem.id)
          if (!prevItem) {
            // Item nuevo
            console.log('[useCartOrder] Item added:', currItem.id, 'quantity:', currItem.cantidad)
            try {
              const productoRef = doc(db, 'productos', currItem.id)
              await updateDoc(productoRef, {
                unidades: increment(-currItem.cantidad),
                stock: increment(-currItem.cantidad),
              })
            } catch (error) {
              console.error('[useCartOrder] Error reducing stock:', error)
            }
          } else if (currItem.cantidad > prevItem.cantidad) {
            // Cantidad aumentó
            const diff = currItem.cantidad - prevItem.cantidad
            console.log('[useCartOrder] Item quantity increased:', currItem.id, 'by:', diff)
            try {
              const productoRef = doc(db, 'productos', currItem.id)
              await updateDoc(productoRef, {
                unidades: increment(-diff),
                stock: increment(-diff),
              })
            } catch (error) {
              console.error('[useCartOrder] Error reducing stock:', error)
            }
          }
        }

        // Si no hay items, eliminar orden
        if (items.length === 0) {
          if (ordenId) {
            console.log('[useCartOrder] Deleting empty order:', ordenId)
            await deleteDoc(doc(db, 'ordenes', ordenId))
            setOrdenId(null)
          }
          setPreviousItems([])
          return
        }

        // Construir datos de la orden
        const reservadoHasta = new Date(Date.now() + 30 * 60 * 1000)
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

        // Si hay orden existente, actualizar; si no, crear
        if (ordenId) {
          console.log('[useCartOrder] Updating existing order:', ordenId)
          await setDoc(doc(db, 'ordenes', ordenId), ordenData, { merge: true })
          console.log('[useCartOrder] Order updated successfully')
        } else {
          const newOrdenId = `${user.uid}_${Date.now()}`
          console.log('[useCartOrder] Creating new order:', newOrdenId)
          await setDoc(doc(db, 'ordenes', newOrdenId), {
            ...ordenData,
            createdAt: serverTimestamp(),
          })
          console.log('[useCartOrder] Order created successfully:', newOrdenId)
          setOrdenId(newOrdenId)
        }

        // Actualizar items previos
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
