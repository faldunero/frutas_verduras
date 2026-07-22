import Link from 'next/link'

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-4">
                Frutas & Verduras Frescas
              </h1>
              <p className="text-lg mb-8 text-green-100">
                Compra los mejores productos frescos directamente de nuestros
                productores. Entrega rápida y segura a tu domicilio.
              </p>
              <Link
                href="/catalogo"
                className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-bold hover:bg-green-50 transition"
              >
                Ver Catálogo Completo
              </Link>
            </div>
            <div className="text-center">
              <div className="text-9xl">🥕</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-4xl font-bold text-center mb-12">
          ¿Por qué elegirnos?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="text-5xl mb-4">🚚</div>
            <h3 className="text-xl font-bold mb-2">Entrega Rápida</h3>
            <p className="text-gray-600">
              Entregamos en menos de 24 horas. Recibe tus productos frescos en tu
              puerta.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="text-xl font-bold mb-2">100% Fresco</h3>
            <p className="text-gray-600">
              Productos seleccionados diariamente de los mejores productores
              locales.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">Mejores Precios</h3>
            <p className="text-gray-600">
              Compra directo del productor sin intermediarios. Ahorra hasta 40%.
            </p>
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-4xl font-bold mb-8">Productos Destacados</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Placeholder Cards */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="bg-gradient-to-br from-green-100 to-green-200 h-48 flex items-center justify-center text-6xl">
                {i === 1 ? '🍎' : i === 2 ? '🥬' : i === 3 ? '🥕' : '🍅'}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">
                  {i === 1 ? 'Manzanas' : i === 2 ? 'Lechuga' : i === 3 ? 'Zanahorias' : 'Tomates'}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Producto fresco y de calidad
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-bold text-lg">
                    ${(i * 2000).toLocaleString('es-CL')}
                  </span>
                  <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition text-sm">
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/catalogo"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition"
          >
            Ver Todos los Productos
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-50 py-12 border-t border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para comprar?</h2>
          <p className="text-gray-600 mb-8">
            Crea tu cuenta y comienza a disfrutar de productos frescos.
          </p>
          <div className="space-x-4">
            <Link
              href="/catalogo"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition"
            >
              Explorar Catálogo
            </Link>
            <Link
              href="/auth/register"
              className="inline-block border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg font-bold hover:bg-green-50 transition"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs Preview */}
      <section id="faqs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-4xl font-bold mb-8">Preguntas Frecuentes</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-2">¿Cómo funciona el envío?</h3>
            <p className="text-gray-600">
              Realizamos entregas en menos de 24 horas. Recibirás una
              notificación con el estado de tu pedido.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">¿Qué métodos de pago aceptan?</h3>
            <p className="text-gray-600">
              Aceptamos tarjetas de crédito, débito, transferencia bancaria y
              billetera digital.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">¿Puedo devolver un producto?</h3>
            <p className="text-gray-600">
              Sí, tienes 7 días para solicitar una devolución si el producto
              no cumple con tus expectativas.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">¿Tienen productos orgánicos?</h3>
            <p className="text-gray-600">
              Sí, contamos con una sección de productos orgánicos certificados.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
