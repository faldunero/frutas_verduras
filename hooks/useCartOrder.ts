'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { doc, setDoc, deleteDoc, serverTimestamp, onSnapshot } from 'firebase/firestore'
import { useCart } from './useCart'
import { useAuth } from './useAuth'

export function useCartOrder() {
  const { items } = useCart()
  const { user, isAuthenticated } = useAuth()
  const [ordenId, setOrdenId] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  // Sincronizar carrito con orden en Firebase
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      setOrdenId(null)
      return
    }

    const syncCartToOrder = async () => {
      try {
        setSyncing(true)

        // Si no hay items, eliminar orden
        if (items.length === 0) {
          if (ordenId) {
            await deleteDoc(doc(db, 'ordenes', ordenId))
            setOrdenId(null)
          }
          return
        }

        // Construir datos de la orden (RESERVA por 30 minutos)
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
          await setDoc(doc(db, 'ordenes', ordenId), ordenData, { merge: true })
        } else {
          const newOrdenId = `${user.uid}_${Date.now()}`
          await setDoc(doc(db, 'ordenes', newOrdenId), ordenData)
          setOrdenId(newOrdenId)
        }
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
