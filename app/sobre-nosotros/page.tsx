import Link from 'next/link'

export default function SobreNosotrosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Sobre Nosotros</h1>
          <p className="text-lg text-green-100">
            Somos una empresa comprometida con traer productos frescos de calidad directamente a tu hogar
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Misión */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Nuestra Misión</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            En Frutas & Verduras, nuestra misión es revolucionar la forma en que los chilenos acceden a productos frescos de calidad. Nos proponemos conectar directamente a productores locales con consumidores, eliminando intermediarios y asegurando que recibas frutas y verduras en su punto óptimo de frescura, a precios justos.
          </p>
        </section>

        {/* Visión */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Nuestra Visión</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            Queremos ser la plataforma de confianza número uno en Chile para la compra de frutas y verduras frescas. Imaginamos un futuro donde cada familia tiene acceso a productos agrícolas de calidad, cultivados localmente, sostenibles y entregados con rapidez a su puerta.
          </p>
        </section>

        {/* Valores */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Nuestros Valores</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-3">🌱</div>
              <h3 className="text-xl font-bold mb-2">Frescura</h3>
              <p className="text-gray-700">
                Garantizamos que cada producto sea recolectado y entregado en su mejor momento de madurez y frescura.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="text-xl font-bold mb-2">Apoyo Local</h3>
              <p className="text-gray-700">
                Trabajamos directamente con pequeños y medianos productores locales para fortalecer la agricultura nacional.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-3">♻️</div>
              <h3 className="text-xl font-bold mb-2">Sostenibilidad</h3>
              <p className="text-gray-700">
                Promovemos prácticas agrícolas sostenibles y respetuosas con el medio ambiente.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-3">💯</div>
              <h3 className="text-xl font-bold mb-2">Calidad</h3>
              <p className="text-gray-700">
                Cada producto es inspeccionado y verificado para garantizar los más altos estándares de calidad.
              </p>
            </div>
          </div>
        </section>

        {/* Historia */}
        <section className="mb-12 bg-white p-8 rounded-lg shadow">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Nuestra Historia</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            Frutas & Verduras nació en 2026 con una visión clara: simplificar el acceso a productos de primer nivel en Chile. Nuestros fundadores, con experiencia en agricultura y tecnología, identificaron un problema importante: los consumidores urbanos tenían dificultades para acceder a frutas y verduras de calidad premium directamente de productores selectos, mientras que estos productores no tenían canales de distribución eficientes.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed">
            Decidimos crear una solución que beneficiara a ambos. Hoy, trabajamos exclusivamente con productores de primer nivel en diferentes regiones de Chile, entregando productos premium en menos de 24 horas a miles de hogares que valoran la calidad.
          </p>
        </section>

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
