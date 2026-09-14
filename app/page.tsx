'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/landing/Footer'

const WA = 'https://wa.me/5491123867934?text=Hola!%20Quiero%20info%20sobre%20Calificar%20para%20mi%20local.'

// ─── NAV ─────────────────────────────────────────────────────────────────────

function DarkNav() {
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
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display font-extrabold text-xl text-white">
            <img src="/logo.svg" alt="Calificar" className="h-7 w-auto brightness-200" />
            <span>Calificar</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/r/demo" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-full hover:bg-white/8 transition-all duration-200">
              Demo
            </Link>
            <Link href="/tienda" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-full hover:bg-white/8 transition-all duration-200">
              Carteles
            </Link>
            <Link href="/precios" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-full hover:bg-white/8 transition-all duration-200">
              Precios
            </Link>
            <Link href="/blog" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-full hover:bg-white/8 transition-all duration-200">
              Blog
            </Link>
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200">
              Entrar
            </Link>
            <a
              href={WA}
              target="_blank"
              className="ml-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors duration-200 shadow-lg shadow-violet-900/40"
            >
              Quiero mi sistema
            </a>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/8 border border-white/10 text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden fixed inset-0 z-[60] bg-[#070A14]/98 backdrop-blur-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <Link href="/" className="flex items-center gap-2 font-display font-extrabold text-xl text-white">
              <img src="/logo.svg" alt="Calificar" className="h-7 w-auto brightness-200" />
              Calificar
            </Link>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col gap-1 text-lg font-medium text-slate-300">
            <Link href="/r/demo" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl hover:bg-white/5 hover:text-white transition-colors">Demo</Link>
            <Link href="/tienda" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl hover:bg-white/5 hover:text-white transition-colors">Carteles</Link>
            <Link href="/precios" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl hover:bg-white/5 hover:text-white transition-colors">Precios</Link>
            <Link href="/blog" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl hover:bg-white/5 hover:text-white transition-colors">Blog</Link>
            <Link href="/login" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl hover:bg-white/5 hover:text-white transition-colors">Entrar</Link>
          </nav>
          <a href={WA} target="_blank" className="mt-auto block text-center bg-violet-600 text-white font-semibold px-5 py-4 rounded-full">
            Quiero mi sistema
          </a>
        </div>
      )}
    </>
  )
}

// ─── PRODUCT CARDS ───────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    label: 'Gastronomia',
    tagline: 'Restaurantes, bares, cafeterías',
    href: '/gastronomia',
    cta: 'Ver más',
    accent: '#7C3AED',
    glow: 'rgba(124,58,237,0.25)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M3 11l19-9-9 19-2-8-8-2z"/>
      </svg>
    ),
  },
  {
    label: 'Beauty',
    tagline: 'Peluquerías, estéticas y spas',
    href: '/beauty',
    cta: 'Proximamente',
    accent: '#ec4899',
    glow: 'rgba(236,72,153,0.2)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 2a7 7 0 017 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 017-7z"/>
        <circle cx="12" cy="9" r="2.5"/>
      </svg>
    ),
  },
  {
    label: 'Carteles QR',
    tagline: 'NFC + QR para cualquier negocio',
    href: '/tienda',
    cta: 'Ver tienda',
    accent: '#10b981',
    glow: 'rgba(16,185,129,0.2)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="3" height="3" rx="0.5"/>
        <rect x="19" y="14" width="2" height="2" rx="0.5"/>
        <rect x="14" y="19" width="2" height="2" rx="0.5"/>
        <rect x="19" y="19" width="2" height="2" rx="0.5"/>
      </svg>
    ),
  },
  {
    label: 'Fidelizacion',
    tagline: 'Tarjetas de puntos en Google Wallet',
    href: '/fidelizacion',
    cta: 'Ver mas',
    accent: '#f59e0b',
    glow: 'rgba(245,158,11,0.2)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
  },
]

function ProductCard({ product }: { product: typeof PRODUCTS[0] }) {
  return (
    <Link
      href={product.href}
      className="group relative flex flex-col p-5 rounded-2xl border border-white/8 bg-white/4 hover:bg-white/8 hover:border-white/15 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      {/* Glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(circle at 50% 0%, ${product.glow} 0%, transparent 70%)` }}
      />

      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 flex-shrink-0"
        style={{ background: `${product.accent}18`, color: product.accent }}
      >
        {product.icon}
      </div>

      <p className="font-display font-bold text-white text-sm leading-snug mb-1">
        Calificar <span style={{ color: product.accent }}>{product.label}</span>
      </p>
      <p className="text-slate-400 text-xs leading-relaxed flex-1">{product.tagline}</p>

      <span
        className="mt-4 text-xs font-semibold transition-colors duration-200"
        style={{ color: product.accent }}
      >
        {product.cta} &rarr;
      </span>
    </Link>
  )
}

