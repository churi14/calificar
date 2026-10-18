/**
 * Prefijo de un código de cupón: hasta 6 letras o números en mayúscula, sin tildes, espacios ni
 * símbolos (por ejemplo "10% OFF en tu compra" pasa a "10OFFE", no a "10%OF").
 */
export function couponPrefix(raw: string | null | undefined, fallback = 'PREMIO'): string {
  const clean = (raw ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 6)
  return clean || fallback
}
