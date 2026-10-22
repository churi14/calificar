'use client'

import { useEffect, useState } from 'react'

/**
 * El QR del negocio es UNO solo, en todos lados: quien es nuevo se registra y quien ya está
 * registrado suma su sello (/s/…). Lleva la clave del local (?k=) para seguir sumando sellos
 * aunque el negocio exija el link de un solo uso en los pedidos.
 * Mientras carga la clave devuelve el link sin clave, que también funciona.
 */
export function useUnifiedQr(programId: string | null, accessToken?: string, branchId?: string | null): string {
  const [key, setKey] = useState<string | null>(null)

  useEffect(() => {
    if (!programId || !accessToken) return
    let cancelled = false
    fetch(`/api/fidelizacion/stamp-token?program_id=${programId}${branchId ? `&branch_id=${branchId}` : ''}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.json())
      .then(d => { if (!cancelled) setKey(d.local_key ?? null) })
      .catch(() => { if (!cancelled) setKey(null) })
    return () => { cancelled = true }
  }, [programId, accessToken, branchId])

  const params = [branchId ? `b=${branchId}` : '', key ? `k=${key}` : ''].filter(Boolean).join('&')
  return `https://calificar.com.ar/s/${programId}${params ? `?${params}` : ''}`
}
