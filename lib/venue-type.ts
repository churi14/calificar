/**
 * Tipo de local: cómo atiende el negocio. No es el rubro (businesses.type, que define precios):
 * solo ajusta qué secciones y textos del panel se muestran. Sin elegir = comportamiento de siempre.
 */
export type VenueType = 'local' | 'sin_calle' | 'delivery'

export const VENUE_TYPES: { id: VenueType; label: string; hint: string }[] = [
  { id: 'local', label: 'Local a la calle', hint: 'Los clientes entran al local. Ej: café, panadería, peluquería.' },
  { id: 'sin_calle', label: 'Local sin atención al público', hint: 'Sin salida a la calle, se atiende con turno o a distancia. Ej: uñas, estudio, consultorio.' },
  { id: 'delivery', label: 'Delivery / Dark kitchen', hint: 'Se vende por pedido (WhatsApp, apps) y nadie retira en el local.' },
]

export const isVenueType = (v: unknown): v is VenueType =>
  VENUE_TYPES.some(t => t.id === v)

/** Nombre de la sección de links de un solo uso en el menú */
export function deliveryNavLabel(v?: string | null): string {
  if (v === 'sin_calle') return 'Links a distancia'
  return 'Delivery / Dark kitchen'
}
