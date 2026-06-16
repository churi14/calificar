'use client'

import { useState } from 'react'
import Link from 'next/link'

const WA = 'https://wa.me/5491123867934?text=Hola!%20Quiero%20info%20sobre%20Calificar%20para%20mi%20local.'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <Link href="/" className="font-display font-extrabold text-xl text-gray-900 flex items-center gap-1.5">
          <img src="/logo.svg" alt="Calificar" className="h-7 w-auto" /><span className="font-extrabold text-xl text-[#0F172A]">Calificar</span></Link>

        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-600">
          <Link href="/r/demo" className="px-4 py-2 rounded-full hover:text-gray-900 hover:bg-gray-50 transition-colors">
            Demo
          </Link>
          <Link href="/tienda" className="px-4 py-2 rounded-full hover:text-gray-900 hover:bg-gray-50 transition-colors">
            Carteles
          </Link>
          <a href="#planes" className="px-4 py-2 rounded-full hover:text-gray-900 hover:bg-gray-50 transition-colors">
            Precios
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Entrar
          </Link>
          <a href={WA} target="_blank"
            className="bg-violet-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-violet-700 transition-colors">
            Quiero mi sistema
          </a>
        </div>

        <button onClick={() => setOpen(o => !o)}
          aria-label="Abrir menú"
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 text-white">
          {open ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M3 12h18M3 18h18"/>
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
          <Link href="/r/demo" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50">Demo</Link>
          <Link href="/tienda" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50">Carteles</Link>
          <a href="#planes" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50">Precios</a>
          <Link href="/login" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50">Entrar</Link>
          <a href={WA} target="_blank" className="block text-center mt-3 bg-violet-600 text-white font-semibold px-5 py-3 rounded-full">
            Quiero mi sistema
          </a>
        </div>
      )}
    </header>
  )
}