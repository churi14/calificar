import type { Metadata } from 'next'
import Link from 'next/link'
import FaqAccordion from './FaqAccordion'

export const metadata: Metadata = {
  title: 'Calificar para Gastronomía | Más reseñas en Google para tu local',
  description:
    'Sistema de cartel QR para restaurantes, bares y cafeterías. El cliente escanea, ve el menú, califica al mozo y te deja una reseña en Google. Sin apps, sin fricciones.',
  keywords: [
    'reseñas Google restaurante Argentina',
    'cartel QR bar cafetería',
    'calificar mozo QR',
    'gastronomía Google Maps reseñas',
    'más reseñas Google negocio gastronómico',
  ],
  openGraph: {
    title: 'Calificar para Gastronomía',
    description:
      'Convertí cada mesa en una reseña de Google. Cartel QR con menú digital, calificación del mozo y link directo a Maps.',
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
  {
    q: '¿Necesito instalar algo en el local?',
    a: 'No. Recibís un cartel impreso con el QR. El cliente lo escanea con cualquier celular y accede a tu página directamente. Sin app, sin wifi del local.',
  },
  {
    q: '¿Cómo llega la reseña a mi perfil de Google?',
    a: 'Al tocar "Calificar en Google Maps", el cliente es redirigido directo a tu ficha en Google. La reseña la escribe ahí con su propia cuenta. Es 100% genuina.',
  },
  {
    q: '¿Puedo ver las calificaciones del mozo?',
    a: 'Sí. Desde tu panel en calificar.com.ar podés ver todas las estrellas y comentarios que dejaron los clientes sobre el servicio, por fecha.',
  },
  {
    q: '¿El menú digital tiene costo extra?',
    a: 'No. Cargás la URL de tu carta (PDF, Instagram, carta digital, delivery) y aparece automáticamente como primera opción cuando el cliente escanea.',
  },
  {
    q: '¿Funciona si el cliente no tiene cuenta de Google?',
    a: 'Puede igual calificar al mozo y ver el menú. La opción de Google Maps requiere que el cliente tenga cuenta, pero las otras dos funcionan sin ningún login.',
  },
  {
    q: '¿Puedo personalizar el color del cartel QR?',
    a: 'Sí. Desde el panel podés elegir el color del QR, el fondo y el tamaño. También podés descargarlo sin fondo para imprimir sobre cualquier soporte.',
  },
]

export default function GastronomiaPage() {
  return (
    <main className="bg-white text-zinc-900 antialiased">
      <style>{`
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes step-card-spin {
          to { --angle: 360deg; }
        }
        .step-card-wrap {
          position: relative;
          padding: 2px;
          border-radius: 1.1rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .step-card-wrap::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: conic-gradient(from var(--angle), #7c3aed, #d946ef, #818cf8, #7c3aed);
          animation: step-card-spin 3s linear infinite;
          opacity: 0;
          transition: opacity 0.35s ease;
        }
        .step-card-wrap:hover::before {
          opacity: 1;
        }
        .step-card-wrap:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(124, 58, 237, 0.2);
        }
        .step-card-inner {
          position: relative;
          z-index: 1;
          background: rgb(250 250 249);
          border-radius: 1rem;
          padding: 1.75rem;
          height: 100%;
        }
      `}</style>

      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur-sm border-b border-zinc-100 h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-6 md:px-10 w-full flex items-center justify-between">
          <Link href="/" className="tracking-tight font-bold text-violet-600 flex items-baseline gap-1.5">
            <span className="text-lg">Calificar</span>
            <em style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 400, fontSize: '0.85rem', color: '#7c3aed', opacity: 0.75 }}>gastronomía</em>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-500">
            <Link href="/precios" className="hover:text-zinc-900 transition-colors duration-150">Precios</Link>
            <Link href="/blog" className="hover:text-zinc-900 transition-colors duration-150">Blog</Link>
            <Link href="/auth/login" className="hover:text-zinc-900 transition-colors duration-150">Ingresar</Link>
          </div>
          <Link
            href="/auth/register"
            className="bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-full transition-all duration-150"
          >
            Empezar gratis
          </Link>
        </div>
      </nav>

      {/* ── HERO: Asymmetric Split ─────────────────────────────── */}
      <section className="pt-16">
        <div className="max-w-7xl mx-auto px-6 md:px-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-14">

          {/* Left: copy */}
          <div>
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-violet-600 bg-violet-50 px-3 py-1.5 rounded-full mb-6">
              Para gastronomía
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.06] text-zinc-900 mb-6">
              Cada mesa,<br />una reseña<br />en Google.
            </h1>
            <p className="text-lg text-zinc-500 leading-relaxed max-w-sm mb-8">
              Un cartel QR en la mesa o con el mozo. El cliente escanea, ve el menú, califica al servicio y te deja una reseña. Sin apps ni fricciones.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth/register"
                className="bg-violet-600 hover:bg-violet-700 active:scale-95 text-white font-bold px-6 py-3.5 rounded-full text-base transition-all duration-150 text-center"
              >
                Empezar gratis
              </Link>
              <Link
                href="#como-funciona"
                className="border border-zinc-200 hover:border-zinc-400 text-zinc-700 font-semibold px-6 py-3.5 rounded-full text-base transition-all duration-150 text-center"
              >
                Ver cómo funciona
              </Link>
            </div>
          </div>

          {/* Right: Phone with linktree preview */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Phone shell */}
              <div className="w-[300px] bg-zinc-900 rounded-[2.75rem] p-[10px] shadow-2xl shadow-zinc-300/60">
                <div className="bg-white rounded-[2.25rem] overflow-hidden">

                  {/* Notch */}
                  <div className="relative bg-violet-50 px-5 pt-3 pb-2 flex justify-between items-center text-[10px] text-zinc-400 font-medium">
                    <span>9:41</span>
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[72px] h-[18px] bg-zinc-900 rounded-full" />
                    <span>●●●</span>
                  </div>

                  {/* Linktree content */}
                  <div className="bg-gradient-to-b from-violet-50 to-white px-5 pb-10 pt-5 space-y-3">
                    {/* Avatar + name */}
                    <div className="text-center mb-5">
                      <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-lg shadow-violet-200">
                        <span className="text-white text-2xl font-extrabold">P</span>
                      </div>
                      <p className="font-bold text-sm text-zinc-900">La Parrilla de Omar</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">¿Qué querés hacer?</p>
                    </div>

                    {/* Opciones */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3 bg-white border border-zinc-100 rounded-xl px-3 py-2.5 shadow-sm">
                        <span className="text-lg leading-none">🍽️</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-zinc-900">Ver el menú</p>
                          <p className="text-[10px] text-zinc-400">Carta completa del local</p>
                        </div>
                        <span className="text-zinc-300 text-xs">→</span>
                      </div>

                      <div className="flex items-center gap-3 bg-white border border-yellow-200 rounded-xl px-3 py-2.5 shadow-sm">
                        <span className="text-lg leading-none">⭐</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-zinc-900">Calificar al mozo</p>
                          <p className="text-[10px] text-zinc-400">Dejá tu opinión</p>
                        </div>
                        <span className="text-yellow-400 text-xs">→</span>
                      </div>

                      <div className="flex items-center gap-3 bg-white border border-blue-100 rounded-xl px-3 py-2.5 shadow-sm">
                        <span className="text-lg leading-none">🗺️</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-zinc-900">Reseña en Google</p>
                          <p className="text-[10px] text-zinc-400">Google Maps</p>
                        </div>
                        <span className="text-blue-400 text-xs">→</span>
                      </div>
                    </div>

                    <p className="text-center text-[9px] text-zinc-300 pt-1">Powered by Calificar.com.ar</p>
                  </div>
                </div>
              </div>

              {/* Glow */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-5 bg-violet-300 blur-2xl rounded-full opacity-50 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEMA: Dark editorial ────────────────────────────── */}
      <section className="bg-zinc-950 py-16 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <blockquote className="text-2xl md:text-4xl font-bold text-white leading-snug mb-6 text-center">
            "El cliente comió bien, pagó la cuenta, y se fue sin dejar reseña."
          </blockquote>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl mx-auto text-center mb-10">
            No porque no le gustó. Sino porque nadie se lo pidió en el momento justo. Las reseñas se pierden en ese minuto en que el cliente está saliendo.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-zinc-800 rounded-2xl overflow-hidden">
            {[
              { n: '93%', label: 'de los clientes miran reseñas antes de elegir dónde comer' },
              { n: '7 de 10', label: 'clientes satisfechos no dejan reseña si nadie se los pide en el momento' },
              { n: '4.4★', label: 'es el mínimo que los clientes exigen para entrar a un local nuevo' },
            ].map(({ n, label }) => (
              <div key={n} className="bg-zinc-900 px-8 py-8 text-center">
                <p className="text-3xl md:text-4xl font-extrabold text-violet-400 mb-2 tabular-nums">{n}</p>
                <p className="text-zinc-400 text-sm leading-relaxed">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA: 3-step cards ─────────────────────────── */}
      <section id="como-funciona" className="py-16 px-6 md:px-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 max-w-lg">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 mb-3">
              Cómo funciona el cartel.
            </h2>
            <p className="text-zinc-500 text-lg">
              Tres pasos y empezás a recibir reseñas reales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            {[
              {
                num: '1',
                title: 'Pedís tu cartel o agendamos una reunión',
                body: 'Te mandamos un cartel personalizado listo para usar, o coordinamos una reunión para asesorarte según tu local. Puede ser solo QR o también NFC. Pago único, es tuyo para siempre.',
              },
              {
                num: '2',
                title: 'El QR va en la mesa o cada mozo tiene el suyo',
                body: 'Con un QR por mozo podés ver cuántas veces escanearon su código, sus calificaciones y en qué están fallando. No hace falta avisarle al mozo. Cuando se va, el código se reasigna a otro.',
              },
              {
                num: '3',
                title: 'Las reseñas llegan solas',
                body: 'El cliente escanea y elige en 10 segundos. Sin buscar tu local en Google, sin excusas, sin fricción. Cada escaneo es una reseña real.',
              },
            ].map(({ num, title, body }) => (
              <div key={num} className="step-card-wrap">
                <div className="step-card-inner">
                  <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold mb-5">
                    {num}
                  </div>
                  <h3 className="font-bold text-base text-zinc-900 mb-2 leading-snug">{title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── SERVICIOS ── */}
          <div className="mb-8 max-w-lg">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 mb-3">
              Y lo hacemos crecer.
            </h2>
            <p className="text-zinc-500 text-lg">
              Servicios para que tu local aparezca primero, en Google, en redes y en la IA.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                tag: 'Presencia en Google',
                title: 'Optimizamos tu Perfil de Empresa',
                body: 'Categorías, fotos, horarios, descripción y link directo a reseñas. Todo lo que hace que aparezcas primero cuando alguien busca tu rubro en Maps.',
              },
              {
                tag: 'Social Media',
                title: 'Posicionamos tu local en redes',
                body: 'Contenido, publicaciones, historias y gestión de comentarios. Vos te ocupás del local, nosotros de que te vean.',
              },
              {
                tag: 'Visibilidad en IA',
                title: 'ChatGPT y Gemini que recomienden tu local',
                body: 'Trabajamos para que aparezcas cuando alguien pregunta a la IA dónde comer en tu ciudad. Medimos lo que contestan hoy.',
              },
              {
                tag: 'El cliente vuelve',
                title: 'Reservas y fidelización',
                body: 'Sistema de turnos por WhatsApp, campañas para que el cliente vuelva y seguimiento post-visita.',
              },
            ].map(({ tag, title, body }) => (
              <div key={tag} className="bg-violet-50 rounded-2xl p-7 border border-violet-100">
                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-3 block">{tag}</span>
                <h3 className="font-bold text-base text-zinc-900 mb-2 leading-snug">{title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{body}</p>
                <p className="mt-4 text-xs font-semibold text-violet-600">A consultar →</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QR LINKTREE: Bento 3 tiles ──────────────────────────── */}
      <section className="py-16 px-6 md:px-10 bg-zinc-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 max-w-lg">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 mb-3">
              Tres opciones en un solo QR.
            </h2>
            <p className="text-zinc-500 text-lg">
              El cliente escanea y elige. Sin cuenta, sin app, sin login.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Tile 1: Menú (blanco) */}
            <div className="bg-white rounded-3xl p-8 border border-zinc-100 flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl mb-5">
                  🍽️
                </div>
                <h3 className="font-bold text-xl text-zinc-900 mb-2">Ver el menú</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Cargás la URL de tu carta y aparece como primera opción. PDF, Instagram, carta digital o delivery. El cliente la abre en el celular al instante.
                </p>
              </div>
              <p className="mt-6 text-xs font-semibold text-zinc-400 uppercase tracking-widest">Incluido</p>
            </div>

            {/* Tile 2: Mozo (amarillo) */}
            <div className="bg-yellow-400 rounded-3xl p-8 flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="w-12 h-12 bg-white/30 rounded-2xl flex items-center justify-center text-2xl mb-5">
                  👨‍🍳
                </div>
                <h3 className="font-bold text-xl text-zinc-900 mb-2">Calificar al mozo</h3>
                <p className="text-zinc-800 text-sm leading-relaxed">
                  El cliente deja 1 a 5 estrellas y un comentario opcional. Vos lo ves desde tu panel. Después lo redirigimos directo a Google Maps.
                </p>
              </div>
              {/* Stars display */}
              <div className="flex gap-1 mt-6">
                {[1, 2, 3, 4, 5].map(s => (
                  <svg key={s} viewBox="0 0 24 24" className="w-5 h-5 fill-zinc-900" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Tile 3: Google (azul) */}
            <div className="bg-blue-600 rounded-3xl p-8 flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl mb-5">
                  🗺️
                </div>
                <h3 className="font-bold text-xl text-white mb-2">Reseña en Google</h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Después de calificar al mozo, el cliente llega directo a tu ficha de Google Maps. Ya sabe qué puntaje poner. Solo escribe y publica.
                </p>
              </div>
              <p className="mt-6 text-xs font-semibold text-blue-200 uppercase tracking-widest">Directo a Maps</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRECIOS ─────────────────────────────────────────────── */}
      <section className="py-16 px-6 md:px-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 max-w-lg">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 mb-3">
              Simple y sin sorpresas.
            </h2>
            <p className="text-zinc-500 text-lg">
              Una cuota mensual por el sistema. El cartel lo pagás una vez y es tuyo para siempre.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">

            {/* Plan base */}
            <div className="bg-zinc-50 rounded-3xl p-8 border border-zinc-100 flex flex-col">
              <p className="font-bold text-xl text-zinc-900 mb-1">Sistema Calificar</p>
              <p className="text-zinc-500 text-sm mb-4">Panel, filtro inteligente, QR, estadísticas y calificación de mozos.</p>
              <p className="text-3xl font-extrabold text-zinc-900 mb-1 tabular-nums">
                $15.000<span className="text-base font-semibold text-zinc-400">/mes</span>
              </p>
              <p className="text-xs text-zinc-400 mb-6">Sin setup. Cancelás cuando querés.</p>
              <Link
                href="/auth/register"
                className="mt-auto border border-violet-600 text-violet-600 hover:bg-violet-50 font-semibold px-5 py-3 rounded-full text-sm text-center transition-colors duration-150"
              >
                Empezar gratis
              </Link>
            </div>

            {/* Plan dominio */}
            <div className="bg-violet-600 rounded-3xl p-8 flex flex-col relative overflow-hidden">
              <span className="absolute top-4 right-4 bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full">Recomendado</span>
              <p className="font-bold text-xl text-white mb-1">Dominio Propio</p>
              <p className="text-violet-200 text-sm mb-4">Todo lo anterior mas tu URL propia. El QR apunta a tu dominio para siempre, sin depender de Calificar.</p>
              <p className="text-3xl font-extrabold text-white mb-1 tabular-nums">
                $15.000<span className="text-base font-semibold text-violet-300">/mes</span>
              </p>
              <p className="text-xs text-violet-300 mb-6">+ $50.000 setup único (dominio + configuración)</p>
              <a
                href="https://wa.me/5491123867934?text=Hola!%20Quiero%20info%20sobre%20Calificar%20para%20mi%20local."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto bg-white hover:bg-violet-50 text-violet-700 font-bold px-5 py-3 rounded-full text-sm text-center transition-colors duration-150"
              >
                Consultar por WhatsApp
              </a>
            </div>
          </div>

          {/* Nota cartel */}
          <div className="mt-6 max-w-3xl bg-zinc-50 rounded-2xl px-6 py-4 border border-zinc-100 flex items-start gap-3">
            <span className="text-lg mt-0.5">📦</span>
            <div>
              <p className="font-semibold text-zinc-900 text-sm">El cartel físico se compra aparte</p>
              <p className="text-zinc-500 text-sm mt-0.5">Los carteles NFC + QR son pago único, tuyos para siempre. <Link href="/precios" className="text-violet-600 underline underline-offset-2">Ver opciones de carteles</Link></p>
            </div>
          </div>
        </div>
      </section>

      {/* ── RUBROS: Chip cloud ──────────────────────────────────── */}
      <section className="py-16 px-6 md:px-10 bg-white border-t border-zinc-100">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-6 text-center">
            Para todo tipo de local gastronómico
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {RUBROS.map(rubro => (
              <span
                key={rubro}
                className="bg-zinc-100 text-zinc-600 text-sm font-medium px-4 py-2 rounded-full"
              >
                {rubro}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ: Accordion ──────────────────────────────────────── */}
      <section className="py-16 px-6 md:px-10 bg-zinc-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-10">
            Preguntas frecuentes
          </h2>
          <FaqAccordion faqs={FAQS} />
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────────────────── */}
      <section className="py-16 px-6 md:px-10 bg-violet-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
            Tu local puede tener 10 reseñas nuevas este mes.
          </h2>
          <p className="text-violet-200 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Sin pedírselas en persona. Sin recordar mandar el link. Un cartel QR en la mesa hace el trabajo.
          </p>
          <Link
            href="/auth/register"
            className="inline-block bg-white hover:bg-violet-50 active:scale-95 text-violet-700 font-bold px-8 py-4 rounded-full text-lg transition-all duration-150"
          >
            Empezar gratis
          </Link>
          <p className="text-violet-300 text-sm mt-4">Sin tarjeta. Sin contrato.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-zinc-950 py-10 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="font-bold text-violet-400 text-lg">Calificar</Link>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-500">
            <Link href="/precios" className="hover:text-zinc-300 transition-colors">Precios</Link>
            <Link href="/blog" className="hover:text-zinc-300 transition-colors">Blog</Link>
            <Link href="/gastronomia" className="hover:text-zinc-300 transition-colors">Gastronomía</Link>
            <Link href="/qr" className="hover:text-zinc-300 transition-colors">Mis QRs</Link>
          </div>
          <p className="text-zinc-600 text-sm">2026 Calificar.com.ar</p>
        </div>
      </footer>

    </main>
  )
}
