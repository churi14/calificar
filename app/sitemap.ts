import type { MetadataRoute } from 'next'

const BASE = 'https://calificar.com.ar'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: BASE,                                      lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/precios`,                         lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/tienda`,                          lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/beneficios`,                      lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/como-funciona`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/sobre-calificar`,                 lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/preguntas-frecuentes`,            lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/links`,                           lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]
}
