'use client'

import { useState } from 'react'
import Link from 'next/link'

const WA = 'https://wa.me/5491100000000?text=Hola!%20Quiero%20info%20sobre%20Calificar%20para%20mi%20local.'

function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/>
    </svg>
  )
}

export default function HeroNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Píldora flotante — desktop */}
      <div className="hidden md:flex items-center gap-1 bg-white rounded-full shadow-lg px-2 py-2">
        <Link href="/r/demo" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50 transition-colors">
          Demo
        </Link>
        <Link href="/tienda" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50 transition-colors">
          Carteles
        </Link>
        <a href="#planes" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50 transition-colors">
          Precios
        </a>
        <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1.5">
          <IconUser/> Entrar
        </Link>
        <a href={WA} target="_blank"
          className="bg-[#1A1A2E] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#2A2A45] transition-colors ml-1 whitespace-nowrap">
          Quiero mi sistema
        </a>
      </div>

      {/* Botón hamburguesa — mobile */}
      <button onClick={() => setOpen(true)} aria-label="Abrir menú"
        className="md:hidden w-11 h-11 flex items-center justify-center rounded-full bg-white shadow-lg text-gray-900">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M3 12h18M3 18h18"/>
        </svg>
      </button>

      {/* Menú mobile */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 bg-white p-6 flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <Link href="/" className="font-display font-extrabold text-xl text-gray-900 flex items-center gap-1.5">
              <span className="text-violet-600">★</span> Calificar
            </Link>
            <button onClick={() => setOpen(false)} aria-label="Cerrar menú"
              className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-900 text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <nav className="flex flex-col gap-1 text-lg font-medium text-gray-700">
            <Link href="/r/demo" onClick={() => setOpen(false)} className="px-3 py-3 rounded-xl hover:bg-gray-50">Demo</Link>
            <Link href="/tienda" onClick={() => setOpen(false)} className="px-3 py-3 rounded-xl hover:bg-gray-50">Carteles</Link>
            <a href="#planes" onClick={() => setOpen(false)} className="px-3 py-3 rounded-xl hover:bg-gray-50">Precios</a>
            <Link href="/login" onClick={() => setOpen(false)} className="px-3 py-3 rounded-xl hover:bg-gray-50 flex items-center gap-2">
              <IconUser/> Entrar
            </Link>
          </nav>
          <a href={WA} target="_blank"
            className="mt-auto block text-center bg-[#1A1A2E] text-white font-semibold px-5 py-4 rounded-full">
            Quiero mi sistema
          </a>
        </div>
      )}
    </>
  )
}