'use client'

import React, { useState, useEffect } from 'react'
import type { Card } from '@/types/dashboard'

interface ViewSelloRapidoProps {
  cards: Card[]
  selectedProgram: string
  accessToken: string
  manualStamp: (id: string, name: string) => void
  plan?: string
  planExpiresAt?: string | null
  /** Sucursal en la que se dan los sellos (null = Principal) */
  branchId?: string | null
  branchLabel?: string
  /** Solo el dueño puede cambiar el modo delivery */
  canConfigure?: boolean
}

export default function ViewSelloRapido({
  cards,
  selectedProgram,
  accessToken,
  manualStamp,
  plan = 'trial',
  planExpiresAt = null,
  branchId = null,
  branchLabel,
  canConfigure = true,
}: ViewSelloRapidoProps) {
  const [phone, setPhone] = useState('')
  const [found, setFound] = useState<Card | null | 'none'>(null)
  const [stamping, setStamping] = useState(false)
  const [stamped, setStamped] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedSecure, setCopiedSecure] = useState(false)
  const selfLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/s/${selectedProgram}${branchId ? `?b=${branchId}` : ''}`
      : `/s/${selectedProgram}${branchId ? `?b=${branchId}` : ''}`

  // Link seguro rotativo (disponible en todos los planes)
  const isExpired = planExpiresAt ? new Date(planExpiresAt) < new Date() : false
  const isProPlus = true
  const [secureLink, setSecureLink] = useState<string | null>(null)
  const [localKey, setLocalKey] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState<number>(0)
  const [loadingToken, setLoadingToken] = useState(false)

  // QR del local: lleva una clave para seguir dando sellos aunque se exija el link de un solo uso en los pedidos
  const qrLink = localKey ? `${selfLink}${selfLink.includes('?') ? '&' : '?'}k=${localKey}` : selfLink

  // ── Pedidos por WhatsApp / delivery ──
  const [waPhone, setWaPhone] = useState('')
  const [waBusy, setWaBusy] = useState(false)
  const [waCopied, setWaCopied] = useState(false)
  const [linkOnly, setLinkOnly] = useState(false)
  const [linkOnlyAvailable, setLinkOnlyAvailable] = useState(true)
  const [linkOnlySaving, setLinkOnlySaving] = useState(false)
  const [linkOnlyError, setLinkOnlyError] = useState('')

  const authHeaders: HeadersInit = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }

  useEffect(() => {
    if (!selectedProgram || !accessToken) return
    fetch(`/api/fidelizacion/stamp-settings?program_id=${selectedProgram}`, { headers: authHeaders })
      .then(r => r.json())
      .then(d => { setLinkOnly(!!d.require_stamp_token); setLinkOnlyAvailable(d.available !== false) })
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
      const r = await fetch(
        `/api/fidelizacion/stamp-token?program_id=${selectedProgram}&fresh=1${branchId ? `&branch_id=${branchId}` : ''}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const d = await r.json()
      return d.link ?? null
    } catch { return null }
  }

  /** Número de WhatsApp argentino: acepta 1155667788, 011 15 5566-7788, +54 9 11 5566 7788 */
  function waNumber(raw: string): string {
    let d = raw.replace(/\D/g, '').replace(/^0+/, '')
    if (!d) return ''
    if (d.startsWith('54')) return d
    d = d.replace(/^(\d{2,4})15(\d{6,8})$/, '$1$2')   // saca el 15 del medio
    return `54${d.startsWith('9') ? '' : '9'}${d}`
  }

  const waMessage = (link: string) => `¡Gracias por tu pedido! 🎁 Sumá tu sello de fidelidad acá (el link sirve una sola vez): ${link}`

  async function sendByWhatsApp() {
    setWaBusy(true)
    const link = await freshLink()
    setWaBusy(false)
    if (!link) return
    const num = waNumber(waPhone)
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(waMessage(link))}`, '_blank')
    setWaPhone('')
  }

  async function copyWaMessage() {
    setWaBusy(true)
    const link = await freshLink()
    setWaBusy(false)
    if (!link) return
    await navigator.clipboard.writeText(waMessage(link))
    setWaCopied(true)
    setTimeout(() => setWaCopied(false), 2000)
  }

  useEffect(() => {
    if (!isProPlus) return
    async function fetchToken() {
      setLoadingToken(true)
      try {
        const res = await fetch(
          `/api/fidelizacion/stamp-token?program_id=${selectedProgram}${branchId ? `&branch_id=${branchId}` : ''}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        const data = await res.json()
        if (data.link) {
          setSecureLink(data.link)
          setSecondsLeft(data.seconds_remaining)
        }
        if (data.local_key) setLocalKey(data.local_key)
      } catch { /* silent */ }
      setLoadingToken(false)
    }
    fetchToken()
  }, [isProPlus, selectedProgram, accessToken, branchId])

  // Countdown y auto-refresh cuando expira
  useEffect(() => {
    if (!isProPlus || secondsLeft <= 0) return
    const interval = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          fetch(`/api/fidelizacion/stamp-token?program_id=${selectedProgram}${branchId ? `&branch_id=${branchId}` : ''}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
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
  }, [isProPlus, secondsLeft, selectedProgram, accessToken, branchId])

  function formatCountdown(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  async function copySecureLink() {
    // Siempre se copia un link NUEVO: si dos clientes recibieran el mismo, el segundo no podría usarlo
    const link = (await freshLink()) ?? secureLink
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopiedSecure(true)
    setTimeout(() => setCopiedSecure(false), 2000)
  }

  function search(value: string) {
    setPhone(value)
    setStamped(false)
    const clean = value.replace(/\D/g, '')
    if (clean.length < 6) { setFound(null); return }
    const match = cards.find(c => {
      const stored = c.phone.replace(/\D/g, '')
      return stored.endsWith(clean) || clean.endsWith(stored)
    })
    setFound(match ?? 'none')
  }

  async function doStamp() {
    if (!found || found === 'none') return
    setStamping(true)
    await manualStamp(found.id, found.name)
    setStamping(false)
    setStamped(true)
    setPhone('')
    setTimeout(() => { setFound(null); setStamped(false) }, 2500)
  }

  function copyLink() {
    navigator.clipboard.writeText(selfLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="p-6 max-w-md mx-auto pt-10">
      <h2 className="text-2xl font-extrabold text-zinc-900 mb-1">Sello rápido</h2>
      <p className="text-sm text-zinc-500 mb-8">Ingresá el teléfono del cliente y sellá con un tap.</p>
      {branchLabel && (
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 rounded-full px-3 py-1 -mt-5 mb-6">
          Los sellos cuentan en: {branchLabel}
        </p>
      )}

      {/* Input teléfono */}
      <div className="relative mb-4">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">📱</span>
        <input
          type="tel"
          value={phone}
          onChange={e => search(e.target.value)}
          placeholder="Número de teléfono"
          className="w-full pl-11 pr-4 py-4 rounded-2xl border border-zinc-200 bg-white text-zinc-900 text-lg font-medium placeholder-zinc-400 focus:outline-none focus:border-violet-400 transition"
        />
      </div>

      {/* Resultado búsqueda */}
      {found === 'none' && (
        <div className="rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-4 text-center text-zinc-500 text-sm mb-4">
          No hay ningún cliente con ese número.
        </div>
      )}

      {found && found !== 'none' && !stamped && (
        <div className="rounded-2xl border border-violet-100 bg-violet-50 px-5 py-4 mb-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-violet-900 text-lg">{found.name}</p>
            <p className="text-violet-600 text-sm">
              {found.stamps} sello{found.stamps !== 1 ? 's' : ''} actuales
            </p>
          </div>
          <span className="text-3xl">🃏</span>
        </div>
      )}

      {stamped && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 mb-4 text-center">
          <p className="text-emerald-700 font-bold text-lg">✅ ¡Sello cargado!</p>
        </div>
      )}

      {/* Botón sellar */}
      <button
        onClick={doStamp}
        disabled={!found || found === 'none' || stamping || stamped}
        className="w-full py-4 rounded-2xl font-extrabold text-lg text-white transition-all disabled:opacity-40"
        style={{ background: '#7C3AED' }}
      >
        {stamping ? 'Sellando…' : stamped ? '¡Listo!' : '⚡ Sellar'}
      </button>

      {/* Divisor */}
      <div className="my-10 border-t border-zinc-100" />

      {/* Pedidos por WhatsApp / delivery / dark kitchen */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 mb-10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-1">Delivery, dark kitchen y pedidos por WhatsApp</p>
        <h3 className="font-bold text-zinc-900 mb-1">Mandá el sello con cada pedido</h3>
        <p className="text-sm text-zinc-600 mb-4 leading-relaxed">
          Si tus clientes no pasan por un local, tocá el botón y se abre WhatsApp con un mensaje y un link
          <b> de un solo uso</b> para ese cliente. Lo abre, pone su teléfono y suma su sello. Si lo reenvía o se lo pasa a otro, no sirve.
        </p>
        <div className="flex gap-2 mb-3">
          <input
            type="tel"
            value={waPhone}
            onChange={e => setWaPhone(e.target.value)}
            placeholder="Teléfono del cliente (ej: 1155667788)"
            aria-label="Teléfono del cliente"
            className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-zinc-200 bg-white text-sm focus:outline-none focus:border-emerald-400"
          />
          <button
            onClick={sendByWhatsApp}
            disabled={waBusy}
            className="flex-shrink-0 px-4 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60"
            style={{ background: '#25D366' }}
          >
            {waBusy ? '…' : 'Enviar por WhatsApp'}
          </button>
        </div>
        <button onClick={copyWaMessage} disabled={waBusy} className="text-xs font-semibold text-emerald-700 hover:text-emerald-900">
          {waCopied ? '✓ Mensaje copiado' : 'O copiar el mensaje y pegarlo en el chat'}
        </button>
        <p className="text-xs text-zinc-400 mt-3">El teléfono es opcional: sin teléfono, WhatsApp te deja elegir el chat. El link vale 2 horas o hasta que se use.</p>

        {canConfigure && (
          <div className="mt-5 pt-4 border-t border-emerald-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-zinc-900">Dar sellos solo con este link</p>
                <p className="text-xs text-zinc-500 mt-0.5 leading-snug">
                  Para pedidos por WhatsApp o delivery: el link fijo (el que se podría compartir o adivinar) deja de dar sellos, y solo vale el link que vos mandás en cada pedido. El QR del local sigue funcionando siempre, para quien retira.
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

      {/* Link de auto-sello */}
      <div>
        <h3 className="font-bold text-zinc-900 mb-1">Link fijo de auto-sello</h3>
        <p className="text-sm text-zinc-500 mb-4">
          Un link que sirve siempre, pensado para el local. El cliente lo abre, pone su teléfono y se sella solo.
          {linkOnly ? ' Ahora está desactivado: para pedidos solo vale el link de un solo uso (el QR del local sigue funcionando).' : ' Para pedidos por WhatsApp o delivery usá mejor el link de un solo uso de arriba.'}
        </p>
        <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3">
          <span className="text-sm text-zinc-600 font-mono truncate flex-1">{selfLink}</span>
          <button
            onClick={copyLink}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
            style={{ background: copied ? '#10b981' : '#7C3AED', color: 'white' }}
          >
            {copied ? '✓ Copiado' : 'Copiar'}
          </button>
        </div>
        <p className="text-xs text-zinc-400 mt-2">
          El link aplica anti-abuso: máximo 1 sello por número cada 4 horas.
        </p>
      </div>

      {/* QR permanente para el mostrador */}
      <div className="mt-8 pt-6 border-t border-zinc-100">
        <h3 className="font-bold text-zinc-900 mb-1">QR para sumar sellos en el local</h3>
        <p className="text-sm text-zinc-500 mb-4">
          Imprimilo y ponélo en el mostrador. El cliente lo escanea, pone su teléfono y se sella
          solo. No tiene vencimiento y funciona siempre, también para quien retira su pedido en el local. Si ya imprimiste un QR anterior, reimprimí este: el viejo deja de dar sellos cuando prendés el interruptor de arriba.
        </p>
        <div className="flex flex-col items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-2xl p-5">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrLink)}&color=0F172A&bgcolor=FFFFFF&qzone=2`}
            alt="QR sellos"
            width={160}
            height={160}
            className="rounded-xl"
          />
          <p className="text-xs text-zinc-400 text-center">Para el local y los retiros · Sin vencimiento</p>
          <div className="flex gap-2 w-full">
            <button
              onClick={() => window.open(qrLink, '_blank')}
              className="flex-1 py-2 rounded-xl text-xs font-semibold border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              Ampliar QR
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(qrLink)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              Copiar link
            </button>
          </div>
        </div>
      </div>

      {/* Link seguro con vencimiento */}
      <div className="mt-8 pt-6 border-t border-zinc-100">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-zinc-900">Link seguro con vencimiento</h3>
        </div>
        {isProPlus ? (
          <>
            <p className="text-sm text-zinc-500 mb-4">
              Cada link sirve <b>una sola vez</b> y vale 2 horas. En cuanto alguien lo usa para cargar un sello,
              deja de funcionar. Esta pantalla muestra uno nuevo cada 10 segundos, y al tocar Copiar siempre
              te da uno distinto para cada cliente.
            </p>
            {loadingToken ? (
              <div className="h-12 bg-zinc-100 rounded-xl animate-pulse" />
            ) : secureLink ? (
              <>
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
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
                <p className="text-xs text-zinc-400 mt-1">
                  Cada link vale 2 horas o hasta que se use.
                </p>
              </>
            ) : (
              <p className="text-sm text-red-500">No se pudo generar el link. Recargá la página.</p>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4">
            <p className="text-sm text-zinc-500">
              Los links con vencimiento automático están disponibles en el plan{' '}
              <strong>Pro</strong>. Evitá que tus clientes guarden el link y se sellen solos cuando
              quieran.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
