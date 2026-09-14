'use client'

import Link from 'next/link'
import Image from 'next/image'

const STEPS = [
  {
    n: '1',
    title: 'Creá tu cuenta gratis',
    desc: 'Sin tarjeta. Sin vencimiento. Sin trampa.',
  },
  {
    n: '2',
    title: 'Pegá la URL de destino',
    desc: 'Tu web, Instagram, WhatsApp, Google Maps, menú digital — lo que sea.',
  },
  {
    n: '3',
    title: 'Descargá e imprimí el QR',
    desc: 'Y si en algún momento cambiás de dirección, actualizás la URL desde el panel. El QR impreso sigue funcionando.',
  },
]

const FEATURES = [
  {
    icon: '✏️',
    title: 'URL editable en cualquier momento',
    desc: 'Cambiá el destino sin reimprimir ni pagar nada. El QR sigue siendo el mismo.',
  },
  {
    icon: '📊',
    title: 'Estadísticas de scans',
    desc: 'Ves cuántas veces escanearon tu QR. Nada más, nada menos.',
  },
  {
    icon: '⚡',
    title: 'Listo en 30 segundos',
    desc: 'Sin configuraciones raras. Entrás, creás el QR y lo descargás.',
  },
  {
    icon: '🆓',
    title: '100% gratis',
    desc: 'El servicio es gratis. Solo verás el logo de Calificar por 2 segundos al escanear.',
  },
]

const FAQS = [
  {
    q: '¿Qué es un QR dinámico?',
    a: 'Es un código QR cuya URL de destino podés cambiar sin tener que reimprimir el QR. Al escanear, el cliente pasa por nuestros servidores y es redirigido a donde vos quieras.',
  },
  {
    q: '¿Por qué es gratis?',
    a: 'Porque cuando alguien escanea tu QR, ve el nombre de Calificar por 2 segundos antes de llegar al destino. Esa visibilidad es nuestra ganancia.',
  },
  {
    q: '¿Hay límite de scans?',
    a: 'No. Podés tener los scans que quieras sin costo adicional.',
  },
  {
    q: '¿Cuántos QRs puedo crear?',
    a: 'Con la cuenta gratis podés crear hasta 5 QRs dinámicos. Si necesitás más, escribinos.',
  },
  {
    q: '¿Funciona con cualquier URL?',
    a: 'Sí. Instagram, WhatsApp, tu web, un PDF, Google Maps, menú digital — cualquier URL funciona.',
  },
]

