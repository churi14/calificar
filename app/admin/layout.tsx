import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('name, role').eq('id', user.id).single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const navItems = [
    { href: '/admin', icon: '📊', label: 'Resumen' },
    { href: '/admin/clientes', icon: '👥', label: 'Clientes' },
    { href: '/admin/clientes/nuevo', icon: '➕', label: 'Nuevo cliente' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col fixed h-full">
        <div className="p-5 border-b border-gray-100">
          <div className="text-lg font-extrabold text-gray-900 flex items-center gap-1.5">
            <span className="text-amber-500">★</span> calificar
          </div>
          <div className="text-xs text-gray-400 mt-0.5 font-semibold uppercase tracking-wider">Admin</div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <div className="pt-3 mt-3 border-t border-gray-100">
            <Link href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-700 transition-colors">
              ← Mi dashboard
            </Link>
          </div>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-900">{profile?.name}</p>
          <p className="text-xs text-amber-600 font-bold">ADMIN</p>
        </div>
      </aside>
      <main className="flex-1 ml-56 p-8">{children}</main>
    </div>
  )
}
