import Link from 'next/link'

export default function CambiosDevolucionesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Cambios y Devoluciones</h1>
          <p className="text-lg text-green-100">
            100% satisfacción garantizada
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Política General */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">📋 Política de Cambios y Devoluciones</h2>
            <p className="text-gray-700 mb-4">
              Sabemos que a veces los productos no cumplen tus expectativas. Si tienes inconformidad con tu compra, aquí te explicamos cómo procedemos.
            </p>
            <div className="bg-orange-50 border border-orange-200 p-4 rounded">
              <p className="text-orange-900 font-medium mb-2">⚠️ Política Especial para Frutas y Verduras</p>
              <p className="text-orange-800 text-sm">
                No existe devolución del producto. En caso de inconformidad, te contactaremos y te abonaremos el valor del producto. Hay un plazo de 2 días para solicitar y hasta 2 días más para efectuar la transferencia.
              </p>
            </div>
          </div>

          {/* Frutas y Verduras Frescas */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">🥕 Frutas y Verduras Frescas</h2>
            <p className="text-gray-700 mb-4">
              <strong>No existe devolución del producto.</strong> En caso de inconformidad, aquí te explicamos cómo procederemos:
            </p>

            <div className="space-y-4">
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-bold text-gray-900 mb-2">📞 Proceso en caso de inconformidad</h3>
                <p className="text-gray-700">
                  1. Te contactaremos para entender el problema<br />
                  2. Evaluaremos tu solicitud<br />
                  3. Si procedemos, te abonaremos el valor del producto<br />
                  <strong>Plazo para solicitar:</strong> Máximo 2 días<br />
                  <strong>Plazo para transferencia:</strong> Hasta 2 días más
                </p>
              </div>

              <div className="border-l-4 border-green-600 pl-4">
                <h3 className="font-bold text-gray-900 mb-2">✓ Productos de Primer Nivel</h3>
                <p className="text-gray-700">
                  Garantizamos que todos nuestros productos llegan en perfecto estado. Los productos de Frutas & Verduras son de primer nivel y cuidadosamente seleccionados.
                </p>
              </div>
            </div>
          </div>

          {/* Proceso */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">🔄 Proceso en caso de Inconformidad</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                <div>
                  <h3 className="font-bold text-gray-900">Comunícate Dentro de 2 Días</h3>
                  <p className="text-gray-700 text-sm">Envía un email a soporte@frutasverduras.cl explicando tu inconformidad</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                <div>
                  <h3 className="font-bold text-gray-900">Evaluación</h3>
                  <p className="text-gray-700 text-sm">Nuestro equipo analiza tu solicitud</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                <div>
                  <h3 className="font-bold text-gray-900">Abono del Valor</h3>
                  <p className="text-gray-700 text-sm">Si procede, te abonamos el valor mediante transferencia bancaria</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">4</div>
                <div>
                  <h3 className="font-bold text-gray-900">Completado</h3>
                  <p className="text-gray-700 text-sm">Transferencia en hasta 2 días más</p>
                </div>
              </div>
            </div>
          </div>

          {/* Consideraciones */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📝 Consideraciones Importantes</h3>
            <p className="text-gray-800 mb-3">
              Ten en cuenta que:
            </p>
            <ul className="space-y-2 text-gray-800">
              <li>• El plazo para reportar inconformidad es de máximo 2 días desde la entrega</li>
              <li>• El abono se efectúa mediante transferencia bancaria</li>
              <li>• Contamos con productos de primer nivel cuidadosamente seleccionados</li>
              <li>• Evaluamos cada caso de forma individual</li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
            <h3 className="text-xl font-bold text-blue-900 mb-4">📧 ¿Necesitas Ayuda?</h3>
            <p className="text-blue-800 mb-3">
              Si tienes problemas con tu pedido, contáctanos:
            </p>
            <p className="text-blue-800">
              <strong>Email:</strong> soporte@frutasverduras.cl<br />
              <strong>Teléfono:</strong> +56 9 1234 5678<br />
              <strong>Horario:</strong> Lun-Vie 9:00-18:00, Sáb 10:00-14:00
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
