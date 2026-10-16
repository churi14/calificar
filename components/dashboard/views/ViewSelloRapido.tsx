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
}

export default function ViewSelloRapido({
  cards,
  selectedProgram,
  accessToken,
  manualStamp,
  plan = 'trial',
  planExpiresAt = null,
}: ViewSelloRapidoProps) {
  const [phone, setPhone] = useState('')
  const [found, setFound] = useState<Card | null | 'none'>(null)
  const [stamping, setStamping] = useState(false)
  const [stamped, setStamped] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedSecure, setCopiedSecure] = useState(false)
  const selfLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/s/${selectedProgram}`
      : `/s/${selectedProgram}`

  // Link seguro rotativo (disponible en todos los planes)
  const isExpired = planExpiresAt ? new Date(planExpiresAt) < new Date() : false
  const isProPlus = true
  const [secureLink, setSecureLink] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState<number>(0)
  const [loadingToken, setLoadingToken] = useState(false)

  useEffect(() => {
    if (!isProPlus) return
    async function fetchToken() {
      setLoadingToken(true)
      try {
        const res = await fetch(
          `/api/fidelizacion/stamp-token?program_id=${selectedProgram}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        const data = await res.json()
        if (data.link) {
          setSecureLink(data.link)
          setSecondsLeft(data.seconds_remaining)
        }
      } catch { /* silent */ }
      setLoadingToken(false)
    }
    fetchToken()
  }, [isProPlus, selectedProgram, accessToken])

  // Countdown y auto-refresh cuando expira
  useEffect(() => {
    if (!isProPlus || secondsLeft <= 0) return
    const interval = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          fetch(`/api/fidelizacion/stamp-token?program_id=${selectedProgram}`, {
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
  }, [isProPlus, secondsLeft, selectedProgram, accessToken])

  function formatCountdown(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  function copySecureLink() {
    if (!secureLink) return
    navigator.clipboard.writeText(secureLink).then(() => {
      setCopiedSecure(true)
      setTimeout(() => setCopiedSecure(false), 2000)
    })
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

      {/* Link de auto-sello */}
      <div>
        <h3 className="font-bold text-zinc-900 mb-1">Link de auto-sello</h3>
        <p className="text-sm text-zinc-500 mb-4">
          Mandá este link por WhatsApp al confirmar un pedido. El cliente lo abre, pone su teléfono
          y se sella solo — vos no necesitás hacer nada.
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
          solo. No tiene vencimiento — es solo para uso en el local.
        </p>
        <div className="flex flex-col items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-2xl p-5">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selfLink)}&color=0F172A&bgcolor=FFFFFF&qzone=2`}
            alt="QR sellos"
            width={160}
            height={160}
            className="rounded-xl"
          />
          <p className="text-xs text-zinc-400 text-center">Solo para uso en el local · Sin vencimiento</p>
          <div className="flex gap-2 w-full">
            <button
              onClick={() => window.open(selfLink, '_blank')}
              className="flex-1 py-2 rounded-xl text-xs font-semibold border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              Ampliar QR
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(selfLink)}
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
              Este link es de un solo uso y se renueva cada 10 segundos. Una vez que alguien lo
              usa para cargar un sello, el link deja de funcionar. Mandalo al cliente justo cuando
              lo necesita.
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
                  El link se renueva cada 10 segundos o al ser usado.
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
