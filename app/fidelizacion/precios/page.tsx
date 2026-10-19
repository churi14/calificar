import type { Metadata } from 'next'
import Link from 'next/link'
import { PLAN_PRICES_ARS, fmtARS } from '@/lib/plans'

export const metadata: Metadata = {
  title: 'Planes y precios de Calificar Fidelización · Starter, Pro y Ultimate',
  description: `Qué incluye cada plan de la tarjeta de sellos digital: Starter (${fmtARS(PLAN_PRICES_ARS.starter)}), Pro (${fmtARS(PLAN_PRICES_ARS.pro)}) y Ultimate (${fmtARS(PLAN_PRICES_ARS.ultimate)}) por mes. 14 días de prueba, sin tarjeta de crédito.`,
  openGraph: {
    title: 'Planes de Calificar Fidelización',
    description: `Tarjetas de sellos digitales para tu negocio, desde ${fmtARS(PLAN_PRICES_ARS.starter)} por mes. 14 días de prueba.`,
  },
}

type Cell = boolean | string

/** Todas las funciones, plan por plan. Una sola tabla para que se vea de un vistazo qué cambia. */
const TABLE: { group: string; rows: { name: string; hint?: string; starter: Cell; pro: Cell; ultimate: Cell }[] }[] = [
  {
    group: 'Tu tarjeta',
    rows: [
      { name: 'Tarjeta digital con tu logo', hint: 'Se abre desde un link y se instala como una app, sin descargar nada.', starter: true, pro: true, ultimate: true },
      { name: 'Cartelito NFC y QR para el mostrador', starter: true, pro: true, ultimate: true },
      { name: 'Sello rápido, manual o escaneando al cliente', starter: true, pro: true, ultimate: true },
      { name: 'Link de sello de un solo uso para pedidos por WhatsApp', hint: 'Pensado para delivery y dark kitchens: se manda con cada pedido y no se puede compartir.', starter: true, pro: true, ultimate: true },
      { name: 'Cupones únicos para canjear los premios', hint: 'Cada premio genera un código que no se puede repetir.', starter: true, pro: true, ultimate: true },
      { name: 'Tarjeta en Google Wallet', hint: 'El cliente la guarda en la billetera de su celular.', starter: false, pro: true, ultimate: true },
      { name: 'Diseño completo', hint: 'Plantillas, colores propios, íconos de los sellos y de la app, y fondo.', starter: false, pro: true, ultimate: true },
      { name: 'Premios en el camino', hint: 'Por ejemplo uno en el sello 3, otro en el 6 y el grande al final.', starter: false, pro: true, ultimate: true },
      { name: 'Tarjeta sin la marca Calificar', starter: false, pro: false, ultimate: true },
    ],
  },
  {
    group: 'Tus clientes',
    rows: [
      { name: 'Lista de clientes con búsqueda', starter: true, pro: true, ultimate: true },
      { name: 'Agregar un cliente a mano', starter: true, pro: true, ultimate: true },
      { name: 'Exportar tus clientes a Excel', hint: 'Nombre, teléfono, sellos y visitas.', starter: false, pro: true, ultimate: true },
    ],
  },
  {
    group: 'Avisos y campañas',
    rows: [
      { name: 'Avisos ilimitados al celular de tus clientes', hint: 'Les llegan como una notificación más, sin que instalen nada.', starter: false, pro: true, ultimate: true },
      { name: 'Avisos a grupos ya armados', hint: 'Los que no vienen hace un tiempo, los nuevos, los que están cerca del premio, los que cumplen años.', starter: false, pro: true, ultimate: true },
      { name: 'Avisos a grupos que armás con tus reglas', hint: 'Por cantidad de sellos, de visitas, días sin venir y más.', starter: false, pro: false, ultimate: true },
      { name: 'Aviso cuando pasan cerca de tu local', starter: false, pro: true, ultimate: true },
      { name: 'Cumpleaños automáticos', hint: 'Un saludo y un regalo el día del cumpleaños de cada cliente.', starter: false, pro: true, ultimate: true },
      { name: 'Recuperar clientes que dejaron de venir', hint: 'Un aviso automático a los 5, 15 y 30 días sin visita.', starter: false, pro: true, ultimate: true },
      { name: 'Recuperar según la frecuencia de cada cliente', hint: 'Avisa cuando alguien tarda más de lo normal en volver.', starter: false, pro: false, ultimate: true },
      { name: 'Pedir reseñas en Google', starter: false, pro: true, ultimate: true },
      { name: 'Referidos: traé un amigo', hint: 'Los dos suman un sello. Vos lo prendés o lo apagás cuando quieras.', starter: false, pro: true, ultimate: true },
      { name: 'Ruleta de la suerte', starter: false, pro: false, ultimate: true },
    ],
  },
  {
    group: 'Tus números',
    rows: [
      { name: 'Panel con lo que pasa hoy', starter: true, pro: true, ultimate: true },
      { name: 'Calculadora de ganancias en pesos', starter: true, pro: true, ultimate: true },
      { name: 'Métricas de cada local por separado', starter: false, pro: true, ultimate: true },
      { name: 'Estadísticas de actividad', hint: 'Qué días y a qué hora vienen más tus clientes.', starter: false, pro: false, ultimate: true },
    ],
  },
  {
    group: 'Locales y equipo',
    rows: [
      { name: 'Locales con una sola tarjeta compartida', hint: 'El cliente suma y canjea en cualquiera de tus locales.', starter: '1', pro: 'Hasta 3 (más con locales extra)', ultimate: 'Hasta 50' },
      { name: 'Equipo con usuario propio', hint: 'Cada empleado entra con su email y da sellos sin usar tu contraseña.', starter: false, pro: false, ultimate: true },
      { name: 'Dominio propio para tu tarjeta', starter: false, pro: false, ultimate: true },
    ],
  },
  {
    group: 'Ayuda',
    rows: [
      { name: 'Soporte en español por WhatsApp o correo', starter: true, pro: true, ultimate: true },
    ],
  },
]

