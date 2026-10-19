'use client'

import { PLAN_PRICES_ARS, DISCOUNT_WINDOW_DAYS, discountedPrice, fmtARS } from '@/lib/plans'
import React, { useState, useEffect } from 'react'

// ── hook de cuenta regresiva ───────────────────────────────────────────────────
function useCountdown(targetMs: number) {
  const [remaining, setRemaining] = useState(Math.max(0, targetMs - Date.now()))
  useEffect(() => {
    const t = setInterval(() => setRemaining(Math.max(0, targetMs - Date.now())), 1000)
    return () => clearInterval(t)
  }, [targetMs])
  const h = Math.floor(remaining / 3600000)
  const m = Math.floor((remaining % 3600000) / 60000)
  const s = Math.floor((remaining % 60000) / 1000)
  return { remaining, h, m, s }
}

// ── planes ────────────────────────────────────────────────────────────────────
const VIEW_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$14.999',
    period: 'ARS/mes',
    desc: 'Para empezar a fidelizar clientes con sellos digitales.',
    color: '#7C3AED',
    badge: null as string | null,
    features: [
      '1 tarjeta de fidelidad con tu logo',
      'Tarjeta digital en Google Wallet',
      'NFC + QR en el mostrador',
      'Panel de gestión en tiempo real',
      'Exportá tus clientes (nombre, teléfono y sellos)',
      'Soporte en español 🇦🇷',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29.999',
    period: 'ARS/mes',
    desc: 'Para negocios que quieren más control y automatización.',
    color: '#7C3AED',
    badge: 'RECOMENDADO',
    features: [
      'Todo lo de Starter',
      'Diseño completo: plantillas, colores, íconos y fondo',
      'Hasta 3 locales con una sola tarjeta compartida',
      'Métricas de cada local por separado',
      'Campañas de cumpleaños automáticas',
      'Soporte prioritario',
    ],
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    price: '$69.999',
    period: 'ARS/mes',
    desc: 'Para cadenas y franquicias con muchos locales.',
    color: '#7C3AED',
    badge: null,
    features: [
      'Todo lo de Pro',
      'Hasta 50 locales con una sola tarjeta compartida',
      'Dominio propio para tu tarjeta',
    ],
  },
]

const DISC_PRICES: Record<string, string> = {
  starter:  fmtARS(discountedPrice(PLAN_PRICES_ARS.starter)),
  pro:      fmtARS(discountedPrice(PLAN_PRICES_ARS.pro)),
  ultimate: fmtARS(discountedPrice(PLAN_PRICES_ARS.ultimate)),
}

// ── props ─────────────────────────────────────────────────────────────────────
interface ViewPlanProps {
  onNav: (id: string) => void
  businessCreatedAt?: string | null
  plan?: string
  planExpiresAt?: string | null
}

