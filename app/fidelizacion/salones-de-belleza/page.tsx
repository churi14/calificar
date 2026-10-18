import type { Metadata } from 'next'
import Link from 'next/link'
import PhoneCardPreview from '@/components/landing/PhoneCardPreview'

export const metadata: Metadata = {
  title: 'Tarjeta de fidelización para salones de belleza · Calificar',
  description: 'Tarjeta de sellos digital para peluquerías, uñas, pestañas, estética y spa. Tus clientes vuelven a reservar, sin papel y sin descargar apps. 14 días gratis.',
  openGraph: {
    title: 'Fidelización para salones de belleza · Calificar',
    description: 'Que tus clientes vuelvan al salón: tarjeta digital en el celular, avisos, premios y recuperación de clientes que dejaron de venir.',
  },
}

const steps = [
  { num: '01', title: 'Escanea el QR del salón', desc: 'En el mostrador o en el espejo. Pone su nombre y su teléfono, y la tarjeta queda guardada en su celular.' },
  { num: '02', title: 'Suma un sello en cada turno', desc: 'Al terminar el servicio escanea el QR o acerca el celular al cartelito. Se suma solo, sin que nadie anote nada.' },
  { num: '03', title: 'Se lleva su premio', desc: 'Al completar la tarjeta recibe un cupón único. Se lo mostrás a la peluquera, lo canjeás y arranca de nuevo.' },
]

const reasons = [
  {
    title: 'Ganá el próximo turno',
    desc: 'Una tarjeta con premio a la vista es una razón concreta para volver a vos y no probar otro salón.',
  },
  {
    title: 'Premiá a tus mejores clientes',
    desc: 'Quienes vienen seguido son los que más te dejan. Con la tarjeta ves quiénes son y los cuidás.',
  },
  {
    title: 'Estate presente entre visita y visita',
    desc: 'Una notificación en el celular con una promo o un recordatorio llega mucho más que una historia de Instagram.',
  },
]

const features = [
  {
    icon: '🔔',
    title: 'Avisos al celular',
    desc: 'Mandá promos, novedades o un “tenemos turnos libres esta semana” directo a la pantalla de tus clientes.',
  },
  {
    icon: '💌',
    title: 'Recuperá a los que dejaron de venir',
    desc: 'Calificar detecta a quienes hace tiempo no vienen y les manda un mensaje automático para que vuelvan. Elegís vos el horario.',
  },
  {
    icon: '🎰',
    title: 'Ruleta de premios',
    desc: 'Sumá un toque de juego: tus clientes giran la ruleta y ganan descuentos o regalos. Más ganas de volver.',
  },
  {
    icon: '🎂',
    title: 'Regalo de cumpleaños',
    desc: 'Un saludo y un regalo automático el día del cumpleaños de cada cliente. Ese día suele ser un turno asegurado.',
  },
  {
    icon: '📍',
    title: 'Varias sucursales',
    desc: 'Si tenés más de un salón, la tarjeta es la misma y ves las métricas de cada local por separado.',
  },
  {
    icon: '📊',
    title: 'Panel simple',
    desc: 'Quién vino, cuántas veces, cuántos premios se canjearon y qué día es el más fuerte del salón.',
  },
]

const rewardIdeas = [
  { service: 'Peluquería', ideas: ['Cada 8 cortes, el siguiente es gratis', 'Lavado y brushing de regalo en el 6° turno'] },
  { service: 'Uñas', ideas: ['Cada 5 manicuras, un diseño de regalo', 'Esmaltado semipermanente gratis en el 8° turno'] },
  { service: 'Pestañas y cejas', ideas: ['Retoque a mitad de precio al completar la tarjeta', 'Perfilado de cejas gratis en el 5° turno'] },
  { service: 'Estética y spa', ideas: ['Una limpieza facial de regalo cada 6 sesiones', 'Un 20% en tu próximo tratamiento corporal'] },
]

const faqs = [
  { q: '¿Mis clientes tienen que descargar una app?', a: 'No. La tarjeta se guarda en el celular (Google Wallet en Android) o se abre desde un link, sin instalar nada.' },
  { q: '¿Cuánto tarda en estar lista?', a: 'Entre cinco y diez minutos: subís tu logo, elegís cuántos sellos pide la tarjeta y qué premio se lleva la clienta. Después imprimís el QR y lo ponés en el mostrador.' },
  { q: '¿Cómo recupero a clientes que hace tiempo no vienen?', a: 'Activás la reactivación y Calificar avisa automáticamente a quienes pasaron un tiempo sin sumar sellos. Vos elegís cuánto tiempo y a qué hora sale el mensaje.' },
  { q: '¿Qué premios funcionan mejor en un salón?', a: 'Los que se sienten cercanos: un servicio de regalo (un brushing, un diseño de uñas) suele convencer más que un descuento chico. Arriba te dejamos algunas ideas.' },
  { q: '¿Es difícil para mi equipo?', a: 'No. Sumar un sello lleva unos segundos con el QR o el cartelito NFC, y el panel funciona desde el celular.' },
  { q: '¿Puedo probarlo antes de pagar?', a: 'Sí. Tenés 14 días gratis, sin tarjeta de crédito.' },
]

