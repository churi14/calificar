import Link from 'next/link'

export const metadata = {
  title: '¿Cómo funciona? — Calificar',
  description: 'Transparencia total. Entendé el modelo de servicio de Calificar en 3 niveles: hardware, software y dominio propio.',
}

const SECTIONS = [
  {
    num: '01',
    badge: 'Pago único',
    badgeColor: 'bg-[#FBCAD8] text-[#0F172A]',
    icon: '🪧',
    title: 'El Cartel Físico',
    subtitle: 'Pago Único',
    desc: 'Te entregamos el cartel de mostrador, mesa o pared (en PVC, Acrílico, etc.) equipado con un código QR y un chip NFC. Por defecto, este cartel dirige directamente a tu perfil de Google Reviews. Lo pagás una sola vez y es tuyo.',
    highlight: null as string | null,
    highlightLabel: null as string | null,
    includes: null as string[] | null,
  },
  {
    num: '02',
    badge: 'Suscripción mensual',
    badgeColor: 'bg-[#056E4B]/10 text-[#056E4B]',
    icon: '⚙️',
    title: 'Sistema Inteligente de Reseñas',
    subtitle: 'Suscripción Mensual',
    desc: 'Si querés el filtro inteligente —las opiniones positivas van a Google y las negativas te llegan por privado para atajarlas— el sistema "Calificar" se contrata aparte por un valor mínimo mensual.',
    highlight: null,
    highlightLabel: null,
    includes: null,
  },
  {
    num: '03',
    badge: 'Anual + Mensual',
    badgeColor: 'bg-[#0F172A] text-white',
    icon: '🔗',
    title: 'Tu Dominio, Tu Control',
    subtitle: 'Anual + Mensual',
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
    <div className="min-h-screen bg-white text-gray-900">

      {/* NAV */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-extrabold text-xl text-[#0F172A] flex items-center gap-1.5">
            <img src="/logo.svg" alt="Calificar" className="h-7 w-auto" /><span className="font-extrabold text-xl text-[#0F172A]">Calificar</span></Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </nav>

      {/* HEADER */}
      <section className="bg-[#F5EFE7] py-20 px-6 text-center">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Transparencia total</span>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#0F172A] max-w-3xl mx-auto leading-tight mb-4">
          ¿Cómo funciona nuestro servicio?
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Elegí la solución que mejor se adapte a tu local.
        </p>
      </section>

      {/* SECCIONES */}
      <section className="max-w-3xl mx-auto px-6 py-20 space-y-10">
        {SECTIONS.map((s) => (
          <div key={s.num} className="rounded-[2rem] border border-gray-100 bg-white shadow-sm overflow-hidden">

            {/* Header de la tarjeta */}
            <div className="flex items-start gap-5 p-8 pb-0">
              <div className="w-14 h-14 rounded-2xl bg-[#F5EFE7] flex items-center justify-center text-2xl flex-shrink-0">
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.badgeColor}`}>{s.badge}</span>
                </div>
                <h2 className="font-display font-extrabold text-[#0F172A] text-2xl sm:text-3xl leading-tight">
                  {s.num}. {s.title}
                </h2>
              </div>
            </div>

            {/* Body */}
            <div className="px-8 pb-8 pt-5">
              <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                {s.desc}
              </p>

              {/* Highlight */}
              {s.highlight && (
                <div className="mt-6 bg-[#0F172A] rounded-2xl p-6">
                  <p className="text-xs font-bold text-[#FBCAD8] uppercase tracking-widest mb-2">{s.highlightLabel}</p>
                  <p className="text-white leading-relaxed">{s.highlight}</p>
                </div>
              )}

              {/* Includes */}
              {s.includes && (
                <div className="mt-5 bg-[#F5EFE7] rounded-2xl p-5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">El pago incluye</p>
                  <ul className="space-y-2">
                    {s.includes.map(item => (
                      <li key={item} className="flex items-start gap-3 text-sm text-[#0F172A] font-medium">
                        <span className="text-[#056E4B] mt-0.5 flex-shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* NOTA ACLARATORIA */}
        <div className="flex items-start gap-3 bg-gray-50 rounded-2xl px-6 py-5 border border-gray-100">
          <span className="text-lg flex-shrink-0">⚠️</span>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Importante</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              La cuota mensual cubre el mantenimiento del software, dominio y soporte digital. No incluye reposición por daños físicos, roturas o extravío del cartel.
            </p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-[#0F172A] py-20 px-6 text-center">
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-4">
          ¿Listo para arrancar?
        </h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Elegí el plan que más se adapte y empezá a recibir más reseñas en Google.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/tienda"
            className="inline-flex items-center justify-center bg-[#FBCAD8] text-[#0F172A] font-bold px-8 py-4 rounded-full hover:bg-white transition-colors text-base shadow-lg">
            Ver productos →
          </Link>
          <Link href="/r/demo"
            className="inline-flex items-center justify-center border border-white/20 text-white font-semibold px-8 py-4 rounded-full hover:bg-white/10 transition-colors text-base">
            Ver demo
          </Link>
        </div>
      </section>
    </div>
  )
}
