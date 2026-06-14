'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import HeroNav from '@/components/landing/HeroNav'
import OffsetBlock from '@/components/landing/OffsetBlock'
import Footer from '@/components/landing/Footer'

const WA = 'https://wa.me/5491100000000?text=Hola!%20Quiero%20info%20sobre%20Calificar%20para%20mi%20local.'

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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage(i => (i + 1) % HERO_IMAGES.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* HERO */}
      <section className="relative grid grid-cols-1 lg:grid-cols-2 lg:min-h-[800px]">

        <div className="fixed top-6 left-6 sm:left-10 z-50">
          <Link href="/" className="font-display font-extrabold text-xl text-gray-900 flex items-center gap-1.5">
            <span className="text-violet-600">★</span> Calificar
          </Link>
        </div>

        {/* Texto */}
        <div className="flex items-center px-6 sm:px-10 lg:px-16 py-24">
          <div className="max-w-md mx-auto text-center">
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-violet-600 mb-6">
              Todo lo que necesitás para cuidar las reseñas de tu local
            </h1>
            <p className="text-gray-500 text-base sm:text-lg leading-relaxed mb-8">
              Cada cliente que escanea el cartel califica su experiencia. Los conformes van
              directo a Google. Los que tuvieron un problema te escriben a vos, en privado,
              antes de que se convierta en una mala reseña.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/r/demo"
                className="inline-flex items-center justify-center bg-white border-2 border-gray-300 text-gray-900 font-semibold px-8 py-4 rounded-full hover:border-gray-400 hover:bg-gray-50 transition-colors text-base">
                Ver demo
              </Link>
              <a href={WA} target="_blank"
                className="inline-flex items-center justify-center bg-[#1A1A2E] text-white font-semibold px-8 py-4 rounded-full hover:bg-[#2A2A45] transition-colors text-base shadow-lg shadow-[#1A1A2E]/20">
                Quiero mi sistema
              </a>
            </div>
          </div>
        </div>

        {/* Panel rosa */}
        <div className="relative bg-[#F4CCD8] min-h-[520px] sm:min-h-[600px] lg:min-h-[800px] flex items-center justify-center px-6 py-10">

          <div className="fixed top-6 right-6 lg:right-10 z-50">
            <HeroNav/>
          </div>

          <div className="absolute z-20 left-1/2 bottom-0 -translate-x-28 sm:-translate-x-40 lg:-translate-x-64 xl:-translate-x-72 pointer-events-none
            translate-y-16 sm:translate-y-24 lg:translate-y-[12rem]
            w-[280px] h-[380px] sm:w-[380px] sm:h-[480px] lg:w-[480px] lg:h-[600px] xl:w-[550px] xl:h-[700px]">
            {HERO_IMAGES.map((src, i) => {
              const isHeroApp = src === '/hero-app.png'
              return (
                <Image
                  key={src}
                  src={src}
                  alt="Calificar — vista del cliente"
                  fill
                  priority={i === 0}
                  className={`object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.3)] transition-all duration-1000 ease-in-out ${i === activeImage ? 'opacity-100' : 'opacity-0'} ${isHeroApp ? 'scale-[1.1] sm:scale-[1.15] lg:scale-[1.18] origin-bottom' : 'scale-100'}`}
                />
              )
            })}
          </div>

          {/* Tarjetas apiladas */}
          <div className="hidden sm:flex absolute z-30 bottom-8 right-6 lg:right-14 flex-col gap-3 w-60">
            <div className="flex items-center gap-3 bg-white rounded-2xl shadow-md px-4 py-3 hover:shadow-xl hover:-translate-x-1 transition-all duration-300">
              <span className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                <IconCheck/>
              </span>
              <p className="text-sm font-semibold text-gray-900 leading-tight">Reseña enviada a Google</p>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-2xl shadow-md px-4 py-3 hover:shadow-xl hover:-translate-x-1 transition-all duration-300">
              <span className="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                M
              </span>
              <p className="text-sm font-semibold text-gray-900 leading-tight">María recibió una reseña</p>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-2xl shadow-md px-4 py-3 hover:shadow-xl hover:-translate-x-1 transition-all duration-300">
              <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-violet-600 flex-shrink-0">
                <span className="inline-block h-3.5 w-3.5 translate-x-[18px] rounded-full bg-white"/>
              </span>
              <p className="text-sm font-semibold text-gray-900 leading-tight">Filtro anti-haters</p>
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

      <Footer/>
    </div>
  )
}