'use client'

import Link from 'next/link'
import { ProductosDestacados } from '@/components/ProductosDestacados'
import { useAuth } from '@/hooks/useAuth'

export default function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="space-y-12">
      {/* Hero Section - Solo si NO está logeado */}
      {!isAuthenticated && <section
        className="relative overflow-hidden h-[300px]"
        style={{
          backgroundImage: 'url("/images/banner-hero.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'scroll'
        }}
      />}

      {/* Features Section - Solo si NO está logeado */}
      {!isAuthenticated &&
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
      </section>}

      {/* Productos Destacados */}
      <ProductosDestacados />

      {/* CTA Section - Solo si NO está logeado */}
      {!isAuthenticated && (
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
      )}

      {/* FAQs Preview */}
      <section id="faqs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-4xl font-bold mb-8">Preguntas Frecuentes</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-2">¿Cómo funciona el envío?</h3>
            <p className="text-gray-600">
              Los pedidos son recibidos el día anterior y despachados el día siguiente. Recibirás una notificación con el estado de tu pedido.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">¿Qué métodos de pago aceptan?</h3>
            <p className="text-gray-600">
              Aceptamos transferencias bancarias como único método de pago. Es seguro, sin comisiones y con confirmación inmediata.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">¿Puedo devolver un producto?</h3>
            <p className="text-gray-600">
              No existe devolución del producto, pero si tienes inconformidad, te abonamos el valor dentro de 2 días. Plazo máximo para solicitar: 2 días.
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
