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
    price: '$9.99',
    perDay: '$0.33 al día',
    perDaySub: 'menos que un café',
    features: [
      '1 programa de fidelidad con tu logo y colores',
      'Notificaciones ilimitadas al celular de tus clientes',
      'Cartelito NFC + QR para el mostrador',
      'Panel: quién volvió, cuándo y cuántos sellos',
      'Exportá tus clientes: nombre y teléfono',
      'Soporte en español',
    ],
    cta: 'Crear mi programa gratis',
    highlight: false,
  },
  {
    label: 'PARA DESTACAR',
    name: 'Pro',
    price: '$19.99',
    perDay: '$0.66 al día',
    perDaySub: 'menos que dos cafés',
    features: [
      'Todo lo de Starter',
      'Hasta 3 programas de fidelidad',
      'Campañas de cumpleaños automáticas',
      'Formulario de registro personalizable',
      'Cupones únicos al completar la tarjeta',
      'Zonas de notificación por geolocalización',
      'Soporte prioritario',
    ],
    cta: 'Crear mi programa gratis',
    highlight: true,
  },
  {
    label: 'SIN LÍMITES',
    name: 'Ultimate',
    price: '$49.99',
    perDay: '$1.66 al día',
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
    cta: 'Crear mi programa gratis',
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
    <div className="bg-white text-zinc-900 font-sans">

      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-lg tracking-tight text-zinc-900">
            calificar <span className="text-violet-600">fidelización</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-500">
            <a href="#como-funciona" className="hover:text-zinc-900 transition-colors">Cómo funciona</a>
            <a href="#funcionalidades" className="hover:text-zinc-900 transition-colors">Funcionalidades</a>
            <a href="#precios" className="hover:text-zinc-900 transition-colors">Precios</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/fidelizacion" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors hidden md:block">
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
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center py-20">
          <div>
            <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-4">Programa de fidelidad digital</p>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6">
              Tus clientes vuelven.
              <br />
              <span className="text-violet-600">Siempre.</span>
            </h1>
            <p className="text-zinc-500 text-lg leading-relaxed mb-8 max-w-md">
              Reemplazá las tarjetitas de papel con una tarjeta digital en Google Wallet. NFC, QR, notificaciones y premios automáticos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="#precios"
                className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-4 rounded-2xl text-base transition-colors text-center"
              >
                Empezar 14 días gratis
              </Link>
              <a
                href="#como-funciona"
                className="border-2 border-zinc-200 hover:border-violet-300 text-zinc-700 font-semibold px-8 py-4 rounded-2xl text-base transition-colors text-center"
              >
                Ver cómo funciona
              </a>
            </div>
            <p className="text-zinc-400 text-xs mt-4">Sin tarjeta de crédito. Sin compromiso.</p>
          </div>

          {/* Card mockup */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Phone frame */}
              <div className="w-[280px] bg-zinc-900 rounded-[48px] p-3 shadow-2xl">
                <div className="bg-zinc-800 rounded-[40px] overflow-hidden">
                  {/* Status bar */}
                  <div className="flex justify-between items-center px-6 pt-4 pb-2">
                    <span className="text-white text-xs font-semibold">9:41</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-2 bg-white rounded-sm opacity-80" />
                      <div className="w-4 h-2 bg-white rounded-sm opacity-80" />
                    </div>
                  </div>
                  {/* Wallet card */}
                  <div className="mx-3 mb-3">
                    <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-3xl p-5 text-white">
                      <div className="flex flex-col items-center mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl mb-2">★</div>
                        <p className="font-extrabold text-sm">La Cocina Fidelidad</p>
                        <p className="text-xs opacity-60">La Cocina</p>
                      </div>
                      <p className="text-xs font-semibold opacity-80 mb-2">María García</p>
                      <div className="grid grid-cols-5 gap-1.5 mb-3">
                        {Array.from({ length: 5 }, (_, i) => (
                          <div key={i} className={`aspect-square rounded-full flex items-center justify-center text-xs font-bold border-2 ${i < 3 ? 'bg-white text-violet-700 border-white' : 'bg-white/10 border-white/30 text-white/40'}`}>
                            {i < 3 ? '★' : '○'}
                          </div>
                        ))}
                      </div>
                      <div className="bg-white/20 rounded-full h-1.5">
                        <div className="bg-white h-1.5 rounded-full" style={{ width: '60%' }} />
                      </div>
                      <div className="flex justify-between text-[10px] opacity-70 mt-1">
                        <span>3 de 5 sellos</span>
                        <span>Premio: Café gratis</span>
                      </div>
                    </div>
                  </div>
                  {/* Google Wallet button */}
                  <div className="mx-3 mb-4">
                    <div className="bg-black rounded-2xl px-4 py-2.5 flex items-center justify-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M21.56 10.738l-9.52-9.52A1.5 1.5 0 0010.978.5H3.5A3 3 0 00.5 3.5v7.478c0 .398.158.78.44 1.062l9.52 9.52a3 3 0 004.242 0l6.858-6.858a3 3 0 000-4.243zM5.5 8a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>
                      </svg>
                      <span className="text-white text-xs font-semibold">Guardar en Google Wallet</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -right-8 top-16 bg-white rounded-2xl shadow-xl px-4 py-3 border border-zinc-100">
                <p className="text-xs text-zinc-400 font-medium">Nuevos clientes hoy</p>
                <p className="text-2xl font-extrabold text-zinc-900">+12</p>
              </div>
              <div className="absolute -left-8 bottom-20 bg-violet-600 rounded-2xl shadow-xl px-4 py-3">
                <p className="text-xs text-white/80 font-medium">Sellos sumados</p>
                <p className="text-2xl font-extrabold text-white">847</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <div className="border-y border-zinc-100 bg-zinc-50 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-zinc-400 text-sm font-medium mb-6">Negocios que ya usan Calificar fidelización</p>
          <div className="flex flex-wrap justify-center gap-8 text-zinc-400 font-semibold text-sm">
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
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">Listo en 10 minutos</h2>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto">Sin instalar nada. Sin contratos. Sin paper de papel.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="relative">
                <div className="w-12 h-12 bg-violet-100 text-violet-700 font-extrabold rounded-2xl flex items-center justify-center text-sm mb-4">
                  {s.num}
                </div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section id="funcionalidades" className="py-24 bg-zinc-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">Todo lo que necesitás</h2>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto">
              Cada herramienta pensada para que el cliente vuelva y vos lo sepas en tiempo real.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-zinc-100 hover:border-violet-200 hover:shadow-md transition-all">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIFERENCIADOR NFC */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-3xl p-10 text-white text-center">
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
            <h2 className="text-4xl font-extrabold tracking-tight mb-6">
              La tecnología que solo tiene Calificar
            </h2>
            <div className="space-y-5">
              {[
                { t: 'NFC físico integrado', d: 'Cartelito de mostrador con chip NFC. El cliente tap y listo, no necesita abrir ninguna app.' },
                { t: 'Sin fricciones para el cliente', d: 'El flujo más corto del mercado. Registro en 30 segundos, sello en 2 segundos.' },
                { t: 'QR de respaldo', d: 'Si el cliente no tiene NFC, escanea el QR que también está en el cartelito.' },
              ].map(({ t, d }) => (
                <div key={t} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-violet-600" />
                  </div>
                  <div>
                    <p className="font-bold mb-1">{t}</p>
                    <p className="text-zinc-500 text-sm leading-relaxed">{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section id="precios" className="py-24 bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold tracking-tight text-white mb-3">Precios simples</h2>
            <p className="text-zinc-400 text-lg">14 días gratis. Cambiá de plan o cancelá cuando quieras.</p>
          </div>

          {/* Promo banner */}
          <div className="border border-violet-500/40 rounded-2xl px-6 py-4 text-center mb-10 max-w-xl mx-auto bg-violet-950/30">
            <span className="bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-2">14 días gratis</span>
            <p className="text-white font-bold text-lg">Probá gratis y empezá a fidelizar desde el primer día.</p>
            <p className="text-zinc-400 text-sm mt-1">Sin tarjeta de crédito. Sin compromiso.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`rounded-3xl p-7 flex flex-col relative ${
                  p.highlight
                    ? 'bg-white text-zinc-900 shadow-2xl shadow-violet-500/20 scale-[1.03]'
                    : 'bg-zinc-900 text-white'
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-violet-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap">Recomendado</span>
                  </div>
                )}

                <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${p.highlight ? 'text-violet-600' : 'text-zinc-400'}`}>{p.label}</p>
                <h3 className="text-3xl font-extrabold mb-1">{p.name}</h3>

                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-4xl font-extrabold">{p.price}</span>
                  <span className={`text-sm ${p.highlight ? 'text-zinc-400' : 'text-zinc-400'}`}>USD / mes</span>
                </div>

                {/* Per day pill */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold w-fit mb-4 ${p.highlight ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-800 text-zinc-400'}`}>
                  <span className="font-bold">{p.perDay}</span>
                  <span className="opacity-70">{p.perDaySub}</span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Tarjetas ilimitadas</span>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${p.highlight ? 'border-zinc-200 text-zinc-600' : 'border-zinc-700 text-zinc-400'}`}>Notificaciones ilimitadas</span>
                </div>

                <ul className="space-y-2.5 mb-7 flex-1">
                  {p.features.map(f => (
                    <li key={f} className={`flex items-start gap-2.5 text-sm leading-snug ${p.highlight ? 'text-zinc-600' : 'text-zinc-300'}`}>
                      <span className="text-violet-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/fidelizacion/onboarding"
                  className="text-center font-bold py-3.5 rounded-2xl text-sm transition-all bg-violet-600 hover:bg-violet-500 text-white active:scale-[0.98]"
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-extrabold tracking-tight text-center mb-12">Preguntas frecuentes</h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="border border-zinc-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left font-semibold text-zinc-900 hover:bg-zinc-50 transition-colors"
                >
                  {f.q}
                  <span className={`text-zinc-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-zinc-500 text-sm leading-relaxed border-t border-zinc-100 pt-4">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 bg-violet-600">
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl font-extrabold tracking-tight mb-4">
            Empezá hoy, gratis.
          </h2>
          <p className="text-violet-200 text-lg mb-8">
            14 días de prueba. Sin tarjeta de crédito. El cartelito NFC incluido en todos los planes pagos.
          </p>
          <Link
            href="/fidelizacion/onboarding"
            className="inline-block bg-white text-violet-700 font-bold px-10 py-4 rounded-2xl text-base hover:bg-violet-50 transition-colors"
          >
            Crear mi programa gratis
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-100 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/" className="font-extrabold text-zinc-900">calificar</Link>
          <div className="flex gap-6 text-sm text-zinc-400">
            <Link href="/" className="hover:text-zinc-900 transition-colors">Inicio</Link>
            <a href="mailto:hola@calificar.com.ar" className="hover:text-zinc-900 transition-colors">Contacto</a>
            <Link href="/admin/fidelizacion" className="hover:text-zinc-900 transition-colors">Ingresar</Link>
          </div>
          <p className="text-zinc-400 text-sm">2026 Calificar</p>
        </div>
      </footer>
    </div>
  )
}
