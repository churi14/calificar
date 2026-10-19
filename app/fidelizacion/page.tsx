'use client'

import Link from 'next/link'
import { useState } from 'react'
import PhoneCardPreview from '@/components/landing/PhoneCardPreview'
import RoiCalculator from '@/components/roi/RoiCalculator'

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
  { num: '01', title: 'Configurás tu tarjeta', desc: 'Subís el logo, elegís cuántos sellos necesita el cliente y qué premio se lleva.' },
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
      'Tarjeta digital con tu logo',
      'Cartelito NFC + QR para el mostrador',
      'Sello rápido, manual o escaneando al cliente',
      'Cupones únicos para canjear los premios',
      'Lista de clientes y panel',
      '1 local',
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
      'Avisos ilimitados al celular, también a grupos de clientes',
      'Cumpleaños, reseñas de Google y recuperación de clientes',
      'Referidos y aviso al pasar cerca del local',
      'Google Wallet y diseño completo',
      'Premios en el camino y exportar clientes',
      'Hasta 3 locales con métricas de cada uno',
      'Soporte prioritario',
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
      'Ruleta de la suerte',
      'Recuperar según la frecuencia de cada cliente',
      'Grupos de clientes con tus propias reglas',
      'Estadísticas de actividad',
      'Equipo: cada empleado con su usuario',
      'Tarjeta sin marca Calificar y dominio propio',
      'Hasta 50 locales',
    ],
    cta: 'Empezar con Ultimate',
    highlight: false,
  },
]

const faqs = [
  { q: '¿El cliente necesita descargar una app?', a: 'No. La tarjeta se guarda directo en Google Wallet, que ya viene instalado en todos los Android.' },
  { q: '¿Cómo suma el cliente su sello?', a: 'Hay dos formas: acerca el celular al cartelito NFC del mostrador, o escanea el QR que está en el local.' },
  { q: '¿Puedo personalizar el diseño de la tarjeta?', a: 'Sí. En todos los planes subís tu logo. Con Pro además elegís plantillas, colores, íconos y fondo para que la tarjeta tenga tu identidad visual.' },
  { q: '¿Qué pasa si el cliente cambia de celular?', a: 'La tarjeta vive en la nube. Al loguearse de nuevo a su cuenta Google, recupera todo.' },
  { q: '¿Puedo probar antes de pagar?', a: 'Sí. Tenés 14 días gratis sin tarjeta de crédito.' },
]

