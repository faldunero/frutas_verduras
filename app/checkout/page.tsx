'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, increment } from 'firebase/firestore'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getSubtotal, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    calle: '',
    numero: '',
    anexo: '',
    comuna: '',
    metodoPago: 'transfer',
    comentarios: '',
  })

  // Cargar datos del perfil del usuario
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.uid) return
      try {
        const docSnap = await getDoc(doc(db, 'users', user.uid))
        if (docSnap.exists()) {
          const data = docSnap.data()
          setFormData((prev) => ({
            ...prev,
            nombre: data.nombre || '',
            email: user.email || '',
            telefono: data.telefono || '',
            calle: data.calle || '',
            numero: data.numero || '',
            anexo: data.anexo || '',
            comuna: data.comuna || '',
          }))
        } else {
          setFormData((prev) => ({
            ...prev,
            email: user.email || '',
          }))
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }
    loadUserData()
  }, [user])

  // Redirigir si no está autenticado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-2xl font-bold mb-2">Inicia sesión para continuar</h1>
            <p className="text-gray-600 mb-8">
              Necesitas tener una cuenta para realizar tu compra
            </p>
            <Link
              href="/auth/login"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700"
            >
              Ir a Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Redirigir si carrito está vacío
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-2xl font-bold mb-2">Carrito vacío</h1>
            <p className="text-gray-600 mb-8">
              Agrega productos antes de proceder al checkout
            </p>
            <Link
              href="/catalogo"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700"
            >
              Ver Catálogo
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const subtotal = getSubtotal()

  // Calcular IVA solo para productos con conIVA: true
  const impuestos = items.reduce((total, item) => {
    if (item.conIVA) {
      return total + Math.round(item.precio * item.cantidad * 0.19)
    }
    return total
  }, 0)

  const envio = 0
  const total = subtotal + impuestos + envio

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.nombre ||
      !formData.email ||
      !formData.telefono ||
      !formData.calle ||
      !formData.numero ||
      !formData.comuna
    ) {
      toast.error('Completa todos los campos requeridos')
      return
    }

    setLoading(true)

    try {
      // Crear la orden en Firestore
      const ordenData = {
        userId: user?.uid,
        email: formData.email,
        nombre: formData.nombre,
        telefono: formData.telefono,
        calle: formData.calle,
        numero: formData.numero,
        anexo: formData.anexo,
        comuna: formData.comuna,
        metodoPago: formData.metodoPago,
        estado: formData.metodoPago === 'transbank' ? 'pendiente' : 'confirmada',
        subtotal,
        impuestos,
        envio,
        total,
        items: items.map((item) => ({
          productoId: item.id,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precioUnitario: item.precio,
          subtotal: item.precio * item.cantidad,
        })),
        comentarios: formData.comentarios,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, 'ordenes'), ordenData)

      // Enviar email de confirmación al cliente
      try {
        await fetch('/api/send-order-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ordenId: docRef.id,
            email: formData.email,
            nombre: formData.nombre,
            items: ordenData.items,
            subtotal: subtotal,
            envio: envio,
            total: total,
            metodoPago: formData.metodoPago,
            estado: ordenData.estado,
          }),
        })
      } catch (error) {
        console.error('Error sending order confirmation email:', error)
        // No bloqueamos si falla el email
      }

      // Notificar al admin
      try {
        await fetch('/api/notify-admin-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ordenId: docRef.id,
            nombre: formData.nombre,
            email: formData.email,
            telefono: formData.telefono,
            comuna: formData.comuna,
            items: ordenData.items,
            total: total,
            metodoPago: formData.metodoPago,
            estado: ordenData.estado,
          }),
        })
      } catch (error) {
        console.error('Error notifying admin:', error)
        // No bloqueamos si falla la notificación
      }

      // Si es Transbank, intentar crear transacción PRIMERO
      if (formData.metodoPago === 'transbank') {
        toast.loading('Redirigiendo a Transbank...')

        try {
          // Crear transacción en Transbank
          const response = await fetch('/api/transbank/create-transaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ordenId: docRef.id,
              monto: total,
              email: formData.email,
            }),
          })

          const data = await response.json()

          if (!data.url) {
            throw new Error('Error al iniciar transacción con Transbank')
          }

          // Solo si Transbank fue exitoso, actualizar stock y limpiar carrito
          for (const item of items) {
            try {
              const productoRef = doc(db, 'productos', item.id)
              await updateDoc(productoRef, {
                stock: increment(-item.cantidad),
              })
            } catch (error) {
              console.error(`Error updating stock for ${item.id}:`, error)
            }
          }

          clearCart()

          // Redirigir a Transbank
          window.location.href = data.url
        } catch (error) {
          // Si falla Transbank, eliminar la orden creada
          throw error
        }
      } else {
        // Actualizar stock de productos
        for (const item of items) {
          try {
            const productoRef = doc(db, 'productos', item.id)
            await updateDoc(productoRef, {
              stock: increment(-item.cantidad),
            })
          } catch (error) {
            console.error(`Error updating stock for ${item.id}:`, error)
          }
        }

        // Limpiar carrito
        clearCart()

        // Si es transferencia, redirigir a confirmación
        router.push(`/orden-confirmada/${docRef.id}`)
        toast.success('Orden creada - Pendiente de pago por transferencia')
      }
    } catch (error) {
      console.error('Error creating orden:', error)
      toast.error('Error al crear la orden')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Datos Personales */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Datos Personales</h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo *
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                </div>
              </div>

              {/* Dirección */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Dirección de Entrega</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Calle *
                    </label>
                    <input
                      type="text"
                      name="calle"
                      value={formData.calle}
                      onChange={handleChange}
                      required
                      placeholder="Nombre de la calle"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número *
                      </label>
                      <input
                        type="text"
                        name="numero"
                        value={formData.numero}
                        onChange={handleChange}
                        required
                        placeholder="Ej: 1234"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Anexo/Departamento
                      </label>
                      <input
                        type="text"
                        name="anexo"
                        value={formData.anexo}
                        onChange={handleChange}
                        placeholder="Ej: Dpto 4B (opcional)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comuna *
                    </label>
                    <select
                      name="comuna"
                      value={formData.comuna}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    >
                      <option value="">Selecciona tu comuna</option>
                      <option value="Las Condes">Las Condes</option>
                      <option value="Providencia">Providencia</option>
                      <option value="Vitacura">Vitacura</option>
                      <option value="Lo Barnechea">Lo Barnechea</option>
                      <option value="Ñuñoa">Ñuñoa</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Método de Pago */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Método de Pago</h2>

                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed opacity-60">
                    <input
                      type="radio"
                      name="metodoPago"
                      value="transbank"
                      disabled
                      className="w-4 h-4 text-gray-400"
                    />
                    <span className="ml-3">
                      <div className="font-medium text-gray-600">💳 Tarjeta de Crédito/Débito (Transbank)</div>
                      <div className="text-xs text-gray-500">⚠️ En mantenimiento - Disponible pronto</div>
                    </span>
                  </label>

                  <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="metodoPago"
                      value="transfer"
                      checked={formData.metodoPago === 'transfer'}
                      onChange={handleChange}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="ml-3">
                      <div className="font-medium text-gray-900">🏦 Transferencia Bancaria</div>
                      <div className="text-xs text-gray-500">Deberás confirmar el pago manualmente</div>
                    </span>
                  </label>
                </div>
              </div>

              {/* Comentarios */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Comentarios (Opcional)</h2>

                <textarea
                  name="comentarios"
                  value={formData.comentarios}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Instrucciones especiales de entrega..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
                >
                  {loading ? 'Procesando...' : 'Confirmar Orden'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 border-2 border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-50 transition"
                >
                  Volver
                </button>
              </div>
            </form>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-6">Resumen de Orden</h2>

              {/* Productos */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="font-bold text-gray-700 mb-3">Productos ({items.length})</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{item.nombre}</p>
                        <p className="text-gray-500">
                          x{item.cantidad} {item.unidadVenta === 'kilo' ? 'kilos' : 'unidades'}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900">
                        ${(item.precio * item.cantidad).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div className="space-y-3 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>

                {impuestos > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Impuestos (19%):</span>
                    <span>${impuestos.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-700">
                  <span>Envío:</span>
                  <span>Gratis</span>
                </div>
              </div>

              {/* Total Final */}
              <div className="flex justify-between items-center pt-4">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-green-600">
                  ${total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
