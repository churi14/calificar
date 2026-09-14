import type { Metadata } from 'next'
import Link from 'next/link'
import FaqAccordion from './FaqAccordion'
import DarkLayout from '@/components/landing/DarkLayout'

export const metadata: Metadata = {
  title: 'Calificar para Gastronomía | Más reseñas en Google para tu local',
  description: 'Sistema de cartel QR para restaurantes, bares y cafeterías. El cliente escanea, ve el menú, califica al mozo y te deja una reseña en Google. Sin apps, sin fricciones.',
  keywords: ['reseñas Google restaurante Argentina', 'cartel QR bar cafetería', 'calificar mozo QR', 'gastronomía Google Maps reseñas', 'más reseñas Google negocio gastronómico'],
  openGraph: {
    title: 'Calificar para Gastronomía',
    description: 'Convertí cada mesa en una reseña de Google. Cartel QR con menú digital, calificación del mozo y link directo a Maps.',
    url: 'https://calificar.com.ar/gastronomia',
    type: 'website',
  },
  alternates: { canonical: 'https://calificar.com.ar/gastronomia' },
}

const RUBROS = [
  'Restaurantes', 'Bares', 'Cafeterías', 'Panaderías', 'Heladerías',
  'Rotiserías', 'Pizzerías', 'Hamburgueserías', 'Cervecerías', 'Confiterías',
  'Sushi', 'Comida rápida', 'Sandwicherías', 'Parrillas', 'Bodegones',
  'Empanaderías', 'Boulangeries', 'Creperies', 'Taquerías', 'Bares de vinos',
]

const FAQS = [
  { q: 'Necesito instalar algo en el local?', a: 'No. Recibís un cartel impreso con el QR. El cliente lo escanea con cualquier celular y accede a tu página directamente. Sin app, sin wifi del local.' },
  { q: 'Cómo llega la reseña a mi perfil de Google?', a: 'Al tocar "Calificar en Google Maps", el cliente es redirigido directo a tu ficha en Google. La reseña la escribe ahí con su propia cuenta. Es 100% genuina.' },
  { q: 'Puedo ver las calificaciones del mozo?', a: 'Sí. Desde tu panel en calificar.com.ar podés ver todas las estrellas y comentarios que dejaron los clientes sobre el servicio, por fecha.' },
  { q: 'El menú digital tiene costo extra?', a: 'No. Cargás la URL de tu carta (PDF, Instagram, carta digital, delivery) y aparece automáticamente como primera opción cuando el cliente escanea.' },
  { q: 'Funciona si el cliente no tiene cuenta de Google?', a: 'Puede igual calificar al mozo y ver el menú. La opción de Google Maps requiere que el cliente tenga cuenta, pero las otras dos funcionan sin ningún login.' },
  { q: 'Puedo personalizar el color del cartel QR?', a: 'Sí. Desde el panel podés elegir el color del QR, el fondo y el tamaño. También podés descargarlo sin fondo para imprimir sobre cualquier soporte.' },
]

