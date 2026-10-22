'use client'

import { useEffect, useState } from 'react'

/**
 * El QR del negocio es UNO solo, en todos lados: quien es nuevo se registra y quien ya está
 * registrado suma su sello (/s/…). Lleva la clave del local (?k=) para seguir sumando sellos
 * aunque el negocio exija el link de un solo uso en los pedidos.
 * Mientras carga la clave devuelve el link sin clave, que también funciona.
 *
 * Los links que se comparten (copiar, WhatsApp) van sin la clave: con el modo "solo por link"
 * activo, un link compartido solo sirve para registrarse, no para sumar sellos.
 */
export function useUnifiedQr(programId: string | null, accessToken?: string, branchId?: string | null): { qr: string; link: string } {
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

  const build = (withKey: boolean) => {
    const params = [branchId ? `b=${branchId}` : '', withKey && key ? `k=${key}` : ''].filter(Boolean).join('&')
    return `https://calificar.com.ar/s/${programId}${params ? `?${params}` : ''}`
  }
  // qr: para imprimir y poner en el local (lleva la clave del local).
  // link: para copiar o mandar por WhatsApp; NO lleva la clave, así no se filtra a quien no está en el local.
  return { qr: build(true), link: build(false) }
}
