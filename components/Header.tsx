'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { FiLogOut, FiUser, FiShoppingCart, FiMenu, FiX, FiChevronDown } from 'react-icons/fi'
import { useState } from 'react'

export function Header() {
  const pathname = usePathname()
  const { user, isAdmin, logout, isAuthenticated } = useAuth()
  const { items } = useCart()

  // No mostrar Header en /admin/*
  if (pathname.startsWith('/admin')) {
    return null
  }
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [adminMenuOpen, setAdminMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      setProfileDropdownOpen(false)
      setMobileMenuOpen(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const adminMenuItems = [
    { label: 'Productos', href: '/admin/productos' },
    { label: 'Pedidos', href: '/admin/pedidos' },
    { label: 'Analizador', href: '/admin/analizador' },
    { label: 'Cuadratura', href: '/admin/cuadratura' },
    { label: 'Usuarios', href: '/admin/usuarios' },
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'ARCOP', href: '/admin/solicitudes-arcop' },
    { label: 'Configuración', href: '/admin/configuracion' },
  ]

  return (
    <>
      <header className="fixed top-0 w-full z-40 bg-gradient-to-b from-black/40 to-transparent text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 flex-shrink-0 cursor-pointer"
              onClick={() => {
                setMobileMenuOpen(false)
                setAdminMenuOpen(false)
              }}
            >
              <div className="text-2xl">🥬</div>
              <span className="text-xl font-bold hidden sm:inline">
                Frutas & Verduras
              </span>
            </Link>

            {/* Desktop Navigation - Only show on desktop */}
            <nav className="hidden md:flex items-center gap-8">
              {isAdmin ? (
                <div className="flex items-center gap-6">
                  {adminMenuItems.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => window.location.href = item.href}
                      className="hover:text-green-100 transition text-sm font-medium cursor-pointer bg-transparent border-0 p-0 text-white"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <button onClick={() => window.location.href = "/catalogo"} className="hover:text-green-100 transition font-medium cursor-pointer bg-transparent border-0 p-0 text-white">
                    Catálogo
                  </button>
                  <button onClick={() => window.location.href = "/#faqs"} className="hover:text-green-100 transition font-medium cursor-pointer bg-transparent border-0 p-0 text-white">
                    FAQs
                  </button>
                </>
              )}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Carrito - Solo para clientes */}
              {!isAdmin && isAuthenticated && (
                <Link href="/carrito" className="relative hover:text-green-100 transition cursor-pointer">
                  <FiShoppingCart className="text-2xl" />
                  {items.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {items.length}
                    </span>
                  )}
                </Link>
              )}

              {/* Auth Menu */}
              {isAuthenticated ? (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 hover:text-green-100 transition p-2 rounded-lg hover:bg-green-500"
                  >
                    <FiUser className="text-xl" />
                    <span className="text-sm hidden md:inline truncate max-w-32">
                      {user?.email?.split('@')[0]}
                    </span>
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg z-50">
                      <Link
                        href="/auth/perfil"
                        className="block px-4 py-2 hover:bg-gray-100 rounded-t-lg text-sm"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Mi Perfil
                      </Link>
                      {!isAdmin && (
                        <Link
                          href="/ordenes"
                          className="block px-4 py-2 hover:bg-gray-100 text-sm"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          Mis Órdenes
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg flex items-center gap-2 text-red-600 text-sm font-medium"
                      >
                        <FiLogOut /> Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex gap-1">
                  <Link
                    href="/auth/login"
                    className="px-2 py-1.5 bg-white text-green-600 rounded font-semibold hover:bg-green-50 transition text-xs"
                  >
                    Ingresar
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-2 py-1.5 bg-green-500 hover:bg-green-400 rounded font-semibold transition text-xs"
                  >
                    Registrar
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button - Only show on mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-green-500 rounded-lg transition"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <FiX className="text-2xl" />
                ) : (
                  <FiMenu className="text-2xl" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar */}
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-lg overflow-y-auto animate-in slide-in-from-left">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="text-2xl">🥬</div>
                <span className="font-bold text-gray-900">Frutas & Verduras</span>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="p-4 space-y-2">
              {isAdmin ? (
                <>
                  {/* Admin Menu - Accordion */}
                  <div className="space-y-1">
                    <button
                      onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                      className="w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 font-medium text-gray-900"
                    >
                      <span>📊 Admin</span>
                      <FiChevronDown
                        className={`transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {adminMenuOpen && (
                      <div className="ml-4 space-y-1 border-l-2 border-green-300 pl-3">
                        {adminMenuItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-lg hover:bg-green-50 text-gray-700 text-sm hover:text-green-600 transition"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/catalogo"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 rounded-lg hover:bg-gray-100 font-medium text-gray-900 hover:text-green-600 transition"
                  >
                    📦 Catálogo
                  </Link>
                  <Link
                    href="/#faqs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 rounded-lg hover:bg-gray-100 font-medium text-gray-900 hover:text-green-600 transition"
                  >
                    ❓ FAQs
                  </Link>
                </>
              )}
            </nav>

            {/* Auth Section - Mobile */}
            <div className="border-t border-gray-200 p-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg mb-2">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.email?.split('@')[0]}
                    </p>
                    {isAdmin && <p className="text-xs text-green-600 font-semibold">Administrador</p>}
                  </div>

                  <Link
                    href="/auth/perfil"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-green-600 transition flex items-center gap-2"
                  >
                    <FiUser /> Mi Perfil
                  </Link>

                  {!isAdmin && (
                    <Link
                      href="/ordenes"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-green-600 transition"
                    >
                      📋 Mis Órdenes
                    </Link>
                  )}

                  {!isAdmin && (
                    <Link
                      href="/carrito"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-green-600 transition flex items-center gap-2"
                    >
                      <FiShoppingCart /> Carrito ({items.length})
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition flex items-center gap-2 font-medium"
                  >
                    <FiLogOut /> Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition font-medium text-center"
                  >
                    Ingresar
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 rounded-lg border-2 border-green-600 text-green-600 hover:bg-green-50 transition font-medium text-center"
                  >
                    Registrar
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
