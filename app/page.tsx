'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import HeroNav from '@/components/landing/HeroNav'
import OffsetBlock from '@/components/landing/OffsetBlock'
import Footer from '@/components/landing/Footer'

const WA = 'https://wa.me/5491123867934?text=Hola!%20Quiero%20info%20sobre%20Calificar%20para%20mi%20local.'
const WA_MAYOR = 'https://wa.me/5491123867934?text=Hola!%20Me%20interesa%20revender%20carteles%20QR%20de%20Calificar.%20Quiero%20info%20sobre%20venta%20por%20mayor.'

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
  const [showPopup, setShowPopup] = useState(false)
  const [popupDismissed, setPopupDismissed] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage(i => (i + 1) % HERO_IMAGES.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const dismissed = sessionStorage.getItem('mayor_popup_dismissed')
    if (dismissed) return
    const t = setTimeout(() => setShowPopup(true), 8000)
    return () => clearTimeout(t)
  }, [])

  function dismissPopup() {
    setShowPopup(false)
    setPopupDismissed(true)
    sessionStorage.setItem('mayor_popup_dismissed', '1')
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
          <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl leading-[1.05] text-violet-600 mb-6">
            Todo lo que necesitás<br className="hidden sm:block"/> para cuidar las<br className="hidden sm:block"/> reseñas de tu local
          </h1>
          <p className="text-gray-500 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-12">
            Cada cliente que escanea el cartel califica su experiencia. Los conformes van
            directo a Google. Los que tuvieron un problema te escriben a vos, en privado,
            antes de que se convierta en una mala reseña.
          </p>

          {/* Verticales */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
            <Link href="/gastronomia"
              className="group bg-white border-2 border-zinc-100 hover:border-violet-300 rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
              <span className="text-3xl mb-4 block">🍽️</span>
              <p className="font-extrabold text-zinc-900 text-base mb-1">Calificar Gastronomía</p>
              <p className="text-sm text-zinc-500 leading-relaxed">Restaurantes, bares, cafeterías y más</p>
              <p className="mt-4 text-violet-600 text-xs font-bold group-hover:underline">Ver más →</p>
            </Link>
            <Link href="/beauty"
              className="group bg-white border-2 border-zinc-100 hover:border-pink-300 rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
              <span className="text-3xl mb-4 block">💅</span>
              <p className="font-extrabold text-zinc-900 text-base mb-1">Calificar Beauty</p>
              <p className="text-sm text-zinc-500 leading-relaxed">Peluquerías, estéticas y spas</p>
              <p className="mt-4 text-pink-500 text-xs font-bold group-hover:underline">Próximamente →</p>
            </Link>
            <Link href="/tienda"
              className="group bg-white border-2 border-zinc-100 hover:border-emerald-300 rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
              <span className="text-3xl mb-4 block">📦</span>
              <p className="font-extrabold text-zinc-900 text-base mb-1">Calificar Carteles</p>
              <p className="text-sm text-zinc-500 leading-relaxed">QR + NFC para cualquier negocio</p>
              <p className="mt-4 text-emerald-600 text-xs font-bold group-hover:underline">Ver tienda →</p>
            </Link>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/r/demo"
              className="inline-flex items-center justify-center bg-white border-2 border-gray-200 text-gray-900 font-semibold px-7 py-3.5 rounded-full hover:border-gray-400 transition-colors text-sm">
              Ver demo
            </Link>
            <Link href="/como-funciona"
              className="inline-flex items-center justify-center bg-[#1A1A2E] text-white font-semibold px-7 py-3.5 rounded-full hover:bg-[#2A2A45] transition-colors text-sm shadow-lg shadow-[#1A1A2E]/20">
              Cómo funciona
            </Link>
          </div>
        </div>
      </section>

      {/* APP SHOWCASE — panel rosa */}
      <section className="relative bg-[#F4CCD8] py-16 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center">
          <p className="text-[#0F172A]/50 text-xs font-bold uppercase tracking-widest mb-10">
            Lo que ve el cliente cuando escanea
          </p>
          <div className="relative w-[280px] h-[380px] sm:w-[360px] sm:h-[460px]">
            {HERO_IMAGES.map((src, i) => {
              const isHeroApp = src === '/hero-app.png'
              return (
                <Image
                  key={src}
                  src={src}
                  alt="Calificar — vista del cliente"
                  fill
                  priority={i === 0}
                  className={`object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.25)] transition-all duration-1000 ease-in-out ${i === activeImage ? 'opacity-100' : 'opacity-0'} ${isHeroApp ? 'scale-[1.08] origin-bottom' : 'scale-100'}`}
                />
              )
            })}
          </div>
          {/* Tarjetas flotantes */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <div className="flex items-center gap-3 bg-white rounded-2xl shadow-md px-4 py-3">
              <span className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                <IconCheck/>
              </span>
              <p className="text-sm font-semibold text-gray-900">Reseña enviada a Google</p>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-2xl shadow-md px-4 py-3">
              <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-violet-600 flex-shrink-0">
                <span className="inline-block h-3.5 w-3.5 translate-x-[18px] rounded-full bg-white"/>
              </span>
              <p className="text-sm font-semibold text-gray-900">Filtro anti-haters</p>
            </div>
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

            {/* Visual — tarjeta tipo cartel */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Glow */}
                <div className="absolute inset-0 bg-violet-500/20 rounded-[2.5rem] blur-2xl scale-110"/>

                <div className="relative bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 rounded-[2.5rem] p-8 w-72 shadow-2xl">
                  {/* QR visual */}
                  <div className="bg-white rounded-2xl p-5 mb-6 flex items-center justify-center">
                    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* QR simulado */}
                      <rect width="120" height="120" fill="white"/>
                      {/* Top-left finder */}
                      <rect x="8" y="8" width="34" height="34" rx="4" fill="#0F172A"/>
                      <rect x="14" y="14" width="22" height="22" rx="2" fill="white"/>
                      <rect x="19" y="19" width="12" height="12" rx="1" fill="#0F172A"/>
                      {/* Top-right finder */}
                      <rect x="78" y="8" width="34" height="34" rx="4" fill="#0F172A"/>
                      <rect x="84" y="14" width="22" height="22" rx="2" fill="white"/>
                      <rect x="89" y="19" width="12" height="12" rx="1" fill="#0F172A"/>
                      {/* Bottom-left finder */}
                      <rect x="8" y="78" width="34" height="34" rx="4" fill="#0F172A"/>
                      <rect x="14" y="84" width="22" height="22" rx="2" fill="white"/>
                      <rect x="19" y="89" width="12" height="12" rx="1" fill="#0F172A"/>
                      {/* Data modules */}
                      <rect x="50" y="8" width="6" height="6" rx="1" fill="#0F172A"/>
                      <rect x="60" y="8" width="6" height="6" rx="1" fill="#0F172A"/>
                      <rect x="50" y="18" width="6" height="6" rx="1" fill="#0F172A"/>
                      <rect x="64" y="18" width="6" height="6" rx="1" fill="#0F172A"/>
                      <rect x="54" y="28" width="6" height="6" rx="1" fill="#0F172A"/>
                      <rect x="8" y="50" width="6" height="6" rx="1" fill="#0F172A"/>
                      <rect x="18" y="50" width="6" height="6" rx="1" fill="#0F172A"/>
                      <rect x="28" y="56" width="6" height="6" rx="1" fill="#0F172A"/>
                      <rect x="8" y="62" width="6" height="6" rx="1" fill="#0F172A"/>
                      <rect x="20" y="62" width="6" height="6" rx="1" fill="#0F172A"/>
                      <rect x="50" y="50" width="6" height="6" rx="1" fill="#7C3AED"/>
                      <rect x="60" y="50" width="6" height="6" rx="1" fill="#7C3AED"/>
                      <rect x="70" y="50" width="6" height="6" rx="1" fill="#7C3AED"/>
                      <rect x="50" y="60" width="6" height="6" rx="1" fill="#7C3AED"/>
                      <rect x="64" y="60" width="6" height="6" rx="1" fill="#7C3AED"/>
                      <rect x="50" y="70" width="6" height="6" rx="1" fill="#7C3AED"/>
                      <rect x="60" y="70" width="6" height="6" rx="1" fill="#7C3AED"/>
                      <rect x="70" y="70" width="6" height="6" rx="1" fill="#7C3AED"/>
                      <rect x="78" y="50" width="6" height="6" rx="1" fill="#0F172A"/>
                      <rect x="90" y="50" width="6" height="6" rx="1" fill="#0F172A"/>
                      <rect x="100" y="50" width="6" height="6" rx="1" fill="#0F172A"/>
                      <rect x="84" y="60" width="6" height="6" rx="1" fill="#0F172A"/>
                      <rect x="96" y="60" width="6" height="6" rx="1" fill="#0F172A"/>
                      <rect x="78" y="70" width="6" height="6" rx="1" fill="#0F172A"/>
                      <rect x="90" y="70" width="6" height="6" rx="1" fill="#0F172A"/>
                      <rect x="50" y="78" width="6" height="6" rx="1" fill="#0F172A"/>
                      <rect x="60" y="84" width="6" height="6" rx="1" fill="#0F172A"/>
                      <rect x="50" y="90" width="6" height="6" rx="1" fill="#0F172A"/>
                      <rect x="64" y="90" width="6" height="6" rx="1" fill="#0F172A"/>
                      <rect x="54" y="100" width="6" height="6" rx="1" fill="#0F172A"/>
                      <rect x="78" y="84" width="6" height="6" rx="1" fill="#0F172A"/>
                      <rect x="90" y="84" width="6" height="6" rx="1" fill="#0F172A"/>
                      <rect x="78" y="96" width="6" height="6" rx="1" fill="#0F172A"/>
                      <rect x="90" y="96" width="6" height="6" rx="1" fill="#0F172A"/>
                      <rect x="100" y="96" width="6" height="6" rx="1" fill="#0F172A"/>
                    </svg>
                  </div>

                  <p className="text-white font-extrabold text-center text-lg mb-1">Mi Negocio</p>
                  <p className="text-gray-500 text-center text-xs mb-5 font-mono">calificar.com.ar/g/A8FX2K</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-2xl p-3 text-center">
                      <p className="text-white font-extrabold text-2xl">47</p>
                      <p className="text-gray-500 text-[10px] mt-0.5">scans</p>
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

      {/* POPUP — Reventa por mayor */}
      {showPopup && !popupDismissed && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 sm:p-0">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={dismissPopup}
          />
          {/* Card */}
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden animate-in slide-in-from-bottom-8 duration-300 ease-out">
            {/* Header verde */}
            <div className="bg-[#056E4B] px-6 pt-6 pb-5 text-white relative">
              <button
                onClick={dismissPopup}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                aria-label="Cerrar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <div className="text-3xl mb-2">📦</div>
              <h3 className="font-extrabold text-xl leading-tight">
                ¿Querés revender carteles QR?
              </h3>
            </div>
            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-gray-600 text-sm leading-relaxed mb-1">
                Vendemos <strong className="text-gray-900">con y sin sistema Calificar</strong> — para que puedas ofrecer la solución que mejor le va a tu cliente.
              </p>
              <p className="text-gray-500 text-xs mt-3 mb-5 flex items-center gap-1.5">
                <span className="inline-block w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0">★</span>
                Compra mínima: <strong className="text-gray-700">10 unidades</strong>
              </p>
              <a
                href={WA_MAYOR}
                target="_blank"
                rel="noopener noreferrer"
                onClick={dismissPopup}
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white font-bold py-3.5 rounded-2xl hover:bg-[#1ebe5c] transition-colors text-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Escribinos por WhatsApp
              </a>
              <button
                onClick={dismissPopup}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-3 transition-colors"
              >
                No me interesa por ahora
              </button>
            </div>
          </div>
        </div>
      )}

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
