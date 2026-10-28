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
  const [qrTab, setQrTab] = useState('local')
  // QR ampliado en un popup (para mostrarlo en pantalla o sacarle captura)
  const [zoomQr, setZoomQr] = useState<{ title: string; url: string } | null>(null)
  // Registro de clientes nuevos: crea la tarjeta sin sumar sello (aparte del QR del local)
  const joinLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/fidelizacion/unirse?program=${selectedProgram}`
      : `/fidelizacion/unirse?program=${selectedProgram}`
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
  const [localKey, setLocalKey] = useState<string | null>(null)

  // QR del local: lleva una clave para seguir dando sellos aunque se exija el link de un solo uso en los pedidos
  const qrLink = localKey ? `${selfLink}${selfLink.includes('?') ? '&' : '?'}k=${localKey}` : selfLink

  // ── Modo dark kitchen (se configura en Delivery): acá solo se lee para ajustar los textos ──
  const [linkOnly, setLinkOnly] = useState(false)

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
        setLinkOnly(!!d.require_stamp_token)
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

  // Clave del QR del local (lleva la clave para seguir dando sellos aunque rija el modo dark kitchen)
  useEffect(() => {
    if (!selectedProgram || !accessToken) return
    fetch(`/api/fidelizacion/stamp-token?program_id=${selectedProgram}${branchId ? `&branch_id=${branchId}` : ''}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.json())
      .then(data => { if (data.local_key) setLocalKey(data.local_key) })
      .catch(() => {})
  }, [selectedProgram, accessToken, branchId])

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

  const limitText = { h4: 'cada 4 horas', h12: 'cada 12 horas', day: 'por día' }[stampInterval]
  const qrs = [
    {
      id: 'local', tab: 'Del local', title: 'QR del local', url: qrLink, copy: selfLink,
      desc: businessOnly
        ? 'Con "solo sella el negocio" prendido no suma sellos: el cliente nuevo se registra y el que ya es cliente ve su tarjeta.'
        : `Para el mostrador. El cliente nuevo se registra y recibe su primer sello; el que ya es cliente se sella solo (1 sello ${limitText}). No vence.${linkOnly ? ' Con el modo dark kitchen activo, reimprimí este QR: los anteriores dejan de sellar.' : ''}`,
    },
    {
      id: 'registro', tab: 'Registro', title: 'QR de registro (sin sello)', url: joinLink, copy: joinLink,
      desc: 'El cliente nuevo crea su tarjeta sin recibir sello. Sirve para sumar clientes a distancia o cuando los sellos los cargás vos.',
    },
    {
      id: 'tarjeta', tab: 'Ver tarjeta', title: 'QR para ver mi tarjeta', url: loginLink, copy: loginLink,
      desc: 'El cliente entra a su tarjeta con su teléfono cuando quiera, sin sumar sellos.',
    },
  ]
  const qr = qrs.find(q => q.id === qrTab) ?? qrs[0]

  function copyQr() {
    navigator.clipboard.writeText(qr.copy).then(() => {
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

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Izquierda: lo de todos los días */}
        <div>
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

          <button
            onClick={doStamp}
            disabled={!found || found === 'none' || stamping || stamped}
            className="w-full py-4 rounded-2xl font-extrabold text-lg text-white transition-all disabled:opacity-40"
            style={{ background: '#7C3AED' }}
          >
            {stamping ? 'Sellando…' : stamped ? '¡Listo!' : '⚡ Sellar'}
          </button>

          {/* Control de sellos (plan Pro), compacto */}
          {canConfigure && (
            <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-zinc-900">Control de sellos</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-700 bg-violet-50 rounded-full px-2 py-0.5">Pro</span>
              </div>
              {canControl ? (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">Solo sella el negocio</p>
                      <p className="text-xs text-zinc-500 mt-0.5 leading-snug">Los QR y links no suman sellos: los cargás vos o tu equipo.</p>
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
                  <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between gap-4">
                    <label className="text-sm font-semibold text-zinc-900" htmlFor="stamp-interval">Tiempo entre sellos</label>
                    <select
                      id="stamp-interval"
                      value={stampInterval}
                      onChange={e => saveControl({ stamp_interval: e.target.value as StampInterval })}
                      disabled={controlSaving || !controlAvailable}
                      className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-violet-400 disabled:opacity-50"
                    >
                      {STAMP_INTERVALS.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
                    </select>
                  </div>
                  {controlError && <p className="text-xs text-red-500 mt-2">{controlError}</p>}
                  {!controlAvailable && <p className="text-xs text-amber-600 mt-2">Falta correr la migración stamp_business_only.sql para poder usarlo.</p>}
                </>
              ) : (
                <p className="text-sm text-zinc-500">
                  Que solo selle el negocio y el tiempo entre sellos están disponibles en el plan <strong>Pro</strong>.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Derecha: un solo cuadro con los tres QR */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h3 className="font-bold text-zinc-900 mb-3">Códigos QR</h3>
          <div className="flex gap-1 p-1 bg-zinc-100 rounded-xl mb-4" role="tablist">
            {qrs.map(q => (
              <button
                key={q.id}
                role="tab"
                aria-selected={qr.id === q.id}
                onClick={() => { setQrTab(q.id); setCopied(false) }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${qr.id === q.id ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                {q.tab}
              </button>
            ))}
          </div>
          <div className="flex flex-col items-center gap-3">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qr.url)}&color=0F172A&bgcolor=FFFFFF&qzone=2`}
              alt={qr.title}
              width={170}
              height={170}
              className="rounded-xl"
            />
            <p className="font-semibold text-zinc-900 text-sm">{qr.title}</p>
            <p className="text-xs text-zinc-500 text-center leading-snug">{qr.desc}</p>
            <div className="flex gap-2 w-full">
              <button
                onClick={() => setZoomQr({ title: qr.title, url: qr.url })}
                className="flex-1 py-2 rounded-xl text-xs font-semibold border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                Ampliar QR
              </button>
              <button
                onClick={copyQr}
                className="flex-1 py-2 rounded-xl text-xs font-semibold border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                {copied ? '✓ Copiado' : 'Copiar link'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR ampliado */}
      {zoomQr && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(24,24,27,0.6)' }}
          onClick={e => { if (e.target === e.currentTarget) setZoomQr(null) }}
        >
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <h3 className="font-bold text-zinc-900 text-lg mb-4">{zoomQr.title}</h3>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(zoomQr.url)}&color=0F172A&bgcolor=FFFFFF&qzone=2`}
              alt={zoomQr.title}
              className="w-full max-w-[300px] mx-auto rounded-xl"
            />
            <p className="text-[11px] text-zinc-400 mt-3 break-all">{zoomQr.url}</p>
            <button
              onClick={() => setZoomQr(null)}
              className="mt-5 w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
