import Link from 'next/link'

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Política de Privacidad</h1>
          <p className="text-lg text-green-100">Última actualización: Julio 2026 | Cumple con Ley 21.719 de Protección de Datos Personales de Chile</p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">1. Responsable del Tratamiento de Datos</h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>Empresa:</strong> Frutas & Verduras SpA<br />
              <strong>Email:</strong> privacidad@frutasverduras.cl<br />
              <strong>Teléfono:</strong> +56 9 1234 5678<br />
              <strong>Dirección:</strong> Santiago, Región Metropolitana, Chile
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Somos responsables del tratamiento de tus datos personales conforme a la Ley Nº 21.719 de Protección de Datos Personales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">2. Información que Recopilamos y Consentimiento</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Recopilamos la siguiente información con tu consentimiento explícito:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Datos de Identificación:</strong> Nombre completo, email, teléfono, RUT (opcional)</li>
              <li><strong>Datos de Ubicación:</strong> Dirección de envío y facturación</li>
              <li><strong>Datos de Pago:</strong> Información de tarjeta (procesada por terceros certificados)</li>
              <li><strong>Datos de Navegación:</strong> Cookies, historial de búsqueda, preferencias</li>
              <li><strong>Datos Transaccionales:</strong> Historial de compras y ordenes</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>Consentimiento:</strong> Al crear tu cuenta o realizar una compra, das consentimiento explícito para el tratamiento de tus datos personales según esta política.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">3. Finalidades del Tratamiento de Datos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Utilizamos tu información para:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Procesar y entregar tus pedidos</li>
              <li>Contactarte sobre el estado de tus compras</li>
              <li>Procesar pagos y transacciones</li>
              <li>Mejorar nuestros servicios y experiencia de usuario</li>
              <li>Cumplir con obligaciones legales y regulatorias</li>
              <li>Prevenir fraude y actividades ilícitas</li>
              <li>Enviar comunicaciones de marketing (solo si consentiste)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">4. Base Legal del Tratamiento</h2>
            <p className="text-gray-700 leading-relaxed">
              El tratamiento de tus datos personales se basa en:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mt-3">
              <li>Tu consentimiento explícito (Artículo 4, Ley 21.719)</li>
              <li>Ejecución de contrato (relación comercial)</li>
              <li>Cumplimiento de obligaciones legales</li>
              <li>Intereses legítimos de Frutas & Verduras</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">5. Seguridad de Datos (Artículo 5, Ley 21.719)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Implementamos medidas de seguridad física, electrónica y procedural para proteger tus datos:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Encriptación SSL de 256 bits en todas las transacciones</li>
              <li>Servidores protegidos con firewalls y sistema de detección de intrusiones</li>
              <li>Copias de seguridad automáticas</li>
              <li>Acceso restringido solo a personal autorizado</li>
              <li>Cumplimiento con estándar PCI DSS para datos de pago</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Si detectas una posible violación de seguridad, <strong>contáctanos inmediatamente</strong> a privacidad@frutasverduras.cl
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">6. Compartir Información con Terceros (Artículos 6 y 9, Ley 21.719)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Solo compartimos tus datos personales con:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Empresas de Logística:</strong> Para entregar tus pedidos (Starken, Correos, etc.)</li>
              <li><strong>Procesadores de Pago:</strong> Para procesar transacciones bancarias</li>
              <li><strong>Autoridades Públicas:</strong> Cuando la ley lo requiera</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>Importante:</strong> Todos nuestros proveedores terceros están obligados por contrato a mantener confidencialidad y no usar tus datos para otros fines.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">7. Tus Derechos ARCO + (Artículos 10, 11, 12, Ley 21.719)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Conforme a la Ley 21.719, tienes los siguientes derechos:
            </p>
            <div className="space-y-3">
              <div className="border-l-4 border-green-600 pl-4">
                <h3 className="font-bold text-gray-900">✓ Acceso (A)</h3>
                <p className="text-gray-700 text-sm">Acceder a tus datos personales almacenados en nuestros sistemas</p>
              </div>
              <div className="border-l-4 border-green-600 pl-4">
                <h3 className="font-bold text-gray-900">✓ Rectificación (R)</h3>
                <p className="text-gray-700 text-sm">Corregir datos inexactos o incompletos</p>
              </div>
              <div className="border-l-4 border-green-600 pl-4">
                <h3 className="font-bold text-gray-900">✓ Cancelación (C)</h3>
                <p className="text-gray-700 text-sm">Solicitar la eliminación de tus datos personales</p>
              </div>
              <div className="border-l-4 border-green-600 pl-4">
                <h3 className="font-bold text-gray-900">✓ Oposición (O)</h3>
                <p className="text-gray-700 text-sm">Oponerte al tratamiento de tus datos para marketing</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>Para ejercer estos derechos:</strong> Envía un email a privacidad@frutasverduras.cl con tu solicitud y verificaremos tu identidad. Responderemos en un plazo máximo de 30 días.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">8. Retención de Datos</h2>
            <p className="text-gray-700 leading-relaxed">
              Mantenemos tus datos personales durante el tiempo necesario para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mt-3">
              <li>Cumplir con la finalidad para la cual fueron recopilados</li>
              <li>Cumplir con obligaciones legales (mínimo 3 años según legislación tributaria)</li>
              <li>Resolver disputas y reclamaciones</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Después de este período, eliminaremos o anonimizaremos tus datos, a menos que la ley requiera su retención.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">9. Cookies y Tecnologías de Seguimiento</h2>
            <p className="text-gray-700 leading-relaxed">
              Utilizamos cookies para mejorar tu experiencia. Puedes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mt-3">
              <li>Desactivar cookies en la configuración de tu navegador</li>
              <li>Usar modo incógnito para navegar sin guardar cookies</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>Nota:</strong> Desactivar cookies puede afectar la funcionalidad del sitio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">10. Cambios en esta Política</h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos actualizar esta política ocasionalmente. Te notificaremos de cambios significativos por email. Tu continuación de uso del sitio implica aceptación de los cambios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">11. Contacto y Reclamos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Para ejercer tus derechos o presentar reclamos sobre privacidad:
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Email:</strong> privacidad@frutasverduras.cl<br />
              <strong>Teléfono:</strong> +56 9 1234 5678<br />
              <strong>Dirección:</strong> Santiago, Región Metropolitana, Chile<br />
              <strong>Plazo de Respuesta:</strong> Máximo 30 días hábiles
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Si no estás satisfecho con nuestra respuesta, puedes presentar una denuncia ante el Consejo para la Transparencia de Chile.
            </p>
          </section>

          <section className="bg-blue-50 border border-blue-200 p-4 rounded">
            <p className="text-blue-900 text-sm">
              <strong>Cumplimiento Legal:</strong> Esta política cumple con la Ley Nº 21.719 de Protección de Datos Personales de Chile y los artículos aplicables sobre tratamiento de datos personales.
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