const PLANS = [
  {
    slug: 'starter',
    name: 'Starter',
    tag: 'Para empezar con un local',
    price: PLAN_PRICES_ARS.starter,
    perDay: '$500 por día',
    blurb: 'Reemplazá las tarjetitas de papel y empezá a saber quiénes vuelven.',
    items: [
      'Tarjeta digital con tu logo',
      'Cartelito NFC y QR para el mostrador',
      'Sello rápido, manual o escaneando',
      'Cupones únicos para los premios',
      'Lista de clientes y panel',
      '1 local',
    ],
    highlight: false,
  },
  {
    slug: 'pro',
    name: 'Pro',
    tag: 'Para hacer que vuelvan más',
    price: PLAN_PRICES_ARS.pro,
    perDay: '$1.000 por día',
    blurb: 'Todo lo de Starter, más avisos, campañas automáticas y tu tarjeta con tu estilo.',
    items: [
      'Todo lo de Starter',
      'Avisos ilimitados, también a grupos de clientes',
      'Cumpleaños, reseñas y recuperación de clientes',
      'Referidos y aviso al pasar cerca',
      'Google Wallet y diseño completo',
      'Premios en el camino y exportar clientes',
      'Hasta 3 locales con métricas de cada uno',
    ],
    highlight: true,
  },
  {
    slug: 'ultimate',
    name: 'Ultimate',
    tag: 'Para cadenas y muchos locales',
    price: PLAN_PRICES_ARS.ultimate,
    perDay: '$2.333 por día',
    blurb: 'Todo lo de Pro, más herramientas para crecer y manejar un equipo.',
    items: [
      'Todo lo de Pro',
      'Ruleta de la suerte',
      'Recuperar según la frecuencia de cada cliente',
      'Grupos de clientes con tus propias reglas',
      'Estadísticas de actividad',
      'Equipo con usuario propio',
      'Tarjeta sin marca Calificar y dominio propio',
      'Hasta 50 locales',
    ],
    highlight: false,
  },
]

