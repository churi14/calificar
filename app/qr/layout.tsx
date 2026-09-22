import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Generador de QR Dinámicos Gratis | Calificar',
  description: 'Creá códigos QR dinámicos gratis. Editá la URL de destino cuando quieras sin reimprimir el QR. Estadísticas de scans incluidas. Ideal para negocios en Argentina.',
  keywords: ['qr dinámico gratis', 'generador qr dinámico', 'qr dinámico argentina', 'crear qr gratis', 'qr editable', 'qr con estadísticas', 'qr dinamico', 'codigo qr dinamico gratis', 'qr dinámico online'],
  openGraph: {
    title: 'QR Dinámicos Gratis — Calificar',
    description: 'Creá QRs que podés editar cuando quieras. Sin reimprimir. Gratis.',
    url: 'https://calificar.com.ar/qr',
    siteName: 'Calificar',
    locale: 'es_AR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://calificar.com.ar/qr',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Calificar QR — Generador de QR Dinámicos Gratis',
  url: 'https://calificar.com.ar/qr',
  description: 'Generador de códigos QR dinámicos gratuito. Editá la URL de destino en cualquier momento sin reimprimir el QR. Incluye estadísticas de scans.',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'ARS',
  },
  inLanguage: 'es-AR',
  availableLanguage: 'Spanish',
  featureList: [
    'Códigos QR dinámicos editables',
    'Cambio de URL sin reimprimir',
    'Estadísticas de scans',
    'Gratis sin tarjeta de crédito',
    'Descarga en PNG',
  ],
}

export default function QRLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="qr-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
