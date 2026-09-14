'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Footer from './Footer'

const WA = 'https://wa.me/5491123867934?text=Hola!%20Quiero%20info%20sobre%20Calificar%20para%20mi%20local.'

export function DarkNav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#070A14]/90 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/40'
            : 'bg-[#070A14]/60 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display font-extrabold text-xl text-white">
            <img src="/logo.svg" alt="Calificar" className="h-7 w-auto brightness-200" />
            <span>Calificar</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/r/demo" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-full hover:bg-white/8 transition-all duration-200">Demo</Link>
            <Link href="/tienda" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-full hover:bg-white/8 transition-all duration-200">Carteles</Link>
            <Link href="/precios" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-full hover:bg-white/8 transition-all duration-200">Precios</Link>
            <Link href="/blog" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-full hover:bg-white/8 transition-all duration-200">Blog</Link>
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200">Entrar</Link>
            <a href={WA} target="_blank" className="ml-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors duration-200 shadow-lg shadow-violet-900/40">
              Quiero mi sistema
            </a>
          </nav>

          <button onClick={() => setOpen(true)} aria-label="Abrir menú" className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/8 border border-white/10 text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          </button>
        </div>
      </header>

      {open && (
        <div className="md:hidden fixed inset-0 z-[60] bg-[#070A14]/98 backdrop-blur-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <Link href="/" className="flex items-center gap-2 font-display font-extrabold text-xl text-white">
              <img src="/logo.svg" alt="Calificar" className="h-7 w-auto brightness-200" />Calificar
            </Link>
            <button onClick={() => setOpen(false)} aria-label="Cerrar menú" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <nav className="flex flex-col gap-1 text-lg font-medium text-slate-300">
            <Link href="/r/demo" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl hover:bg-white/5 hover:text-white transition-colors">Demo</Link>
            <Link href="/tienda" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl hover:bg-white/5 hover:text-white transition-colors">Carteles</Link>
            <Link href="/precios" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl hover:bg-white/5 hover:text-white transition-colors">Precios</Link>
            <Link href="/blog" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl hover:bg-white/5 hover:text-white transition-colors">Blog</Link>
            <Link href="/login" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl hover:bg-white/5 hover:text-white transition-colors">Entrar</Link>
          </nav>
          <a href={WA} target="_blank" className="mt-auto block text-center bg-violet-600 text-white font-semibold px-5 py-4 rounded-full">Quiero mi sistema</a>
        </div>
      )}
    </>
  )
}

/** Wrapper completo: dark bg + nav fija + footer */
export default function DarkLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-white" style={{ background: '#070A14' }}>
      <DarkNav />
      <main className="pt-16">{children}</main>
      <Footer />
    </div>
  )
}
