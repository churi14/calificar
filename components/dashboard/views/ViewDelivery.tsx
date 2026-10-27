'use client'

import React, { useState, useEffect } from 'react'

interface ViewDeliveryProps {
  selectedProgram: string
  accessToken: string
  /** Sucursal en la que se dan los sellos (null = Principal) */
  branchId?: string | null
  branchLabel?: string
  /** Solo el dueño puede cambiar el modo */
  canConfigure?: boolean
  /** Tipo de local, solo para ajustar el título */
  venueType?: string | null
}

/** Delivery, dark kitchen y locales sin atención al público: links de un solo uso para cada pedido */
export default function ViewDelivery({
  selectedProgram,
  accessToken,
  branchId = null,
  branchLabel,
  canConfigure = true,
  venueType = null,
}: ViewDeliveryProps) {
  const [secureLink, setSecureLink] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState<number>(0)
  const [loadingToken, setLoadingToken] = useState(false)
  const [copiedSecure, setCopiedSecure] = useState(false)
  const [waBusy, setWaBusy] = useState(false)

  const [linkOnly, setLinkOnly] = useState(false)
  const [linkOnlyAvailable, setLinkOnlyAvailable] = useState(true)
  const [linkOnlySaving, setLinkOnlySaving] = useState(false)
  const [linkOnlyError, setLinkOnlyError] = useState('')
  // Con "solo sella el negocio" ningún link suma sellos: estos links no aplican
  const [businessOnly, setBusinessOnly] = useState(false)

  const authHeaders: HeadersInit = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
  const tokenUrl = `/api/fidelizacion/stamp-token?program_id=${selectedProgram}${branchId ? `&branch_id=${branchId}` : ''}`

  useEffect(() => {
    if (!selectedProgram || !accessToken) return
    fetch(`/api/fidelizacion/stamp-settings?program_id=${selectedProgram}`, { headers: authHeaders })
      .then(r => r.json())
      .then(d => {
        setLinkOnly(!!d.require_stamp_token)
        setLinkOnlyAvailable(d.available !== false)
        setBusinessOnly(!!d.business_only)
      })
      .catch(() => {})
  }, [selectedProgram, accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleLinkOnly() {
    setLinkOnlySaving(true); setLinkOnlyError('')
    const next = !linkOnly
    const r = await fetch('/api/fidelizacion/stamp-settings', {
      method: 'POST', headers: authHeaders,
      body: JSON.stringify({ program_id: selectedProgram, require_stamp_token: next }),
    })
    const d = await r.json().catch(() => ({}))
    setLinkOnlySaving(false)
    if (!r.ok) { setLinkOnlyError(d.error ?? 'No se pudo cambiar'); return }
    setLinkOnly(next)
  }

  /** Pide un link de un solo uso NUEVO (uno distinto para cada cliente) */
  async function freshLink(): Promise<string | null> {
    try {
      const r = await fetch(`${tokenUrl}&fresh=1`, { headers: { Authorization: `Bearer ${accessToken}` } })
      const d = await r.json()
      return d.link ?? null
    } catch { return null }
  }

  const waMessage = (link: string) => `¡Gracias por tu pedido! 🎁 Sumá tu sello de fidelidad acá (el link sirve una sola vez): ${link}`

  /** Abre WhatsApp con el mensaje y un link NUEVO; el negocio elige el chat */
  async function sendByWhatsApp() {
    setWaBusy(true)
    const link = await freshLink()
    setWaBusy(false)
    if (!link) return
    window.open(`https://wa.me/?text=${encodeURIComponent(waMessage(link))}`, '_blank')
  }

  useEffect(() => {
    async function fetchToken() {
      setLoadingToken(true)
      try {
        const res = await fetch(tokenUrl, { headers: { Authorization: `Bearer ${accessToken}` } })
        const data = await res.json()
        if (data.link) {
          setSecureLink(data.link)
          setSecondsLeft(data.seconds_remaining)
        }
      } catch { /* silent */ }
      setLoadingToken(false)
    }
    fetchToken()
  }, [selectedProgram, accessToken, branchId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown y auto-refresh cuando expira
  useEffect(() => {
    if (secondsLeft <= 0) return
    const interval = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          fetch(tokenUrl, { headers: { Authorization: `Bearer ${accessToken}` } })
            .then(r => r.json())
            .then(data => {
              if (data.link) {
                setSecureLink(data.link)
                setSecondsLeft(data.seconds_remaining)
              }
            })
            .catch(() => {})
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [secondsLeft, selectedProgram, accessToken, branchId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function copySecureLink() {
    // Siempre se copia un link NUEVO: si dos clientes recibieran el mismo, el segundo no podría usarlo
    const link = (await freshLink()) ?? secureLink
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopiedSecure(true)
    setTimeout(() => setCopiedSecure(false), 2000)
  }

  return (
    <div className="p-6 max-w-xl mx-auto pt-8">
      <h2 className="text-2xl font-extrabold text-zinc-900 mb-1">
        {venueType === 'sin_calle' ? 'Links a distancia' : 'Delivery y dark kitchen'}
      </h2>
      <p className="text-sm text-zinc-500 mb-8">
        {venueType === 'sin_calle'
          ? 'Para locales sin salida a la calle: mandás un link por WhatsApp y el cliente suma su sello sin pasar por un QR.'
          : 'Para negocios que venden por delivery, WhatsApp o no reciben gente en el local.'}
      </p>
      {branchLabel && (
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 rounded-full px-3 py-1 -mt-5 mb-6">
          Los sellos cuentan en: {branchLabel}
        </p>
      )}

      {businessOnly ? (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-500 leading-relaxed">
          <p className="font-bold text-zinc-700 mb-1">Links de un solo uso para pedidos</p>
          No aplican mientras "solo sella el negocio" esté prendido: ningún link suma sellos al cliente. Apagalo en Sello rápido si querés volver a mandar links por WhatsApp.
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-1">Delivery, dark kitchen y pedidos por WhatsApp</p>
          <h3 className="font-bold text-zinc-900 mb-1">Link de un solo uso para cada pedido</h3>
          <p className="text-sm text-zinc-600 mb-4 leading-relaxed">
            Cada link sirve <b>una sola vez</b> y vale 2 horas. En cuanto el cliente lo usa para sumar su sello, deja de funcionar:
            si lo reenvía o se lo pasa a otro, no sirve. Al tocar Copiar o Enviar siempre sale uno nuevo, distinto para cada cliente.
          </p>
          <ul className="text-sm text-zinc-600 mb-4 leading-relaxed space-y-1 list-disc pl-5">
            <li><b>Cliente que ya tiene tarjeta:</b> pone su teléfono y recibe el sello.</li>
            <li><b>Cliente nuevo:</b> pone su teléfono y su nombre; se le crea la tarjeta y recibe su primer sello en el mismo paso.</li>
            <li>Si querés que se registre <b>sin recibir sello</b>, usá el "QR de registro" de Sello rápido.</li>
          </ul>
          {loadingToken ? (
            <div className="h-12 bg-zinc-100 rounded-xl animate-pulse" />
          ) : secureLink ? (
            <>
              <div className="flex items-center gap-2 bg-white border border-emerald-200 rounded-xl px-4 py-3">
                <span className="text-sm text-emerald-800 font-mono truncate flex-1">{secureLink}</span>
                <button
                  onClick={copySecureLink}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                  style={{ background: copiedSecure ? '#10b981' : '#7C3AED', color: 'white' }}
                >
                  {copiedSecure ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (secondsLeft / 10) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-zinc-400 tabular-nums">
                  {secondsLeft > 0 ? `${secondsLeft}s` : 'Actualizando…'}
                </span>
              </div>
              <button
                onClick={sendByWhatsApp}
                disabled={waBusy}
                className="mt-4 w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                style={{ background: '#25D366' }}
              >
                {waBusy ? '…' : 'Enviar por WhatsApp'}
              </button>
              <p className="text-xs text-zinc-400 mt-1.5 text-center">Se abre WhatsApp con el mensaje y el link listo; vos elegís el chat.</p>
            </>
          ) : (
            <p className="text-sm text-red-500">No se pudo generar el link. Recargá la página.</p>
          )}

          {canConfigure && (
            <div className="mt-5 pt-4 border-t border-emerald-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-zinc-900">Modo dark kitchen / locales sin atención al público</p>
                  <p className="text-xs text-zinc-500 mt-0.5 leading-snug">
                    El link fijo de sellos deja de sumar sellos y solo valen los links de un solo uso que mandás en cada pedido. El QR del local sigue sumando, para quien retira. Apagado, el link fijo también suma sellos.
                  </p>
                </div>
                <button
                  onClick={toggleLinkOnly}
                  disabled={linkOnlySaving || !linkOnlyAvailable}
                  aria-pressed={linkOnly}
                  className={`relative w-12 h-6 rounded-full shrink-0 transition-colors ${linkOnly ? 'bg-emerald-500' : 'bg-zinc-300'} disabled:opacity-50`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${linkOnly ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              {linkOnlyError && <p className="text-xs text-red-500 mt-2">{linkOnlyError}</p>}
              {!linkOnlyAvailable && <p className="text-xs text-amber-600 mt-2">Falta correr la migración stamp_link_only.sql para poder activarlo.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
