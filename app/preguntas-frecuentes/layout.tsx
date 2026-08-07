import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes',
  description: 'Todo lo que necesitás saber sobre Calificar: cómo funciona el cartel NFC, si el cliente necesita una app, cómo se filtran las reseñas negativas y más.',
  alternates: { canonical: 'https://calificar.com.ar/preguntas-frecuentes' },
  openGraph: {
    title: 'Preguntas Frecuentes — Calificar',
    description: 'Resolvé tus dudas sobre el sistema de reseñas NFC + QR para negocios argentinos.',
    url: 'https://calificar.com.ar/preguntas-frecuentes',
  },
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children
}
