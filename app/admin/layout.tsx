import AdminSidebar from '@/components/AdminSidebar'
import { useAuth } from '@/hooks/useAuth'

export const metadata = {
  title: 'Admin - Frutas & Verduras',
  description: 'Panel de administración',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto md:ml-0">
        {children}
      </main>
    </div>
  )
}
