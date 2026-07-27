'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AdminGuard } from '@/components/AdminGuard'
import { db, Producto, storage } from '@/lib/firebase'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useConfig } from '@/hooks/useConfig'

export default function EditarProductoPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const { config } = useConfig()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Producto & { id: string } | null>(null)
  const [imagen, setImagen] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    fetchProducto()
  }, [productId])

  const fetchProducto = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'productos', productId))
      if (docSnap.exists()) {
        const data = {
          id: docSnap.id,
          ...docSnap.data(),
        } as Producto & { id: string }
        setFormData(data)
        if (data.imagenUrl) {
          setPreviewUrl(data.imagenUrl)
        }
      } else {
        toast.error('Producto no encontrado')
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching producto:', error)
      toast.error('Error al cargar producto')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!formData) return

    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value

    setFormData((prev) =>
      prev
        ? {
            ...prev,
            [name]: name === 'precio' || name === 'stock' ? parseFloat(value) : val,
          }
        : null
    )
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImagen(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData || !formData.nombre || !formData.descripcion || formData.precio <= 0) {
      toast.error('Completa todos los campos requeridos')
      return
    }

    setSaving(true)

    try {
      const { id, ...dataToUpdate } = formData
      let updateData: any = {
        ...dataToUpdate,
        updatedAt: serverTimestamp(),
      }

      // Subir imagen si existe
      if (imagen) {
        const timestamp = Date.now()
        const filename = `${timestamp}-${imagen.name}`
        const storageRef = ref(storage, `productos/${filename}`)
        await uploadBytes(storageRef, imagen)
        const imagenUrl = await getDownloadURL(storageRef)
        updateData.imagenUrl = imagenUrl
      }

      await updateDoc(doc(db, 'productos', productId), updateData)

      toast.success('Producto actualizado exitosamente')
      router.push('/admin')
    } catch (error) {
      console.error('Error updating producto:', error)
      toast.error('Error al actualizar producto')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4"></div>
            <p className="text-gray-600">Cargando producto...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  if (!formData) {
    return null
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Editar Producto</h1>
              <Link href="/admin" className="text-blue-600 hover:text-blue-800">
                Volver
              </Link>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              {/* Imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen del Producto
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {previewUrl && (
                  <div className="mt-3">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-40 w-40 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Precio y Stock */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio (CLP) *
                  </label>
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    required
                    min="0"
                    step="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.unidadVenta === 'unidad' ? 'Unidades disponibles' : 'Kilos disponibles'} *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    min="0"
                    step={formData.unidadVenta === 'unidad' ? '1' : '0.5'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>

              {/* Tipo de Venta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Venta *
                </label>
                <select
                  name="unidadVenta"
                  value={formData.unidadVenta || 'kilo'}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <option value="unidad">Por Unidad</option>
                  <option value="kilo">Por Kilo</option>
                </select>
              </div>

              {/* Categoría y Peso */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    {config.categorias.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso/Cantidad
                  </label>
                  <input
                    type="text"
                    name="peso"
                    value={formData.peso}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="disponible"
                    checked={formData.disponible}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-600"
                  />
                  <span className="ml-3 text-sm text-gray-700">Disponible</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="destacado"
                    checked={formData.destacado}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-600"
                  />
                  <span className="ml-3 text-sm text-gray-700">Destacado en la tienda</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="conIVA"
                    checked={formData.conIVA || false}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-600"
                  />
                  <span className="ml-3 text-sm text-gray-700">Aplicar IVA (19%)</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/admin')}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-3 px-4 rounded-lg transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
