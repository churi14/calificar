import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Precios — Calificar',
  description: 'Planes simples y transparentes para cuidar la reputación de tu local en Google.',
}

const WA = 'https://wa.me/5491123867934?text=Hola!%20Quiero%20info%20sobre%20Calificar%20para%20mi%20local.'
const WA_SERVICIOS = 'https://wa.me/5491123867934?text=Hola!%20Me%20interesan%20los%20servicios%20adicionales%20(redes%2C%20Google%2C%20dominio).'

function fmt(n: number) {
  return '$' + n.toLocaleString('es-AR')
}

const PLANES = [
  {
    name: 'Sistema Calificar',
    badge: null as string | null,
    highlight: false,
    price: 5000,
    period: '/mes',
    setup: null as number | null,
    desc: 'El filtro inteligente de reseñas para tu local. Los clientes felices van a Google, los que tuvieron un problema te escriben en privado.',
    includes: [
      'Filtro inteligente de reseñas',
      'Dashboard con estadísticas en tiempo real',
      'Feedback privado con datos del cliente',
      'Ranking de empleados por reseñas',
      'Código QR descargable',
      'Soporte por WhatsApp',
    ],
    note: null as string | null,
    cta: 'Empezar ahora',
    ctaHref: '/register',
    ctaStyle: 'border',
  },
  {
    name: 'Dominio Propio',
    badge: '★ Recomendado',
    highlight: true,
    price: 5000,
    period: '/mes',
    setup: 30000,
    desc: 'Todo lo del plan Calificar más tu dominio registrado. El QR de tu cartel apunta a tu dirección para siempre — si el día de mañana querés cambiar el destino, lo hacemos sin tocar el cartel.',
    includes: [
      'Todo lo del Sistema Calificar',
      'Registro y gestión del dominio',
      'QR dinámico de por vida',
      'Linktree personalizado con tu marca',
      'Página calificar.ar/tunegocio incluida',
      'Soporte prioritario y cambios de links',
    ],
    note: `${fmt(30000)} pago anual · incluye dominio + configuración completa`,
    cta: 'Quiero este plan',
    ctaHref: WA,
    ctaStyle: 'solid',
  },
]

const SERVICIOS_EXTRA = [
  { icon: '📱', label: 'Gestión de redes sociales', desc: 'Instagram, Facebook y TikTok' },
  { icon: '🗺️', label: 'Alta en Google Business', desc: 'Tu local en Google Maps' },
  { icon: '🌐', label: 'Registro de dominio', desc: 'tulocal.com.ar o .com' },
  { icon: '🖥️', label: 'Sitio web para tu local', desc: 'Landing page profesional' },
  { icon: '⚙️', label: 'Configuración inicial', desc: 'Te ayudamos a arrancar desde cero' },
  { icon: '📸', label: 'Contenido para redes', desc: 'Fotos y diseños para publicar' },
]

