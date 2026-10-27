'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin',                      icon: '📊', label: 'Resumen' },
  { href: '/admin/clientes',             icon: '👥', label: 'Clientes' },
  { href: '/admin/clientes/nuevo',       icon: '➕', label: 'Nuevo cliente' },
  { href: '/admin/qr',                   icon: '🔲', label: 'QR Dinámicos' },
  { href: '/admin/donaciones',           icon: '☕', label: 'Donaciones' },
  { href: '/admin/fidelizacion',         icon: '🎴', label: 'Fidelización' },
  { href: '/admin/fidelizacion/planes',  icon: '💳', label: 'Gestión de planes' },
]

export default function AdminShell({
  children,
  profileName,
}: {
  children: React.ReactNode
  profileName: string | null
}) {
  const [dark, setDark] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  // Ítem activo: el de la ruta más específica que coincide con la actual
  const activeHref = navItems
    .filter(i => pathname === i.href || pathname.startsWith(i.href + '/'))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href

  // Leer preferencia guardada
  useEffect(() => {
    const saved = localStorage.getItem('cal_admin_dark')
    if (saved === '1') setDark(true)
  }, [])

  // Modo noche: oscurece todas las páginas del admin (ver .admin-night en globals.css).
  // Se saca al salir del admin para que no afecte al resto del sitio.
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark')
    root.classList.toggle('admin-night', dark)
    localStorage.setItem('cal_admin_dark', dark ? '1' : '0')
  }, [dark])

  useEffect(() => () => { document.documentElement.classList.remove('admin-night') }, [])

  // Permite instalar el admin como app (PWA) desde el navegador
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/admin-sw.js', { scope: '/admin/' }).catch(() => {})
    }
  }, [])

  // En el celular el menú se cierra al cambiar de página
  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Fondo oscuro detrás del menú en el celular */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 bg-gray-900/50 xl:hidden" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}

      {/* Menú lateral */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 xl:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="px-6 pt-7 pb-5">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Calificar" className="h-7 w-auto" />
            <span className="font-extrabold text-xl text-[#0F172A]">Calificar</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-1 font-semibold uppercase tracking-wider">Administración</div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-1">
          <p className="px-3 pb-1 text-xs uppercase tracking-wider text-gray-400">Menú</p>
          {navItems.map(item => {
            const active = item.href === activeHref
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#ecf3ff] text-[#465fff]'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}>
                <span className="w-5 text-center">{item.icon}</span>{item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 pb-5 pt-3 border-t border-gray-100">
          <form action="/api/auth/signout" method="post">
            <button type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">
              <span className="w-5 text-center">🚪</span> Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Contenido */}
      <div className="flex-1 min-w-0 xl:ml-64 flex flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Abrir menú"
              className="xl:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
            >
              ☰
            </button>
            <span className="text-sm font-semibold text-gray-500 hidden sm:block">Panel de administración</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDark(d => !d)}
              title={dark ? 'Modo claro' : 'Modo noche'}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-base text-gray-600 transition-colors hover:bg-gray-100"
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ecf3ff] text-sm font-bold text-[#465fff]">
                {(profileName ?? 'A').charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-sm font-semibold text-gray-800">{profileName}</p>
                <p className="text-[11px] font-bold text-amber-600">ADMIN</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 xl:p-8">{children}</main>
      </div>
    </div>
  )
}