// ─── FEATURE BENTO ───────────────────────────────────────────────────────────

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/8 p-7 ${className}`}
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {children}
    </div>
  )
}

// ─── QR DEMO ─────────────────────────────────────────────────────────────────

function QrDemo() {
  const [qrUrl, setQrUrl] = useState('https://calificar.com.ar')
  const [qrInput, setQrInput] = useState('https://calificar.com.ar')

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (qrInput.trim()) setQrUrl(qrInput.trim())
  }

  return (
    <section className="py-24 lg:py-32 px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          <div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white leading-[1.1] mb-5">
              Un QR que cambia cuando quieras
            </h2>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-8">
              El cartel fisico no cambia nunca. Pero el link adonde lleva, si. Actualizalo desde tu celular en segundos, sin cambiar el impreso.
            </p>

            <div className="space-y-4 mb-10">
              {[
                { title: 'Link siempre actualizable', desc: 'Cambia el destino del QR sin tocar el cartel.' },
                { title: 'NFC incluido', desc: 'Tus clientes tambien pueden apoyar el celular.' },
                { title: 'Ves quien escanea', desc: 'Conteo de scans en tiempo real desde tu panel.' },
                { title: 'Activacion desde el celular', desc: 'El cliente final activa su cartel sin ayuda.' },
              ].map(f => (
                <div key={f.title} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-violet-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </span>
                  <div>
                    <p className="text-white font-semibold text-sm">{f.title}</p>
                    <p className="text-slate-500 text-sm">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/tienda"
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-7 py-3.5 rounded-full transition-colors text-sm shadow-lg shadow-violet-900/40"
              >
                Ver carteles con QR Dinamico
              </Link>
              <Link
                href="/r/demo"
                className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 hover:bg-white/5 text-white font-semibold px-7 py-3.5 rounded-full transition-all text-sm"
              >
                Probalo en demo
              </Link>
            </div>
          </div>

          {/* Widget QR */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-0 bg-violet-500/15 rounded-[2.5rem] blur-2xl scale-110 pointer-events-none" />
              <div
                className="relative rounded-[2rem] p-7 w-80"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
                }}
              >
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">Generador de QR Dinamico</p>
                <div className="bg-white rounded-xl p-4 mb-5 flex items-center justify-center">
                  <img
                    key={qrUrl}
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrUrl)}&color=0F172A&bgcolor=FFFFFF&qzone=1&format=png`}
                    alt="QR generado"
                    width={140}
                    height={140}
                    className="rounded-lg"
                  />
                </div>
                <form onSubmit={handleGenerate} className="mb-5">
                  <label className="block text-slate-400 text-[11px] font-semibold mb-1.5 uppercase tracking-wider">Tu URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={qrInput}
                      onChange={e => setQrInput(e.target.value)}
                      placeholder="https://tu-sitio.com"
                      className="flex-1 bg-white/5 border border-white/10 text-white text-xs placeholder-slate-600 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500 transition-colors min-w-0"
                    />
                    <button
                      type="submit"
                      className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition-colors flex-shrink-0"
                    >
                      OK
                    </button>
                  </div>
                </form>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                    <p className="text-white font-extrabold text-2xl font-display">47</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">scans hoy</p>
                  </div>
                  <div className="bg-violet-500/10 rounded-xl p-3 text-center border border-violet-500/20">
                    <p className="text-violet-300 font-extrabold text-2xl font-display">12</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">resenas 5 estrellas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div
      className="min-h-screen text-white"
      style={{ background: '#070A14' }}
    >
      <style>{`
        @keyframes float-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float-soft {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .card-float-in {
          animation: float-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .bg-glow-grid {
          background-image:
            radial-gradient(circle at 20% 50%, rgba(124,58,237,0.12) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(99,102,241,0.08) 0%, transparent 40%),
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 100% 100%, 100% 100%, 64px 64px, 64px 64px;
        }
      `}</style>

      <DarkNav />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="bg-glow-grid min-h-[100dvh] flex items-center px-6 pt-16">
        <div className="max-w-7xl mx-auto w-full py-20 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* LEFT */}
            <div className="card-float-in" style={{ animationDelay: '0ms' }}>
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Sistema de resenas para locales argentinos
              </div>

              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.06] tracking-tight mb-6">
                Mas resenas<br className="hidden sm:block" /> cinco estrellas.<br className="hidden sm:block" />
                <span className="text-violet-400">Menos dolores</span><br className="hidden sm:block" /> de cabeza.
              </h1>

              <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-lg">
                Cada cliente escanea el cartel y califica su experiencia. Los conformes van directo a Google. Los que tuvieron un problema te escriben a vos, en privado.
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href={WA}
                  target="_blank"
                  className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-7 py-4 rounded-full transition-all duration-200 text-sm shadow-lg shadow-violet-900/50 hover:-translate-y-0.5"
                >
                  Quiero mi sistema
                </a>
                <Link
                  href="/r/demo"
                  className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 hover:bg-white/5 text-white font-semibold px-7 py-4 rounded-full transition-all duration-200 text-sm"
                >
                  Ver demo
                </Link>
              </div>

              {/* Micro stats */}
              <div className="flex items-center gap-8 mt-12 pt-10 border-t border-white/6">
                <div>
                  <p className="font-display font-extrabold text-2xl text-white">+5.000</p>
                  <p className="text-slate-500 text-xs mt-0.5">locales activos</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="font-display font-extrabold text-2xl text-white">+200k</p>
                  <p className="text-slate-500 text-xs mt-0.5">resenas generadas</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="font-display font-extrabold text-2xl text-violet-400">4.9</p>
                  <p className="text-slate-500 text-xs mt-0.5">promedio Google</p>
                </div>
              </div>
            </div>

            {/* RIGHT — 2x2 product cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {PRODUCTS.map((p, i) => (
                <div
                  key={p.label}
                  className="card-float-in"
                  style={{ animationDelay: `${120 + i * 80}ms` }}
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <section className="px-6 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-4">
              Todo lo que necesita tu local, en un sistema.
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Desde el cartel fisico hasta el panel de control, todo conectado.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card grande */}
            <GlassCard className="md:col-span-2 flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(124,58,237,0.15)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-xl mb-2">Las quejas, antes de que sean publicas</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Si la experiencia no fue la mejor, el cliente te lo cuenta a vos primero, en privado. Vos decides como responder, y mientras tanto tu reputacion en Google queda protegida.</p>
              </div>
            </GlassCard>

            {/* Card chica */}
            <GlassCard>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(16,185,129,0.12)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/>
                </svg>
              </div>
              <h3 className="font-display font-bold text-white text-lg mb-2">Estadisticas en tiempo real</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Cuantos scans, cuantas resenas, cuanto califico cada empleado.</p>
            </GlassCard>

            {/* Card chica */}
            <GlassCard>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(245,158,11,0.12)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.5-7 8-7s8 3 8 7"/>
                </svg>
              </div>
              <h3 className="font-display font-bold text-white text-lg mb-2">Tu equipo, con nombre y apellido</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Cada persona tiene su propia tarjeta. Ves quien genera mas resenas.</p>
            </GlassCard>

            {/* Card grande */}
            <GlassCard className="md:col-span-2">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,102,241,0.15)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round">
                    <rect x="5" y="2" width="14" height="20" rx="2"/>
                    <path d="M12 18h.01"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-xl mb-2">El cartel que hace todo el trabajo</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Tu cliente apoya el celular o escanea el codigo QR y listo. No necesita instalar nada ni crear una cuenta. En menos de cinco segundos ya esta calificando su experiencia.</p>
                  <Link href="/tienda" className="inline-flex items-center gap-1.5 mt-4 text-violet-400 text-sm font-semibold hover:text-violet-300 transition-colors">
                    Ver los carteles &rarr;
                  </Link>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ── QR INTERACTIVO ──────────────────────────────────────── */}
      <QrDemo />

      {/* ── CTA FINAL ───────────────────────────────────────────── */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-3xl p-10 sm:p-14 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(99,102,241,0.08) 100%)',
              border: '1px solid rgba(124,58,237,0.25)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white mb-5 leading-tight">
              Listo para mas resenas cinco estrellas?
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-lg mx-auto">
              Instalar demora menos de 10 minutos. Resultados en la primera semana.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-4 rounded-full transition-all duration-200 text-sm shadow-lg shadow-violet-900/50 hover:-translate-y-0.5"
              >
                Crear cuenta gratis
              </Link>
              <Link
                href="/r/demo"
                className="inline-flex items-center gap-2 border border-white/15 hover:border-white/25 hover:bg-white/5 text-white font-semibold px-8 py-4 rounded-full transition-all duration-200 text-sm"
              >
                Ver demo primero
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Floating registration CTA */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <Link
          href="/register"
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm px-6 py-3.5 rounded-full shadow-xl shadow-violet-900/60 hover:shadow-violet-900/80 hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap border border-violet-400/20"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
          Crear mi cuenta gratis
        </Link>
      </div>
    </div>
  )
}