// ── componente ────────────────────────────────────────────────────────────────
export default function ViewPlan({ onNav, businessCreatedAt = null, plan = 'trial', planExpiresAt = null }: ViewPlanProps) {
  const planExpired = !!(planExpiresAt && new Date(planExpiresAt) < new Date())
  const planNames: Record<string, string> = { starter: 'Starter', pro: 'Pro', ultimate: 'Ultimate', gifted: 'Ultimate (regalo)' }
  const isPaidPlan = plan in planNames && !planExpired
  const discountDeadlineMs = businessCreatedAt
    ? new Date(businessCreatedAt).getTime() + DISCOUNT_WINDOW_DAYS * 24 * 60 * 60 * 1000
    : 0
  const isDiscountEligible = discountDeadlineMs > Date.now()
  const { h, m, s } = useCountdown(discountDeadlineMs)

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [checkoutErr, setCheckoutErr] = useState('')

  async function goCheckout(planId: string) {
    setLoadingPlan(planId)
    setCheckoutErr('')
    try {
      const res = await fetch('/api/mp/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, discount: isDiscountEligible }),
      })
      const data = await res.json()
      if (!res.ok) { setCheckoutErr(data.error || 'Error al procesar'); setLoadingPlan(null); return }
      window.location.href = data.init_point
    } catch {
      setCheckoutErr('Error de conexión')
      setLoadingPlan(null)
    }
  }

  return (
    <div className="p-4 md:p-8 w-full">
      <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-1">Tu plan</h1>
      <p className="text-zinc-400 dark:text-gray-500 text-sm mb-4">
        {isPaidPlan
          ? `Tu plan actual es ${planNames[plan]}${planExpiresAt ? ` y está vigente hasta el ${new Date(planExpiresAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}` : ''}. Podés cambiarlo cuando quieras.`
          : planExpired
            ? 'Tu plan venció. Elegí un plan para reactivar todas las funciones.'
            : 'Estás en el período de prueba gratuita. Elegí el plan que mejor se adapta a tu negocio.'}
      </p>

      {isDiscountEligible && (
        <div
          className="mb-6 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
          style={{
            background: 'linear-gradient(135deg, #7C3AED22, #6366f122)',
            border: '1px solid #7C3AED44',
          }}
        >
          <div>
            <span className="inline-block bg-violet-600 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-1">
              50% OFF — OFERTA DE BIENVENIDA
            </span>
            <p className="text-sm font-semibold text-zinc-800 dark:text-gray-200">
              Oferta de bienvenida · Se aplica automáticamente al elegir tu plan.
            </p>
          </div>
          <div className="flex items-center gap-2 text-violet-700 dark:text-violet-400 font-extrabold flex-shrink-0">
            <span className="bg-violet-100 dark:bg-violet-950 px-3 py-1.5 rounded-xl text-2xl tabular-nums">
              {Math.ceil((discountDeadlineMs - Date.now()) / (1000 * 60 * 60 * 24))}
            </span>
            <span className="text-sm font-semibold text-violet-500 dark:text-violet-400">días restantes</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {VIEW_PLANS.map(plan => (
          <div
            key={plan.id}
            className={`bg-white dark:bg-gray-900 border rounded-2xl p-5 flex flex-col relative ${
              plan.badge
                ? 'border-violet-300 dark:border-violet-700 shadow-md'
                : 'border-zinc-100 dark:border-gray-800'
            }`}
          >
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-0.5 rounded-full text-white bg-violet-600 whitespace-nowrap">
                {plan.badge}
              </span>
            )}
            <div className="mb-4 mt-1">
              <p className="text-xs font-bold uppercase tracking-widest mb-1 text-violet-600 dark:text-violet-400">{plan.name}</p>
              {isDiscountEligible ? (
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold text-violet-600 dark:text-violet-400">{DISC_PRICES[plan.id]}</span>
                    <span className="text-xs text-zinc-400 dark:text-gray-500">{plan.period}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-zinc-400 dark:text-gray-500 line-through">{plan.price}</span>
                    <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950 px-2 py-0.5 rounded-full">
                      50% OFF primer mes
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">{plan.price}</span>
                  <span className="text-xs text-zinc-400 dark:text-gray-500 ml-1">{plan.period}</span>
                </div>
              )}
              <p className="text-xs text-zinc-400 dark:text-gray-500 mt-1">{plan.desc}</p>
            </div>
            <div className="flex-1 space-y-2 mb-5">
              {plan.features.map(f => (
                <div key={f} className="flex items-start gap-2">
                  <span className="text-violet-500 text-xs mt-0.5 flex-shrink-0">✓</span>
                  <p className="text-xs text-zinc-600 dark:text-gray-400">{f}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => goCheckout(plan.id)}
              disabled={!!loadingPlan}
              className="w-full py-2.5 rounded-xl font-bold text-white text-sm mb-2 disabled:opacity-60 transition-colors"
              style={{ background: '#7C3AED' }}
            >
              {loadingPlan === plan.id ? 'Redirigiendo...' : `Pasarme a ${plan.name}`}
            </button>
            <a
              href={`/fidelizacion/precios#${plan.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center text-xs text-violet-500 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
            >
              Ver qué incluye {plan.name} ↗
            </a>
          </div>
        ))}
      </div>

      {checkoutErr && <p className="text-red-500 dark:text-red-400 text-xs text-center mb-4">{checkoutErr}</p>}

      {/* Facturación */}
      <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500 mb-3">FACTURACIÓN</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Período de prueba gratuita</p>
            <p className="text-xs text-zinc-400 dark:text-gray-500 mt-0.5">Sin cargo hasta que elijas un plan.</p>
          </div>
          <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full">
            ACTIVO
          </span>
        </div>
      </div>

      {/* Dudas */}
      <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500 mb-3">¿TENÉS DUDAS?</p>
        <p className="text-sm text-zinc-600 dark:text-gray-400 mb-3">
          Hablá con nosotros por WhatsApp y te ayudamos a elegir el plan que mejor se adapta a tu negocio.
        </p>
        <a
          href="https://wa.me/5491123867934?text=Hola!%20Tengo%20dudas%20sobre%20los%20planes%20de%20Calificar."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: '#25D366' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.554 4.103 1.523 5.824L.057 23.5l5.805-1.522A11.951 11.951 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.871 9.871 0 01-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374A9.861 9.861 0 012.118 12C2.118 6.985 6.985 2.118 12 2.118S21.882 6.985 21.882 12 17.015 21.882 12 21.882z" />
          </svg>
          Hablar por WhatsApp
        </a>
      </div>
    </div>
  )
}
