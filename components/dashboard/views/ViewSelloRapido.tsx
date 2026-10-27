'use client'

import React, { useState, useEffect } from 'react'
import type { Card } from '@/types/dashboard'
import { canUse } from '@/lib/plan-features'
import { STAMP_INTERVALS, DEFAULT_STAMP_INTERVAL, isStampInterval, type StampInterval } from '@/lib/stamp-interval'

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
  const [copiedLogin, setCopiedLogin] = useState(false)
  // Entrada para ver la tarjeta sin sumar sello (aparte de los QR de sellos)
  const loginLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/t/${selectedProgram}`
      : `/t/${selectedProgram}`
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
  const [waBusy, setWaBusy] = useState(false)
  const [linkOnly, setLinkOnly] = useState(false)
  const [linkOnlyAvailable, setLinkOnlyAvailable] = useState(true)
  const [linkOnlySaving, setLinkOnlySaving] = useState(false)
  const [linkOnlyError, setLinkOnlyError] = useState('')

  // ── Control de sellos (plan Pro): solo sella el negocio + tiempo entre sellos ──
  const canControl = canUse(plan, 'business_only') && !isExpired
  const [businessOnly, setBusinessOnly] = useState(false)
  const [stampInterval, setStampInterval] = useState<StampInterval>(DEFAULT_STAMP_INTERVAL)
  const [controlAvailable, setControlAvailable] = useState(true)
  const [controlSaving, setControlSaving] = useState(false)
  const [controlError, setControlError] = useState('')

  const authHeaders: HeadersInit = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }

  useEffect(() => {
    if (!selectedProgram || !accessToken) return
    fetch(`/api/fidelizacion/stamp-settings?program_id=${selectedProgram}`, { headers: authHeaders })
      .then(r => r.json())
      .then(d => {
        setLinkOnly(!!d.require_stamp_token); setLinkOnlyAvailable(d.available !== false)
        setBusinessOnly(!!d.business_only)
        setStampInterval(isStampInterval(d.stamp_interval) ? d.stamp_interval : DEFAULT_STAMP_INTERVAL)
        setControlAvailable(d.control_available !== false)
      })
      .catch(() => {})
  }, [selectedProgram, accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  /** Guarda un cambio del control de sellos y, si sale bien, lo refleja en pantalla */
  async function saveControl(patch: { business_only_stamps?: boolean; stamp_interval?: StampInterval }) {
    setControlSaving(true); setControlError('')
    const r = await fetch('/api/fidelizacion/stamp-settings', {
      method: 'POST', headers: authHeaders,
      body: JSON.stringify({ program_id: selectedProgram, ...patch }),
    })
    const d = await r.json().catch(() => ({}))
    setControlSaving(false)
    if (!r.ok) { setControlError(d.error ?? 'No se pudo guardar'); return }
    if (patch.business_only_stamps !== undefined) setBusinessOnly(patch.business_only_stamps)
    if (patch.stamp_interval) setStampInterval(patch.stamp_interval)
  }

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
    <div className="p-6 max-w-5xl mx-auto pt-8">
      <h2 className="text-2xl font-extrabold text-zinc-900 mb-1">Sello rápido</h2>
      <p className="text-sm text-zinc-500 mb-8">Ingresá el teléfono del cliente y sellá con un tap.</p>
      {branchLabel && (
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 rounded-full px-3 py-1 -mt-5 mb-6">
          Los sellos cuentan en: {branchLabel}
        </p>
      )}

      {/* Dos columnas en pantallas grandes: todo a la vista sin bajar */}
      <div className="grid lg:grid-cols-2 gap-8 items-start">
      <div>
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

      {/* Separador */}
      <div className="my-6 border-t border-zinc-100" />

      {/* QR del local */}
      <div>
        <h3 className="font-bold text-zinc-900 mb-1">QR del local</h3>
        <p className="text-sm text-zinc-500 mb-4">
          Imprimilo y ponélo en el mostrador. Es el mismo QR para todo: si el cliente es nuevo, se registra y recibe su primer sello;
          si ya es cliente, se sella solo. No tiene vencimiento y funciona siempre, también para quien retira su pedido en el local.
          {' '}Si ya imprimiste un QR anterior, reimprimí este: el viejo deja de dar sellos cuando prendés el interruptor de pedidos.
        </p>
        <div className="flex flex-col items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-2xl p-5">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrLink)}&color=0F172A&bgcolor=FFFFFF&qzone=2`}
            alt="QR del local"
            width={140}
            height={140}
            className="rounded-xl"
          />
          <p className="text-xs text-zinc-400 text-center">
            {businessOnly
              ? 'Con "solo sella el negocio" este QR no suma sellos: muestra la tarjeta del cliente.'
              : `Para el local y los retiros · Sin vencimiento · 1 sello por número ${{ h4: 'cada 4 horas', h12: 'cada 12 horas', day: 'por día' }[stampInterval]}`}
          </p>
          <div className="flex gap-2 w-full">
            <button
              onClick={() => window.open(qrLink, '_blank')}
              className="flex-1 py-2 rounded-xl text-xs font-semibold border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              Ampliar QR
            </button>
            <button
              onClick={copyLink}
              className="flex-1 py-2 rounded-xl text-xs font-semibold border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              {copied ? '✓ Copiado' : 'Copiar link'}
            </button>
          </div>
        </div>
      </div>

      </div>

      {/* Columna derecha: control de sellos y pedidos (delivery, dark kitchen y WhatsApp) */}
      <div>
      {canConfigure && (
        <div className="rounded-2xl border border-violet-200 bg-violet-50/40 p-5 mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-700 mb-1">Control de sellos · Plan Pro</p>
          <h3 className="font-bold text-zinc-900 mb-1">Quién sella y cada cuánto</h3>
          {canControl ? (
            <>
              <div className="flex items-start justify-between gap-4 mt-3">
                <div>
                  <p className="text-sm font-bold text-zinc-900">Solo sella el negocio</p>
                  <p className="text-xs text-zinc-500 mt-0.5 leading-snug">
                    El QR y el link del local dejan de sumar sellos: el cliente solo ve su tarjeta. Los sellos los cargás vos desde acá (Sello rápido) o desde Clientes, y el límite de abajo vale también para tu equipo.
                  </p>
                </div>
                <button
                  onClick={() => saveControl({ business_only_stamps: !businessOnly })}
                  disabled={controlSaving || !controlAvailable}
                  aria-pressed={businessOnly}
                  className={`relative w-12 h-6 rounded-full shrink-0 transition-colors ${businessOnly ? 'bg-violet-600' : 'bg-zinc-300'} disabled:opacity-50`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${businessOnly ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-violet-200">
                <label className="text-sm font-bold text-zinc-900 block mb-1" htmlFor="stamp-interval">Tiempo entre sellos de un mismo cliente</label>
                <select
                  id="stamp-interval"
                  value={stampInterval}
                  onChange={e => saveControl({ stamp_interval: e.target.value as StampInterval })}
                  disabled={controlSaving || !controlAvailable}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-violet-400 disabled:opacity-50"
                >
                  {STAMP_INTERVALS.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
                </select>
                <p className="text-xs text-zinc-500 mt-1.5 leading-snug">
                  {businessOnly
                    ? 'Si alguien intenta sellar de nuevo antes de tiempo, el panel le avisa que ya sellaste a ese cliente.'
                    : 'Aplica a los sellos que se dan con el QR y el link. Desde el panel el sello sigue sin límite hasta que prendas "solo sella el negocio".'}
                </p>
              </div>
              {controlError && <p className="text-xs text-red-500 mt-2">{controlError}</p>}
              {!controlAvailable && <p className="text-xs text-amber-600 mt-2">Falta correr la migración stamp_business_only.sql para poder usarlo.</p>}
            </>
          ) : (
            <p className="text-sm text-zinc-500 mt-2">
              Elegir que solo sella el negocio y cuánto tiempo pasa entre sellos está disponible en el plan <strong>Pro</strong>.
            </p>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-1">Delivery, dark kitchen y pedidos por WhatsApp</p>
        <h3 className="font-bold text-zinc-900 mb-1">Link de un solo uso para cada pedido</h3>
        {isProPlus ? (
          <>
            <p className="text-sm text-zinc-600 mb-4 leading-relaxed">
              Cada link sirve <b>una sola vez</b> y vale 2 horas. En cuanto el cliente lo usa para sumar su sello, deja de funcionar:
              si lo reenvía o se lo pasa a otro, no sirve. Al tocar Copiar o Enviar siempre sale uno nuevo, distinto para cada cliente.
            </p>
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
          </>
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4">
            <p className="text-sm text-zinc-500">
              Los links con vencimiento automático están disponibles en el plan <strong>Pro</strong>.
            </p>
          </div>
        )}

        {canConfigure && (
          <div className="mt-5 pt-4 border-t border-emerald-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-zinc-900">Dar sellos solo con link de un solo uso</p>
                <p className="text-xs text-zinc-500 mt-0.5 leading-snug">
                  Para delivery y pedidos por WhatsApp: los links comunes y copiados dejan de dar sellos, y solo vale el link que mandás en cada pedido. El QR del local sigue funcionando siempre, para quien retira.
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

      {/* QR para ver la tarjeta (no suma sellos) */}
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex items-center gap-4">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(loginLink)}&color=0F172A&bgcolor=FFFFFF&qzone=2`}
            alt="QR para ver mi tarjeta"
            width={96}
            height={96}
            className="rounded-lg shrink-0"
          />
          <div className="min-w-0">
            <h3 className="font-bold text-zinc-900 leading-tight">QR para ver mi tarjeta</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-snug">
              Para que el cliente entre a su tarjeta cuando quiera, sin sumar sellos. Si no la tiene guardada, pone su teléfono y la ve. Es aparte del QR del local.
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => window.open(loginLink, '_blank')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                Ampliar QR
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(loginLink).then(() => {
                    setCopiedLogin(true)
                    setTimeout(() => setCopiedLogin(false), 2000)
                  })
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                {copiedLogin ? '✓ Copiado' : 'Copiar link'}
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
      </div>
    </div>
  )
}
