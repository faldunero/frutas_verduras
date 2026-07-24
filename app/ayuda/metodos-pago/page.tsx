import Link from 'next/link'

export default function MetodosPagoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Métodos de Pago</h1>
          <p className="text-lg text-green-100">
            Múltiples opciones de pago seguras y convenientes
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Transferencia Bancaria */}
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="text-4xl">🏦</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Transferencia Bancaria</h2>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              <strong>Única forma de pago aceptada:</strong> Transfiere dinero directamente desde tu banco a nuestra cuenta corriente.
            </p>
            <div className="bg-gray-50 p-4 rounded mb-4">
              <p className="text-sm text-gray-700 mb-3"><strong>Datos de Transferencia:</strong></p>
              <p className="text-sm text-gray-700">Banco: Banco de Chile</p>
              <p className="text-sm text-gray-700">Cuenta: 1234567890</p>
              <p className="text-sm text-gray-700">RUT: 76.123.456-K</p>
            </div>
            <p className="text-gray-600 text-sm">
              <strong>Ventajas:</strong> Sin comisiones, seguro, confirmación inmediata, trazable
            </p>
          </div>

          {/* Información Importante */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
            <h3 className="text-xl font-bold text-blue-900 mb-4">ℹ️ Información Importante</h3>
            <p className="text-blue-800 mb-3">
              Actualmente aceptamos <strong>únicamente transferencias bancarias</strong> como método de pago.
            </p>
            <p className="text-blue-800">
              Si tienes dudas sobre cómo realizar la transferencia, contáctanos a <strong>soporte@frutasverduras.cl</strong>
            </p>
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