export default function GastronomiaPage() {
  return (
    <DarkLayout>
      <style>{`
        @property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
        @keyframes step-card-spin { to { --angle: 360deg; } }
        .step-card-wrap { position: relative; padding: 2px; border-radius: 1.1rem; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .step-card-wrap::before { content: ''; position: absolute; inset: 0; border-radius: inherit; background: conic-gradient(from var(--angle), #7c3aed, #d946ef, #818cf8, #7c3aed); animation: step-card-spin 3s linear infinite; opacity: 0; transition: opacity 0.35s ease; }
        .step-card-wrap:hover::before { opacity: 1; }
        .step-card-wrap:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(124, 58, 237, 0.25); }
        .step-card-inner { position: relative; z-index: 1; background: rgba(255,255,255,0.05); border-radius: 1rem; padding: 1.75rem; height: 100%; border: 1px solid rgba(255,255,255,0.07); }
      `}</style>

      {/* HERO */}
      <section className="pt-12 pb-4 px-6 md:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-14">
          <div>
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              Para gastronomía
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.06] text-white mb-6">
              Cada mesa,<br />una reseña<br />en Google.
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-sm mb-8">
              Un cartel QR en la mesa o con el mozo. El cliente escanea, ve el menú, califica al servicio y te deja una reseña. Sin apps ni fricciones.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/register" className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3.5 rounded-full text-base transition-all duration-150 text-center shadow-lg shadow-violet-900/40">
                Empezar gratis
              </Link>
              <Link href="#como-funciona" className="border border-white/15 hover:border-white/25 text-white font-semibold px-6 py-3.5 rounded-full text-base transition-all duration-150 text-center">
                Ver cómo funciona
              </Link>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute -inset-4 bg-violet-500/15 rounded-[3rem] blur-2xl pointer-events-none" />
              <div className="relative w-[300px] rounded-[2.75rem] p-[10px] shadow-2xl shadow-black/60" style={{ background: '#1a1a2e' }}>
                <div className="bg-white rounded-[2.25rem] overflow-hidden">
                  <div className="relative px-5 pt-3 pb-2 flex justify-between items-center text-[10px] text-zinc-400 font-medium" style={{ background: '#f5f0ff' }}>
                    <span>9:41</span>
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[72px] h-[18px] bg-zinc-900 rounded-full" />
                    <span>●●●</span>
                  </div>
                  <div className="px-5 pb-10 pt-5 space-y-3" style={{ background: 'linear-gradient(to bottom, #f5f0ff, white)' }}>
                    <div className="text-center mb-5">
                      <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-lg shadow-violet-200">
                        <span className="text-white text-2xl font-extrabold">P</span>
                      </div>
                      <p className="font-bold text-sm text-zinc-900">La Parrilla de Omar</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Que querés hacer?</p>
                    </div>
                    <div className="space-y-2.5">
                      {[
                        { emoji: '🍽️', label: 'Ver el menú', sub: 'Carta completa del local', color: 'border-zinc-100', arrow: 'text-zinc-300' },
                        { emoji: '⭐', label: 'Calificar al mozo', sub: 'Dejá tu opinión', color: 'border-yellow-200', arrow: 'text-yellow-400' },
                        { emoji: '🗺️', label: 'Reseña en Google', sub: 'Google Maps', color: 'border-blue-100', arrow: 'text-blue-400' },
                      ].map(opt => (
                        <div key={opt.label} className={`flex items-center gap-3 bg-white border ${opt.color} rounded-xl px-3 py-2.5 shadow-sm`}>
                          <span className="text-lg leading-none">{opt.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-zinc-900">{opt.label}</p>
                            <p className="text-[10px] text-zinc-400">{opt.sub}</p>
                          </div>
                          <span className={`${opt.arrow} text-xs`}>→</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-center text-[9px] text-zinc-300 pt-1">Powered by Calificar.com.ar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="px-6 md:px-10 py-12">
        <div className="max-w-4xl mx-auto">
          <blockquote className="text-2xl md:text-3xl font-bold text-white leading-snug mb-6 text-center">
            "El cliente comió bien, pagó la cuenta, y se fue sin dejar reseña."
          </blockquote>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto text-center mb-10">
            No porque no le gustó. Sino porque nadie se lo pidió en el momento justo.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { n: '93%', label: 'de los clientes miran reseñas antes de elegir dónde comer' },
              { n: '7 de 10', label: 'clientes satisfechos no dejan reseña si nadie se los pide' },
              { n: '4.4★', label: 'es el mínimo que los clientes exigen para entrar a un local nuevo' },
            ].map(({ n, label }) => (
              <div key={n} className="rounded-2xl px-8 py-8 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-3xl md:text-4xl font-extrabold text-violet-400 mb-2 tabular-nums">{n}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-16 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 max-w-lg">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-3">Cómo funciona el cartel.</h2>
            <p className="text-slate-400 text-lg">Tres pasos y empezás a recibir reseñas reales.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            {[
              { num: '1', title: 'Pedís tu cartel o agendamos una reunión', body: 'Te mandamos un cartel personalizado listo para usar, o coordinamos una reunión para asesorarte. Puede ser solo QR o también NFC. Pago único, es tuyo para siempre.' },
              { num: '2', title: 'El QR va en la mesa o cada mozo tiene el suyo', body: 'Con un QR por mozo podés ver cuántas veces escanearon su código, sus calificaciones y en qué están fallando. No hace falta avisarle al mozo.' },
              { num: '3', title: 'Las reseñas llegan solas', body: 'El cliente escanea y elige en 10 segundos. Sin buscar tu local en Google, sin excusas, sin fricción. Cada escaneo es una reseña real.' },
            ].map(({ num, title, body }) => (
              <div key={num} className="step-card-wrap">
                <div className="step-card-inner">
                  <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold mb-5">{num}</div>
                  <h3 className="font-bold text-base text-white mb-2 leading-snug">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-8 max-w-lg">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-3">Y lo hacemos crecer.</h2>
            <p className="text-slate-400 text-lg">Servicios para que tu local aparezca primero, en Google, en redes y en la IA.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { tag: 'Presencia en Google', title: 'Optimizamos tu Perfil de Empresa', body: 'Categorías, fotos, horarios, descripción y link directo a reseñas. Todo lo que hace que aparezcas primero cuando alguien busca tu rubro en Maps.' },
              { tag: 'Social Media', title: 'Posicionamos tu local en redes', body: 'Contenido, publicaciones, historias y gestión de comentarios. Vos te ocupás del local, nosotros de que te vean.' },
              { tag: 'Visibilidad en IA', title: 'ChatGPT y Gemini que recomienden tu local', body: 'Trabajamos para que aparezcas cuando alguien pregunta a la IA dónde comer en tu ciudad. Medimos lo que contestan hoy.' },
              { tag: 'El cliente vuelve', title: 'Reservas y fidelización', body: 'Sistema de turnos por WhatsApp, campañas para que el cliente vuelva y seguimiento post-visita.' },
            ].map(({ tag, title, body }) => (
              <div key={tag} className="rounded-2xl p-7" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-3 block">{tag}</span>
                <h3 className="font-bold text-base text-white mb-2 leading-snug">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
                <p className="mt-4 text-xs font-semibold text-violet-400">A consultar</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRES OPCIONES EN UN QR */}
      <section className="py-16 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 max-w-lg">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-3">Tres opciones en un solo QR.</h2>
            <p className="text-slate-400 text-lg">El cliente escanea y elige. Sin cuenta, sin app, sin login.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-3xl p-8 flex flex-col justify-between min-h-[280px]" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <div className="w-12 h-12 bg-orange-500/15 rounded-2xl flex items-center justify-center text-2xl mb-5">🍽️</div>
                <h3 className="font-bold text-xl text-white mb-2">Ver el menú</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Cargás la URL de tu carta y aparece como primera opción. PDF, Instagram, carta digital o delivery.</p>
              </div>
              <p className="mt-6 text-xs font-semibold text-slate-500 uppercase tracking-widest">Incluido</p>
            </div>
            <div className="rounded-3xl p-8 flex flex-col justify-between min-h-[280px]" style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.2)' }}>
              <div>
                <div className="w-12 h-12 bg-yellow-400/20 rounded-2xl flex items-center justify-center text-2xl mb-5">👨‍🍳</div>
                <h3 className="font-bold text-xl text-white mb-2">Calificar al mozo</h3>
                <p className="text-yellow-200/70 text-sm leading-relaxed">El cliente deja 1 a 5 estrellas y un comentario opcional. Vos lo ves desde tu panel.</p>
              </div>
              <div className="flex gap-1 mt-6">
                {[1,2,3,4,5].map(s => <svg key={s} viewBox="0 0 24 24" className="w-5 h-5 fill-yellow-400" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
              </div>
            </div>
            <div className="rounded-3xl p-8 flex flex-col justify-between min-h-[280px]" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-2xl mb-5">🗺️</div>
                <h3 className="font-bold text-xl text-white mb-2">Reseña en Google</h3>
                <p className="text-blue-200/70 text-sm leading-relaxed">Después de calificar al mozo, el cliente llega directo a tu ficha de Google Maps.</p>
              </div>
              <p className="mt-6 text-xs font-semibold text-blue-300/70 uppercase tracking-widest">Directo a Maps</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section className="py-16 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 max-w-lg">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-3">Simple y sin sorpresas.</h2>
            <p className="text-slate-400 text-lg">Una cuota mensual por el sistema. El cartel lo pagás una vez y es tuyo para siempre.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            <div className="rounded-3xl p-8 flex flex-col" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="font-bold text-xl text-white mb-1">Sistema Calificar</p>
              <p className="text-slate-400 text-sm mb-4">Panel, filtro inteligente, QR, estadísticas y calificación de mozos.</p>
              <p className="text-3xl font-extrabold text-white mb-1 tabular-nums">$15.000<span className="text-base font-semibold text-slate-500">/mes</span></p>
              <p className="text-xs text-slate-600 mb-6">Sin setup. Cancelás cuando querés.</p>
              <Link href="/register" className="mt-auto border border-violet-500/40 text-violet-400 hover:bg-violet-500/10 font-semibold px-5 py-3 rounded-full text-sm text-center transition-all duration-150">
                Empezar gratis
              </Link>
            </div>
            <div className="rounded-3xl p-8 flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(99,102,241,0.1) 100%)', border: '1px solid rgba(124,58,237,0.35)' }}>
              <span className="absolute top-4 right-4 bg-violet-500/30 text-violet-200 text-[11px] font-bold px-3 py-1 rounded-full">Recomendado</span>
              <p className="font-bold text-xl text-white mb-1">Dominio Propio</p>
              <p className="text-slate-400 text-sm mb-4">Todo lo anterior más tu URL propia. El QR apunta a tu dominio para siempre.</p>
              <p className="text-3xl font-extrabold text-white mb-1 tabular-nums">$15.000<span className="text-base font-semibold text-violet-300">/mes</span></p>
              <p className="text-xs text-violet-400/70 mb-6">+ $50.000 setup único (dominio + configuración)</p>
              <a href="https://wa.me/5491123867934?text=Hola!%20Quiero%20info%20sobre%20Calificar%20para%20mi%20local." target="_blank" className="mt-auto bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 py-3 rounded-full text-sm text-center transition-colors duration-150 shadow-lg shadow-violet-900/40">
                Consultar por WhatsApp
              </a>
            </div>
          </div>
          <div className="mt-5 max-w-3xl rounded-2xl px-6 py-4 flex items-start gap-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div>
              <p className="font-semibold text-white text-sm">El cartel físico se compra aparte</p>
              <p className="text-slate-500 text-sm mt-0.5">Los carteles NFC + QR son pago único, tuyos para siempre. <Link href="/precios" className="text-violet-400 underline underline-offset-2">Ver opciones de carteles</Link></p>
            </div>
          </div>
        </div>
      </section>

      {/* RUBROS */}
      <section className="py-12 px-6 md:px-10 border-t border-white/6">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-6 text-center">Para todo tipo de local gastronómico</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {RUBROS.map(rubro => (
              <span key={rubro} className="text-slate-400 text-sm font-medium px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {rubro}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 md:px-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl font-extrabold text-white mb-10">Preguntas frecuentes</h2>
          <FaqAccordion faqs={FAQS} />
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-16 px-6 md:px-10">
        <div className="max-w-3xl mx-auto text-center rounded-3xl p-12" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(99,102,241,0.08) 100%)', border: '1px solid rgba(124,58,237,0.3)' }}>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
            Tu local puede tener 10 resenas nuevas este mes.
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Sin pedírselas en persona. Un cartel QR en la mesa hace el trabajo.
          </p>
          <Link href="/register" className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-4 rounded-full text-lg transition-all duration-150 shadow-lg shadow-violet-900/40">
            Empezar gratis
          </Link>
          <p className="text-slate-600 text-sm mt-4">Sin tarjeta. Sin contrato.</p>
        </div>
      </section>
    </DarkLayout>
  )
}
