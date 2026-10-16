'use client'

import Link from 'next/link'
import { useState } from 'react'

const features = [
  {
    icon: '📱',
    title: 'Tarjeta digital en Google Wallet',
    desc: 'Tus clientes guardan la tarjeta en el celular. Sin apps, sin papel, sin fricción.',
  },
  {
    icon: '📡',
    title: 'NFC + QR en el mostrador',
    desc: 'El cliente acerca el celular o escanea el QR y suma su sello automáticamente.',
  },
  {
    icon: '🎂',
    title: 'Notificaciones de cumpleaños',
    desc: 'Mandá un regalo automático el día del cumpleaños de cada cliente.',
  },
  {
    icon: '🔔',
    title: 'Push notifications',
    desc: 'Avisá de promos, novedades o días especiales directo al celular.',
  },
  {
    icon: '🏆',
    title: 'Premios y cupones únicos',
    desc: 'Al completar la tarjeta se genera un cupón irrepetible listo para canjear.',
  },
  {
    icon: '📊',
    title: 'Panel de gestión',
    desc: 'Ves tus clientes, sellos y canjes en tiempo real desde cualquier dispositivo.',
  },
]

const steps = [
  { num: '01', title: 'Configurás tu programa', desc: 'Subís el logo, elegís cuántos sellos necesita el cliente y qué premio se lleva.' },
  { num: '02', title: 'El cliente se registra', desc: 'Escanea el QR del local, completa nombre y teléfono, listo. La tarjeta aparece en su Wallet.' },
  { num: '03', title: 'Suma sellos con NFC o QR', desc: 'Cada visita, el cliente acerca el celular al cartel del mostrador o escanea el QR.' },
  { num: '04', title: 'Canjea el premio', desc: 'Al llegar a la meta recibe un cupón único. Lo muestra, lo canjeás, se reinicia la tarjeta.' },
]

const plans = [
  {
    label: 'PARA TU NEGOCIO',
    name: 'Starter',
    slug: 'starter',
    price: '$14.999',
    perDay: '$500 al día',
    perDaySub: 'menos que un café',
    features: [
      '1 programa de fidelidad con tu logo y colores',
      'Notificaciones ilimitadas al celular de tus clientes',
      'Cartelito NFC + QR para el mostrador',
      'Panel: quién volvió, cuándo y cuántos sellos',
      'Exportá tus clientes: nombre y teléfono',
      'Soporte premium en español 🇦🇷',
    ],
    cta: 'Empezar con Starter',
    highlight: false,
  },
  {
    label: 'PARA DESTACAR',
    name: 'Pro',
    slug: 'pro',
    price: '$29.999',
    perDay: '$1.000 al día',
    perDaySub: 'menos que un café doble',
    features: [
      'Todo lo de Starter',
      'Hasta 3 programas de fidelidad',
      'Campañas de cumpleaños automáticas',
      'Formulario de registro personalizable',
      'Cupones únicos al completar la tarjeta',
      'Zonas de notificación por geolocalización',
      'Soporte premium en español 🇦🇷',
    ],
    cta: 'Empezar con Pro',
    highlight: true,
  },
  {
    label: 'SIN LÍMITES',
    name: 'Ultimate',
    slug: 'ultimate',
    price: '$69.999',
    perDay: '$2.333 al día',
    perDaySub: 'para todas tus sucursales',
    features: [
      'Todo lo de Pro',
      'Programas ilimitados',
      'Sucursales ilimitadas',
      'Múltiples usuarios por local',
      'Zonas de notificación ilimitadas',
      'Exportación detallada con historial',
      'API + integración con tu sistema',
    ],
    cta: 'Empezar con Ultimate',
    highlight: false,
  },
]

