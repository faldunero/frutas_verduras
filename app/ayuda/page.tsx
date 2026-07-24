import Link from 'next/link'

export default function AyudaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Centro de Ayuda</h1>
          <p className="text-lg text-green-100">
            Encuentra respuestas a tus preguntas
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Búsqueda */}
        <div className="mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">¿Cómo podemos ayudarte?</h2>
            <p className="text-gray-700 mb-4">
              Explora nuestras categorías de ayuda o <Link href="/contacto" className="text-green-600 hover:text-green-700 font-medium">contáctanos directamente</Link>
            </p>
          </div>
        </div>

        {/* Categorías */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Métodos de Pago */}
          <Link href="/ayuda/metodos-pago">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer h-full">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Métodos de Pago</h3>
              <p className="text-gray-700 mb-4">
                Conoce las diferentes formas de pagar tus pedidos de forma segura.
              </p>
              <p className="text-green-600 font-medium">Ver más →</p>
            </div>
          </Link>

          {/* Envíos y Entregas */}
          <Link href="/ayuda/envios-entregas">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer h-full">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Envíos y Entregas</h3>
              <p className="text-gray-700 mb-4">
                Información sobre tiempos, zonas de cobertura y seguimiento de tu pedido.
              </p>
              <p className="text-green-600 font-medium">Ver más →</p>
            </div>
          </Link>

          {/* Cambios y Devoluciones */}
          <Link href="/ayuda/cambios-devoluciones">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer h-full">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cambios y Devoluciones</h3>
              <p className="text-gray-700 mb-4">
                Todo sobre nuestra política de cambios, devoluciones y garantía de satisfacción.
              </p>
              <p className="text-green-600 font-medium">Ver más →</p>
            </div>
          </Link>

          {/* Preguntas Frecuentes */}
          <Link href="/#faqs">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer h-full">
              <div className="text-4xl mb-4">❓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Preguntas Frecuentes</h3>
              <p className="text-gray-700 mb-4">
                Lee las preguntas más comunes y sus respuestas.
              </p>
              <p className="text-green-600 font-medium">Ver más →</p>
            </div>
          </Link>
        </div>

        {/* Información */}
        <div className="bg-white rounded-lg shadow p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Más Información</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/sobre-nosotros" className="text-green-600 hover:text-green-700 font-medium hover:underline">
              → Sobre Nosotros
            </Link>
            <Link href="/terminos" className="text-green-600 hover:text-green-700 font-medium hover:underline">
              → Términos de Servicio
            </Link>
            <Link href="/privacidad" className="text-green-600 hover:text-green-700 font-medium hover:underline">
              → Política de Privacidad
            </Link>
          </div>
        </div>

        {/* Contacto Directo */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4 text-green-900">¿No encontraste lo que buscas?</h2>
          <p className="text-green-800 mb-6">
            Nuestro equipo de soporte está disponible para ayudarte
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-green-800 font-bold mb-1">📧 Email</p>
              <p className="text-green-700">
                <a href="mailto:info@frutasverduras.cl" className="hover:underline">
                  info@frutasverduras.cl
                </a>
              </p>
            </div>
            <div>
              <p className="text-green-800 font-bold mb-1">📱 Teléfono</p>
              <p className="text-green-700">
                <a href="tel:+56912345678" className="hover:underline">
                  +56 9 1234 5678
                </a>
              </p>
            </div>
            <div>
              <p className="text-green-800 font-bold mb-1">🕐 Horario</p>
              <p className="text-green-700">Lun-Vie 9:00-18:00</p>
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