export default function SalonesDeBellezaPage() {
  return (
    <div className="font-sans text-zinc-900 bg-white">

      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b" style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px)', borderColor: 'rgba(24,24,27,0.08)' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/fidelizacion" className="font-extrabold text-lg tracking-tight text-zinc-900">
            calificar <span className="text-violet-600">fidelización</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
            <a href="#como-funciona" className="hover:text-zinc-900 transition-colors">Cómo funciona</a>
            <a href="#funcionalidades" className="hover:text-zinc-900 transition-colors">Funcionalidades</a>
            <a href="#premios" className="hover:text-zinc-900 transition-colors">Ideas de premios</a>
            <Link href="/fidelizacion#precios" className="hover:text-zinc-900 transition-colors">Precios</Link>
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
            <p className="inline-flex items-center gap-2 bg-white border border-violet-200 text-violet-700 font-semibold text-xs uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
              ✂️ Para salones de belleza
            </p>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6">
              Que tus clientes
              <br />
              <span className="text-violet-600">vuelvan al salón.</span>
            </h1>
            <p className="text-zinc-600 text-lg leading-relaxed mb-8 max-w-md">
              La tarjeta de sellos digital para peluquerías, uñas, pestañas, estética y spa. Reemplaza el papelito, premia cada turno y te ayuda a recuperar a quienes dejaron de venir.
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

          {/* Celular con la tarjeta de un salón de ejemplo */}
          <div className="relative mx-auto lg:ml-auto w-72 sm:w-[320px] h-[640px] flex items-center justify-center mt-12 lg:mt-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[500px] bg-violet-400/40 blur-[100px] rounded-full -z-10 pointer-events-none" />
            <div className="relative transform rotate-[-5deg]">
              <div className="relative w-72 sm:w-[320px] h-[640px] rounded-[48px] shadow-[15px_25px_50px_rgba(76,29,149,0.35)] border-[8px] border-[#18181b] bg-[#18181b]">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[90px] h-[26px] bg-black rounded-full z-40" />
                <div className="relative w-full h-full rounded-[40px] overflow-hidden bg-[#09090b]">
                  <PhoneCardPreview customer="Lucía Fernández" business="Tu salón" reward="Brushing de regalo" icon="scissors" />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-[4px] bg-white/40 rounded-full z-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUÉ ES */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-3">Pensado para tu rubro</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-5">Una clienta que vuelve vale más que diez que pasan una vez</h2>
          <p className="text-zinc-600 text-lg leading-relaxed">
            En un salón, la mayor parte de lo que facturás viene de quienes ya te eligieron. Calificar te ayuda a que esas personas te sigan eligiendo: cada turno suma un sello, cada sello las acerca a un premio, y vos ves quién vuelve y quién se fue enfriando.
          </p>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="py-24 px-6" style={{ background: '#FAF7FF' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-3">Cómo funciona</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Así lo vive tu cliente en el salón</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map(s => (
              <div key={s.num} className="bg-white border border-zinc-200 rounded-3xl p-7 shadow-sm shadow-violet-100">
                <div className="w-11 h-11 rounded-full bg-violet-100 text-violet-700 font-extrabold flex items-center justify-center mb-5">{s.num}</div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POR QUÉ */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-3">Por qué fidelizar</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Más turnos de los que ya te conocen</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reasons.map(r => (
              <div key={r.title} className="rounded-3xl p-7 border border-zinc-200" style={{ background: 'linear-gradient(180deg,#FFFFFF 0%,#F8F4FF 100%)' }}>
                <h3 className="font-bold text-lg mb-2">{r.title}</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section id="funcionalidades" className="py-24 px-6" style={{ background: '#FAF7FF' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-3">Funcionalidades</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Mucho más que un sello</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm shadow-violet-100">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-base mb-2">{f.title}</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IDEAS DE PREMIOS */}
      <section id="premios" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-3">Ideas de premios</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Qué regalar según tu servicio</h2>
            <p className="text-zinc-600 mt-4 max-w-xl mx-auto">Podés poner el premio y la cantidad de sellos que quieras. Estas son algunas ideas para arrancar.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {rewardIdeas.map(r => (
              <div key={r.service} className="border border-zinc-200 rounded-3xl p-6">
                <h3 className="font-bold text-lg text-violet-700 mb-3">{r.service}</h3>
                <ul className="space-y-2 text-sm text-zinc-600">
                  {r.ideas.map(i => (
                    <li key={i} className="flex gap-2"><span className="text-violet-500">✓</span><span>{i}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6" style={{ background: '#FAF7FF' }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold tracking-tight text-center mb-10">Preguntas frecuentes</h2>
          <div className="space-y-3">
            {faqs.map(f => (
              <details key={f.q} className="group bg-white border border-zinc-200 rounded-2xl px-5 py-4">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-semibold text-sm">
                  {f.q}
                  <span className="text-violet-600 text-lg transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="text-zinc-600 text-sm leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-6 text-center" style={{ background: 'linear-gradient(135deg,#7C3AED 0%,#6D28D9 100%)' }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">¿Listo para que tus clientes vuelvan?</h2>
          <p className="text-violet-100 mb-8">Armá la tarjeta de tu salón en unos minutos. 14 días gratis, sin tarjeta de crédito.</p>
          <Link
            href="/fidelizacion/onboarding"
            className="inline-block bg-white text-violet-700 font-bold px-8 py-4 rounded-2xl text-base hover:bg-violet-50 transition-colors"
          >
            Empezar 14 días gratis
          </Link>
          <p className="text-violet-200 text-xs mt-4">
            ¿Querés ver los planes? <Link href="/fidelizacion#precios" className="underline">Mirá los precios</Link>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-200 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-zinc-500">
          <Link href="/" className="font-extrabold text-zinc-900">calificar</Link>
          <div className="flex gap-6">
            <Link href="/fidelizacion" className="hover:text-zinc-900 transition-colors">Fidelización</Link>
            <a href="mailto:hola@calificar.com.ar" className="hover:text-zinc-900 transition-colors">Contacto</a>
            <Link href="/admin/fidelizacion" className="hover:text-zinc-900 transition-colors">Ingresar</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
