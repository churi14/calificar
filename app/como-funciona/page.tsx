import Link from 'next/link'
import type { Metadata } from 'next'
import DarkLayout from '@/components/landing/DarkLayout'

export const metadata: Metadata = {
  title: 'Cómo funciona el cartel de reseñas NFC',
  description: 'El cliente apoya el celular, califica su experiencia y si estuvo conforme va directo a Google. Si no, te escribe a vos en privado. Sin apps, sin fricciones.',
  alternates: { canonical: 'https://calificar.com.ar/como-funciona' },
  openGraph: {
    title: 'Cómo funciona el sistema de reseñas NFC — Calificar',
    description: 'Cartel NFC + QR → cliente califica → positivos van a Google, negativos te llegan a vos. Así de simple.',
    url: 'https://calificar.com.ar/como-funciona',
  },
}

const SECTIONS = [
  {
    num: '01',
    badge: 'Pago único',
    icon: '🪧',
    title: 'El Cartel Físico',
    desc: 'Te entregamos el cartel de mostrador, mesa o pared (en PVC, Acrílico, etc.) equipado con un código QR y un chip NFC. Por defecto, este cartel dirige directamente a tu perfil de Google Reviews. Lo pagás una sola vez y es tuyo.',
    highlight: null as string | null,
    highlightLabel: null as string | null,
    includes: null as string[] | null,
  },
  {
    num: '02',
    badge: 'Suscripción mensual',
    icon: '⚙️',
    title: 'Sistema Inteligente de Reseñas',
    desc: 'Si querés el filtro inteligente —las opiniones positivas van a Google y las negativas te llegan por privado para atajarlas— el sistema "Calificar" se contrata aparte por un valor mínimo mensual.',
    highlight: null,
    highlightLabel: null,
    includes: null,
  },
  {
    num: '03',
    badge: 'Anual + Mensual',
    icon: '🔗',
    title: 'Tu Dominio, Tu Control',
    desc: 'Llevá tu cartel al siguiente nivel. Registramos un dominio propio para tu local (ej: tunegocio.com/calificar) que se vincula al QR y al NFC.',
    highlight: 'Un QR para toda la vida. Al tener dominio propio, tu QR es dinámico. Si mañana querés que el cartel apunte a tu menú digital, a una promoción especial o a un Linktree personalizado, lo cambiamos desde el sistema. El cartel físico jamás se toca ni se vuelve a imprimir.',
    highlightLabel: '✦ La gran ventaja',
    includes: [
      'Costo anual del dominio',
      'Hosting de la plataforma',
      'Linktree personalizado para tu local',
      'Soporte técnico para cambiar los links cuando lo pidas',
    ],
  },
]

export default function ComoFuncionaPage() {
  return (
    <DarkLayout>
      {/* HEADER */}
      <section className="px-6 pt-16 pb-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.10) 0%, transparent 60%)' }} />
        <div className="relative max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-violet-400 mb-5 border border-violet-500/20 px-4 py-1.5 rounded-full">Transparencia total</span>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white max-w-3xl mx-auto leading-tight mb-4">
            ¿Cómo funciona nuestro servicio?
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Elegí la solución que mejor se adapte a tu local.
          </p>
        </div>
      </section>

      {/* SECCIONES */}
      <section className="max-w-3xl mx-auto px-6 pb-20 space-y-5">
        {SECTIONS.map((s) => (
          <div key={s.num} className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-start gap-5 p-8 pb-0">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.15)' }}>
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold px-3 py-1 rounded-full inline-block mb-3" style={{ background: 'rgba(124,58,237,0.12)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)' }}>{s.badge}</span>
                <h2 className="font-display font-extrabold text-white text-2xl sm:text-3xl leading-tight">
                  {s.num}. {s.title}
                </h2>
              </div>
            </div>

            <div className="px-8 pb-8 pt-5">
              <p className="text-slate-400 leading-relaxed text-base sm:text-lg">
                {s.desc}
              </p>

              {s.highlight && (
                <div className="mt-6 rounded-2xl p-6" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">{s.highlightLabel}</p>
                  <p className="text-slate-300 leading-relaxed">{s.highlight}</p>
                </div>
              )}

              {s.includes && (
                <div className="mt-5 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">El pago incluye</p>
                  <ul className="space-y-2">
                    {s.includes.map(item => (
                      <li key={item} className="flex items-start gap-3 text-sm text-slate-300 font-medium">
                        <span className="text-violet-400 mt-0.5 flex-shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* NOTA */}
        <div className="flex items-start gap-3 rounded-2xl px-6 py-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <span className="text-lg flex-shrink-0">⚠️</span>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Importante</p>
            <p className="text-sm text-slate-500 leading-relaxed">
              La cuota mensual cubre el mantenimiento del software, dominio y soporte digital. No incluye reposición por daños físicos, roturas o extravío del cartel.
            </p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto text-center rounded-3xl p-12" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(99,102,241,0.08) 100%)', border: '1px solid rgba(124,58,237,0.3)' }}>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-4">
            ¿Listo para arrancar?
          </h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Elegí el plan que más se adapte y empezá a recibir más reseñas en Google.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/tienda" className="inline-flex items-center justify-center bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-4 rounded-full transition-colors text-base shadow-lg shadow-violet-900/40">
              Ver productos →
            </Link>
            <Link href="/r/demo" className="inline-flex items-center justify-center border border-white/15 text-white font-semibold px-8 py-4 rounded-full hover:bg-white/5 transition-colors text-base">
              Ver demo
            </Link>
          </div>
        </div>
      </section>
    </DarkLayout>
  )
}
