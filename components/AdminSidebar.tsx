'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { FiMenu, FiX, FiChevronDown, FiBarChart2, FiBox, FiDollarSign, FiSettings, FiActivity, FiShoppingCart, FiTrendingUp, FiUsers, FiSliders, FiLogOut } from 'react-icons/fi'

interface MenuItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface MenuCategory {
  title: string
  icon: React.ReactNode
  items: MenuItem[]
}

const menuCategories: MenuCategory[] = [
  {
    title: 'Dashboard',
    icon: <FiBarChart2 size={20} />,
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: <FiBarChart2 size={18} /> },
      { label: 'Observabilidad', href: '/admin/observabilidad', icon: <FiActivity size={18} /> },
    ],
  },
  {
    title: 'Productos',
    icon: <FiBox size={20} />,
    items: [
      { label: 'Productos', href: '/admin/productos', icon: <FiBox size={18} /> },
      { label: 'Analizador', href: '/admin/analizador', icon: <FiTrendingUp size={18} /> },
    ],
  },
  {
    title: 'Ventas',
    icon: <FiDollarSign size={20} />,
    items: [
      { label: 'Pedidos', href: '/admin/pedidos', icon: <FiShoppingCart size={18} /> },
      { label: 'Cuadratura', href: '/admin/cuadratura', icon: <FiTrendingUp size={18} /> },
      { label: 'ARCOP', href: '/admin/solicitudes-arcop', icon: <FiDollarSign size={18} /> },
    ],
  },
  {
    title: 'Administración',
    icon: <FiSettings size={20} />,
    items: [
      { label: 'Usuarios', href: '/admin/usuarios', icon: <FiUsers size={18} /> },
      { label: 'Configuración', href: '/admin/configuracion', icon: <FiSliders size={18} /> },
    ],
  },
]

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Dashboard')
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isActive = (href: string) => pathname === href

  const toggleCategory = (title: string) => {
    setExpandedCategory(expandedCategory === title ? null : title)
  }

  const handleNavigation = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 md:hidden bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white shadow-lg transform transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } md:relative md:translate-x-0`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-center">
          <Link href="/admin" onClick={handleNavigation}>
            <Image
              src="/logo.webp"
              alt="El Chiringuito de Felipe"
              width={120}
              height={120}
              className="w-32 h-auto"
            />
          </Link>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-100px)]">
          {menuCategories.map((category) => (
            <div key={category.title}>
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.title)}
                className="w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm font-medium text-gray-300 hover:text-white"
              >
                <div className="flex items-center gap-2">
                  {category.icon}
                  <span>{category.title}</span>
                </div>
                <FiChevronDown
                  size={16}
                  className={`transition-transform ${expandedCategory === category.title ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Category Items */}
              {expandedCategory === category.title && (
                <div className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-3">
                  {category.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleNavigation}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
                        isActive(item.href)
                          ? 'bg-green-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-gray-950 space-y-3">
          {/* User Info */}
          <div className="px-4 py-3 bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-400">Usuario</p>
            <p className="text-sm font-medium text-white truncate">{user?.email?.split('@')[0]}</p>
            <p className="text-xs text-green-400 font-semibold mt-1">👑 Administrador</p>
          </div>

          {/* Logout Button */}
          <button
            onClick={async () => {
              await logout()
              handleNavigation()
            }}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-950/20 transition"
          >
            <FiLogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
