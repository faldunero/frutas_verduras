'use client'

import { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: '',
  })
  const [consentimiento, setConsentimiento] = useState(false)
  const [sending, setSending] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre || !formData.email || !formData.asunto || !formData.mensaje) {
      toast.error('Completa todos los campos')
      return
    }

    if (!consentimiento) {
      toast.error('Debes aceptar el tratamiento de datos para enviar el mensaje')
      return
    }

    setSending(true)

    try {
      // En producción, aquí enviarías el email a un servidor
      // Por ahora solo mostramos un mensaje de éxito
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success('Mensaje enviado. Te contactaremos pronto')
      setFormData({
        nombre: '',
        email: '',
        asunto: '',
        mensaje: '',
      })
    } catch (error) {
      toast.error('Error al enviar el mensaje')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Contacto</h1>
          <p className="text-lg text-green-100">
            ¿Preguntas? Nos encantaría escucharte
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Formulario */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Envíanos un Mensaje</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
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
                  Email
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
                  Asunto
                </label>
                <select
                  name="asunto"
                  value={formData.asunto}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <option value="">Selecciona un asunto</option>
                  <option value="consulta">Consulta General</option>
                  <option value="problema">Problema con Compra</option>
                  <option value="producto">Calidad de Producto</option>
                  <option value="sugerencia">Sugerencia o Mejora</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje
                </label>
                <textarea
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="Tu mensaje..."
                />
              </div>

              {/* Consentimiento - Ley 21.719 */}
              <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  checked={consentimiento}
                  onChange={(e) => setConsentimiento(e.target.checked)}
                  className="w-4 h-4 text-green-600 rounded mt-1"
                />
                <span className="text-sm text-gray-700">
                  Autorizo el tratamiento de mis datos personales conforme a la{' '}
                  <a href="/privacidad" target="_blank" className="text-green-600 hover:text-green-700 font-medium">
                    Política de Privacidad
                  </a>
                  {' '}(Ley 21.719) <span className="text-red-600">*</span>
                </span>
              </label>

              <button
                type="submit"
                disabled={sending || !consentimiento}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
              >
                {sending ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
            </form>
          </div>

          {/* Información de Contacto */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Información de Contacto</h2>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-bold text-lg mb-2">📧 Email</h3>
                <a
                  href="mailto:info@frutasverduras.cl"
                  className="text-green-600 hover:text-green-700"
                >
                  info@frutasverduras.cl
                </a>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-bold text-lg mb-2">📱 Teléfono</h3>
                <a href="tel:+56912345678" className="text-green-600 hover:text-green-700">
                  +56 9 1234 5678
                </a>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-bold text-lg mb-2">🕐 Horario de Atención</h3>
                <p className="text-gray-700 mb-2">
                  <strong>Lunes a Viernes:</strong> 9:00 - 18:00
                </p>
                <p className="text-gray-700">
                  <strong>Sábados:</strong> 10:00 - 14:00
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-bold text-lg mb-2">📍 Ubicación</h3>
                <p className="text-gray-700">
                  Santiago, Región Metropolitana<br />
                  Chile
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Volver */}
        <div className="text-center mt-12">
          <Link href="/" className="text-green-600 hover:text-green-700 font-medium">
            ← Volver a Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
