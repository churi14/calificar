import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Calificar Beauty — Próximamente',
  description: 'Sistema de reseñas y reputación para peluquerías, estéticas, spas y salones de belleza. Próximamente.',
  robots: { index: false },
}

export default function BeautyPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900 antialiased flex flex-col">

      {/* NAV */}
      <nav className="border-b border-zinc-100 h-16 flex items-center px-6 md:px-10">
        <Link href="/" className="flex items-center gap-1.5 font-bold text-lg text-[#0F172A]">
          <img src="/logo.svg" alt="Calificar" className="h-7 w-auto" />
          Calificar
        </Link>
      </nav>

      {/* HERO */}
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="text-center max-w-xl">

          {/* Badge */}
          <span className="inline-block bg-pink-50 text-pink-500 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8">
            Próximamente
          </span>

          {/* Logo vertical */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <img src="/logo.svg" alt="" className="h-10 w-auto" style={{ filter: 'hue-rotate(280deg) saturate(1.5)' }} />
            <p className="font-extrabold text-2xl text-[#0F172A]">
              Calificar <em style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 400, color: '#ec4899' }}>beauty</em>
            </p>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 leading-tight mb-5">
            Más reseñas para tu salón,<br />sin esfuerzo extra.
          </h1>

          <p className="text-zinc-500 text-lg leading-relaxed mb-10">
            El mismo sistema de carteles QR que usan los restaurantes, adaptado para
            peluquerías, estéticas, spas y salones de uñas. Avisanos y te contactamos cuando esté listo.
          </p>

          {/* CTA */}
          <a
            href="https://wa.me/5491123867934?text=Hola!%20Me%20interesa%20Calificar%20Beauty%20para%20mi%20salón."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-pink-500 hover:bg-pink-600 active:scale-95 text-white font-bold px-8 py-4 rounded-full text-base transition-all duration-150 shadow-lg shadow-pink-200"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Anotarme para cuando salga
          </a>

          <p className="mt-4 text-zinc-400 text-sm">
            O volvé al{' '}
            <Link href="/" className="text-zinc-600 underline underline-offset-2 hover:text-zinc-900">
              inicio
            </Link>
          </p>

          {/* Chips de rubros */}
          <div className="flex flex-wrap justify-center gap-2 mt-12">
            {['Peluquerías', 'Estéticas', 'Spas', 'Salones de uñas', 'Barberías', 'Centros de depilación', 'Masajes', 'Maquillaje'].map(r => (
              <span key={r} className="bg-pink-50 text-pink-400 text-xs font-medium px-3 py-1.5 rounded-full">
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-100 py-6 px-6 text-center text-xs text-zinc-400">
        © 2026 Calificar.com.ar
      </footer>
    </main>
  )
}
