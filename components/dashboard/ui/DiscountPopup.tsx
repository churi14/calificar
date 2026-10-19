'use client'

import React, { useState } from 'react'
import { PLAN_PRICES_ARS, discountedPrice, fmtARS, isBeautyType } from '@/lib/plans'

// ── Planes con descuento ───────────────────────────────────────────────────────
const planRow = (id: 'beauty' | 'starter' | 'pro' | 'ultimate', name: string, pill: string, highlight: boolean) => ({
  id, name, pill, highlight,
  origPrice: fmtARS(PLAN_PRICES_ARS[id]),
  discPrice: fmtARS(discountedPrice(PLAN_PRICES_ARS[id])),
  savings:   fmtARS(PLAN_PRICES_ARS[id] - discountedPrice(PLAN_PRICES_ARS[id])),
})

export const BEAUTY_DISCOUNT_PLANS = [
  planRow('beauty',   'Beauty',   'Para tu salón', false),
  planRow('pro',      'Pro',      'Más completo', true),
  planRow('ultimate', 'Ultimate', 'Sin límites',  false),
]

export const DISCOUNT_PLANS = [
  planRow('starter',  'Starter',  'Para empezar', false),
  planRow('pro',      'Pro',      'Más popular',  true),
  planRow('ultimate', 'Ultimate', 'Sin límites',  false),
]

// ── props ─────────────────────────────────────────────────────────────────────
interface DiscountPopupProps {
  onClose: () => void
  daysLeft: number
  /** Los salones ven el plan Beauty en lugar de Starter */
  businessType?: string
}

// ── componente ────────────────────────────────────────────────────────────────
export default function DiscountPopup({ onClose, daysLeft, businessType }: DiscountPopupProps) {
  const plansToShow = isBeautyType(businessType) ? BEAUTY_DISCOUNT_PLANS : DISCOUNT_PLANS
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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(24,24,27,0.55)' }}>
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-violet-900/20">
        <div className="px-6 pt-6 pb-5 text-center border-b border-zinc-100 relative" style={{ background: 'linear-gradient(180deg, #F3EEFF 0%, #FFFFFF 100%)' }}>
          <button onClick={dismiss} className="absolute right-5 top-5 text-zinc-400 hover:text-zinc-700 text-xl leading-none">✕</button>
          <div className="inline-block bg-violet-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            50% OFF — PRIMER MES
          </div>
          <h2 className="text-zinc-900 font-black text-2xl leading-tight">Tu oferta de bienvenida vence en {daysLeft} {daysLeft === 1 ? 'día' : 'días'}</h2>
          <p className="text-zinc-600 text-sm mt-2">Activá tu plan ahora con 50% de descuento en el primer mes.</p>
        </div>

        <div className="p-4 space-y-3">
          {plansToShow.map(p => (
            <button
              key={p.id}
              onClick={() => checkout(p.id)}
              disabled={!!loading}
              className={`w-full rounded-xl px-4 py-3.5 text-left transition-all ${
                p.highlight
                  ? 'bg-violet-600 hover:bg-violet-500 border-2 border-violet-400'
                  : 'bg-white hover:bg-violet-50 border border-zinc-200 hover:border-violet-300'
              } ${loading === p.id ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full mr-2 ${
                    p.highlight ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600'
                  }`}>{p.pill}</span>
                  <span className={`font-bold ${p.highlight ? 'text-white' : 'text-zinc-900'}`}>{p.name}</span>
                </div>
                <div className="text-right">
                  <span className={`line-through text-xs mr-1 ${p.highlight ? 'text-violet-200' : 'text-zinc-400'}`}>{p.origPrice}</span>
                  <span className={`font-black ${p.highlight ? 'text-white' : 'text-zinc-900'}`}>{p.discPrice}</span>
                  <span className={`text-xs ${p.highlight ? 'text-violet-200' : 'text-zinc-400'}`}>/mes</span>
                </div>
              </div>
              {loading === p.id && <p className={`text-xs mt-1 ${p.highlight ? 'text-violet-100' : 'text-zinc-500'}`}>Procesando...</p>}
            </button>
          ))}
          {err && <p className="text-red-500 text-xs text-center">{err}</p>}
        </div>

        <div className="px-6 pb-5 text-center">
          <button
            onClick={() => { localStorage.setItem('cal_discount_dismissed', '1'); onClose() }}
            className="text-zinc-500 hover:text-zinc-800 text-xs transition-colors"
          >
            No, seguir con la prueba gratuita
          </button>
        </div>
      </div>
    </div>
  )
}
