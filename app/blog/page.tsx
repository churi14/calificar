import type { Metadata } from 'next'
import Link from 'next/link'
import { posts } from '@/lib/blog/posts'

export const metadata: Metadata = {
  title: 'Blog — Reseñas Google, QR Dinámicos y Reputación Online',
  description: 'Guías prácticas para conseguir más reseñas en Google, gestionar tu reputación online y usar QR dinámicos en tu negocio en Argentina.',
  alternates: { canonical: 'https://calificar.com.ar/blog' },
  openGraph: {
    title: 'Blog de Calificar — Reseñas Google y QR Dinámicos',
    description: 'Guías prácticas para negocios argentinos: más reseñas, mejor reputación, QR dinámicos gratis.',
    url: 'https://calificar.com.ar/blog',
    type: 'website',
  },
}

const CATEGORY_COLORS: Record<string, string> = {
  'Reseñas Google': 'bg-amber-100 text-amber-700',
  'QR Dinámicos': 'bg-violet-100 text-violet-700',
  'Reputación Online': 'bg-emerald-100 text-emerald-700',
}

export default function BlogPage() {
  const sorted = [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-20">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-gray-900 text-lg">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="#7C3AED"/>
              <text x="16" y="22" textAnchor="middle" fill="white" fontSize="18" fontFamily="Arial" fontWeight="bold">★</text>
            </svg>
            Calificar
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium text-gray-500">
            <Link href="/qr" className="hover:text-gray-900 transition-colors">QR Dinámicos</Link>
            <Link href="/login" className="bg-violet-600 text-white px-4 py-2 rounded-xl hover:bg-violet-700 transition-colors font-semibold text-sm">
              Empezar gratis
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-16">
        {/* Header */}
        <div className="mb-14 text-center">
          <span className="inline-block bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide mb-4">
            Blog
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            Reseñas, QR y reputación<br className="hidden sm:block" /> para tu negocio
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Guías prácticas para negocios argentinos que quieren crecer con más reseñas en Google y mejor presencia online.
          </p>
        </div>

        {/* Article grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-200"
            >
              {/* Colored header */}
              <div className="bg-gradient-to-br from-violet-50 to-indigo-50 p-8 text-5xl flex items-center justify-center">
                {post.emoji}
              </div>

              <div className="flex flex-col flex-1 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-600'}`}>
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400">{post.readingTime} min</span>
                </div>

                <h2 className="text-base font-bold text-gray-900 leading-snug mb-2 group-hover:text-violet-700 transition-colors">
                  {post.title}
                </h2>

                <p className="text-sm text-gray-500 leading-relaxed flex-1">
                  {post.description}
                </p>

                <div className="mt-4 flex items-center text-violet-600 text-sm font-semibold">
                  Leer artículo
                  <svg className="ml-1.5 w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl p-10 text-center text-white">
          <div className="text-4xl mb-4">⭐</div>
          <h2 className="text-2xl font-extrabold mb-3">¿Querés más reseñas en Google?</h2>
          <p className="text-violet-200 mb-6 max-w-md mx-auto">
            Calificar te ayuda a conseguir más reseñas positivas y filtrar las negativas antes de que lleguen a Google.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="bg-white text-violet-700 font-bold px-6 py-3 rounded-xl hover:bg-violet-50 transition-colors"
            >
              Empezar gratis
            </Link>
            <Link
              href="/qr"
              className="bg-white/10 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors border border-white/20"
            >
              Crear QR dinámico gratis
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 mt-10">
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <span>© 2025 Calificar. Todos los derechos reservados.</span>
          <div className="flex gap-5">
            <Link href="/" className="hover:text-gray-600 transition-colors">Inicio</Link>
            <Link href="/qr" className="hover:text-gray-600 transition-colors">QR Dinámicos</Link>
            <Link href="/blog" className="hover:text-gray-600 transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
