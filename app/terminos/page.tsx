import Link from 'next/link'

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Términos de Servicio</h1>
          <p className="text-lg text-green-100">Última actualización: Julio 2026</p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">1. Aceptación de Términos</h2>
            <p className="text-gray-700 leading-relaxed">
              Al acceder y utilizar este sitio web (Frutas & Verduras), aceptas estar sujeto a estos términos y condiciones. Si no estás de acuerdo con alguno de estos términos, no debes usar el sitio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">2. Licencia de Uso</h2>
            <p className="text-gray-700 leading-relaxed">
              Se te concede una licencia limitada, no exclusiva y revocable para acceder y utilizar este sitio web únicamente para fines personales y no comerciales. No puedes reproducir, distribuir, transmitir o explotar cualquier contenido de este sitio sin permiso previo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">3. Cuentas de Usuario</h2>
            <p className="text-gray-700 leading-relaxed">
              Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. Aceptas ser responsable de todas las actividades que ocurran bajo tu cuenta. Debes notificarnos inmediatamente de cualquier uso no autorizado.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">4. Compras y Pagos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Al realizar una compra, confirmas que tienes el derecho legal de usar el método de pago proporcionado. Aceptas pagar el precio total mostrado, incluyendo impuestos y gastos de envío.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Nos reservamos el derecho de rechazar o cancelar cualquier pedido por cualquier razón.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">5. Devoluciones y Cambios</h2>
            <p className="text-gray-700 leading-relaxed">
              Los productos pueden ser devueltos dentro de 7 días desde la entrega si están en condiciones originales. Los productos perecederos (frutas y verduras) pueden ser cambiados si llegan en mal estado. El cambio debe reportarse dentro de 24 horas de la entrega.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">6. Limitación de Responsabilidad</h2>
            <p className="text-gray-700 leading-relaxed">
              Frutas & Verduras no será responsable por daños indirectos, incidentales, especiales o consecuentes derivados del uso de este sitio o los productos comprados.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">7. Cambios en los Términos</h2>
            <p className="text-gray-700 leading-relaxed">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigencia al publicarlos en el sitio. El uso continuado del sitio constituye aceptación de los términos modificados.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">8. Contacto</h2>
            <p className="text-gray-700 leading-relaxed">
              Si tienes preguntas sobre estos términos, contáctanos en info@frutasverduras.cl
            </p>
          </section>
        </div>

        {/* Volver */}
        <div className="text-center mt-8">
          <Link href="/" className="text-green-600 hover:text-green-700 font-medium">
            ← Volver a Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
