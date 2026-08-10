import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { posts, getPost, getAllSlugs } from '@/lib/blog/posts'

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
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

const CATEGORY_COLORS: Record<string, string> = {
  'Reseñas Google': 'bg-amber-100 text-amber-700',
  'QR Dinámicos': 'bg-violet-100 text-violet-700',
  'Reputación Online': 'bg-emerald-100 text-emerald-700',
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
    author: {
      '@type': 'Organization',
      name: 'Calificar',
      url: 'https://calificar.com.ar',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Calificar',
      url: 'https://calificar.com.ar',
      logo: {
        '@type': 'ImageObject',
        url: 'https://calificar.com.ar/logo.svg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://calificar.com.ar/blog/${post.slug}`,
    },
    keywords: post.keywords.join(', '),
  }

  const related = posts
    .filter(p => p.slug !== post.slug && p.category === post.category)
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Nav */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-20">
        <div className="max-w-4xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-gray-900 text-lg">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="#7C3AED"/>
              <text x="16" y="22" textAnchor="middle" fill="white" fontSize="18" fontFamily="Arial" fontWeight="bold">★</text>
            </svg>
            Calificar
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium text-gray-500">
            <Link href="/blog" className="hover:text-gray-900 transition-colors">Blog</Link>
            <Link href="/login" className="bg-violet-600 text-white px-4 py-2 rounded-xl hover:bg-violet-700 transition-colors font-semibold text-sm">
              Empezar gratis
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/blog" className="hover:text-gray-600 transition-colors">Blog</Link>
          <span>›</span>
          <span className={`font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-600'}`}>
            {post.category}
          </span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <div className="text-6xl mb-6">{post.emoji}</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
            <span>·</span>
            <span>{post.readingTime} min de lectura</span>
          </div>
        </div>

        {/* Article body */}
        <article className="prose prose-gray max-w-none">
          {/* Intro */}
          <p className="text-lg text-gray-600 leading-relaxed border-l-4 border-violet-400 pl-5 mb-10 italic">
            {post.intro}
          </p>

          {post.sections.map((section, i) => (
            <div key={i} className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{section.h2}</h2>

              {section.paragraphs?.map((p, j) => {
                // Handle **bold** inline rendering
                const parts = p.split(/(\*\*[^*]+\*\*)/g)
                return (
                  <p key={j} className="text-gray-600 leading-relaxed mb-3">
                    {parts.map((part, k) =>
                      part.startsWith('**') && part.endsWith('**')
                        ? <strong key={k} className="font-semibold text-gray-800">{part.slice(2, -2)}</strong>
                        : part
                    )}
                  </p>
                )
              })}

              {section.highlight && (
                <div className="my-6 bg-violet-50 border border-violet-100 rounded-2xl px-6 py-4">
                  <p className="text-violet-800 font-semibold text-sm leading-relaxed">{section.highlight}</p>
                </div>
              )}

              {section.list && (
                <div className="my-4">
                  {section.list.intro && (
                    <p className="text-gray-700 font-medium mb-3">{section.list.intro}</p>
                  )}
                  <ul className="space-y-2.5">
                    {section.list.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-3 text-gray-600 text-sm leading-relaxed">
                        <span className="flex-shrink-0 w-5 h-5 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center font-bold text-xs mt-0.5">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {/* Conclusion */}
          <div className="mt-10 p-6 bg-gray-50 rounded-2xl">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Conclusión</h2>
            <p className="text-gray-600 leading-relaxed">{post.conclusion}</p>
          </div>
        </article>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl p-8 text-center text-white">
          <h3 className="text-xl font-extrabold mb-2">{post.ctaText}</h3>
          <p className="text-violet-200 text-sm mb-5">Sin tarjeta de crédito. Gratis para empezar.</p>
          <Link
            href={post.ctaHref}
            className="inline-block bg-white text-violet-700 font-bold px-6 py-3 rounded-xl hover:bg-violet-50 transition-colors"
          >
            {post.ctaText} →
          </Link>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-14">
            <h3 className="text-lg font-bold text-gray-900 mb-5">También te puede interesar</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map(r => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="group flex gap-4 p-4 border border-gray-100 rounded-2xl hover:border-violet-200 hover:shadow-sm transition-all"
                >
                  <span className="text-3xl flex-shrink-0">{r.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-violet-700 transition-colors leading-snug">{r.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{r.readingTime} min</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All posts link */}
        <div className="mt-10 text-center">
          <Link href="/blog" className="text-sm text-violet-600 font-semibold hover:text-violet-800 transition-colors">
            ← Ver todos los artículos
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 mt-10">
        <div className="max-w-3xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
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