export default function FidelizacionLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="font-sans text-zinc-900 bg-white">

      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b" style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px)', borderColor: 'rgba(24,24,27,0.08)' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-lg tracking-tight text-zinc-900">
            calificar <span className="text-violet-600">fidelización</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
            <a href="#como-funciona" className="hover:text-zinc-900 transition-colors">Cómo funciona</a>
            <a href="#funcionalidades" className="hover:text-zinc-900 transition-colors">Funcionalidades</a>
            <a href="#precios" className="hover:text-zinc-900 transition-colors">Precios</a>
            {/* Más servicios: lleva a las versiones por rubro (hoy, Beauty) */}
            <div className="relative group">
              <button type="button" className="inline-flex items-center gap-1 hover:text-zinc-900 transition-colors" aria-haspopup="true">
                Más servicios <span className="text-[10px] text-zinc-400">▾</span>
              </button>
              <div className="hidden group-hover:block group-focus-within:block absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50">
                <div className="w-64 bg-white border border-zinc-200 rounded-2xl shadow-xl shadow-violet-200/40 p-2">
                  <Link href="/fidelizacion/salones-de-belleza" className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-violet-50 transition-colors">
                    <span className="text-lg leading-none mt-0.5">✂️</span>
                    <span>
                      <span className="block text-sm font-bold text-zinc-900">Beauty</span>
                      <span className="block text-xs text-zinc-500 leading-snug">Salones, peluquerías, uñas y estética</span>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/negocio/fidelizacion" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              Ingresar
            </Link>
            <Link
              href="/fidelizacion/onboarding"
              className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-[100dvh] flex items-center pt-16" style={{ background: 'linear-gradient(180deg, #F3EEFF 0%, #FFFFFF 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <Link
              href="/fidelizacion/salones-de-belleza"
              className="inline-flex items-center gap-2 bg-white border border-violet-200 hover:border-violet-400 text-violet-700 font-semibold text-xs px-3 py-1.5 rounded-full mb-5 transition-colors"
            >
              ✂️ ¿Tenés un salón de belleza? Mirá la versión para vos →
            </Link>
            <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-4">Programa de fidelidad digital</p>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6">
              Tus clientes vuelven.
              <br />
              <span className="text-violet-600">Siempre.</span>
            </h1>
            <p className="text-zinc-600 text-lg leading-relaxed mb-8 max-w-md">
              Reemplazá las tarjetitas de papel con una tarjeta digital en Google Wallet. NFC, QR, notificaciones y premios automáticos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/fidelizacion/onboarding"
                className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-4 rounded-2xl text-base transition-colors text-center shadow-lg shadow-violet-300/60"
              >
                Empezar 14 días gratis
              </Link>
              <a
                href="#como-funciona"
                className="border border-zinc-300 hover:border-zinc-400 bg-white text-zinc-900 font-semibold px-8 py-4 rounded-2xl text-base transition-colors text-center"
              >
                Ver cómo funciona
              </a>
            </div>
            <p className="text-zinc-500 text-xs mt-4">Sin tarjeta de crédito. Sin compromiso.</p>
          </div>

          {/* iPhone 15 Pro mockup (pantalla full-screen) */}
          <div className="relative mx-auto lg:ml-auto w-72 sm:w-[320px] h-[640px] flex items-center justify-center mt-12 lg:mt-0">

            {/* Glow violeta de fondo detrás del teléfono */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[500px] bg-violet-400/40 blur-[100px] rounded-full -z-10 pointer-events-none" />

            {/* Contenedor del teléfono: rotación suave del bloque entero */}
            <div className="relative transition-transform duration-700 ease-out hover:scale-105 transform rotate-[-5deg] hover:rotate-[-2deg]">

              {/* Chasis */}
              <div className="relative w-72 sm:w-[320px] h-[640px] rounded-[48px] shadow-[15px_25px_50px_rgba(76,29,149,0.35)] border-[8px] border-[#18181b] bg-[#18181b]">

                {/* Borde metálico interno sutil */}
                <div className="absolute -inset-[1px] border-[2px] border-white/10 rounded-[40px] pointer-events-none z-30" />

                {/* Dynamic Island */}
                <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-[90px] h-[26px] bg-black rounded-full z-40 flex items-center justify-end px-3 gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#111] border border-zinc-800" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#05050e] border border-zinc-800" />
                </div>

                {/* Pantalla: la tarjeta real que ve el cliente, con datos de ejemplo */}
                <div className="relative w-full h-full rounded-[40px] overflow-hidden bg-[#09090b] shadow-inner">

                  {/* Barra de estado iOS */}
                  <div className="absolute top-4 left-7 text-[11px] font-semibold text-white z-20">9:41</div>
                  <div className="absolute top-[18px] right-6 flex items-center gap-1.5 z-20" aria-hidden="true">
                    <div className="flex items-end gap-[1.5px]">
                      <span className="w-[3px] h-[4px] bg-white rounded-[1px]" />
                      <span className="w-[3px] h-[6px] bg-white rounded-[1px]" />
                      <span className="w-[3px] h-[8px] bg-white rounded-[1px]" />
                      <span className="w-[3px] h-[10px] bg-white/40 rounded-[1px]" />
                    </div>
                    <div className="relative w-[22px] h-[11px] rounded-[3px] border border-white/60">
                      <span className="absolute inset-[1.5px] right-[5px] bg-white rounded-[1.5px]" />
                      <span className="absolute -right-[3px] top-[3px] w-[1.5px] h-[4px] bg-white/60 rounded-r" />
                    </div>
                  </div>

                  <PhoneCardPreview />

                  {/* Barra de inicio iOS */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-[4px] bg-white/40 rounded-full z-20" />
                </div>

                {/* Botones físicos laterales */}
                <div className="absolute left-[-11px] top-24 w-[3px] h-7 bg-[#27272a] rounded-l-sm" />
                <div className="absolute left-[-11px] top-36 w-[3px] h-14 bg-[#27272a] rounded-l-sm" />
                <div className="absolute left-[-11px] top-56 w-[3px] h-14 bg-[#27272a] rounded-l-sm" />
                <div className="absolute right-[-11px] top-40 w-[3px] h-16 bg-[#27272a] rounded-r-sm" />
              </div>
            </div>

            {/* Popups flotantes externos */}
            <div className="max-sm:hidden absolute sm:-left-24 top-[440px] bg-violet-600 rounded-2xl p-4 shadow-[0_20px_40px_rgba(76,29,149,0.35)] border border-violet-400/50 flex flex-col z-50 transform -rotate-3 hover:scale-105 transition-transform">
              <span className="text-[10px] text-violet-200 font-bold uppercase tracking-wider">Sellos sumados</span>
              <span className="text-3xl font-black text-white leading-none mt-1">847</span>
            </div>

            <div className="max-sm:hidden absolute sm:-right-24 top-[330px] bg-white rounded-2xl p-4 shadow-[0_20px_40px_rgba(76,29,149,0.25)] border border-zinc-200 flex flex-col z-50 transform rotate-3 hover:scale-105 transition-transform">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Nuevos clientes</span>
              <span className="text-3xl font-black text-zinc-900 leading-none mt-1">+12</span>
            </div>

          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <div className="border-y py-8" style={{ borderColor: 'rgba(24,24,27,0.07)', background: '#FAFAFA' }}>
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-zinc-500 text-sm font-medium mb-6">Negocios que ya usan Calificar fidelización</p>
          <div className="flex flex-wrap justify-center gap-8 text-zinc-500 font-semibold text-sm">
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
            <h2 className="text-4xl font-extrabold tracking-tight mb-4 text-zinc-900">Listo en 10 minutos</h2>
            <p className="text-zinc-600 text-lg max-w-xl mx-auto">Sin instalar nada. Sin contratos. Sin papel.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="relative">
                <div className="w-12 h-12 bg-violet-600 text-white font-extrabold rounded-2xl flex items-center justify-center text-sm mb-4">
                  {s.num}
                </div>
                <h3 className="font-bold text-lg mb-2 text-zinc-900">{s.title}</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section id="funcionalidades" className="py-24" style={{ background: '#FAF7FF' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold tracking-tight mb-4 text-zinc-900">Todo lo que necesitás</h2>
            <p className="text-zinc-600 text-lg max-w-xl mx-auto">
              Cada herramienta pensada para que el cliente vuelva y vos lo sepas en tiempo real.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl p-6 hover:-translate-y-1 transition-all duration-200" style={{ background: '#FFFFFF', border: '1px solid #E9E3F8', boxShadow: '0 1px 3px rgba(76,29,149,0.06)' }}>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2 text-zinc-900">{f.title}</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALCULADORA */}
      <section id="calculadora" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-3">Calculadora</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">¿Cuánto te deja una tarjeta de sellos?</h2>
            <p className="text-zinc-600 max-w-xl mx-auto">Poné lo que cobrás y cuántos clientes atendés. Te mostramos en pesos cuánto ganás después de pagar los premios y el plan.</p>
          </div>
          <RoiCalculator mode="preview" cta={{ href: '/fidelizacion/onboarding', label: 'Probalo con tus números · 14 días gratis' }} />
        </div>
      </section>

      {/* DELIVERY / DARK KITCHEN */}
      <section id="delivery" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-3">Delivery y dark kitchens</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">¿Vendés por WhatsApp, sin local abierto al público?</h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              Casi todas las tarjetas de fidelidad piden un mostrador y un QR pegado en la pared. Acá no: el sello viaja con cada pedido.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { n: '1', title: 'Confirmás el pedido', desc: 'Entrás al panel, escribís el teléfono del cliente (o no) y tocás “Enviar por WhatsApp”.' },
              { n: '2', title: 'El cliente recibe su link', desc: 'Un link único para ese pedido, dentro de un mensaje que ya sale escrito. Se abre en el celular, sin descargar nada.' },
              { n: '3', title: 'Suma su sello, una sola vez', desc: 'Si lo reenvía o se lo pasa a otro, no funciona. Nadie se sella sin haber comprado.' },
            ].map(st => (
              <div key={st.n} className="bg-white border border-zinc-200 rounded-3xl p-7 shadow-sm shadow-violet-100">
                <div className="w-11 h-11 rounded-full bg-violet-100 text-violet-700 font-extrabold flex items-center justify-center mb-5">{st.n}</div>
                <h3 className="font-bold text-lg mb-2">{st.title}</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-zinc-500 mt-8">
            Incluido en todos los planes. Y si no tenés local a la calle, podés dejar que <b>solo</b> se den sellos con este link.
          </p>
        </div>
      </section>

      {/* DIFERENCIADOR NFC */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="rounded-3xl p-10 text-white text-center" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)', boxShadow: '0 20px 50px rgba(124,58,237,0.30)' }}>
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
            <h2 className="text-4xl font-extrabold tracking-tight mb-6 text-zinc-900">
              La tecnología que solo tiene Calificar
            </h2>
            <div className="space-y-5">
              {[
                { t: 'NFC físico integrado', d: 'Cartelito de mostrador con chip NFC. El cliente tap y listo, no necesita abrir ninguna app.' },
                { t: 'Sin fricciones para el cliente', d: 'El flujo más corto del mercado. Registro en 30 segundos, sello en 2 segundos.' },
                { t: 'QR de respaldo', d: 'Si el cliente no tiene NFC, escanea el QR que también está en el cartelito.' },
              ].map(({ t, d }) => (
                <div key={t} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#EDE9FE' }}>
                    <div className="w-2 h-2 rounded-full bg-violet-600" />
                  </div>
                  <div>
                    <p className="font-bold mb-1 text-zinc-900">{t}</p>
                    <p className="text-zinc-600 text-sm leading-relaxed">{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section id="precios" className="py-24" style={{ background: '#FAF7FF' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900 mb-3">Precios simples</h2>
            <p className="text-zinc-600 text-lg">14 días gratis. Cambiá de plan o cancelá cuando quieras.</p>
            <p className="text-sm text-violet-600 mt-2 font-medium">🇦🇷 Precios válidos únicamente para Argentina</p>
          </div>

          {/* Promo banner */}
          <div className="rounded-2xl px-6 py-4 text-center mb-10 max-w-xl mx-auto" style={{ border: '1px solid #DDD0FB', background: '#F3EEFF' }}>
            <span className="bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-2">14 días gratis</span>
            <p className="text-zinc-900 font-bold text-lg">Probá gratis y empezá a fidelizar desde el primer día.</p>
            <p className="text-zinc-600 text-sm mt-1">Sin tarjeta de crédito. Sin compromiso.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`rounded-3xl p-7 flex flex-col relative text-zinc-900 ${p.highlight ? 'scale-[1.03]' : ''}`}
                style={p.highlight ? {
                  background: '#FFFFFF',
                  border: '2px solid #7C3AED',
                  boxShadow: '0 16px 50px rgba(124,58,237,0.22)',
                } : {
                  background: '#FFFFFF',
                  border: '1px solid #E4E4E7',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                {p.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-violet-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap">Recomendado</span>
                  </div>
                )}

                <p className="text-xs font-bold uppercase tracking-widest mb-2 text-violet-600">{p.label}</p>
                <h3 className="text-3xl font-extrabold mb-1 text-zinc-900">{p.name}</h3>

                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-4xl font-extrabold text-zinc-900">{p.price}</span>
                  <span className="text-sm text-zinc-500">ARS / mes</span>
                </div>

                {/* Per day pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold w-fit mb-4" style={{ background: '#F3EEFF', color: '#6B7280' }}>
                  <span className="font-bold text-zinc-900">{p.perDay}</span>
                  <span className="opacity-70">{p.perDaySub}</span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Tarjetas ilimitadas</span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full text-zinc-600" style={{ border: '1px solid #D4D4D8' }}>Notificaciones ilimitadas</span>
                </div>

                <ul className="space-y-2.5 mb-7 flex-1">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm leading-snug text-zinc-700">
                      <span className="text-violet-600 font-bold mt-0.5 flex-shrink-0">✓</span>
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
                  className="text-center text-xs text-violet-600 hover:text-violet-800 mt-3 transition-colors"
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
          <h2 className="text-4xl font-extrabold tracking-tight text-center mb-12 text-zinc-900">Preguntas frecuentes</h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid #E4E4E7' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left font-semibold text-zinc-900 hover:bg-zinc-50 transition-colors"
                >
                  {f.q}
                  <span className={`text-zinc-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-zinc-600 text-sm leading-relaxed border-t pt-4" style={{ borderColor: '#F4F4F5' }}>
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}>
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl font-extrabold tracking-tight mb-4">
            Empezá hoy, gratis.
          </h2>
          <p className="text-violet-200 text-lg mb-8">
            14 días de prueba. Sin tarjeta de crédito. El cartelito NFC incluido en todos los planes pagos.
          </p>
          <Link
            href="/fidelizacion/onboarding"
            className="inline-block bg-white hover:bg-violet-50 text-violet-700 font-bold px-10 py-4 rounded-2xl text-base transition-colors shadow-lg shadow-violet-900/30"
          >
            Crear mi tarjeta gratis
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-10 bg-white" style={{ borderColor: 'rgba(24,24,27,0.08)' }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/" className="font-extrabold text-zinc-900">calificar</Link>
          <div className="flex gap-6 text-sm text-zinc-500">
            <Link href="/" className="hover:text-zinc-900 transition-colors">Inicio</Link>
            <a href="mailto:hola@calificar.com.ar" className="hover:text-zinc-900 transition-colors">Contacto</a>
            <Link href="/admin/fidelizacion" className="hover:text-zinc-900 transition-colors">Ingresar</Link>
          </div>
          <p className="text-zinc-500 text-sm">2026 Calificar</p>
        </div>
      </footer>
    </div>
  )
}