const FAQS = [
  {
    q: '¿Se cobra por cantidad de clientes?',
    a: 'No. Las tarjetas son ilimitadas en los tres planes: tener 50 o 5.000 clientes cuesta lo mismo. Lo que cambia entre un plan y otro son las funciones y la cantidad de locales.',
  },
  {
    q: '¿Cómo funciona la prueba de 14 días?',
    a: 'Armás tu tarjeta y probás casi todo sin poner ninguna tarjeta de crédito. Al terminar, elegís el plan que te sirva. Si no elegís ninguno, tu tarjeta sigue funcionando, pero se ve con un diseño genérico y la marca Calificar.',
  },
  {
    q: '¿Qué es una "tarjeta compartida" entre locales?',
    a: 'Es una sola tarjeta para todos tus locales. Un cliente puede sumar un sello en uno y otro en otro, y canjear el premio en cualquiera. En el panel ves cuánto pasó en cada local por separado.',
  },
  {
    q: '¿Mi cliente tiene que instalar algo?',
    a: 'No. Escanea el QR del mostrador, pone su nombre y teléfono, y la tarjeta queda en su celular. Con Pro además puede guardarla en la billetera del teléfono (Google Wallet).',
  },
  {
    q: '¿Cómo se paga?',
    a: 'Con Mercado Pago, con cualquiera de sus medios de pago. Cada pago activa 30 días del plan.',
  },
  {
    q: '¿Puedo cambiar de plan?',
    a: 'Sí, cuando quieras desde el panel, hacia arriba cuando crezcas o hacia abajo si lo necesitás.',
  },
  {
    q: '¿Y si tengo más de 3 locales y no necesito Ultimate?',
    a: 'En Pro podés sumar locales extra de a uno. Pedilos por WhatsApp desde la pantalla de tu plan y te los activamos.',
  },
  {
    q: '¿Mis datos son míos?',
    a: 'Sí. En Pro y Ultimate exportás tu lista de clientes a Excel desde el panel. Si estás en Starter y querés tu lista, escribinos por WhatsApp y te la pasamos.',
  },
]

function Mark({ value }: { value: Cell }) {
  if (typeof value === 'string') return <span className="text-xs font-bold text-violet-700">{value}</span>
  return value
    ? <span className="text-violet-600 font-extrabold" aria-label="Incluido">✓</span>
    : <span className="text-zinc-300" aria-label="No incluido">—</span>
}

