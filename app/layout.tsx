import type { Metadata } from 'next'
import { Poppins, Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const GA_ID = 'G-TXJKY9DTWY'

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700', '800'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
})

const SITE_URL = 'https://calificar.com.ar'
const SITE_NAME = 'Calificar'
const DEFAULT_TITLE = 'Calificar — Más reseñas de Google para tu local'
const DEFAULT_DESCRIPTION = 'Conseguí más reseñas positivas en Google y filtrá las negativas antes de que lleguen. Cartel NFC + QR para restaurantes, peluquerías, clínicas y cualquier negocio con atención al público en Argentina.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    'reseñas Google', 'más reseñas Google', 'cartel NFC reseñas', 'QR reseñas Google',
    'cómo conseguir reseñas Google', 'reseñas Google Maps negocio', 'filtrar reseñas negativas',
    'sistema reseñas restaurante Argentina', 'cartel NFC Argentina', 'aumentar reseñas Google',
    'gestión reseñas negocio', 'reputación online negocios Argentina',
  ],
  authors: [{ name: 'En Red Consultora', url: 'https://www.enredconsultora.com.ar' }],
  creator: 'En Red Consultora',
  publisher: 'Calificar',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Calificar — Más reseñas de Google para tu local' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ['/og-image.png'],
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%237C3AED'/><text x='16' y='22' text-anchor='middle' fill='white' font-size='18' font-family='Arial' font-weight='bold'>★</text></svg>",
  },
  alternates: { canonical: SITE_URL },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Calificar',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: SITE_URL,
  description: DEFAULT_DESCRIPTION,
  offers: {
    '@type': 'Offer',
    price: '5000',
    priceCurrency: 'ARS',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      billingDuration: 'P1M',
    },
  },
  provider: {
    '@type': 'Organization',
    name: 'En Red Consultora',
    url: 'https://www.enredconsultora.com.ar',
    areaServed: 'AR',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${poppins.variable} ${inter.variable} scroll-smooth`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_ID}');
      `}</Script>
      <body className="font-sans">{children}</body>
    </html>
  )
}
