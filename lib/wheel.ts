/**
 * Ángulo final de la ruleta para que la flecha (fija arriba) caiga en el premio `index`.
 * Los segmentos se dibujan desde las 12 en punto, en sentido horario, con tamaño
 * proporcional a su probabilidad. Rotar la rueda θ grados deja bajo la flecha el
 * punto de la rueda en (360 - θ).
 */
export function wheelTargetAngle(
  currentAngle: number,
  prizes: { probability: number }[],
  index: number,
  turns = 5,
): number {
  const total = prizes.reduce((s, p) => s + (p.probability || 0), 0) || 1
  let start = 0
  for (let i = 0; i < index; i++) start += ((prizes[i].probability || 0) / total) * 360
  const size = ((prizes[index]?.probability || 0) / total) * 360
  // Punto al azar dentro del segmento (sin pegarse a los bordes)
  const landing = start + size * (0.15 + Math.random() * 0.7)
  const delta = (((-landing - currentAngle) % 360) + 360) % 360
  return currentAngle + turns * 360 + delta
}

/** Sorteo ponderado por probabilidad. Devuelve el índice del premio. */
export function weightedIndex(prizes: { probability: number }[]): number {
  const total = prizes.reduce((s, p) => s + (p.probability || 1), 0)
  let rand = Math.random() * total
  for (let i = 0; i < prizes.length; i++) {
    rand -= prizes[i].probability || 1
    if (rand <= 0) return i
  }
  return prizes.length - 1
}
