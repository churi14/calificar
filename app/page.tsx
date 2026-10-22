import type { Metadata } from 'next'
import FidelizacionLanding from './fidelizacion/page'

// El home de calificar.com.ar es Calificar Fidelización.
// La página anterior (reseñas, carteles y QR) vive en /servicios.
export const metadata: Metadata = {
  title: { absolute: 'Calificar Fidelización · Tarjeta de sellos digital para tu negocio' },
  description: 'Reemplazá las tarjetitas de papel por una tarjeta digital en el celular de tus clientes. Sellos, premios y avisos automáticos. 14 días gratis.',
  alternates: { canonical: '/' },
}

export default FidelizacionLanding
