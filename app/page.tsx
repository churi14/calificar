'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import HeroNav from '@/components/landing/HeroNav'
import OffsetBlock from '@/components/landing/OffsetBlock'
import Footer from '@/components/landing/Footer'

const WA = 'https://wa.me/5491123867934?text=Hola!%20Quiero%20info%20sobre%20Calificar%20para%20mi%20local.'

const HERO_IMAGES = [
  '/hero-app.png',
  '/hero-app-2.png',
  '/hero-app-3.png',
]

const LOGOS = [
  { name: 'Logo 1', src: '/logos/logo-1.png' },
  { name: 'Logo 2', src: '/logos/logo-2.png' },
  { name: 'Logo 3', src: '/logos/logo-3.png' },
  { name: 'Logo 4', src: '/logos/logo-4.png' },
]

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  )
}
function IconClock() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7v5l3 3"/>
    </svg>
  )
}
function IconChat() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
    </svg>
  )
}
function IconChart() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"/>
      <rect x="7" y="12" width="3" height="6"/>
      <rect x="12" y="8" width="3" height="10"/>
      <rect x="17" y="5" width="3" height="13"/>
    </svg>
  )
}
function IconShield() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  )
}

const BENEFITS = [
  { icon: <IconClock/>, text: 'Ahorrá horas por semana' },
  { icon: <IconChat/>, text: 'Todo el equipo, conectado' },
  { icon: <IconChart/>, text: 'Tus datos, en tiempo real' },
  { icon: <IconShield/>, text: 'Tu negocio, bajo control' },
]

