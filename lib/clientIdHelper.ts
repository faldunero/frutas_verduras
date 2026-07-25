import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, increment } from 'firebase/firestore'

/**
 * Genera un nuevo ID de cliente secuencial
 * Ej: CLT-001, CLT-002, etc.
 */
export const generateClientId = async (): Promise<string> => {
  try {
    const counterRef = doc(db, 'settings', 'client_counter')
    const counterDoc = await getDoc(counterRef)

    let nextNumber = 1

    if (counterDoc.exists()) {
      nextNumber = (counterDoc.data().count || 0) + 1
    }

    // Actualizar el contador
    await setDoc(counterRef, { count: nextNumber }, { merge: true })

    // Retornar con formato CLT-001, CLT-002, etc.
    return `CLT-${String(nextNumber).padStart(3, '0')}`
  } catch (error) {
    console.error('Error generating client ID:', error)
    throw error
  }
}