export default function PreciosPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* NAV */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-extrabold text-xl text-[#0F172A] flex items-center gap-1.5">
            <span className="text-[#FBCAD8]">★</span> Calificar
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/como-funciona" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
              Cómo funciona
            </Link>
            <Link href="/tienda" className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors hidden sm:block">
              Tienda
            </Link>
            <Link href="/r/demo"
              className="text-sm bg-[#0F172A] text-white font-semibold px-4 py-2 rounded-full hover:bg-[#1E293B] transition-colors">
              Ver demo
            </Link>
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <section className="bg-[#F5EFE7] pt-20 pb-32 px-6 text-center">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Precios</span>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#0F172A] max-w-2xl mx-auto leading-tight mb-4">
          Simple, transparente y sin sorpresas.
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          El cartel lo pagás una vez. El sistema es una cuota mensual mínima. Sin contratos largos.
        </p>
      </section>

      {/* PLANES */}
      <section className="max-w-5xl mx-auto px-6 -mt-16 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLANES.map(plan => (
            <div key={plan.name}
              className={`relative rounded-[2rem] overflow-hidden flex flex-col
                ${plan.highlight
                  ? 'bg-[#0F172A] shadow-2xl'
                  : 'bg-white border border-gray-100 shadow-sm'}`}>

              {plan.badge && (
                <div className="absolute top-6 right-6">
                  <span className="text-xs font-extrabold bg-[#FBCAD8] text-[#0F172A] px-3 py-1.5 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="p-8 flex-1">
                <h2 className={`font-display font-extrabold text-2xl mb-2 ${plan.highlight ? 'text-white' : 'text-[#0F172A]'}`}>
                  {plan.name}
                </h2>
                <p className={`text-sm leading-relaxed mb-6 ${plan.highlight ? 'text-gray-300' : 'text-gray-500'}`}>
                  {plan.desc}
                </p>

                {/* Precio */}
                <div className="mb-2">
                  {plan.setup && (
                    <p className={`text-sm font-semibold mb-1 ${plan.highlight ? 'text-[#FBCAD8]' : 'text-[#056E4B]'}`}>
                      {fmt(plan.setup)} setup único +
                    </p>
                  )}
                  <div className="flex items-end gap-1">
                    <span className={`text-4xl font-black ${plan.highlight ? 'text-white' : 'text-[#0F172A]'}`}>
                      {fmt(plan.price)}
                    </span>
                    <span className={`text-sm font-medium mb-1.5 ${plan.highlight ? 'text-gray-400' : 'text-gray-400'}`}>
                      {plan.period}
                    </span>
                  </div>
                </div>

                {plan.note && (
                  <p className={`text-xs mb-6 ${plan.highlight ? 'text-gray-500' : 'text-gray-400'}`}>{plan.note}</p>
                )}

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.includes.map(f => (
                    <li key={f} className="flex items-start gap-3">
                      <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5
                        ${plan.highlight ? 'bg-[#FBCAD8]/20 text-[#FBCAD8]' : 'bg-[#056E4B]/10 text-[#056E4B]'}`}>
                        <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="2 6 5 9 10 3"/>
                        </svg>
                      </span>
                      <span className={`text-sm ${plan.highlight ? 'text-gray-300' : 'text-gray-600'}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {plan.ctaStyle === 'solid' ? (
                  <a href={plan.ctaHref} target="_blank"
                    className="w-full flex items-center justify-center bg-[#FBCAD8] text-[#0F172A] font-bold py-4 rounded-full hover:bg-white transition-colors text-sm">
                    {plan.cta}
                  </a>
                ) : (
                  <Link href={plan.ctaHref}
                    className="w-full flex items-center justify-center border-2 border-gray-200 text-[#0F172A] font-bold py-4 rounded-full hover:border-gray-400 hover:bg-gray-50 transition-colors text-sm">
                    {plan.cta}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Nota del cartel */}
        <div className="mt-6 bg-[#F5EFE7] rounded-2xl px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-semibold text-[#0F172A] text-sm">¿Y el cartel físico?</p>
            <p className="text-sm text-gray-500 mt-0.5">Los carteles NFC + QR se compran por separado. Pago único, tuyo para siempre.</p>
          </div>
          <Link href="/tienda"
            className="text-sm font-bold text-[#0F172A] border border-[#0F172A] px-5 py-2.5 rounded-full hover:bg-[#0F172A] hover:text-white transition-colors whitespace-nowrap flex-shrink-0">
            Ver tienda →
          </Link>
        </div>
      </section>

      {/* SERVICIOS ADICIONALES */}
      <section className="bg-[#F5EFE7] py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#0F172A] mb-3">
              ¿Necesitás algo más?
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Si todavía no tenés presencia digital, te ayudamos con todo. Desde cero o desde donde estés.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {SERVICIOS_EXTRA.map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-5 flex items-start gap-4 shadow-sm border border-gray-100">
                <div className="w-11 h-11 rounded-xl bg-[#F5EFE7] flex items-center justify-center text-xl flex-shrink-0">
                  {s.icon}
                </div>
                <div>
                  <p className="font-semibold text-[#0F172A] text-sm mb-0.5">{s.label}</p>
                  <p className="text-xs text-gray-400">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a href={WA_SERVICIOS} target="_blank"
              className="inline-flex items-center gap-2.5 bg-[#0F172A] text-white font-bold px-8 py-4 rounded-full hover:bg-[#1E293B] transition-colors shadow-lg text-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Consultar por WhatsApp
            </a>
            <p className="text-xs text-gray-400 mt-3">Te respondemos en menos de 24 hs</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-6 py-20">
        <h2 className="font-display font-extrabold text-3xl text-[#0F172A] text-center mb-10">Preguntas frecuentes</h2>
        <div className="space-y-5">
          {[
            {
              q: '¿Hay contrato mínimo?',
              a: 'No. Podés cancelar cuando quieras. Si cancelás, el cartel sigue funcionando — solo deja de tener el filtro inteligente y el dashboard.',
            },
            {
              q: '¿El cartel va incluido en el plan mensual?',
              a: 'No. El cartel se compra aparte en la tienda y es tuyo para siempre. Los planes son solo por el sistema digital (filtro, dashboard, feedback).',
            },
            {
              q: '¿Qué pasa con mi QR si cancelo el plan de dominio propio?',
              a: 'Si tenés dominio propio, el QR es tuyo y siempre va a apuntar a tu dominio. Si cancelás el plan, el cartel queda apuntando directo a Google — sin el filtro.',
            },
            {
              q: '¿Cómo se paga?',
              a: 'Por transferencia bancaria o Mercado Pago. Te avisamos por WhatsApp cuando se acerca el vencimiento.',
            },
            {
              q: '¿Qué incluye el "soporte" mensual?',
              a: 'Atención por WhatsApp, ayuda para configurar cambios, y mantenimiento del sistema. Si hay una actualización o algo que no funciona, lo resolvemos nosotros.',
            },
          ].map(({ q, a }) => (
            <div key={q} className="border-b border-gray-100 pb-5">
              <p className="font-semibold text-[#0F172A] mb-2">{q}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-[#0F172A] py-20 px-6 text-center">
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-4">
          ¿Arrancamos?
        </h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto text-sm">
          Registrate, configurá tu local en 3 pasos y empezá a recibir más reseñas esta semana.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/register"
            className="inline-flex items-center bg-[#FBCAD8] text-[#0F172A] font-bold px-8 py-4 rounded-full hover:bg-white transition-colors text-sm">
            Crear cuenta gratis →
          </Link>
          <a href={WA} target="_blank"
            className="inline-flex items-center border border-white/20 text-white font-semibold px-8 py-4 rounded-full hover:bg-white/10 transition-colors text-sm">
            Hablar por WhatsApp
          </a>
        </div>
      </section>
    </div>
  )
}