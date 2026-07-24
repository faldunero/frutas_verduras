'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { db, Producto } from '@/lib/firebase'
import { doc, getDoc, collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { useWishlist } from '@/hooks/useWishlist'
import toast from 'react-hot-toast'
import { FiHeart } from 'react-icons/fi'

interface Review {
  id: string
  usuarioEmail: string
  usuarioNombre: string
  rating: number
  comentario: string
  fecha: any
}

export default function ProductoPage() {
  const params = useParams()
  const id = params.id as string
  const { user, isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  
  const [producto, setProducto] = useState<(Producto & { id: string }) | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [nuevoReview, setNuevoReview] = useState({ rating: 5, comentario: '' })
  const [enviandoReview, setEnviandoReview] = useState(false)
  const [enWishlist, setEnWishlist] = useState(false)

  useEffect(() => {
    fetchProducto()
    fetchReviews()
    setEnWishlist(isInWishlist(id))
  }, [id])

  const fetchProducto = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'productos', id))
      if (docSnap.exists()) {
        setProducto({ id: docSnap.id, ...docSnap.data() } as any)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar producto')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, 'reviews'), where('productoId', '==', id))
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Review[]
      setReviews(data.sort((a, b) => b.fecha?.toDate?.() - a.fecha?.toDate?.()))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleAgregarReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Debes estar logueado para dejar un review')
      return
    }
    if (!nuevoReview.comentario.trim()) {
      toast.error('El comentario no puede estar vacío')
      return
    }

    setEnviandoReview(true)
    try {
      await addDoc(collection(db, 'reviews'), {
        productoId: id,
        usuarioEmail: user?.email,
        usuarioNombre: user?.displayName || user?.email?.split('@')[0],
        rating: nuevoReview.rating,
        comentario: nuevoReview.comentario,
        fecha: serverTimestamp(),
      })
      toast.success('Review publicado exitosamente')
      setNuevoReview({ rating: 5, comentario: '' })
      fetchReviews()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar review')
    } finally {
      setEnviandoReview(false)
    }
  }

  const handleToggleWishlist = () => {
    if (!producto) return
    if (enWishlist) {
      removeFromWishlist(producto.id)
      setEnWishlist(false)
      toast.success('Removido del wishlist')
    } else {
      addToWishlist(producto)
      setEnWishlist(true)
      toast.success('Agregado al wishlist')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-lg mb-4">Producto no encontrado</p>
          <Link href="/catalogo" className="text-green-600">← Volver al catálogo</Link>
        </div>
      </div>
    )
  }

  const promedioRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <Link href="/catalogo" className="text-green-600 font-medium mb-8 inline-block">← Volver al catálogo</Link>
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              {producto.imagenUrl ? (
                <img src={producto.imagenUrl} alt={producto.nombre} className="w-full h-96 object-cover rounded-lg"/>
              ) : (
                <div className="bg-green-100 h-96 rounded-lg flex items-center justify-center text-9xl">📦</div>
              )}
            </div>
            <div>
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-4xl font-bold">{producto.nombre}</h1>
                <button
                  onClick={handleToggleWishlist}
                  className={`p-3 rounded-full transition ${enWishlist ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <FiHeart size={24} fill={enWishlist ? 'currentColor' : 'none'}/>
                </button>
              </div>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-lg font-semibold">{promedioRating} ⭐ ({reviews.length} reviews)</span>
              </div>
              <p className="text-gray-700 mb-4">{producto.descripcion}</p>
              <div className="space-y-2 mb-6 text-sm text-gray-600">
                <p><strong>Peso:</strong> {producto.peso}</p>
                <p><strong>Stock:</strong> {producto.stock}</p>
              </div>
              <p className="text-4xl font-bold text-green-600 mb-6">${producto.precio.toLocaleString()}</p>
              <button
                onClick={() => { addItem(producto, 1); toast.success('Agregado al carrito')}}
                disabled={producto.stock === 0}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg"
              >
                {producto.stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
              </button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-8">Opiniones de Clientes</h2>
          {isAuthenticated && (
            <div className="bg-white rounded-lg shadow p-8 mb-8">
              <h3 className="text-xl font-bold mb-4">Deja tu opinión</h3>
              <form onSubmit={handleAgregarReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Calificación</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNuevoReview({ ...nuevoReview, rating: star })}
                        className={`text-3xl ${star <= nuevoReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >★</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Comentario</label>
                  <textarea
                    value={nuevoReview.comentario}
                    onChange={(e) => setNuevoReview({ ...nuevoReview, comentario: e.target.value })}
                    rows={4}
                    placeholder="Cuéntanos tu experiencia..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <button type="submit" disabled={enviandoReview} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg">
                  {enviandoReview ? 'Publicando...' : 'Publicar Review'}
                </button>
              </form>
            </div>
          )}
          {reviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
              No hay reviews aún. ¡Sé el primero!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between mb-2">
                    <p className="font-bold">{review.usuarioNombre}</p>
                    <p className="text-sm text-gray-500">{review.fecha?.toDate?.()?.toLocaleDateString('es-CL')}</p>
                  </div>
                  <p className="text-yellow-400 text-sm mb-2">{'⭐'.repeat(review.rating)}</p>
                  <p className="text-gray-700">{review.comentario}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
