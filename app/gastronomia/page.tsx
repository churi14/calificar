import type { Metadata } from 'next'
import Link from 'next/link'

const WA = 'https://wa.me/5491123867934?text=Hola!%20Quiero%20info%20sobre%20Calificar%20para%20mi%20local%20gastron%C3%B3mico.'

export const metadata: Metadata = {
  title: 'Calificar para Gastronomía — Más reseñas en Google para tu local',
  description:
    'Sistema de carteles QR y NFC para restaurantes, bares, cafeterías, panaderías y todo local con atención al público. Cada cliente satisfecho va directo a Google. Los problemas te llegan a vos, en privado.',
  keywords: [
    'reseñas Google restaurante',
    'reseñas Google bar',
    'reseñas Google cafetería',
    'carteles QR gastronomía Argentina',
    'aumentar reseñas Google local gastronómico',
    'sistema reseñas gastronomía',
    'QR NFC restaurante bar cafetería',
    'calificar gastronomía',
  ],
  openGraph: {
    title: 'Calificar para Gastronomía — Más reseñas en Google para tu local',
    description:
      'Carteles QR y NFC para restaurantes, bares, cafeterías y más. Tus clientes satisfechos van directo a Google. Los problemas te llegan a vos, en privado.',
    url: 'https://calificar.com.ar/gastronomia',
    siteName: 'Calificar',
    locale: 'es_AR',
    type: 'website',
  },
  alternates: { canonical: 'https://calificar.com.ar/gastronomia' },
}

const RUBROS = [
  'Restaurantes', 'Bares', 'Cafeterías', 'Panaderías',
  'Heladerías', 'Rotiserías', 'Pizzerías', 'Hamburgueserías',
  'Cervecerías', 'Confiterías', 'Sushi', 'Comida rápida',
]

const STEPS = [
  {
    n: '01',
    title: 'El cliente escanea el QR o toca el NFC',
    desc: 'Con el celular, sin descargar nada. Aparece una pantalla simple que le pregunta cómo estuvo su experiencia.',
  },
  {
    n: '02',
    title: 'Los satisfechos van directo a Google',
    desc: 'Si la experiencia fue buena, el sistema los lleva automáticamente a tu ficha de Google para que dejen la estrella. Sin fricciones.',
  },
  {
    n: '03',
    title: 'Los insatisfechos te escriben a vos',
    desc: 'Si algo salió mal, en vez de irse a quejarse en Google, te mandan un mensaje privado. Podés resolverlo antes de que se convierta en una mala reseña pública.',
  },
  {
    n: '04',
    title: 'Vos ves todo desde el panel',
    desc: 'Cuántos scans hubo, cuántas reseñas generaste, qué carteles están funcionando. Todo en un panel limpio y claro.',
  },
]

const PROBLEMS = [
  {
    emoji: '😤',
    title: 'Clientes satisfechos que no dejan reseña',
    desc: 'El 90% de tus clientes se va conforme pero no hace nada. Calificar les pone el link de Google directo en la mano, en el momento justo.',
  },
  {
    emoji: '💀',
    title: 'Una mala reseña arruina semanas de trabajo',
    desc: 'Un solo comentario negativo puede bajar tu promedio y ahuyentar clientes. Con Calificar, los problemas te llegan a vos antes de llegar a Google.',
  },
  {
    emoji: '📉',
    title: 'Sin reseñas, tu local es invisible en Google',
    desc: 'Los locales con más de 100 reseñas y 4.5+ estrellas aparecen primero en Maps. Sin reseñas, no existís para quien busca dónde comer.',
  },
]

const FEATURES = [
  { icon: '📍', title: 'Cartel físico A5 o A4', desc: 'Impreso en alta calidad, laminado, listo para poner en mesa, mostrador o entrada.' },
  { icon: '📡', title: 'Chip NFC incluido', desc: 'Un toque del celular y el cliente ya está en tu sistema. Sin escanear nada.' },
  { icon: '🔄', title: 'QR dinámico', desc: 'Si tu local cambia de nombre, dirección o link de Google, el QR se actualiza sin reimprimir nada.' },
  { icon: '📊', title: 'Panel de control', desc: 'Ves cuántos scans tuvo cada cartel, qué días hay más actividad y cuántas reseñas generaste.' },
  { icon: '🔒', title: 'Filtro de reseñas negativas', desc: 'Los clientes insatisfechos te escriben a vos en privado. Tu reputación pública queda protegida.' },
  { icon: '⚡', title: 'Activación en minutos', desc: 'El cartel llega a tu local. Escaneás, completás el link de Google y listo. No necesitás saber de tecnología.' },
]

