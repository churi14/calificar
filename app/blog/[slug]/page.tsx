import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { posts, getPost, getAllSlugs } from '@/lib/blog/posts'
import DarkLayout from '@/components/landing/DarkLayout'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  const url = `https://calificar.com.ar/blog/${post.slug}`
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: 'article',
      publishedTime: post.date,
      locale: 'es_AR',
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.description },
  }
}

const CATEGORY_COLORS: Record<string, string> = {
  'Reseñas Google': 'bg-amber-500/15 text-amber-300 border border-amber-500/20',
  'QR Dinámicos': 'bg-violet-500/15 text-violet-300 border border-violet-500/20',
  'Reputación Online': 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20',
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: 'Calificar', url: 'https://calificar.com.ar' },
    publisher: { '@type': 'Organization', name: 'Calificar', url: 'https://calificar.com.ar', logo: { '@type': 'ImageObject', url: 'https://calificar.com.ar/logo.svg' } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://calificar.com.ar/blog/${post.slug}` },
    keywords: post.keywords.join(', '),
  }

  const related = posts
    .filter(p => p.slug !== post.slug && p.category === post.category)
    .slice(0, 2)

  return (
    <DarkLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-3xl mx-auto px-6 py-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8">
          <Link href="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
          <span>›</span>
          <span className={`font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] ?? 'bg-white/10 text-slate-300'}`}>
            {post.category}
          </span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <div className="text-6xl mb-6">{post.emoji}</div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white leading-tight mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
            <span>·</span>
            <span>{post.readingTime} min de lectura</span>
          </div>
        </div>

        {/* Artículo */}
        <article className="space-y-10">
          {/* Intro */}
          <p className="text-lg text-slate-300 leading-relaxed border-l-4 border-violet-500/50 pl-5 italic">
            {post.intro}
          </p>

          {post.sections.map((section, i) => (
            <div key={i}>
              <h2 className="font-display font-bold text-xl text-white mb-4">{section.h2}</h2>

              {section.paragraphs?.map((p, j) => {
                const parts = p.split(/(\*\*[^*]+\*\*)/g)
                return (
                  <p key={j} className="text-slate-400 leading-relaxed mb-3">
                    {parts.map((part, k) =>
                      part.startsWith('**') && part.endsWith('**')
                        ? <strong key={k} className="font-semibold text-slate-200">{part.slice(2, -2)}</strong>
                        : part
                    )}
                  </p>
                )
              })}

              {section.highlight && (
                <div className="my-6 rounded-2xl px-6 py-4" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <p className="text-violet-300 font-semibold text-sm leading-relaxed">{section.highlight}</p>
                </div>
              )}

              {section.list && (
                <div className="my-4">
                  {section.list.intro && <p className="text-slate-300 font-medium mb-3">{section.list.intro}</p>}
                  <ul className="space-y-2.5">
                    {section.list.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-3 text-slate-400 text-sm leading-relaxed">
                        <span className="flex-shrink-0 w-5 h-5 bg-violet-500/20 text-violet-400 rounded-full flex items-center justify-center font-bold text-xs mt-0.5">
                          <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {/* Conclusion */}
          <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="font-display font-bold text-lg text-white mb-3">Conclusion</h2>
            <p className="text-slate-400 leading-relaxed">{post.conclusion}</p>
          </div>
        </article>

        {/* CTA */}
        <div className="mt-12 rounded-3xl p-8 text-center" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(99,102,241,0.08) 100%)', border: '1px solid rgba(124,58,237,0.3)' }}>
          <h3 className="font-display font-extrabold text-xl text-white mb-2">{post.ctaText}</h3>
          <p className="text-slate-400 text-sm mb-5">Sin tarjeta de crédito. Gratis para empezar.</p>
          <Link href={post.ctaHref} className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3 rounded-full transition-colors shadow-lg shadow-violet-900/40">
            {post.ctaText}
          </Link>
        </div>

        {/* Relacionados */}
        {related.length > 0 && (
          <div className="mt-14">
            <h3 className="font-display font-bold text-lg text-white mb-5">También te puede interesar</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map(r => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="group flex gap-4 p-4 rounded-2xl hover:-translate-y-0.5 transition-all duration-200" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className="text-3xl flex-shrink-0">{r.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-white group-hover:text-violet-400 transition-colors leading-snug">{r.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{r.readingTime} min</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/blog" className="text-sm text-violet-400 font-semibold hover:text-violet-300 transition-colors">
            Ver todos los artículos
          </Link>
        </div>
      </div>
    </DarkLayout>
  )
}
