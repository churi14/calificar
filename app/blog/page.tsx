import type { Metadata } from 'next'
import Link from 'next/link'
import { posts } from '@/lib/blog/posts'
import DarkLayout from '@/components/landing/DarkLayout'

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
  'Reseñas Google': 'bg-amber-500/15 text-amber-300 border border-amber-500/20',
  'QR Dinámicos': 'bg-violet-500/15 text-violet-300 border border-violet-500/20',
  'Reputación Online': 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20',
}

export default function BlogPage() {
  const sorted = [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <DarkLayout>
      {/* HEADER */}
      <section className="px-6 pt-16 pb-14 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.10) 0%, transparent 60%)' }} />
        <div className="relative max-w-2xl mx-auto">
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white leading-tight mb-4">
            Resenas, QR y reputacion para tu negocio
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Guías prácticas para negocios argentinos que quieren crecer con más reseñas en Google y mejor presencia online.
          </p>
        </div>
      </section>

      {/* GRID DE ARTÍCULOS */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Header coloreado */}
              <div className="p-8 text-5xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.12)' }}>
                {post.emoji}
              </div>

              <div className="flex flex-col flex-1 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${CATEGORY_COLORS[post.category] ?? 'bg-white/10 text-slate-300'}`}>
                    {post.category}
                  </span>
                  <span className="text-xs text-slate-500">{post.readingTime} min</span>
                </div>

                <h2 className="text-base font-bold text-white leading-snug mb-2 group-hover:text-violet-400 transition-colors">
                  {post.title}
                </h2>

                <p className="text-sm text-slate-400 leading-relaxed flex-1">
                  {post.description}
                </p>

                <div className="mt-4 flex items-center text-violet-400 text-sm font-semibold">
                  Leer artículo
                  <svg className="ml-1.5 w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-3xl p-10 text-center" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(99,102,241,0.08) 100%)', border: '1px solid rgba(124,58,237,0.25)' }}>
          <h2 className="font-display font-extrabold text-2xl text-white mb-3">Queres mas resenas en Google?</h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto text-sm">
            Calificar te ayuda a conseguir más reseñas positivas y filtrar las negativas antes de que lleguen a Google.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login" className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3 rounded-full transition-colors shadow-lg shadow-violet-900/40 text-sm">
              Empezar gratis
            </Link>
            <Link href="/qr" className="border border-white/15 hover:border-white/25 hover:bg-white/5 text-white font-semibold px-6 py-3 rounded-full transition-all text-sm">
              Crear QR dinámico gratis
            </Link>
          </div>
        </div>
      </section>
    </DarkLayout>
  )
}
