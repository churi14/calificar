import type { MetadataRoute } from 'next'
import { posts } from '@/lib/blog/posts'

const BASE = 'https://calificar.com.ar'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const blogPosts: MetadataRoute.Sitemap = posts.map(p => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [
    { url: BASE,                                      lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/qr`,                              lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/blog`,                            lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/precios`,                         lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tienda`,                          lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/beneficios`,                      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/como-funciona`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/sobre-calificar`,                 lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/preguntas-frecuentes`,            lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/links`,                           lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    ...blogPosts,
  ]
}
