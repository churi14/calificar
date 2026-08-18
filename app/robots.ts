import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/onboarding/',
          '/r/',
          '/api/',
          '/(auth)/',
          '/login/',
          '/register/',
          '/recuperar/',
          '/nueva-contrasenia/',
          '/demo/dashboard/',
          '/qr/dashboard/',
          '/qr/login/',
          '/qr/register/',
          '/g/',
        ],
      },
    ],
    sitemap: 'https://calificar.com.ar/sitemap.xml',
  }
}
