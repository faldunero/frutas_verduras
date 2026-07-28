'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { doc, setDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { useCart } from './useCart'
import { useAuth } from './useAuth'

export function useCartOrder() {
  const { items } = useCart()
  const { user, isAuthenticated } = useAuth()
  const [ordenId, setOrdenId] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  // Sincronizar carrito con orden en Firebase
  useEffect(() => {
    console.log('[useCartOrder] Auth state:', { isAuthenticated, userId: user?.uid, itemsCount: items.length })

    if (!isAuthenticated || !user?.uid) {
      // Limpiar orden si se desautentica
      console.log('[useCartOrder] Clearing order - not authenticated')
      setOrdenId(null)
      return
    }

    const syncCartToOrder = async () => {
      try {
        setSyncing(true)
        console.log('[useCartOrder] Syncing cart to order:', { itemsCount: items.length, ordenId })

        // Si no hay items, eliminar orden
        if (items.length === 0) {
          if (ordenId) {
            console.log('[useCartOrder] Deleting empty order:', ordenId)
            await deleteDoc(doc(db, 'ordenes', ordenId))
            setOrdenId(null)
          }
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

        // Si hay orden existente, actualizar; si no, crear con documento personalizado
        if (ordenId) {
          // Actualizar orden existente
          console.log('[useCartOrder] Updating existing order:', ordenId)
          await setDoc(doc(db, 'ordenes', ordenId), ordenData, { merge: true })
          console.log('[useCartOrder] Order updated successfully')
        } else {
          // Crear nueva orden con ID personalizado basado en timestamp + user
          const newOrdenId = `${user.uid}_${Date.now()}`
          console.log('[useCartOrder] Creating new order:', newOrdenId)
          await setDoc(doc(db, 'ordenes', newOrdenId), {
            ...ordenData,
            createdAt: serverTimestamp(),
          })
          console.log('[useCartOrder] Order created successfully:', newOrdenId)
          setOrdenId(newOrdenId)
        }
      } catch (error: any) {
        console.error('[useCartOrder] Error sincronizando carrito con orden:', error)
        console.error('[useCartOrder] Error details:', error.message, error.code)
      } finally {
        setSyncing(false)
      }
    }

    const debounceTimer = setTimeout(syncCartToOrder, 500)
    return () => clearTimeout(debounceTimer)
  }, [items, user, isAuthenticated, ordenId])

  return { ordenId, syncing }
}