export default function PreciosPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Nav */}
      <nav className="border-b border-zinc-100 sticky top-0 bg-white/90 backdrop-blur z-40">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/fidelizacion" className="font-extrabold text-zinc-900 text-lg tracking-tight">
            Calificar
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/negocio/fidelizacion" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors hidden sm:block">
              Iniciar sesión
            </Link>
            <Link href="/fidelizacion/onboarding" className="text-sm font-bold bg-violet-600 text-white px-4 py-2 rounded-xl hover:bg-violet-500 transition-colors">
              Probá 14 días gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 pb-12 text-center" style={{ background: 'linear-gradient(180deg, #F3EEFF 0%, #FFFFFF 100%)' }}>
        <div className="max-w-5xl mx-auto px-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600 mb-4">Planes y precios</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 leading-tight mb-5">
            Elegí el plan según<br className="hidden sm:block" /> cuánto querés que vuelvan.
          </h1>
          <p className="text-zinc-600 text-lg leading-relaxed max-w-2xl mx-auto">
            Tarjetas ilimitadas en los tres planes: no pagás más por tener más clientes.
            Probás 14 días sin tarjeta de crédito y elegís después.
          </p>
        </div>
      </section>

      {/* Planes */}
      <section className="max-w-5xl mx-auto px-5 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {PLANS.map(p => (
            <div
              key={p.slug}
              className={`relative rounded-2xl p-6 flex flex-col ${p.highlight ? 'bg-zinc-900 text-white shadow-2xl' : 'border border-zinc-200 bg-white'}`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full whitespace-nowrap">
                  El más elegido
                </div>
              )}
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2 text-zinc-400">{p.tag}</p>
              <h2 className="text-2xl font-extrabold mb-3">{p.name}</h2>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold">{fmtARS(p.price)}</span>
                <span className="text-sm text-zinc-400">ARS / mes</span>
              </div>
              <p className="text-xs mb-4 text-zinc-400">{p.perDay}</p>
              <p className={`text-sm mb-5 ${p.highlight ? 'text-zinc-300' : 'text-zinc-600'}`}>{p.blurb}</p>
              <ul className={`space-y-2 mb-6 text-sm flex-1 ${p.highlight ? 'text-zinc-300' : 'text-zinc-600'}`}>
                {p.items.map(i => (
                  <li key={i} className="flex gap-2">
                    <span className={`font-bold flex-shrink-0 ${p.highlight ? 'text-violet-400' : 'text-violet-500'}`}>✓</span>{i}
                  </li>
                ))}
              </ul>
              <Link
                href="/fidelizacion/onboarding"
                className={`block text-center py-3 rounded-xl font-bold text-sm transition-all ${
                  p.highlight ? 'bg-violet-600 text-white hover:bg-violet-500' : 'border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                Probá 14 días gratis
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-5">
          <div>
            <p className="font-bold text-zinc-900 text-sm">¿Tenés una cadena grande o necesitás algo especial?</p>
            <p className="text-xs text-zinc-500 mt-0.5">Escribinos y lo armamos a medida.</p>
          </div>
          <a
            href="https://wa.me/5491123867934?text=Hola!%20Quiero%20info%20sobre%20un%20plan%20a%20medida%20para%20Calificar."
            target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm text-white"
            style={{ background: '#25D366' }}
          >
            Hablar por WhatsApp
          </a>
        </div>
      </section>

      {/* Tabla completa */}
      <section className="bg-zinc-50 border-y border-zinc-200 py-16">
        <div className="max-w-5xl mx-auto px-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Todo, plan por plan</p>
          <h2 className="text-3xl font-extrabold text-zinc-900 mb-2">Qué trae cada uno.</h2>
          <p className="text-zinc-500 mb-8">Una sola tabla con todas las funciones, para comparar sin vueltas.</p>

          <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-zinc-200 text-left">
                  <th className="px-5 py-4 font-bold text-zinc-900 w-[46%]">Función</th>
                  <th className="px-3 py-4 font-bold text-zinc-900 text-center">Starter</th>
                  <th className="px-3 py-4 font-bold text-violet-700 text-center">Pro</th>
                  <th className="px-3 py-4 font-bold text-zinc-900 text-center">Ultimate</th>
                </tr>
              </thead>
              {TABLE.map(g => (
                <tbody key={g.group}>
                  <tr className="bg-violet-50/60">
                    <td colSpan={4} className="px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-violet-700">{g.group}</td>
                  </tr>
                  {g.rows.map(r => (
                    <tr key={r.name} className="border-t border-zinc-100 align-top">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-zinc-800">{r.name}</p>
                        {r.hint && <p className="text-xs text-zinc-500 mt-0.5 leading-snug">{r.hint}</p>}
                      </td>
                      <td className="px-3 py-3 text-center"><Mark value={r.starter} /></td>
                      <td className="px-3 py-3 text-center bg-violet-50/30"><Mark value={r.pro} /></td>
                      <td className="px-3 py-3 text-center"><Mark value={r.ultimate} /></td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
          <p className="text-xs text-zinc-400 mt-3">Los precios son por mes, en pesos argentinos. Cada pago con Mercado Pago activa 30 días.</p>
        </div>
      </section>

      {/* Preguntas */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Preguntas</p>
          <h2 className="text-3xl font-extrabold text-zinc-900 mb-8">Lo que más nos preguntan.</h2>
          <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-2xl overflow-hidden bg-white">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="group px-6 py-5 cursor-pointer">
                <summary className="flex items-center justify-between font-semibold text-sm text-zinc-900 list-none select-none">
                  {q}
                  <span className="ml-4 flex-shrink-0 text-zinc-400 group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                </summary>
                <p className="mt-3 text-sm text-zinc-500 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Cierre */}
      <section className="py-20 text-center" style={{ background: 'linear-gradient(135deg,#7C3AED 0%,#6D28D9 100%)' }}>
        <div className="max-w-2xl mx-auto px-5">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Probalo 14 días, sin tarjeta.</h2>
          <p className="text-violet-100 mb-8">Armás tu tarjeta en unos minutos y elegís el plan después.</p>
          <Link
            href="/fidelizacion/onboarding"
            className="inline-block px-8 py-4 rounded-2xl font-extrabold text-base bg-white text-violet-700 hover:bg-violet-50 transition-colors"
          >
            Empezar gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-8">
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <span className="font-bold text-zinc-900">Calificar</span>
          <span>Tarjetas de fidelización digitales · Hecho en Argentina</span>
          <div className="flex gap-4">
            <Link href="/privacidad" className="hover:text-zinc-700">Privacidad</Link>
            <Link href="/terminos" className="hover:text-zinc-700">Términos</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
