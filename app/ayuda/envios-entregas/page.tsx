import Link from 'next/link'

export default function EnviosEntregasPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Envíos y Entregas</h1>
          <p className="text-lg text-green-100">
            Entrega rápida y segura a tu hogar
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Zonas de Cobertura */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">📍 Zonas de Cobertura</h2>
            <p className="text-gray-700 mb-6">
              Actualmente realizamos entregas en las siguientes comunas de la Región Metropolitana:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-gray-900">
                    <span className="text-xl">✓</span>
                    <span className="font-medium">Las Condes</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-900">
                    <span className="text-xl">✓</span>
                    <span className="font-medium">Providencia</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-900">
                    <span className="text-xl">✓</span>
                    <span className="font-medium">Vitacura</span>
                  </li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-gray-900">
                    <span className="text-xl">✓</span>
                    <span className="font-medium">Lo Barnechea</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-900">
                    <span className="text-xl">✓</span>
                    <span className="font-medium">Ñuñoa</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-900">
                <strong>ℹ️ Nota:</strong> Solo despachamos en estas 5 comunas. Si estás fuera de estas zonas, <Link href="/contacto" className="text-blue-600 underline font-medium">contáctanos</Link> para consultar.
              </p>
            </div>
          </div>

          {/* Tiempos de Entrega */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">⏱️ Tiempos de Entrega</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-green-600 pl-4">
                <h3 className="font-bold text-gray-900">Recepción y Despacho</h3>
                <p className="text-gray-700">Los pedidos son recibidos el día anterior y despachados el día siguiente.</p>
                <p className="text-green-600 font-medium">Gratis</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-4">
              <strong>Nota:</strong> Todos los pedidos se procesan de acuerdo con el ciclo de recepción y despacho diario.
            </p>
          </div>

          {/* Costo de Envío */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">💰 Costo de Envío</h2>
            <div className="bg-gray-50 p-4 rounded mb-4">
              <p className="text-gray-700 mb-3"><strong>Envío Gratis en Pedidos:</strong></p>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Mayores a $30.000</li>
                <li>✓ Clientes frecuentes (3+ compras)</li>
                <li>✓ Compras de frutas/verduras orgánicas (cualquier monto)</li>
              </ul>
            </div>
            <p className="text-gray-600 text-sm">
              <strong>Envíos con costo:</strong> Pedidos menores a $30.000: $1.990
            </p>
          </div>

          {/* Seguimiento */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">📦 Seguimiento de tu Pedido</h2>
            <p className="text-gray-700 mb-4">
              Recibirás notificaciones por email y SMS en cada paso:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-green-600 font-bold">1.</span>
                <div>
                  <p className="font-bold text-gray-900">Pedido Confirmado</p>
                  <p className="text-gray-600 text-sm">Después del pago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 font-bold">2.</span>
                <div>
                  <p className="font-bold text-gray-900">Pedido Preparado</p>
                  <p className="text-gray-600 text-sm">En nuestro depósito</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 font-bold">3.</span>
                <div>
                  <p className="font-bold text-gray-900">En Camino</p>
                  <p className="text-gray-600 text-sm">Tu conductor te llamará 30 minutos antes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 font-bold">4.</span>
                <div>
                  <p className="font-bold text-gray-900">Entregado</p>
                  <p className="text-gray-600 text-sm">Con foto de confirmación</p>
                </div>
              </div>
            </div>
          </div>

          {/* Empaque */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
            <h3 className="text-xl font-bold text-blue-900 mb-4">📦 Nuestro Empaque Especial</h3>
            <p className="text-blue-800 mb-3">
              Tus productos llegan frescos gracias a:
            </p>
            <ul className="space-y-2 text-blue-800">
              <li>✓ Cajas térmicas aislantes</li>
              <li>✓ Hielo reciclable para mantener la temperatura</li>
              <li>✓ Empaques individuales por producto</li>
              <li>✓ Materiales 100% reciclables</li>
            </ul>
          </div>
        </div>

        {/* Volver */}
        <div className="text-center mt-12">
          <Link href="/ayuda" className="text-green-600 hover:text-green-700 font-medium">
            ← Volver a Ayuda
          </Link>
        </div>
      </div>
    </div>
  )
}
