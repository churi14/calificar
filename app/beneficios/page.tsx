import Link from 'next/link'
import type { Metadata } from 'next'
import DarkLayout from '@/components/landing/DarkLayout'

export const metadata: Metadata = {
  title: 'Beneficios — Por qué tener un cartel de reseñas NFC',
  description: 'Descubrí por qué más reseñas en Google aumentan las visitas a tu negocio. El cartel NFC + QR de Calificar funciona solo, sin apps y en 3 segundos.',
  alternates: { canonical: 'https://calificar.com.ar/beneficios' },
  openGraph: {
    title: 'Beneficios del cartel NFC de reseñas — Calificar',
    description: 'Más reseñas en Google, clientes que eligen tu local y control sobre tu reputación online. Sin apps, sin fricción.',
    url: 'https://calificar.com.ar/beneficios',
  },
}

const WA = 'https://wa.me/5491123867934?text=Hola!%20Quiero%20info%20sobre%20Calificar%20para%20mi%20local.'

const BENEFITS = [
  {
    icon: '⭐',
    title: 'Más reseñas 5 estrellas en Google',
    desc: 'El sistema dirige a los clientes satisfechos directamente a tu perfil de Google. Cuantas más reseñas positivas tengas, más alto aparecés en Google Maps cuando alguien busca un local como el tuyo.',
    accent: 'rgba(234,179,8,0.12)',
    accentBorder: 'rgba(234,179,8,0.2)',
    iconColor: 'rgba(234,179,8,0.2)',
  },
  {
    icon: '🛡️',
    title: 'Las quejas no llegan a internet',
    desc: 'Cuando un cliente no está del todo satisfecho, el sistema lo redirige a vos en privado antes de que pueda publicar una mala reseña. Podés resolver el problema sin que nadie más lo vea.',
    accent: 'rgba(34,197,94,0.10)',
    accentBorder: 'rgba(34,197,94,0.15)',
    iconColor: 'rgba(34,197,94,0.15)',
  },
  {
    icon: '📱',
    title: 'Sin apps, sin fricción',
    desc: 'El cliente apoya el celular cerca del cartel o escanea el QR. En tres segundos ya está calificando. No necesita instalar nada, crear cuenta ni tener datos especiales.',
    accent: 'rgba(59,130,246,0.10)',
    accentBorder: 'rgba(59,130,246,0.15)',
    iconColor: 'rgba(59,130,246,0.15)',
  },
  {
    icon: '📊',
    title: 'Métricas en tiempo real',
    desc: 'Desde tu panel ves cuántos clientes pasaron por el funnel, cuántos fueron a Google y cuántos te dejaron feedback privado. Todo por local y por período.',
    accent: 'rgba(124,58,237,0.10)',
    accentBorder: 'rgba(124,58,237,0.15)',
    iconColor: 'rgba(124,58,237,0.15)',
  },
  {
    icon: '👥',
    title: 'Medí el desempeño de tu equipo',
    desc: 'Cada mozo, vendedor o empleado puede tener su propia tarjeta o QR. Ves quién genera más reseñas y podés reconocer al que más se esfuerza en atender bien.',
    accent: 'rgba(236,72,153,0.10)',
    accentBorder: 'rgba(236,72,153,0.15)',
    iconColor: 'rgba(236,72,153,0.15)',
  },
  {
    icon: '🔗',
    title: 'Link dinámico, siempre actualizado',
    desc: 'El destino del QR y el NFC se puede cambiar en cualquier momento desde tu panel, sin cambiar el cartel físico. Si cambiás de lugar de Google, listo — actualizás el link y el cartel sigue funcionando.',
    accent: 'rgba(249,115,22,0.10)',
    accentBorder: 'rgba(249,115,22,0.15)',
    iconColor: 'rgba(249,115,22,0.15)',
  },
]

const STATS = [
  { value: '3 seg', label: 'es todo lo que tarda un cliente en calificar' },
  { value: '+300%', label: 'más reseñas en los primeros 90 días (promedio)' },
  { value: '0 apps', label: 'el cliente no tiene que instalar nada' },
]

export default function BeneficiosPage() {
  return (
    <DarkLayout>
      {/* HERO */}
      <section className="pt-14 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.10) 0%, transparent 60%)' }} />
        <div className="relative max-w-3xl mx-auto">
          <span className="inline-block text-violet-300 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}>
            Por qué Calificar
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-6">
            Un sistema que trabaja mientras vos atendés
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Cada cliente que pasa por tu local es una oportunidad de mejorar tu reputación online. Calificar convierte esa oportunidad en acción automáticamente, sin que tengas que pedirle nada a nadie.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="px-6 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="rounded-2xl px-8 py-8 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-3xl md:text-4xl font-extrabold text-violet-400 mb-2 tabular-nums">{s.value}</p>
              <p className="text-slate-400 text-sm leading-relaxed">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS GRID */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-extrabold text-white text-center mb-3">
            Todo lo que ganás con el sistema
          </h2>
          <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
            Desde el primer día que instalás el cartel, el sistema empieza a trabajar para tu reputación.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map(b => (
              <div key={b.title} className="rounded-3xl p-8" style={{ background: b.accent, border: `1px solid ${b.accentBorder}` }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5" style={{ background: b.iconColor }}>
                  {b.icon}
                </div>
                <h3 className="font-extrabold text-white text-lg mb-3">{b.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl font-extrabold text-white mb-3">Así de simple es</h2>
          <p className="text-slate-400 mb-12">Tres pasos. Sin complicaciones.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { n: '1', t: 'El cliente escanea', d: 'Apoya el celu al cartel NFC o escanea el QR. Sin apps, sin registro.' },
              { n: '2', t: 'Califica su experiencia', d: 'Si fue positiva, va directo a Google. Si no, te escribe a vos en privado.' },
              { n: '3', t: 'Vos ves todo', d: 'Desde el panel ves scans, positivos, negativos y el desempeño por empleado.' },
            ].map(s => (
              <div key={s.n} className="rounded-3xl p-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-10 h-10 bg-violet-600 text-white rounded-full flex items-center justify-center font-extrabold text-lg mb-5 mx-auto">
                  {s.n}
                </div>
                <h3 className="font-extrabold text-white mb-3">{s.t}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 pb-20">
        <div className="max-w-2xl mx-auto text-center rounded-3xl p-12" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(99,102,241,0.08) 100%)', border: '1px solid rgba(124,58,237,0.3)' }}>
          <h2 className="font-display text-3xl font-extrabold text-white mb-4">
            ¿Listo para multiplicar tus reseñas?
          </h2>
          <p className="text-slate-400 mb-10">Hablemos. Te contamos cómo funciona y qué cartel le conviene a tu local.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={WA} target="_blank"
              className="inline-flex items-center justify-center bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-4 rounded-full transition-colors shadow-lg shadow-violet-900/40 text-base">
              Quiero mi sistema →
            </a>
            <Link href="/r/demo"
              className="inline-flex items-center justify-center border border-white/15 text-white font-semibold px-8 py-4 rounded-full hover:bg-white/5 transition-colors text-base">
              Ver demo
            </Link>
          </div>
        </div>
      </section>
    </DarkLayout>
  )
}
