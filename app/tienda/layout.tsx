import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tienda — Carteles NFC y QR para reseñas de Google',
  description: 'Comprá tu cartel NFC + QR para conseguir más reseñas en Google. Disponible en PVC, acrílico y metal. Envío a todo Argentina.',
  alternates: { canonical: 'https://calificar.com.ar/tienda' },
  keywords: [
    'cartel NFC reseñas Google', 'cartel QR reseñas', 'comprar cartel NFC Argentina',
    'cartel reseñas restaurante', 'NFC Google Maps', 'sticker NFC reseñas',
  ],
  openGraph: {
    title: 'Tienda — Carteles NFC y QR para reseñas de Google',
    description: 'Cartel NFC + QR para conseguir más reseñas en Google. PVC, acrílico y metal. Envío a todo Argentina.',
    url: 'https://calificar.com.ar/tienda',
  },
}

export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return children
}
