import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { planLabel, planColor } from '@/lib/utils'
import SidebarNav from '@/components/dashboard/SidebarNav'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, plan, role')
    .eq('id', user.id)
    .single()

  const navItems = [
    { href: '/dashboard', icon: '📊', label: 'Inicio' },
    { href: '/dashboard/negocios', icon: '🏪', label: 'Mis locales' },
    { href: '/dashboard/feedback', icon: '💬', label: 'Feedback recibido' },
    { href: '/qr/dashboard', icon: '🔲', label: 'QRs dinámicos' },
    ...(profile?.role === 'admin' ? [{ href: '/admin', icon: '⚙️', label: 'Admin' }] : [])
  ]

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex">
      {/* SIDEBAR — solo desktop */}
      <aside className="hidden md:flex w-60 bg-white border-r border-gray-100 flex-col fixed h-full z-30">
        <div className="p-5 border-b border-gray-100">
          <Link href="/" className="text-xl font-extrabold text-gray-900 flex items-center gap-1.5">
            <img src="/logo.svg" alt="Calificar" className="h-7 w-auto" /><span className="font-extrabold text-xl text-[#0F172A]">Calificar</span></Link>
        </div>

        <SidebarNav items={navItems}/>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
              {profile?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{profile?.name ?? user.email}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${planColor(profile?.plan ?? 'free')}`}>
                {planLabel(profile?.plan ?? 'free')}
              </span>
            </div>
          </div>
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1 text-left">
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 md:ml-60 p-4 md:p-8 min-h-screen pb-24 md:pb-8">
        {children}
      </main>

      {/* BOTTOM NAV — solo mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 flex">
        {navItems.map(item => (
          <Link key={item.href} href={item.href}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-gray-400 hover:text-gray-900 transition-colors">
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="text-[10px] font-medium leading-none truncate px-1">{item.label}</span>
          </Link>
        ))}
        <form action="/api/auth/signout" method="post" className="flex-1">
          <button type="submit" className="w-full h-full flex flex-col items-center justify-center py-3 gap-0.5 text-gray-400 hover:text-gray-900 transition-colors">
            <span className="text-xl leading-none">🚪</span>
            <span className="text-[10px] font-medium leading-none">Salir</span>
          </button>
        </form>
      </nav>
    </div>
  )
}