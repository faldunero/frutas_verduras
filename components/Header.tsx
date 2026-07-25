'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { FiLogOut, FiUser, FiShoppingCart } from 'react-icons/fi'
import { useState } from 'react'

export function Header() {
  const { user, isAdmin, logout, isAuthenticated } = useAuth()
  const { items } = useCart()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      setDropdownOpen(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl">🥬</div>
            <span className="text-xl font-bold hidden sm:inline">
              Frutas & Verduras
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {isAdmin ? (
              <>
                <Link href="/admin/productos" className="hover:text-green-100 transition">
                  Productos
                </Link>
                <Link href="/admin/pedidos" className="hover:text-green-100 transition">
                  Pedidos
                </Link>
                <Link href="/admin/analizador" className="hover:text-green-100 transition">
                  Analizador
                </Link>
                <Link href="/admin/usuarios" className="hover:text-green-100 transition">
                  Usuarios
                </Link>
                <Link href="/admin/dashboard" className="hover:text-green-100 transition">
                  Dashboard
                </Link>
                <Link href="/admin/solicitudes-arcop" className="hover:text-green-100 transition">
                  ARCOP
                </Link>
              </>
            ) : (
              <>
                <Link href="/catalogo" className="hover:text-green-100 transition">
                  Catálogo
                </Link>
                <Link href="/#faqs" className="hover:text-green-100 transition">
                  FAQs
                </Link>
              </>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-6">
            {/* Carrito - Solo para clientes */}
            {!isAdmin && (
              <Link href="/carrito" className="relative hover:text-green-100 transition">
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
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 hover:text-green-100 transition"
                >
                  <FiUser className="text-2xl" />
                  <span className="hidden sm:inline text-sm truncate max-w-48">
                    {user?.email?.split('@')[0]} {isAdmin && '(admin)'}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg z-50">
                    <Link
                      href="/perfil"
                      className="block px-4 py-2 hover:bg-gray-100 rounded-t-lg"
                    >
                      Mi Perfil
                    </Link>
                    {!isAdmin && (
                      <Link
                        href="/ordenes"
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        Mis Órdenes
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg flex items-center gap-2 text-red-600"
                    >
                      <FiLogOut /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/auth/login"
                  className="px-3 py-2 bg-white text-green-600 rounded font-semibold hover:bg-green-50 transition"
                >
                  Ingresar
                </Link>
                <Link
                  href="/auth/register"
                  className="px-3 py-2 bg-green-500 hover:bg-green-400 rounded font-semibold transition"
                >
                  Registrar
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden pb-4 flex gap-4 flex-wrap">
          {isAdmin ? (
            <>
              <Link href="/admin/productos" className="text-sm hover:text-green-100">
                Productos
              </Link>
              <Link href="/admin/pedidos" className="text-sm hover:text-green-100">
                Pedidos
              </Link>
              <Link href="/admin/analizador" className="text-sm hover:text-green-100">
                Analizador
              </Link>
              <Link href="/admin/usuarios" className="text-sm hover:text-green-100">
                Usuarios
              </Link>
              <Link href="/admin/dashboard" className="text-sm hover:text-green-100">
                Dashboard
              </Link>
              <Link href="/admin/solicitudes-arcop" className="text-sm hover:text-green-100">
                ARCOP
              </Link>
            </>
          ) : (
            <>
              <Link href="/catalogo" className="text-sm hover:text-green-100">
                Catálogo
              </Link>
              <Link href="/#faqs" className="text-sm hover:text-green-100">
                FAQs
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
