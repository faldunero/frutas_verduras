'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'

export default function PrivacidadDatosPage() {
  const { user, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    tipo: 'acceso', // acceso, rectificacion, cancelacion, oposicion, portabilidad
    descripcion: '',
  })
  const [enviado, setEnviado] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre || !formData.email || !formData.tipo) {
      toast.error('Completa todos los campos requeridos')
      return
    }

    try {
      // Guardar en Firestore
      await addDoc(collection(db, 'solicitudesARCOP'), {
        userId: user?.uid || null,
        nombre: formData.nombre,
        email: formData.email,
        tipo: formData.tipo,
        descripcion: formData.descripcion,
        estado: 'pendiente',
        createdAt: serverTimestamp(),
      })

      toast.success('Solicitud enviada. Responderemos en máximo lo antes posible')
      setEnviado(true)
      setFormData({
        nombre: '',
        email: '',
        tipo: 'acceso',
        descripcion: '',
      })

      setTimeout(() => setEnviado(false), 5000)
    } catch (error) {
      console.error('Error al enviar solicitud:', error)
      toast.error('Error al enviar la solicitud')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Gestión de Privacidad y Datos</h1>
          <p className="text-lg text-green-100">
            Ejercita tus derechos ARCOP según la Ley 21.719
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Derechos ARCOP */}
          <div className="md:col-span-1">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Tus Derechos ARCOP</h2>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl mb-2">📖</div>
                <h3 className="font-bold text-gray-900 mb-1">Acceso (A)</h3>
                <p className="text-sm text-gray-600">
                  Acceder a todos tus datos personales que tenemos almacenados
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl mb-2">✏️</div>
                <h3 className="font-bold text-gray-900 mb-1">Rectificación (R)</h3>
                <p className="text-sm text-gray-600">
                  Corregir datos inexactos o incompletos
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl mb-2">🗑️</div>
                <h3 className="font-bold text-gray-900 mb-1">Cancelación (C)</h3>
                <p className="text-sm text-gray-600">
                  Solicitar la eliminación de tus datos personales
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl mb-2">✋</div>
                <h3 className="font-bold text-gray-900 mb-1">Oposición (O)</h3>
                <p className="text-sm text-gray-600">
                  Oponerte al tratamiento de tus datos para marketing
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl mb-2">📤</div>
                <h3 className="font-bold text-gray-900 mb-1">Portabilidad (P)</h3>
                <p className="text-sm text-gray-600">
                  Recibir tus datos en formato estructurado y transferirlos
                </p>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Solicitar Derechos ARCOP</h2>

              {enviado && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">
                    ✓ Solicitud enviada exitosamente
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    Nos comunicaremos contigo en máximo lo antes posible.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Solicitud <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    <option value="acceso">Acceso a mis datos</option>
                    <option value="rectificacion">Rectificación de datos</option>
                    <option value="cancelacion">Cancelación de datos</option>
                    <option value="oposicion">Oposición al tratamiento</option>
                    <option value="portabilidad">Portabilidad de datos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Detalles de tu solicitud (opcional)
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="Proporciona detalles adicionales si es necesario..."
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-blue-900 text-sm">
                    <strong>Importante:</strong> Verificaremos tu identidad antes de procesar tu solicitud. Responderemos en máximo lo antes posible conforme a la Ley 21.719.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition"
                >
                  Enviar Solicitud
                </button>
              </form>
            </div>

            {/* Información adicional */}
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-bold text-green-900 mb-3">¿Necesitas ayuda?</h3>
              <p className="text-green-800 text-sm mb-3">
                Si tienes preguntas sobre cómo ejercitar tus derechos, contáctanos:
              </p>
              <p className="text-green-800 text-sm">
                <strong>Email:</strong> privacidad@frutasverduras.cl<br />
                <strong>Teléfono:</strong> +56 9 1234 5678
              </p>
            </div>
          </div>
        </div>

        {/* Información legal */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Preguntas Frecuentes sobre ARCOP</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">¿Cuánto tiempo tiene Frutas & Verduras para responder?</h3>
              <p className="text-gray-700">
                Conforme a la Ley 21.719, tenemos un plazo máximo de lo antes posible para responder cualquier solicitud ARCOP.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">¿Hay algún costo para ejercitar mis derechos?</h3>
              <p className="text-gray-700">
                No. El ejercicio de derechos ARCOP es completamente gratuito.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">¿Qué formato recibiré mis datos?</h3>
              <p className="text-gray-700">
                Tus datos te serán entregados en un formato estructurado, comúnmente utilizado y legible por máquina (JSON o CSV según corresponda).
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">¿Puedo cambiar de opinión después de cancelar?</h3>
              <p className="text-gray-700">
                Si solicitas la cancelación de tu cuenta, tus datos será eliminados. Luego podrás crear una nueva cuenta si lo deseas, pero no podremos recuperar los datos anteriores.
              </p>
            </div>
          </div>
        </div>

        {/* Volver */}
        <div className="text-center">
          <Link href="/" className="text-green-600 hover:text-green-700 font-medium">
            ← Volver a Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
