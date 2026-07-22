export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Empresa */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🥬</span> Frutas & Verduras
            </h3>
            <p className="text-sm">
              Ofrecemos frutas y verduras frescas de calidad, entregadas
              directamente a tu puerta.
            </p>
          </div>

          {/* Información */}
          <div>
            <h4 className="text-white font-bold mb-4">Información</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-green-400 transition">
                  Sobre Nosotros
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400 transition">
                  Términos de Servicio
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400 transition">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400 transition">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h4 className="text-white font-bold mb-4">Ayuda</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-green-400 transition">
                  Preguntas Frecuentes
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400 transition">
                  Métodos de Pago
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400 transition">
                  Envíos y Entregas
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400 transition">
                  Cambios y Devoluciones
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-white font-bold mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm">
              <li>📧 info@frutasverduras.cl</li>
              <li>📱 +56 9 1234 5678</li>
              <li>🕐 Lun-Vie: 9:00 - 18:00</li>
              <li>🕐 Sáb: 10:00 - 14:00</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p>&copy; 2024 Frutas & Verduras. Todos los derechos reservados.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-green-400 transition">
                Facebook
              </a>
              <a href="#" className="hover:text-green-400 transition">
                Instagram
              </a>
              <a href="#" className="hover:text-green-400 transition">
                Twitter
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
