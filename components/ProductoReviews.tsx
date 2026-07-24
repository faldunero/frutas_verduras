'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { FiStar } from 'react-icons/fi'

interface Review {
  id: string
  productoId: string
  userId: string
  nombre: string
  rating: number
  comentario: string
  createdAt: any
}

export function ProductoReviews({ productoId }: { productoId: string }) {
  const { user, isAuthenticated } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [comentario, setComentario] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [productoId])

  const fetchReviews = async () => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('productoId', '==', productoId)
      )
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Review[]
      setReviews(data.sort((a, b) => new Date(b.createdAt?.toDate()).getTime() - new Date(a.createdAt?.toDate()).getTime()))
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated || !user) {
      toast.error('Debes iniciar sesión para dejar una reseña')
      return
    }

    if (!comentario.trim()) {
      toast.error('Escribe un comentario')
      return
    }

    setSubmitting(true)

    try {
      await addDoc(collection(db, 'reviews'), {
        productoId,
        userId: user.uid,
        nombre: user.email?.split('@')[0] || 'Anónimo',
        rating,
        comentario,
        createdAt: serverTimestamp(),
      })

      toast.success('Reseña publicada')
      setComentario('')
      setRating(5)
      fetchReviews()
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Error al publicar reseña')
    } finally {
      setSubmitting(false)
    }
  }

  const promedioRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-bold mb-6">Reseñas ({reviews.length})</h2>

      {/* Rating Promedio */}
      {reviews.length > 0 && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-4xl font-bold text-yellow-500">{promedioRating}</p>
              <p className="text-gray-600">de 5 estrellas</p>
            </div>
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviews.filter((r) => r.rating === stars).length
                const percent = (count / reviews.length) * 100
                return (
                  <div key={stars} className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-600 w-8">{stars}⭐</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded">
                      <div
                        className="h-full bg-yellow-400 rounded transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="font-bold text-lg mb-4">Deja tu reseña</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calificación
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-3xl transition transform hover:scale-110"
                >
                  {star <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentario
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              placeholder="Cuéntanos tu experiencia con este producto..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            {submitting ? 'Publicando...' : 'Publicar Reseña'}
          </button>
        </form>
      ) : (
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-gray-700 mb-3">Inicia sesión para dejar una reseña</p>
        </div>
      )}

      {/* Reseñas */}
      {loading ? (
        <p className="text-gray-600">Cargando reseñas...</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No hay reseñas aún. ¡Sé el primero!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-gray-900">{review.nombre}</p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400">
                        {i < review.rating ? '⭐' : '☆'}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {review.createdAt?.toDate?.().toLocaleDateString('es-CL') || 'Hace poco'}
                </p>
              </div>
              <p className="text-gray-700">{review.comentario}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