export default function QRLandingPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#070A14' }}>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: 'rgba(7,10,20,0.9)', backdropFilter: 'blur(20px)', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Calificar" className="h-7 w-auto" />
            <span className="font-extrabold text-lg text-white">Calificar</span>
            <span className="text-xs font-bold text-violet-400 px-2 py-0.5 rounded-full ml-1" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' }}>QR</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/register"
              className="bg-violet-600 text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-violet-500 transition-colors">
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-violet-300 text-xs font-bold px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse"/>
            100% gratis · Sin tarjeta
          </div>
          <h1 className="font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-white mb-6">
            Generador de QR dinámicos gratis
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            Creá un código QR que podés editar cuando quieras. Cambiá la URL sin reimprimir.
            Estadísticas de scans incluidas. Gratis.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register"
              className="bg-violet-600 text-white font-bold text-base px-8 py-4 rounded-full hover:bg-violet-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-violet-900/40">
              Crear mi QR gratis →
            </Link>
            <Link href="/qr/dashboard"
              className="border border-white/15 hover:border-white/25 text-white font-semibold text-base px-8 py-4 rounded-full hover:bg-white/5 transition-colors">
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        {/* Mock visual */}
        <div className="mt-16 max-w-sm mx-auto">
          <div className="rounded-3xl p-8 shadow-2xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-4">
              <div className="w-36 h-36 bg-gray-100 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full p-2" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* QR mock */}
                  <rect width="100" height="100" fill="white"/>
                  <rect x="5" y="5" width="35" height="35" rx="3" fill="#0F172A"/>
                  <rect x="11" y="11" width="23" height="23" rx="1" fill="white"/>
                  <rect x="15" y="15" width="15" height="15" rx="1" fill="#0F172A"/>
                  <rect x="60" y="5" width="35" height="35" rx="3" fill="#0F172A"/>
                  <rect x="66" y="11" width="23" height="23" rx="1" fill="white"/>
                  <rect x="70" y="15" width="15" height="15" rx="1" fill="#0F172A"/>
                  <rect x="5" y="60" width="35" height="35" rx="3" fill="#0F172A"/>
                  <rect x="11" y="66" width="23" height="23" rx="1" fill="white"/>
                  <rect x="15" y="70" width="15" height="15" rx="1" fill="#0F172A"/>
                  <rect x="45" y="5" width="7" height="7" fill="#0F172A"/>
                  <rect x="55" y="5" width="7" height="7" fill="#0F172A"/>
                  <rect x="45" y="15" width="7" height="7" fill="#0F172A"/>
                  <rect x="55" y="15" width="7" height="7" fill="#0F172A"/>
                  <rect x="45" y="45" width="7" height="7" fill="#0F172A"/>
                  <rect x="55" y="45" width="7" height="7" fill="#0F172A"/>
                  <rect x="65" y="45" width="7" height="7" fill="#0F172A"/>
                  <rect x="75" y="45" width="7" height="7" fill="#0F172A"/>
                  <rect x="85" y="45" width="7" height="7" fill="#0F172A"/>
                  <rect x="45" y="55" width="7" height="7" fill="#0F172A"/>
                  <rect x="65" y="55" width="7" height="7" fill="#0F172A"/>
                  <rect x="85" y="55" width="7" height="7" fill="#0F172A"/>
                  <rect x="45" y="65" width="7" height="7" fill="#0F172A"/>
                  <rect x="55" y="65" width="7" height="7" fill="#0F172A"/>
                  <rect x="75" y="65" width="7" height="7" fill="#0F172A"/>
                  <rect x="45" y="75" width="7" height="7" fill="#0F172A"/>
                  <rect x="65" y="75" width="7" height="7" fill="#0F172A"/>
                  <rect x="75" y="75" width="7" height="7" fill="#0F172A"/>
                  <rect x="45" y="85" width="7" height="7" fill="#0F172A"/>
                  <rect x="55" y="85" width="7" height="7" fill="#0F172A"/>
                  <rect x="65" y="85" width="7" height="7" fill="#0F172A"/>
                  <rect x="85" y="85" width="7" height="7" fill="#0F172A"/>
                </svg>
              </div>
              <div className="w-full">
                <p className="text-[10px] text-gray-400 font-semibold mb-1">URL DE DESTINO</p>
                <div className="flex items-center gap-2 bg-violet-50 rounded-xl px-3 py-2">
                  <span className="text-xs text-violet-700 font-mono truncate flex-1">calificar.com.ar/g/M3PMZJ</span>
                  <span className="text-violet-500 text-xs font-bold">✏️</span>
                </div>
              </div>
              <div className="flex items-center justify-between w-full">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">248</p>
                  <p className="text-[10px] text-gray-400">scans</p>
                </div>
                <button className="bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-xl">↓ Descargar</button>
              </div>
            </div>
            <p className="text-center text-gray-500 text-[11px] mt-4">★ Powered by Calificar</p>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="py-20 px-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="font-extrabold text-3xl sm:text-4xl text-white text-center mb-4">
            Cómo funciona
          </h2>
          <p className="text-slate-400 text-center mb-14 max-w-xl mx-auto">
            En menos de un minuto tenés tu QR dinámico listo para usar.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {STEPS.map(s => (
              <div key={s.n} className="relative">
                <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white font-extrabold text-xl flex items-center justify-center mb-4 shadow-lg shadow-violet-900/40">
                  {s.n}
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-extrabold text-3xl sm:text-4xl text-white text-center mb-14">
            Todo lo que incluye, gratis
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-white mb-2 text-sm">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="font-extrabold text-3xl text-white text-center mb-12">
            Preguntas frecuentes
          </h2>
          <div className="space-y-4">
            {FAQS.map(f => (
              <div key={f.q} className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 className="font-bold text-white mb-2">{f.q}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-xl mx-auto rounded-3xl p-12" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(99,102,241,0.08) 100%)', border: '1px solid rgba(124,58,237,0.3)' }}>
          <h2 className="font-extrabold text-3xl sm:text-4xl text-white mb-4">
            Empezá ahora, es gratis
          </h2>
          <p className="text-slate-400 mb-8">
            Sin tarjeta. Sin vencimiento. El QR que creás hoy dura para siempre.
          </p>
          <Link href="/register"
            className="inline-flex items-center gap-2 bg-violet-600 text-white font-bold text-base px-8 py-4 rounded-full hover:bg-violet-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-violet-900/40">
            Crear mi cuenta gratis →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-8 px-6" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Calificar" className="h-5 w-auto opacity-40" />
            <span>© 2025 Calificar</span>
          </div>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-slate-300 transition-colors">Inicio</Link>
            <Link href="/precios" className="hover:text-slate-300 transition-colors">Precios</Link>
            <Link href="/terminos" className="hover:text-slate-300 transition-colors">Términos</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
