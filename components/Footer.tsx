'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Footer() {
  const pathname = usePathname()

  // No mostrar Footer en /admin/* ni en home (/)
  if (pathname.startsWith('/admin') || pathname === '/') {
    return null
  }

  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Empresa */}
          <div>
            <h3 className="text-white font-bold mb-4">
              Frutas & Verduras
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
                <Link href="/sobre-nosotros" className="hover:text-green-400 transition">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="hover:text-green-400 transition">
                  Términos de Servicio
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="hover:text-green-400 transition">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-green-400 transition">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h4 className="text-white font-bold mb-4">Ayuda</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#faqs" className="hover:text-green-400 transition">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="/ayuda/metodos-pago" className="hover:text-green-400 transition">
                  Métodos de Pago
                </Link>
              </li>
              <li>
                <Link href="/ayuda/envios-entregas" className="hover:text-green-400 transition">
                  Envíos y Entregas
                </Link>
              </li>
              <li>
                <Link href="/ayuda/cambios-devoluciones" className="hover:text-green-400 transition">
                  Cambios y Devoluciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-white font-bold mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm">
              <li>info@frutasverduras.cl</li>
              <li>+56 9 1234 5678</li>
              <li>Lun-Vie: 9:00 - 18:00</li>
              <li>Sáb: 10:00 - 14:00</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p>&copy; 2026 Frutas & Verduras. Todos los derechos reservados.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="/privacidad-datos" className="hover:text-green-400 transition">
                Gestionar Datos (ARCOP)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
