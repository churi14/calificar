'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const navItems = [
  { href: '/admin',             icon: '📊', label: 'Resumen' },
  { href: '/admin/clientes',    icon: '👥', label: 'Clientes' },
  { href: '/admin/clientes/nuevo', icon: '➕', label: 'Nuevo cliente' },
  { href: '/admin/qr',          icon: '🔲', label: 'QR Dinámicos' },
  { href: '/admin/donaciones',  icon: '☕', label: 'Donaciones' },
  { href: '/admin/fidelizacion',icon: '🎴', label: 'Fidelización' },
]

export default function AdminShell({
  children,
  profileName,
}: {
  children: React.ReactNode
  profileName: string | null
}) {
  const [dark, setDark] = useState(false)

  // Leer preferencia guardada
  useEffect(() => {
    const saved = localStorage.getItem('cal_admin_dark')
    if (saved === '1') setDark(true)
  }, [])

  // Aplicar/quitar clase `dark` en <html>
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('cal_admin_dark', dark ? '1' : '0')
  }, [dark])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white dark:bg-zinc-900 border-r border-gray-100 dark:border-zinc-800 flex flex-col fixed h-full">
        <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
          <div className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
            <img src="/logo.svg" alt="Calificar" className="h-7 w-auto" />
            <span className="font-extrabold text-xl text-[#0F172A] dark:text-white">Calificar</span>
          </div>
          <div className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5 font-semibold uppercase tracking-wider">Admin</div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <div className="pt-3 mt-3 border-t border-gray-100 dark:border-zinc-800">
            <form action="/api/auth/signout" method="post">
              <button type="submit"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors">
                🚪 Cerrar sesión
              </button>
            </form>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-900 dark:text-white">{profileName}</p>
            <p className="text-xs text-amber-600 font-bold">ADMIN</p>
          </div>
          <button
            onClick={() => setDark(d => !d)}
            title={dark ? 'Modo claro' : 'Modo noche'}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 ml-56 p-8 dark:text-zinc-100">{children}</main>
    </div>
  )
}