const ECOSYSTEM = [
  {
    tag: 'Incluido',
    color: 'bg-violet-100 text-violet-700',
    title: 'Calificar QR + NFC',
    desc: 'El sistema de reseñas. Carteles físicos que generan reseñas en Google automáticamente. El núcleo del servicio.',
    bullets: ['Cartel A5 o A4 laminado', 'Chip NFC incluido', 'QR dinámico modificable', 'Panel de estadísticas'],
  },
  {
    tag: 'Opcional',
    color: 'bg-blue-100 text-blue-700',
    title: 'LetsGather — Reservas online',
    desc: 'Tu local toma reservas por WhatsApp y llamadas todo el tiempo. LetsGather las automatiza. El cliente elige día, hora y cantidad de personas desde tu página.',
    bullets: ['Sin llamadas para reservar', 'Recordatorios automáticos', 'Gestión de capacidad', 'Gratis hasta 50 reservas/mes'],
  },
  {
    tag: 'Opcional',
    color: 'bg-green-100 text-green-700',
    title: 'Social Media con IA',
    desc: 'Cada reseña positiva que genera Calificar se puede convertir en un post de Instagram. Contenido real, del local, generado con IA.',
    bullets: ['3 posts semanales', 'Diseño con identidad del local', 'Reseñas → contenido automático', 'Metricool + Canva IA'],
  },
]

const FAQS = [
  {
    q: '¿Sirve para cualquier tipo de local gastronómico?',
    a: 'Sí. Funciona igual para un restaurante, un bar, una cafetería, una panadería o cualquier local con atención al público. El sistema es el mismo — cambia el link de Google de tu ficha.',
  },
  {
    q: '¿El cliente necesita descargar alguna app?',
    a: 'No. Escanea el QR con la cámara del celular o toca el NFC y ya está. Sin descargas, sin registros.',
  },
  {
    q: '¿Qué pasa si cambio el link de Google de mi local?',
    a: 'El QR es dinámico. Entrás al panel, actualizás el link y listo. El cartel físico sigue funcionando sin reimprimir nada.',
  },
  {
    q: '¿Cuántos carteles necesito?',
    a: 'Depende del tamaño del local. Un local chico con 2 carteles (uno en mesa o mostrador y uno en la entrada) ya nota la diferencia. Para locales más grandes recomendamos uno por cada 4-5 mesas.',
  },
  {
    q: '¿Realmente funciona el filtro de reseñas negativas?',
    a: 'Sí. Si el cliente elige una experiencia negativa, el sistema le muestra un formulario para que te cuente qué pasó. No lo lleva a Google. Vos recibís el mensaje y podés responder.',
  },
  {
    q: '¿Cuánto tiempo tarda en llegar el cartel?',
    a: 'Zona GBA: 24-48 hs. Interior del país: 3-5 días hábiles. Lo activás vos mismo en minutos desde el panel.',
  },
]