export default function LandingPage() {
  const [activeImage, setActiveImage] = useState(0)
  const [qrUrl, setQrUrl] = useState('https://calificar.com.ar')
  const [qrInput, setQrInput] = useState('https://calificar.com.ar')

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage(i => (i + 1) % HERO_IMAGES.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  function handleQrGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (qrInput.trim()) setQrUrl(qrInput.trim())
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* HEADER sticky */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 font-extrabold text-xl text-[#0F172A]">
            <img src="/logo.svg" alt="Calificar" className="h-7 w-auto" />
            Calificar
          </Link>
          <HeroNav />
        </div>
      </header>

      {/* HERO — centrado */}
      <section className="relative bg-white py-20 lg:py-28 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-50/50 to-white pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.08] text-violet-600 mb-6">
            Todo lo que necesitás<br className="hidden sm:block"/> para cuidar las<br className="hidden sm:block"/> reseñas de tu local
          </h1>
          <p className="text-gray-500 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-12">
            Cada cliente que escanea el cartel califica su experiencia. Los conformes van
            directo a Google. Los que tuvieron un problema te escriben a vos, en privado,
            antes de que se convierta en una mala reseña.
          </p>

          {/* Verticales */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            <Link href="/gastronomia"
              className="group bg-white border-2 border-zinc-100 hover:border-violet-300 rounded-2xl p-6 sm:p-8 text-center transition-all duration-200 hover:shadow-xl hover:-translate-y-1 flex flex-col items-center">
              <img src="/logo.svg" alt="" className="h-10 w-auto mb-3" />
              <p className="font-extrabold text-[#0F172A] text-base sm:text-lg leading-snug mb-1">
                Calificar<br/><em style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 400 }}>gastronomía</em>
              </p>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed mt-2">Restaurantes, bares, cafeterías y más</p>
              <p className="mt-5 text-violet-600 text-sm font-bold group-hover:underline">Ver más →</p>
            </Link>
            <Link href="/beauty"
              className="group bg-white border-2 border-zinc-100 hover:border-pink-300 rounded-2xl p-6 sm:p-8 text-center transition-all duration-200 hover:shadow-xl hover:-translate-y-1 flex flex-col items-center">
              <img src="/logo.svg" alt="" className="h-10 w-auto mb-3" style={{ filter: 'hue-rotate(280deg) saturate(1.5)' }} />
              <p className="font-extrabold text-[#0F172A] text-base sm:text-lg leading-snug mb-1">
                Calificar<br/><em style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 400, color: '#ec4899' }}>beauty</em>
              </p>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed mt-2">Peluquerías, estéticas y spas</p>
              <p className="mt-5 text-pink-500 text-sm font-bold group-hover:underline">Próximamente →</p>
            </Link>
            <Link href="/tienda"
              className="group bg-white border-2 border-zinc-100 hover:border-emerald-300 rounded-2xl p-6 sm:p-8 text-center transition-all duration-200 hover:shadow-xl hover:-translate-y-1 flex flex-col items-center">
              <img src="/logo.svg" alt="" className="h-10 w-auto mb-3" style={{ filter: 'hue-rotate(130deg) saturate(1.2)' }} />
              <p className="font-extrabold text-[#0F172A] text-base sm:text-lg leading-snug mb-1">
                Calificar<br/><em style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 400, color: '#059669' }}>carteles</em>
              </p>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed mt-2">QR + NFC para cualquier negocio</p>
              <p className="mt-5 text-emerald-600 text-sm font-bold group-hover:underline">Ver tienda →</p>
            </Link>
            <Link href="/fidelizacion"
              className="group bg-white border-2 border-amber-100 hover:border-amber-300 rounded-2xl p-6 sm:p-8 text-center transition-all duration-200 hover:shadow-xl hover:-translate-y-1 flex flex-col items-center">
              <img src="/logo.svg" alt="" className="h-10 w-auto mb-3" style={{ filter: 'hue-rotate(40deg) saturate(1.4) brightness(1.1)' }} />
              <p className="font-extrabold text-[#0F172A] text-base sm:text-lg leading-snug mb-1">
                Calificar<br/><em style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 400, color: '#d97706' }}>fidelización</em>
              </p>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed mt-2">Tarjetas de puntos en Google Wallet</p>
              <span className="mt-5 inline-block bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">Próximamente</span>
            </Link>
          </div>
        </div>
      </section>


      {/* Sección navy */}
      <section className="relative bg-[#0F172A] py-32 lg:py-48">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true"
          className="absolute bottom-full left-0 w-full h-16 sm:h-20 lg:h-28">
          <path fill="#0F172A" d="M0,120 C360,10 1080,10 1440,120 L1440,120 L0,120 Z"/>
        </svg>
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
            Tomá el control de lo que dicen de tu local.
          </h2>
          <p className="text-gray-300 leading-relaxed text-base sm:text-lg">
            El sistema actúa como un filtro inteligente. Potencia las reseñas positivas en tu perfil público y desvía las críticas hacia un chat privado con vos para que las atajes a tiempo.
          </p>
        </div>
      </section>

      {/* Características */}
      <section className="bg-[#F5EFE7] py-24 overflow-hidden">
        <div className="space-y-28 lg:space-y-40">
          <OffsetBlock
            contentAlign="right"
            bgColor="bg-[#FBCAD8]"
            textColorClass="text-gray-900"
            mutedColorClass="text-gray-700"
            imageUrl="/screenshots/cartel-1.png"
            imageAlt="Cartel STAR•TAG con código QR para reseñas"
            title="El cartel que hace todo el trabajo"
            description="Tu cliente apoya el celular o escanea el código QR y listo. No necesita instalar nada ni crear una cuenta. En menos de cinco segundos ya está calificando su experiencia."
          />
          <OffsetBlock
            contentAlign="left"
            bgColor="bg-[#056E4B]"
            textColorClass="text-white"
            mutedColorClass="text-gray-200"
            imageUrl="/screenshots/quejas.png"
            imageAlt="Feedback negativo filtrado antes de llegar a Google"
            title="Las quejas, antes de que sean públicas"
            description="Si la experiencia no fue la mejor, el cliente te lo cuenta a vos primero, en privado. Vos decidís cómo responder, y mientras tanto tu reputación en Google queda protegida."
          />
          <OffsetBlock
            contentAlign="right"
            bgColor="bg-[#FBCAD8]"
            textColorClass="text-gray-900"
            mutedColorClass="text-gray-700"
            imageUrl="/screenshots/equipo.png"
            imageAlt="Ranking de empleados por reseñas generadas"
            title="Tu equipo, con nombre y apellido"
            description="Cada mozo o vendedor puede tener su propia tarjeta. Vos ves quién genera más reseñas y podés reconocer al que más se esfuerza."
            ctaText="Probar ahora"
            ctaHref="/r/demo"
          />
        </div>
      </section>

      {/* LOGOS DE CLIENTES */}
      <section className="bg-white py-20 lg:py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-400 mb-12">
            Algunos de los locales que ya confían en Calificar
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 sm:gap-x-16">
            {LOGOS.map(logo => (
              <div key={logo.name}
                className="relative h-10 w-32 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <Image src={logo.src} alt={logo.name} fill className="object-contain"/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="bg-[#FBCAD8] py-20 lg:py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#0F172A] text-center max-w-3xl mx-auto mb-14 lg:mb-16">
            Más estrellas en Google, menos dolores de cabeza.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <IconChart/>, title: 'Multiplicá tus reseñas 5⭐', text: 'Los clientes felices te posicionan más arriba en el mapa.' },
              { icon: <IconShield/>, title: 'Atajá las quejas a tiempo', text: 'El feedback negativo te llega a vos, no a internet.' },
              { icon: <IconClock/>, title: 'Métricas al instante', text: 'Entendé qué opinan de tu local en tiempo real.' },
              { icon: <IconChat/>, title: 'Medí a tu equipo', text: 'Descubrí quién atiende mejor y premiá su esfuerzo.' },
            ].map(b => (
              <div key={b.title}
                className="bg-white rounded-[2rem] shadow-md p-8 flex flex-col items-center text-center
                  hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                <span className="w-14 h-14 rounded-2xl border border-gray-200 flex items-center justify-center text-[#0F172A] mb-4">
                  {b.icon}
                </span>
                <p className="font-display font-extrabold text-base text-[#056E4B] mb-2">{b.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QR DINÁMICO — Sección destacada */}
      <section className="bg-[#0F172A] py-24 lg:py-32 px-6 overflow-hidden relative">
        {/* Glow decorativo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none"/>

        <div className="max-w-6xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Texto */}
            <div>
              <span className="inline-flex items-center gap-2 bg-violet-500/10 text-violet-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-6">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="3" height="3" rx="0.5"/><rect x="19" y="14" width="2" height="2" rx="0.5"/><rect x="14" y="19" width="2" height="2" rx="0.5"/><rect x="19" y="19" width="2" height="2" rx="0.5"/></svg>
                QR Dinámico con NFC
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white leading-[1.1] mb-6">
                Un código QR que podés cambiar cuando quieras
              </h2>
              <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-8">
                El cartel físico no cambia nunca. Pero el link adonde lleva, sí. Actualizalo desde tu celular en segundos — sin cambiar el impreso.
              </p>

              <div className="space-y-4 mb-10">
                {[
                  { icon: '🔄', title: 'Link siempre actualizable', desc: 'Cambiá el destino del QR sin tocar el cartel.' },
                  { icon: '📡', title: 'NFC incluido', desc: 'Tus clientes también pueden apoyar el celular.' },
                  { icon: '📊', title: 'Ves quién escanea', desc: 'Conteo de scans en tiempo real desde tu panel.' },
                  { icon: '⚡', title: 'Activación desde el celular', desc: 'El cliente final activa su cartel sin ayuda.' },
                ].map(f => (
                  <div key={f.title} className="flex items-start gap-4">
                    <span className="text-2xl flex-shrink-0 mt-0.5">{f.icon}</span>
                    <div>
                      <p className="text-white font-semibold text-sm">{f.title}</p>
                      <p className="text-gray-500 text-sm">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/tienda"
                  className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-7 py-4 rounded-full transition-colors text-sm shadow-lg shadow-violet-900/40">
                  Ver carteles con QR Dinámico →
                </Link>
                <Link href="/r/demo"
                  className="inline-flex items-center gap-2 bg-white/8 border border-white/10 hover:bg-white/12 text-white font-semibold px-7 py-4 rounded-full transition-colors text-sm">
                  Probalo en demo
                </Link>
              </div>
            </div>

            {/* Visual — generador de QR interactivo */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Glow */}
                <div className="absolute inset-0 bg-violet-500/20 rounded-[2.5rem] blur-2xl scale-110"/>

                <div className="relative bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 rounded-[2.5rem] p-8 w-80 shadow-2xl">
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">Generador de QR Dinámico</p>

                  {/* QR generado */}
                  <div className="bg-white rounded-2xl p-4 mb-5 flex items-center justify-center min-h-[160px]">
                    <img
                      key={qrUrl}
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrUrl)}&color=0F172A&bgcolor=FFFFFF&qzone=1&format=png`}
                      alt="QR generado"
                      width={140}
                      height={140}
                      className="rounded-lg"
                    />
                  </div>

                  {/* Input URL */}
                  <form onSubmit={handleQrGenerate} className="mb-4">
                    <label className="block text-gray-400 text-[11px] font-semibold mb-1.5 uppercase tracking-wider">Tu URL</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={qrInput}
                        onChange={e => setQrInput(e.target.value)}
                        placeholder="https://tu-sitio.com"
                        className="flex-1 bg-white/8 border border-white/10 text-white text-xs placeholder-gray-600 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500 min-w-0"
                      />
                      <button
                        type="submit"
                        className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-colors flex-shrink-0"
                      >
                        ↗
                      </button>
                    </div>
                  </form>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-2xl p-3 text-center">
                      <p className="text-white font-extrabold text-2xl">47</p>
                      <p className="text-gray-500 text-[10px] mt-0.5">scans hoy</p>
                    </div>
                    <div className="bg-green-500/10 rounded-2xl p-3 text-center">
                      <p className="text-green-400 font-extrabold text-2xl">12</p>
                      <p className="text-gray-500 text-[10px] mt-0.5">reseñas ★</p>
                    </div>
                  </div>

                  {/* NFC badge */}
                  <div className="absolute -top-3 -right-3 bg-violet-600 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-lg">
                    📡 NFC
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer/>

      {/* BOTÓN FLOTANTE — Registrarse */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <Link href="/register"
          className="flex items-center gap-2 bg-[#056E4B] text-white font-bold text-sm px-6 py-3.5 rounded-full shadow-lg hover:bg-[#045c3f] transition-all hover:scale-105 active:scale-95 whitespace-nowrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