const faqs = [
  { q: '¿El cliente necesita descargar una app?', a: 'No. La tarjeta se guarda directo en Google Wallet, que ya viene instalado en todos los Android.' },
  { q: '¿Cómo suma el cliente su sello?', a: 'Hay dos formas: acerca el celular al cartelito NFC del mostrador, o escanea el QR que está en el local.' },
  { q: '¿Puedo personalizar el diseño de la tarjeta?', a: 'Sí. Subís el logo, elegís el color y configurás el nombre del programa. La tarjeta adopta tu identidad visual.' },
  { q: '¿Qué pasa si el cliente cambia de celular?', a: 'La tarjeta vive en la nube. Al loguearse de nuevo a su cuenta Google, recupera todo.' },
  { q: '¿Puedo probar antes de pagar?', a: 'Sí. Tenés 14 días gratis sin tarjeta de crédito.' },
]

export default function FidelizacionLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="font-sans text-white" style={{ background: '#070A14' }}>

      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b" style={{ background: 'rgba(7,10,20,0.9)', backdropFilter: 'blur(20px)', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-lg tracking-tight text-white">
            calificar <span className="text-violet-400">fidelización</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#como-funciona" className="hover:text-white transition-colors">Cómo funciona</a>
            <a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a>
            <a href="#precios" className="hover:text-white transition-colors">Precios</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/negocio/fidelizacion" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Ingresar
            </Link>
            <Link
              href="#precios"
              className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-[100dvh] flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-violet-400 font-semibold text-sm uppercase tracking-widest mb-4">Programa de fidelidad digital</p>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6">
              Tus clientes vuelven.
              <br />
              <span className="text-violet-400">Siempre.</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-md">
              Reemplazá las tarjetitas de papel con una tarjeta digital en Google Wallet. NFC, QR, notificaciones y premios automáticos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="#precios"
                className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-4 rounded-2xl text-base transition-colors text-center shadow-lg shadow-violet-900/40"
              >
                Empezar 14 días gratis
              </Link>
              <a
                href="#como-funciona"
                className="border border-white/15 hover:border-white/25 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-colors text-center"
              >
                Ver cómo funciona
              </a>
            </div>
            <p className="text-slate-500 text-xs mt-4">Sin tarjeta de crédito. Sin compromiso.</p>
          </div>

          {/* iPhone 15 Pro mockup 3D */}
          <div className="relative mx-auto lg:ml-auto lg:mr-0 w-[380px] max-w-full h-[720px] flex items-center justify-center [perspective:1500px]">
            {/* Resplandor violeta/azul de fondo */}
            <div className="absolute top-12 left-12 w-[300px] h-[450px] bg-indigo-600/30 blur-[120px] rounded-full -z-10 pointer-events-none" />

            {/* Contenedor con rotación 3D */}
            <div
              className="relative w-[300px] h-[610px] [transform-style:preserve-3d] [transform:rotateY(-18deg)_rotateX(10deg)_rotateZ(3deg)] transition-all duration-500 ease-out hover:[transform:rotateY(-14deg)_rotateX(8deg)_rotateZ(2deg)_scale(1.02)]"
            >
              {/* Extrusión: borde lateral metálico (titanio) */}
              <div
                className="absolute inset-0 rounded-[44px] bg-gradient-to-r from-[#8e8e93] via-[#c7c7cc] to-[#3a3a3c] border border-white/20 shadow-2xl z-0"
                style={{ transform: 'translate3d(-9px, 0, -8px)' }}
              />

              {/* Sombra proyectada en el piso */}
              <div
                className="absolute -inset-x-12 bottom-[-40px] h-12 bg-black/50 blur-[30px] rounded-full pointer-events-none"
                style={{ transform: 'rotateX(80deg) translateZ(-20px)' }}
              />

              {/* Botones físicos del lateral izquierdo */}
              <div className="absolute top-[80px] -left-[11px] w-[2px] h-[15px] bg-[#a2a2a7] rounded-l border-r border-black/30" style={{ transform: 'translateZ(-2px)' }} />
              <div className="absolute top-[115px] -left-[11px] w-[2px] h-[35px] bg-[#a2a2a7] rounded-l border-r border-black/30" style={{ transform: 'translateZ(-2px)' }} />
              <div className="absolute top-[160px] -left-[11px] w-[2px] h-[35px] bg-[#a2a2a7] rounded-l border-r border-black/30" style={{ transform: 'translateZ(-2px)' }} />

              {/* Chasis frontal / pantalla */}
              <div className="absolute inset-0 rounded-[42px] border-[10px] border-[#1c1c1e] bg-[#09090b] shadow-[inset_0_0_2px_rgba(255,255,255,0.4)] overflow-visible z-10 [transform:translateZ(4px)]">
                <div className="absolute inset-[0px] rounded-[32px] border border-white/10 pointer-events-none z-40" />

                {/* Dynamic Island */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[85px] h-[24px] bg-[#000] rounded-full z-50 flex items-center justify-end px-2.5 gap-0.5 shadow-inner">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0d0d0d] border border-zinc-900" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#04040a] border border-[#121212]" />
                </div>

                {/* Auricular */}
                <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-black/40 rounded-full z-40" />

                {/* Pantalla interna */}
                <div className="relative w-full h-full rounded-[32px] overflow-hidden bg-gradient-to-b from-[#0e0c15] to-[#040409] flex flex-col pt-10 pb-5 px-3">
                  <div className="flex justify-between items-center text-[9px] font-semibold text-white/90 px-3 absolute top-3 left-0 right-0 z-30 pointer-events-none">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5">
                      <span className="scale-[0.8] opacity-80">📶</span>
                      <span className="scale-[0.8] opacity-80">🔋</span>
                    </div>
                  </div>

                  <p className="text-center font-bold text-base text-white/90 mt-1 mb-3 tracking-wider select-none">
                    calificar
                  </p>

                  {/* Tarjeta violeta (estilo Wallet) */}
                  <div className="flex-1 flex flex-col justify-between bg-gradient-to-b from-[#6b21a8] to-[#3b0764] rounded-[24px] p-4 border border-violet-500/35 shadow-[0_8px_32px_rgba(107,33,168,0.4)]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-violet-600/40 border border-violet-300/35 flex items-center justify-center text-white text-base shadow-inner">
                        ★
                      </div>
                      <div className="text-center">
                        <h2 className="text-white font-extrabold text-xs tracking-wide">La Cocina Fidelidad</h2>
                        <p className="text-violet-300/80 text-[8px] font-semibold">La Cocina</p>
                      </div>
                    </div>

                    <div className="my-2">
                      <p className="text-violet-200/90 text-[8px] font-semibold mb-2 pl-1 select-none">María García</p>
                      <div className="flex justify-between gap-1.5">
                        {[-6, 3, -4].map((deg, i) => (
                          <div key={i} className="flex-1 aspect-square rounded-full bg-white flex items-center justify-center shadow-lg" style={{ transform: `rotate(${deg}deg)` }}>
                            <span className="text-violet-800 text-[10px] font-black">★</span>
                          </div>
                        ))}
                        {[3, 4].map(i => (
                          <div key={i} className="flex-1 aspect-square rounded-full bg-black/40 border border-violet-400/20 flex items-center justify-center">
                            <span className="text-violet-400/15 text-[10px]">★</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-[7.5px] text-violet-300/80 mt-3 px-1 font-bold">
                        <span>5 sellos</span>
                        <span>Premio: Café gratis</span>
                      </div>
                    </div>

                    <button type="button" className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 flex items-center justify-center gap-2 transition hover:bg-zinc-900 active:scale-[0.98]">
                      <span className="text-[9px] text-white font-semibold flex items-center gap-1.5">
                        💳 Guardar en Google Wallet
                      </span>
                    </button>
                  </div>

                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-[3px] bg-white/30 rounded-full z-40 pointer-events-none" />
                </div>
              </div>

              {/* Popups flotantes: desplazados en Z para salirse de la pantalla */}
              <div
                className="absolute left-[-24px] bottom-[140px] bg-violet-600 border border-violet-400/50 rounded-2xl p-4 shadow-[-20px_20px_40px_rgba(0,0,0,0.5)] flex flex-col z-30"
                style={{ transform: 'translateZ(45px) rotateY(10deg)' }}
              >
                <span className="text-[9px] text-violet-200/95 font-bold uppercase tracking-wider">Sellos sumados</span>
                <span className="text-2xl font-black text-white mt-0.5 tracking-tight drop-shadow-md">847</span>
              </div>

              <div
                className="absolute right-[-28px] top-[150px] bg-white border border-zinc-200 rounded-2xl p-4 shadow-[20px_20px_40px_rgba(0,0,0,0.4)] flex flex-col gap-0.5 z-30"
                style={{ transform: 'translateZ(55px) rotateY(-8deg)' }}
              >
                <span className="text-[9.5px] text-zinc-500 font-bold uppercase tracking-wider whitespace-nowrap">Nuevos clientes hoy</span>
                <span className="text-[26px] leading-8 font-black text-zinc-950 mt-0.5 tracking-tight">+12</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <div className="border-y py-8" style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-slate-500 text-sm font-medium mb-6">Negocios que ya usan Calificar fidelización</p>
          <div className="flex flex-wrap justify-center gap-8 text-slate-500 font-semibold text-sm">
            {['La Cocina', 'Café Central', 'Peluquería Nova', 'Sushi Haus', 'El Rincón'].map(b => (
              <span key={b} className="opacity-60">{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold tracking-tight mb-4 text-white">Listo en 10 minutos</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">Sin instalar nada. Sin contratos. Sin papel.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="relative">
                <div className="w-12 h-12 bg-violet-600 text-white font-extrabold rounded-2xl flex items-center justify-center text-sm mb-4">
                  {s.num}
                </div>
                <h3 className="font-bold text-lg mb-2 text-white">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section id="funcionalidades" className="py-24" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold tracking-tight mb-4 text-white">Todo lo que necesitás</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Cada herramienta pensada para que el cliente vuelva y vos lo sepas en tiempo real.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl p-6 hover:-translate-y-1 transition-all duration-200" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2 text-white">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIFERENCIADOR NFC */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="rounded-3xl p-10 text-white text-center" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(99,102,241,0.15) 100%)', border: '1px solid rgba(124,58,237,0.3)' }}>
            <div className="text-6xl mb-4">📡</div>
            <h3 className="text-2xl font-extrabold mb-3">Tap. Sello sumado.</h3>
            <p className="opacity-80 text-sm leading-relaxed">
              El cliente acerca el celular al cartelito NFC del mostrador y el sello se suma solo. Sin apps, sin escanear, sin fricción.
            </p>
            <div className="mt-6 bg-white/20 rounded-2xl px-6 py-4">
              <p className="text-xs opacity-70 font-semibold uppercase tracking-widest mb-1">Tiempo para sumar un sello</p>
              <p className="text-4xl font-extrabold">2 seg</p>
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight mb-6 text-white">
              La tecnología que solo tiene Calificar
            </h2>
            <div className="space-y-5">
              {[
                { t: 'NFC físico integrado', d: 'Cartelito de mostrador con chip NFC. El cliente tap y listo, no necesita abrir ninguna app.' },
                { t: 'Sin fricciones para el cliente', d: 'El flujo más corto del mercado. Registro en 30 segundos, sello en 2 segundos.' },
                { t: 'QR de respaldo', d: 'Si el cliente no tiene NFC, escanea el QR que también está en el cartelito.' },
              ].map(({ t, d }) => (
                <div key={t} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(124,58,237,0.2)' }}>
                    <div className="w-2 h-2 rounded-full bg-violet-400" />
                  </div>
                  <div>
                    <p className="font-bold mb-1 text-white">{t}</p>
                    <p className="text-slate-400 text-sm leading-relaxed">{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section id="precios" className="py-24" style={{ background: 'rgba(124,58,237,0.04)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold tracking-tight text-white mb-3">Precios simples</h2>
            <p className="text-slate-400 text-lg">14 días gratis. Cambiá de plan o cancelá cuando quieras.</p>
            <p className="text-sm text-violet-400 mt-2 font-medium">🇦🇷 Precios válidos únicamente para Argentina</p>
          </div>

          {/* Promo banner */}
          <div className="rounded-2xl px-6 py-4 text-center mb-10 max-w-xl mx-auto" style={{ border: '1px solid rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.08)' }}>
            <span className="bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-2">14 días gratis</span>
            <p className="text-white font-bold text-lg">Probá gratis y empezá a fidelizar desde el primer día.</p>
            <p className="text-zinc-400 text-sm mt-1">Sin tarjeta de crédito. Sin compromiso.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`rounded-3xl p-7 flex flex-col relative text-white ${p.highlight ? 'scale-[1.03]' : ''}`}
                style={p.highlight ? {
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(99,102,241,0.12) 100%)',
                  border: '1px solid rgba(124,58,237,0.4)',
                  boxShadow: '0 8px 40px rgba(124,58,237,0.2)',
                } : {
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {p.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-violet-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap">Recomendado</span>
                  </div>
                )}

                <p className="text-xs font-bold uppercase tracking-widest mb-2 text-violet-400">{p.label}</p>
                <h3 className="text-3xl font-extrabold mb-1 text-white">{p.name}</h3>

                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-4xl font-extrabold text-white">{p.price}</span>
                  <span className="text-sm text-slate-400">ARS / mes</span>
                </div>

                {/* Per day pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold w-fit mb-4" style={{ background: 'rgba(255,255,255,0.07)', color: '#94a3b8' }}>
                  <span className="font-bold text-white">{p.perDay}</span>
                  <span className="opacity-70">{p.perDaySub}</span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Tarjetas ilimitadas</span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full text-slate-400" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>Notificaciones ilimitadas</span>
                </div>

                <ul className="space-y-2.5 mb-7 flex-1">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm leading-snug text-slate-300">
                      <span className="text-violet-400 font-bold mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/fidelizacion/onboarding?plan=${p.slug}`}
                  className="text-center font-bold py-3.5 rounded-2xl text-sm transition-all bg-violet-600 hover:bg-violet-500 text-white active:scale-[0.98]"
                >
                  {p.cta}
                </Link>

                <Link
                  href={`/fidelizacion/precios#${p.slug}`}
                  className="text-center text-xs text-violet-400 hover:text-violet-300 mt-3 transition-colors"
                >
                  Ver qué incluye {p.name} ↓
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-extrabold tracking-tight text-center mb-12 text-white">Preguntas frecuentes</h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left font-semibold text-white hover:bg-white/5 transition-colors"
                >
                  {f.q}
                  <span className={`text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-slate-400 text-sm leading-relaxed border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(99,102,241,0.1) 100%)' }}>
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl font-extrabold tracking-tight mb-4">
            Empezá hoy, gratis.
          </h2>
          <p className="text-violet-200 text-lg mb-8">
            14 días de prueba. Sin tarjeta de crédito. El cartelito NFC incluido en todos los planes pagos.
          </p>
          <Link
            href="/fidelizacion/onboarding"
            className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-bold px-10 py-4 rounded-2xl text-base transition-colors shadow-lg shadow-violet-900/40"
          >
            Crear mi programa gratis
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-10" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/" className="font-extrabold text-white">calificar</Link>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <a href="mailto:hola@calificar.com.ar" className="hover:text-white transition-colors">Contacto</a>
            <Link href="/admin/fidelizacion" className="hover:text-white transition-colors">Ingresar</Link>
          </div>
          <p className="text-slate-500 text-sm">2026 Calificar</p>
        </div>
      </footer>
    </div>
  )
}
