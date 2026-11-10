'use client'

import { PLAN_PRICES_ARS, fmtARS, isBeautyType } from '@/lib/plans'
import React, { useState } from 'react'

// ── planes ────────────────────────────────────────────────────────────────────
const BEAUTY_PLAN = {
  id: 'beauty',
  name: 'Beauty',
  price: fmtARS(PLAN_PRICES_ARS.beauty),
  period: 'ARS/mes',
  desc: 'Para salones, peluquerías, uñas y estética.',
  color: '#7C3AED',
  badge: null as string | null,
  features: [
    'Tarjeta digital con el logo de tu salón',
    'QR listo para imprimir',
    'Sello rápido, manual o escaneando',
    'Cupones únicos para los premios',
    'Cumpleaños automáticos',
    'Lista de clientas y panel',
    '1 local',
  ],
}

const VIEW_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$10.000',
    period: 'ARS/mes',
    desc: 'Para empezar a fidelizar clientes con sellos digitales.',
    color: '#7C3AED',
    badge: null as string | null,
    features: [
      'Tarjeta digital con tu logo',
      'QR listo para imprimir',
      'Sello rápido, manual o escaneando al cliente',
      'Cupones únicos para canjear los premios',
      'Lista de clientes y panel',
      '1 local',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$25.000',
    period: 'ARS/mes',
    desc: 'Para negocios que quieren más control y automatización.',
    color: '#7C3AED',
    badge: 'RECOMENDADO',
    features: [
      'Todo lo de Starter',
      'Avisos ilimitados al celular, también a grupos de clientes',
      'Cumpleaños, reseñas de Google y recuperación de clientes',
      'Referidos y aviso al pasar cerca del local',
      'Google Wallet y diseño completo',
      'Premios en el camino y exportar clientes',
      'Hasta 3 locales con métricas de cada uno',
      'Soporte prioritario',
    ],
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    price: '$50.000',
    period: 'ARS/mes',
    desc: 'Para cadenas y franquicias con muchos locales.',
    color: '#7C3AED',
    badge: null,
    features: [
      'Todo lo de Pro',
      'Ruleta de la suerte',
      'Recuperar según la frecuencia de cada cliente',
      'Grupos de clientes con tus propias reglas',
      'Estadísticas de actividad',
      'Equipo: cada empleado con su usuario',
      'Tarjeta sin marca Calificar y dominio propio',
      'Hasta 50 locales',
    ],
  },
]

// ── props ─────────────────────────────────────────────────────────────────────
interface ViewPlanProps {
  onNav: (id: string) => void
  plan?: string
  planExpiresAt?: string | null
  /** Tipo de negocio: los salones ven el plan Beauty en lugar de Starter */
  businessType?: string
}

// ── componente ────────────────────────────────────────────────────────────────
export default function ViewPlan({ onNav, plan = 'trial', planExpiresAt = null, businessType }: ViewPlanProps) {
  const plansToShow = isBeautyType(businessType) ? [BEAUTY_PLAN, ...VIEW_PLANS.filter(p => p.id !== 'starter')] : VIEW_PLANS
  const planExpired = !!(planExpiresAt && new Date(planExpiresAt) < new Date())
  const planNames: Record<string, string> = { beauty: 'Beauty', starter: 'Starter', pro: 'Pro', ultimate: 'Ultimate', gifted: 'Ultimate (regalo)' }
  const isPaidPlan = plan in planNames && !planExpired

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [checkoutErr, setCheckoutErr] = useState('')

  async function goCheckout(planId: string) {
    setLoadingPlan(planId)
    setCheckoutErr('')
    try {
      const res = await fetch('/api/mp/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {plansToShow.map(plan => (
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
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">{plan.price}</span>
                <span className="text-xs text-zinc-400 dark:text-gray-500 ml-1">{plan.period}</span>
              </div>
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

      {/* Locales extra: solo en Pro */}
      {plan === 'pro' && (
        <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5 mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500 mb-3">¿TENÉS MÁS DE 3 LOCALES?</p>
          <p className="text-sm text-zinc-600 dark:text-gray-400 mb-3">
            Con Pro podés sumar locales extra de a uno, sin pasar a Ultimate. Todos usan la misma tarjeta y vos ves los números de cada uno.
          </p>
          <a
            href="https://wa.me/5491123867934?text=Hola!%20Tengo%20el%20plan%20Pro%20y%20quiero%20sumar%20locales%20extra."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: '#7C3AED' }}
          >
            Pedir locales extra
          </a>
        </div>
      )}

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
