'use client'

import React, { useState } from 'react'
import { PLAN_PRICES_ARS, discountedPrice, fmtARS } from '@/lib/plans'

// ── Planes con descuento ───────────────────────────────────────────────────────
const planRow = (id: 'starter' | 'pro' | 'ultimate', name: string, pill: string, highlight: boolean) => ({
  id, name, pill, highlight,
  origPrice: fmtARS(PLAN_PRICES_ARS[id]),
  discPrice: fmtARS(discountedPrice(PLAN_PRICES_ARS[id])),
  savings:   fmtARS(PLAN_PRICES_ARS[id] - discountedPrice(PLAN_PRICES_ARS[id])),
})

export const DISCOUNT_PLANS = [
  planRow('starter',  'Starter',  'Para empezar', false),
  planRow('pro',      'Pro',      'Más popular',  true),
  planRow('ultimate', 'Ultimate', 'Sin límites',  false),
]

// ── props ─────────────────────────────────────────────────────────────────────
interface DiscountPopupProps {
  onClose: () => void
  daysLeft: number
}

// ── componente ────────────────────────────────────────────────────────────────
export default function DiscountPopup({ onClose, daysLeft }: DiscountPopupProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [err, setErr]         = useState('')

  async function checkout(planId: string) {
    setLoading(planId); setErr('')
    try {
      const res = await fetch('/api/mp/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, discount: true }),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error || 'Error al procesar'); setLoading(null); return }
      localStorage.setItem('cal_discount_dismissed', '1')
      window.location.href = data.init_point
    } catch { setErr('Error de conexión'); setLoading(null) }
  }

  function dismiss() {
    localStorage.setItem('cal_discount_next', String(Date.now() + 3 * 60 * 60 * 1000))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.72)' }}>
      <div className="bg-zinc-950 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 pt-6 pb-5 text-center border-b border-zinc-800 relative">
          <button onClick={dismiss} className="absolute right-5 top-5 text-zinc-500 hover:text-zinc-300 text-xl leading-none">✕</button>
          <div className="inline-block bg-violet-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            50% OFF — PRIMER MES
          </div>
          <h2 className="text-white font-black text-2xl leading-tight">Tu oferta de bienvenida vence en {daysLeft} {daysLeft === 1 ? 'día' : 'días'}</h2>
          <p className="text-zinc-400 text-sm mt-2">Activá tu plan ahora con 50% de descuento en el primer mes.</p>
        </div>

        <div className="p-4 space-y-3">
          {DISCOUNT_PLANS.map(p => (
            <button
              key={p.id}
              onClick={() => checkout(p.id)}
              disabled={!!loading}
              className={`w-full rounded-xl px-4 py-3.5 text-left transition-all ${
                p.highlight
                  ? 'bg-violet-600 hover:bg-violet-500 border-2 border-violet-400'
                  : 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700'
              } ${loading === p.id ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full mr-2 ${
                    p.highlight ? 'bg-white/20 text-white' : 'bg-zinc-600 text-zinc-300'
                  }`}>{p.pill}</span>
                  <span className="text-white font-bold">{p.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-400 line-through text-xs mr-1">{p.origPrice}</span>
                  <span className="text-white font-black">{p.discPrice}</span>
                  <span className="text-zinc-400 text-xs">/mes</span>
                </div>
              </div>
              {loading === p.id && <p className="text-xs text-zinc-300 mt-1">Procesando...</p>}
            </button>
          ))}
          {err && <p className="text-red-400 text-xs text-center">{err}</p>}
        </div>

        <div className="px-6 pb-5 text-center">
          <button
            onClick={() => { localStorage.setItem('cal_discount_dismissed', '1'); onClose() }}
            className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
          >
            No, seguir con la prueba gratuita
          </button>
        </div>
      </div>
    </div>
  )
}