export default function GastronomiaPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Calificar" className="h-6 w-auto" />
            <span className="font-extrabold text-lg text-gray-900">Calificar</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
              Inicio
            </Link>
            <a href={WA}
              className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm px-5 py-2.5 rounded-full transition-colors">
              Contactar
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-sm font-semibold px-4 py-2 rounded-full mb-8">
            🍽️ Para restaurantes, bares, cafeterías y más
          </div>
          <h1 className="font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-gray-900 mb-6">
            Tu local gastronómico necesita{' '}
            <span className="text-violet-600">más reseñas en Google.</span>{' '}
            Calificar las consigue solo.
          </h1>
          <p className="text-gray-500 text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">
            Un cartel en la mesa, el mostrador o la entrada. El cliente lo escanea o lo toca. Los que quedaron conformes van directo a Google. Los que tuvieron un problema te escriben a vos, en privado.
          </p>

          {/* Rubros */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {RUBROS.map(r => (
              <span key={r} className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">{r}</span>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <a href={WA}
              className="inline-flex items-center justify-center bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-4 rounded-full transition-colors text-base shadow-lg shadow-violet-200">
              Quiero empezar →
            </a>
            <Link href="/como-funciona"
              className="inline-flex items-center justify-center bg-white border-2 border-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-full hover:border-gray-400 transition-colors text-base">
              Ver cómo funciona
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 justify-center text-sm text-gray-400">
            <span>⭐ Reseñas reales en Google</span>
            <span>📡 QR + NFC incluido</span>
            <span>🔄 Sin reimprimir si cambiás el link</span>
            <span>⚡ Activo en minutos</span>
          </div>
        </div>
      </section>

      {/* PROBLEMAS */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-extrabold text-3xl sm:text-4xl text-gray-900 mb-4">
              Los problemas que tiene todo local en Google
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Y que Calificar resuelve sin que tengas que hacer nada extra.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROBLEMS.map(p => (
              <div key={p.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-3xl mb-4">{p.emoji}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">{p.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-extrabold text-3xl sm:text-4xl text-gray-900 mb-4">
              Cómo funciona
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Cuatro pasos. El único que tiene que hacer algo es tu cliente — y es un escaneo.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {STEPS.map(s => (
              <div key={s.n} className="flex gap-5 p-6 rounded-2xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 transition-colors">
                <span className="font-extrabold text-4xl text-violet-200 leading-none flex-shrink-0">{s.n}</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-extrabold text-3xl sm:text-4xl text-gray-900 mb-4">
              Todo lo que incluye el sistema
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ECOSISTEMA */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-extrabold text-3xl sm:text-4xl text-gray-900 mb-4">
              Un ecosistema completo para tu local
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Calificar es el núcleo. Pero si querés, podés sumar reservas online y presencia en redes — todo integrado, todo desde el mismo proveedor.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ECOSYSTEM.map(e => (
              <div key={e.title} className="rounded-2xl border border-gray-200 p-6 flex flex-col">
                <span className={`text-xs font-bold px-3 py-1 rounded-full w-fit mb-4 ${e.color}`}>{e.tag}</span>
                <h3 className="font-bold text-gray-900 text-lg mb-3">{e.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{e.desc}</p>
                <ul className="space-y-2 mt-auto">
                  {e.bullets.map(b => (
                    <li key={b} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA MEDIO */}
      <section className="py-16 px-6 bg-violet-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-extrabold text-3xl sm:text-4xl text-white mb-4">
            ¿Cuántas reseñas nuevas podría tener tu local este mes?
          </h2>
          <p className="text-violet-200 text-lg mb-8">
            Un local con 30 clientes por día puede conseguir entre 5 y 15 reseñas nuevas por semana con Calificar. Sin pedirle nada al cliente.
          </p>
          <a href={WA}
            className="inline-flex items-center justify-center bg-white text-violet-700 font-bold px-8 py-4 rounded-full hover:bg-violet-50 transition-colors text-base">
            Hablar por WhatsApp →
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-extrabold text-3xl sm:text-4xl text-gray-900 mb-4">
              Preguntas frecuentes
            </h2>
          </div>
          <div className="space-y-4">
            {FAQS.map(f => (
              <div key={f.q} className="border border-gray-200 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">{f.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-extrabold text-3xl sm:text-4xl text-gray-900 mb-4">
            Empezá hoy
          </h2>
          <p className="text-gray-500 text-lg mb-8">
            El cartel llega a tu local en 24 a 48 hs en GBA. Lo activás vos en minutos. Sin contratos, sin permanencia.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href={WA}
              className="inline-flex items-center justify-center bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-4 rounded-full transition-colors text-base shadow-lg shadow-violet-200">
              Contactar por WhatsApp →
            </a>
            <Link href="/tienda"
              className="inline-flex items-center justify-center bg-white border-2 border-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-full hover:border-gray-400 transition-colors text-base">
              Ver la tienda
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Calificar" className="h-5 w-auto" />
            <span className="font-bold text-gray-900">Calificar</span>
          </Link>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/gastronomia" className="font-semibold text-violet-600">Gastronomía</Link>
            <Link href="/precios" className="hover:text-gray-600 transition-colors">Precios</Link>
            <Link href="/blog" className="hover:text-gray-600 transition-colors">Blog</Link>
            <Link href="/como-funciona" className="hover:text-gray-600 transition-colors">Cómo funciona</Link>
          </div>
          <p className="text-sm text-gray-400">© 2026 Calificar · Buenos Aires, Argentina</p>
        </div>
      </footer>

    </div>
  )
}
