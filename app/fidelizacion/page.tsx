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

          {/* iPhone 15 Pro mockup (marco sólido) */}
          <div className="relative mx-auto lg:ml-auto w-72 sm:w-[300px] h-[600px] flex items-center justify-center mt-10 lg:mt-0">

            {/* Glow violeta de fondo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[400px] bg-indigo-600/40 blur-[100px] rounded-full -z-10 pointer-events-none" />

            {/* Contenedor del teléfono (rotado como un bloque entero) */}
            <div className="relative transition-transform duration-700 ease-out hover:scale-105 transform rotate-[-8deg] hover:rotate-[-2deg]">

              {/* iPhone 15 base */}
              <div className="relative w-72 h-[600px] rounded-[45px] shadow-[20px_30px_60px_rgba(0,0,0,0.6)] border-[6px] border-[#1c1c1e] bg-black">

                {/* Dynamic Island */}
                <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-[85px] h-[24px] bg-black rounded-full z-30 shadow-inner flex items-center justify-end px-2.5 gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#111] border border-zinc-800" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#05050e] border border-zinc-800" />
                </div>

                {/* Borde interno brillante */}
                <div className="absolute -inset-[1px] border-[2px] border-white/10 rounded-[40px] pointer-events-none z-20" />

                {/* Pantalla */}
                <div className="relative w-full h-full rounded-[40px] overflow-hidden bg-black flex flex-col">

                  {/* Barra de estado iOS */}
                  <div className="absolute top-4 left-5 text-[10px] font-bold text-white/90 z-20">9:41</div>
                  <div className="absolute top-4 right-5 flex gap-1 text-[10px] text-white/90 z-20">📶 🔋</div>

                  {/* Contenido de la app */}
                  <div className="w-full h-full bg-gradient-to-b from-[#0e0c15] to-[#040409] pt-14 pb-8 px-4 flex flex-col">
                    <p className="text-center font-bold text-white text-base mb-4">calificar</p>
                    <div className="flex-1 bg-gradient-to-b from-violet-600 to-violet-950 rounded-[24px] p-4 border border-violet-400/30 flex flex-col justify-between shadow-lg relative overflow-hidden">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-violet-500/50 border border-violet-300/40 flex items-center justify-center text-white text-xl">★</div>
                        <div className="text-center">
                          <h2 className="text-white font-bold text-xs">La Cocina Fidelidad</h2>
                          <p className="text-violet-300 text-[9px]">La Cocina</p>
                        </div>
                      </div>
                      <div className="my-2">
                        <p className="text-violet-200 text-[9px] mb-2">María García</p>
                        <div className="flex justify-between gap-1.5">
                          {[0, 1, 2].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full bg-white flex items-center justify-center"><span className="text-violet-800 text-[10px]">★</span></div>
                          ))}
                          {[3, 4].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center"><span className="text-violet-400/20 text-[10px]">★</span></div>
                          ))}
                        </div>
                      </div>
                      <button type="button" className="w-full bg-black border border-zinc-700/50 rounded-xl py-2 flex items-center justify-center gap-2">
                        <span className="text-[10px] text-white">💳 Guardar en Google Wallet</span>
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/30 rounded-full" />
                  </div>
                </div>

                {/* Botones laterales */}
                <div className="absolute left-[-8px] top-20 w-[3px] h-6 bg-[#3a3a3c] rounded-l-sm shadow-md" />
                <div className="absolute left-[-8px] top-32 w-[3px] h-12 bg-[#3a3a3c] rounded-l-sm shadow-md" />
                <div className="absolute left-[-8px] top-48 w-[3px] h-12 bg-[#3a3a3c] rounded-l-sm shadow-md" />
                <div className="absolute right-[-8px] top-36 w-[3px] h-16 bg-[#3a3a3c] rounded-r-sm shadow-md" />
              </div>
            </div>

            {/* Popups flotantes (fuera del teléfono) */}
            <div className="absolute -left-10 bottom-28 bg-violet-600 rounded-2xl p-4 shadow-2xl border border-violet-400/50 flex flex-col z-50 transform -rotate-3 hover:scale-105 transition-transform">
              <span className="text-[10px] text-violet-200 font-bold uppercase">Sellos sumados</span>
              <span className="text-2xl font-black text-white leading-none mt-1">847</span>
            </div>

            <div className="absolute -right-6 top-32 bg-white rounded-2xl p-4 shadow-2xl border border-zinc-200 flex flex-col z-50 transform rotate-3 hover:scale-105 transition-transform">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">Nuevos clientes</span>
              <span className="text-2xl font-black text-zinc-900 leading-none mt-1">+12</span>
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
