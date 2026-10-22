'use client'

import { useUnifiedQr } from '@/lib/use-unified-qr'
import { PLAN_PRICES_ARS, discountedPrice, fmtARS } from '@/lib/plans'
import { canUse } from '@/lib/plan-features'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { QRCanvas } from '@/app/fidelizacion/tarjeta/QRCanvas'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import type { Program, Milestone } from '@/types/dashboard'

const supabaseClient = createSupabaseClient()

// ── Planes ────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$14.999',
    period: 'ARS / mes',
    sub: '$500/día · menos que un café',
    desc: 'PARA TU NEGOCIO',
    features: ['Tarjeta digital con tu logo', 'QR listo para imprimir', 'Sello rápido, manual o escaneando al cliente', 'Cupones únicos para canjear los premios', 'Lista de clientes y panel', '1 local'],
    pills: ['Tarjetas ilimitadas', 'Notificaciones ilimitadas'],
    cta: 'Activar Starter',
    highlight: false,
    badge: undefined as string | undefined,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29.999',
    period: 'ARS / mes',
    sub: '$1.000/día · menos que dos cafés',
    desc: 'PARA DESTACAR',
    features: ['Todo lo de Starter', 'Avisos ilimitados al celular, también a grupos de clientes', 'Cumpleaños, reseñas de Google y recuperación de clientes', 'Referidos y aviso al pasar cerca del local', 'Google Wallet y diseño completo', 'Premios en el camino y exportar clientes', 'Hasta 3 locales con métricas de cada uno', 'Soporte prioritario'],
    pills: ['Tarjetas ilimitadas', 'Notificaciones ilimitadas'],
    cta: 'Activar Pro',
    highlight: true,
    badge: 'RECOMENDADO',
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    price: '$69.999',
    period: 'ARS / mes',
    sub: '$2.333/día · para todas tus sucursales',
    desc: 'SIN LÍMITES',
    features: ['Todo lo de Pro', 'Ruleta de la suerte', 'Recuperar según la frecuencia de cada cliente', 'Grupos de clientes con tus propias reglas', 'Estadísticas de actividad', 'Equipo: cada empleado con su usuario', 'Tarjeta sin marca Calificar y dominio propio', 'Hasta 50 locales'],
    pills: ['Tarjetas ilimitadas', 'Notificaciones ilimitadas'],
    cta: 'Activar Ultimate',
    highlight: false,
    badge: undefined as string | undefined,
  },
]

// ── Plantillas ────────────────────────────────────────────────────────────────

const CARD_TEMPLATES = [
  { id: 'clasico',  name: 'Clásico', color: '#7C3AED', textColor: '#FFFFFF' },
  { id: 'noche',    name: 'Noche',   color: '#0F172A', textColor: '#FFFFFF' },
  { id: 'cafe',     name: 'Café',    color: '#78350F', textColor: '#FFFFFF' },
  { id: 'fresh',    name: 'Fresh',   color: '#16A34A', textColor: '#FFFFFF' },
  { id: 'fuego',    name: 'Fuego',   color: '#DC2626', textColor: '#FFFFFF' },
  { id: 'oceano',   name: 'Océano',  color: '#0369A1', textColor: '#FFFFFF' },
  { id: 'dorado',   name: 'Dorado',  color: '#92400E', textColor: '#FEF3C7' },
  { id: 'rosa',     name: 'Rosa',    color: '#BE185D', textColor: '#FFFFFF' },
]

// ── PlansModal ────────────────────────────────────────────────────────────────

function PlansModal({ onClose, isDiscountEligible = false }: { onClose: () => void; isDiscountEligible?: boolean }) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [err, setErr] = useState('')
  const DISC_PRICES: Record<string, string> = {
    starter: fmtARS(discountedPrice(PLAN_PRICES_ARS.starter)),
    pro: fmtARS(discountedPrice(PLAN_PRICES_ARS.pro)),
    ultimate: fmtARS(discountedPrice(PLAN_PRICES_ARS.ultimate)),
  }

  async function checkout(planId: string) {
    setLoadingPlan(planId)
    setErr('')
    try {
      const res = await fetch('/api/mp/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, discount: isDiscountEligible }),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error || 'Error al procesar'); setLoadingPlan(null); return }
      if (isDiscountEligible) localStorage.setItem('cal_discount_dismissed', '1')
      window.location.href = data.init_point
    } catch { setErr('Error de conexión'); setLoadingPlan(null) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="bg-zinc-950 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl">
        <div className="relative px-7 pt-6 pb-5 text-center border-b border-zinc-800">
          <button onClick={onClose} className="absolute right-5 top-5 text-zinc-500 hover:text-zinc-300 text-xl leading-none">✕</button>
          {isDiscountEligible ? (
            <>
              <div className="inline-block bg-violet-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">50% OFF — PRIMER MES</div>
              <h2 className="text-xl font-extrabold text-white">Oferta de bienvenida. Solo esta semana.</h2>
              <p className="text-zinc-400 text-sm mt-1">El descuento se aplica automáticamente al elegir tu plan.</p>
            </>
          ) : (
            <>
              <div className="inline-block bg-violet-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">14 DÍAS GRATIS</div>
              <h2 className="text-xl font-extrabold text-white">Probá gratis y empezá a fidelizar desde el primer día.</h2>
              <p className="text-zinc-400 text-sm mt-1">Sin tarjeta de crédito. Sin compromiso.</p>
            </>
          )}
        </div>
        <div className="p-5 grid grid-cols-3 gap-4">
          {PLANS.map(plan => (
            <div key={plan.id} className={`relative rounded-2xl flex flex-col overflow-visible ${plan.highlight ? 'bg-white shadow-xl' : 'bg-zinc-900 border border-zinc-800'}`}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap z-10">
                  {plan.badge}
                </div>
              )}
              <div className="p-5 pt-6 flex-1">
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${plan.highlight ? 'text-violet-600' : 'text-zinc-400'}`}>{plan.desc}</p>
                <p className={`text-xl font-extrabold mb-1 ${plan.highlight ? 'text-zinc-900' : 'text-white'}`}>{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  {isDiscountEligible ? (
                    <>
                      <span className={`text-lg line-through ${plan.highlight ? 'text-zinc-400' : 'text-zinc-600'}`}>{plan.price}</span>
                      <span className={`text-3xl font-extrabold ${plan.highlight ? 'text-violet-600' : 'text-violet-400'}`}>{DISC_PRICES[plan.id]}</span>
                    </>
                  ) : (
                    <span className={`text-3xl font-extrabold ${plan.highlight ? 'text-zinc-900' : 'text-white'}`}>{plan.price}</span>
                  )}
                  <span className={`text-xs ${plan.highlight ? 'text-zinc-400' : 'text-zinc-500'}`}>{plan.period}</span>
                </div>
                <div className={`text-[10px] px-2.5 py-1 rounded-lg inline-block mb-3 ${plan.highlight ? 'bg-zinc-100 text-zinc-500' : 'bg-zinc-800 text-zinc-400'}`}>
                  {isDiscountEligible ? '50% OFF primer mes' : plan.sub}
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {plan.pills.map(p => (
                    <span key={p} className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${plan.highlight ? 'border-violet-300 text-violet-700 bg-violet-50' : 'border-violet-700 text-violet-400 bg-violet-950'}`}>{p}</span>
                  ))}
                </div>
                <ul className="space-y-2">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-start gap-2 text-xs ${plan.highlight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                      <span className="text-violet-500 font-bold mt-0.5 flex-shrink-0">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-5 pb-5">
                <button onClick={() => checkout(plan.id)} disabled={!!loadingPlan}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60"
                  style={{ background: '#7C3AED' }}>
                  {loadingPlan === plan.id ? 'Redirigiendo...' : plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
        {err && <p className="text-red-400 text-xs text-center pb-3">{err}</p>}
        <div className="pb-5 text-center">
          <p className="text-xs text-zinc-500">¿Tenés dudas? <a href="mailto:hola@calificar.com.ar" className="text-violet-400 underline">Escribinos</a> y te ayudamos.</p>
        </div>
      </div>
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface ViewTarjetaProps {
  program: Program | undefined
  selectedProgram: string | null
  onLogoUploaded: (url: string) => void
  accessToken: string
  plan?: string
  planExpiresAt?: string | null
  stats?: { total: number; stampsToday: number; rewardsTotal: number }
  businessCreatedAt?: string | null
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function ViewTarjeta({
  program,
  selectedProgram,
  onLogoUploaded,
  accessToken,
  plan = 'trial',
  planExpiresAt = null,
  stats,
  businessCreatedAt = null,
}: ViewTarjetaProps) {
  const fileRef      = useRef<HTMLInputElement>(null)
  const appIconRef   = useRef<HTMLInputElement>(null)
  const stampIconRef = useRef<HTMLInputElement>(null)
  const cardBgRef    = useRef<HTMLInputElement>(null)

  const [uploading,        setUploading]        = useState(false)
  const [uploadError,      setUploadError]      = useState('')
  const [appIconUploading, setAppIconUploading] = useState(false)
  const [appIconError,     setAppIconError]     = useState('')
  const [appIconUrl,       setAppIconUrl]       = useState<string | null>(program?.app_icon_url ?? null)
  const [stampIconUploading, setStampIconUploading] = useState(false)
  const [stampIconError,   setStampIconError]   = useState('')
  const [stampIconUrl,     setStampIconUrl]     = useState<string | null>(program?.stamp_icon_url ?? null)
  const [cardBgUploading,  setCardBgUploading]  = useState(false)
  const [cardBgError,      setCardBgError]      = useState('')
  const [cardBgUrl,        setCardBgUrl]        = useState<string | null>(program?.card_background_url ?? null)
  const [cardColor,        setCardColor]        = useState<string>(program?.color_primary ?? '#7C3AED')
  const [cardTextColor,    setCardTextColor]    = useState<string>(program?.card_text_color ?? '#FFFFFF')
  const [pageBgColor,      setPageBgColor]      = useState<string>(program?.page_bg_color ?? '#09090b')
  const [stampNoBg,        setStampNoBg]        = useState<boolean>(program?.stamp_icon_no_bg ?? false)
  const [colorSaving,      setColorSaving]      = useState(false)
  const [colorSaved,       setColorSaved]       = useState(false)
  const [previewDevice,    setPreviewDevice]    = useState<'ios' | 'android'>('ios')
  const [showPlans,        setShowPlans]        = useState(false)
  // Simulación interactiva del celular (solo demo, no toca la base de datos)
  const [pvStamps,         setPvStamps]         = useState(0)
  const [pvEvent,          setPvEvent]          = useState<{ kind: 'milestone' | 'reward'; label: string; code: string } | null>(null)
  const [pvCoupons,        setPvCoupons]        = useState<{ label: string; code: string; reward: boolean }[]>([])
  const [pvPush,           setPvPush]           = useState<string | null>(null)
  const [pvToast,          setPvToast]          = useState(false)
  const [milestones,      setMilestones]       = useState<Milestone[]>([])
  const [milestoneSaving,  setMilestoneSaving]  = useState(false)
  const [milestoneSaved,   setMilestoneSaved]   = useState(false)
  const [milestoneError,   setMilestoneError]   = useState('')
  const [rewardGoal,       setRewardGoal]       = useState(0)
  const [rewardDesc,       setRewardDesc]       = useState('')
  const [rewardSaving,     setRewardSaving]     = useState(false)
  const [rewardSaved,      setRewardSaved]      = useState(false)
  const [rewardError,      setRewardError]      = useState('')
  const [walletSyncing,    setWalletSyncing]    = useState(false)
  const [walletSyncMsg,    setWalletSyncMsg]    = useState('')

  const color   = program?.color_primary ?? '#7C3AED'
  const joinUrl = useUnifiedQr(selectedProgram, accessToken)

  useEffect(() => {
    if (program?.milestones)         setMilestones(program.milestones)
    if (program?.stamps_goal)        setRewardGoal(program.stamps_goal)
    if (program?.reward_description) setRewardDesc(program.reward_description)
  }, [program?.id])

  async function getFreshToken(): Promise<string> {
    if (accessToken) return accessToken
    const { data } = await supabaseClient.auth.getSession()
    return data.session?.access_token ?? ''
  }

  async function patchProgram(body: Record<string, unknown>) {
    return fetch('/api/fidelizacion/program', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: JSON.stringify({ program_id: selectedProgram, ...body }),
    }).then(r => r.json())
  }

  async function uploadFile(
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
    onSuccess: (url: string) => void,
    setUpl: (v: boolean) => void,
    setErr: (v: string) => void,
  ) {
    const file = e.target.files?.[0]
    if (!file) return
    setUpl(true)
    setErr('')
    const tok = await getFreshToken()
    const form = new FormData()
    form.append('file', file)
    form.append('program_id', selectedProgram ?? '')
    form.append('field', field)
    try {
      const res  = await fetch('/api/fidelizacion/upload-logo', { method: 'POST', headers: tok ? { Authorization: `Bearer ${tok}` } : {}, body: form })
      const data = await res.json()
      if (data.url) onSuccess(data.url)
      else setErr(data.error ?? 'Error al subir')
    } catch { setErr('Error de red') }
    setUpl(false)
  }

  async function saveMilestones() {
    if (!selectedProgram) return
    setMilestoneSaving(true); setMilestoneError('')
    const d = await patchProgram({ milestones })
    setMilestoneSaving(false)
    if (d.error) { setMilestoneError(d.error); return }
    setMilestoneSaved(true); setTimeout(() => setMilestoneSaved(false), 2500)
  }

  async function saveReward() {
    if (!selectedProgram || !rewardGoal || !rewardDesc.trim()) return
    setRewardSaving(true); setRewardError('')
    const d = await patchProgram({ stamps_goal: rewardGoal, reward_description: rewardDesc.trim() })
    setRewardSaving(false)
    if (d.error) { setRewardError(d.error); return }
    setRewardSaved(true); setTimeout(() => setRewardSaved(false), 2500)
  }

  async function saveCardColors() {
    if (!selectedProgram) return
    setColorSaving(true)
    await patchProgram({ color_primary: cardColor, card_text_color: cardTextColor, page_bg_color: pageBgColor })
    setColorSaving(false); setColorSaved(true); setTimeout(() => setColorSaved(false), 2500)
  }

  async function saveStampNoBg(val: boolean) {
    setStampNoBg(val)
    await patchProgram({ stamp_icon_no_bg: val })
  }

  async function applyTemplate(tpl: typeof CARD_TEMPLATES[number]) {
    if (!selectedProgram) return
    setCardColor(tpl.color); setCardTextColor(tpl.textColor)
    await patchProgram({ color_primary: tpl.color, card_text_color: tpl.textColor })
  }

  async function syncWallet() {
    if (!selectedProgram) return
    setWalletSyncing(true); setWalletSyncMsg('')
    const d = await patchProgram({ sync_wallet: true })
    setWalletSyncing(false)
    setWalletSyncMsg(d.wallet_synced ? '✓ Wallet sincronizado' : `Error: ${d.wallet_error ?? 'desconocido'}`)
    setTimeout(() => setWalletSyncMsg(''), 5000)
  }

  if (!program) return <div className="p-4 md:p-8 text-zinc-400 text-sm">No hay programa activo.</div>

  const isPro = ['pro', 'ultimate', 'gifted'].includes(plan)
  const isExpired = planExpiresAt ? new Date(planExpiresAt) < new Date() : false

  /** Simula que el encargado escanea el QR: suma un sello y dispara hito/premio como en el flujo real */
  function simulateStamp() {
    if (!program || pvEvent) return
    const goal = program.stamps_goal
    const next = pvStamps + 1
    const businessName = program.businesses?.name ?? program.name
    const genCode = (prefix: string) =>
      `${prefix.substring(0, 6).toUpperCase().replace(/\s/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    const pushNotif = (text: string) => {
      setPvPush(text)
      setTimeout(() => setPvPush(null), 4500)
    }

    if (next >= goal) {
      const label = program.reward_description ?? 'Premio'
      const code = genCode(label)
      setPvStamps(0)
      setPvCoupons(prev => [{ label, code, reward: true }, ...prev])
      setPvEvent({ kind: 'reward', label, code })
      pushNotif(`🏆 ¡Completaste la tarjeta! Tu premio: ${label}`)
    } else {
      setPvStamps(next)
      const hit = milestones.find(m => m.at === next)
      if (hit) {
        const code = genCode(hit.coupon_prefix ?? hit.label)
        setPvCoupons(prev => [{ label: hit.label, code, reward: false }, ...prev])
        setPvEvent({ kind: 'milestone', label: hit.label, code })
        pushNotif(`🎁 ¡Ganaste un descuento en ${businessName}: ${hit.label}!`)
      } else {
        setPvToast(true)
        setTimeout(() => setPvToast(false), 1600)
      }
    }
  }

  function resetSimulation() {
    setPvStamps(0)
    setPvEvent(null)
    setPvCoupons([])
    setPvPush(null)
    setPvToast(false)
  }

  return (
    <div className="p-4 md:p-8 w-full">
      {showPlans && (
        <PlansModal
          onClose={() => setShowPlans(false)}
          isDiscountEligible={
            !!businessCreatedAt &&
            (Date.now() - new Date(businessCreatedAt).getTime()) / (1000 * 60 * 60 * 24) <= 7
          }
        />
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Tarjeta</h1>
        <p className="text-zinc-400 text-sm mt-0.5">1 programa activo</p>
      </div>

      {/* Banner plan */}
      {plan === 'trial' && (
        <div className="border border-violet-200 bg-violet-50 dark:bg-violet-950 dark:border-violet-800 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">🪪</span>
            <div>
              <p className="text-sm font-semibold text-violet-900 dark:text-violet-200">Estás en tu período de prueba gratuita.</p>
              <p className="text-xs text-violet-600 dark:text-violet-400 mt-0.5">Activá el plan Pro para desbloquear todas las funciones.</p>
            </div>
          </div>
          <button onClick={() => setShowPlans(true)} className="flex-shrink-0 text-xs font-bold text-white px-4 py-2 rounded-xl" style={{ background: '#7C3AED' }}>
            → Ver planes
          </button>
        </div>
      )}
      {isExpired && plan !== 'trial' && (
        <div className="border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">Tu plan venció el {new Date(planExpiresAt!).toLocaleDateString('es-AR', { day: '2-digit', month: 'long' })}.</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">Renovalo para seguir usando todas las funciones.</p>
            </div>
          </div>
          <button onClick={() => setShowPlans(true)} className="flex-shrink-0 text-xs font-bold text-white px-4 py-2 rounded-xl bg-red-600">
            → Renovar
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'CLIENTES ACTIVOS',    value: String(stats?.total ?? 0) },
          { label: 'SELLOS HOY',          value: String(stats?.stampsToday ?? 0) },
          { label: 'PREMIOS ENTREGADOS',  value: String(stats?.rewardsTotal ?? 0) },
          { label: 'PLAN ACTIVO',         value: plan === 'trial' ? 'Trial' : plan.charAt(0).toUpperCase() + plan.slice(1) },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">{s.label}</p>
            <p className="text-xl font-extrabold text-zinc-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Two-column: editor + phone preview */}
      <div className="flex gap-6 items-start">

        {/* LEFT: editor */}
        <div className="flex-1 min-w-0 bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl overflow-hidden">

          {/* Header del programa */}
          <div className="p-5 border-b border-zinc-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                  {program.logo_url
                    ? <img src={program.logo_url} alt="" className="w-10 h-8 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
                    : <span className="text-white font-extrabold text-xs">{program.name.charAt(0)}</span>
                  }
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-zinc-900 dark:text-white text-sm">{program.name}</p>
                    <span className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">Recompensas</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">{program.stamps_goal} sellos para una recompensa</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={joinUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs border border-zinc-200 dark:border-gray-700 text-zinc-600 dark:text-gray-300 px-3 py-1.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-gray-800 font-medium flex items-center gap-1.5">
                  🔗 Enlace
                </a>
                <a href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(joinUrl)}&color=0F172A&bgcolor=FFFFFF&qzone=1`}
                  download="qr-calificar.png" target="_blank" rel="noopener noreferrer"
                  className="text-xs border border-zinc-200 dark:border-gray-700 text-zinc-600 dark:text-gray-300 px-3 py-1.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-gray-800 font-medium flex items-center gap-1.5">
                  ⊞ QR
                </a>
              </div>
            </div>
          </div>

          {/* Diseño de tarjeta */}
          <div className="p-5 border-b border-zinc-50 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-zinc-800 dark:text-gray-100">Diseño de tarjeta</p>
              {!isPro && <span className="text-[10px] bg-violet-100 text-violet-700 font-bold px-2 py-0.5 rounded-full">Pro</span>}
            </div>
            <p className="text-xs text-zinc-400 mb-4">Elegí una plantilla o personalizá los colores. Pro y superior para aplicar.</p>

            {/* Plantillas */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {CARD_TEMPLATES.map(tpl => {
                const isActive = cardColor === tpl.color
                return (
                  <button
                    key={tpl.id}
                    onClick={() => isPro ? applyTemplate(tpl) : undefined}
                    className={`relative rounded-xl overflow-hidden transition-all ${isActive ? 'ring-2 ring-violet-500 ring-offset-1' : 'opacity-80 hover:opacity-100'} ${!isPro ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    title={isPro ? tpl.name : `${tpl.name} — disponible en Pro`}
                  >
                    <div className="p-2 pb-1.5" style={{ background: `linear-gradient(145deg, ${tpl.color}f0, ${tpl.color}a0)` }}>
                      <p className="text-[9px] font-bold mb-1 truncate" style={{ color: tpl.textColor }}>{program.businesses?.name ?? 'Mi Negocio'}</p>
                      <div className="grid grid-cols-5 gap-0.5 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`aspect-square rounded-sm ${i < 3 ? 'bg-white/80' : 'bg-white/20'}`} />
                        ))}
                      </div>
                      <p className="text-[8px] font-semibold" style={{ color: `${tpl.textColor}cc` }}>{tpl.name}</p>
                    </div>
                    {!isPro && (
                      <div className="absolute inset-0 bg-zinc-900/40 flex items-center justify-center">
                        <span className="text-[10px] text-white font-bold">🔒</span>
                      </div>
                    )}
                    {isActive && isPro && (
                      <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-violet-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-[8px] font-bold">✓</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Colores custom */}
            {isPro ? (
              <div>
                <p className="text-xs font-semibold text-zinc-600 dark:text-gray-400 mb-2">O personalizá los colores:</p>
                <div className="flex items-center gap-4 flex-wrap">
                  {[
                    { label: 'Color tarjeta',    val: cardColor,     set: setCardColor },
                    { label: 'Color texto',       val: cardTextColor, set: setCardTextColor },
                    { label: 'Fondo de página',   val: pageBgColor,   set: setPageBgColor },
                  ].map(({ label, val, set }) => (
                    <div key={label} className="flex items-center gap-2">
                      <label className="text-xs text-zinc-500 dark:text-gray-400">{label}</label>
                      <input type="color" value={val} onChange={e => set(e.target.value)}
                        className="w-9 h-9 rounded-lg cursor-pointer border border-zinc-200 p-0.5" />
                    </div>
                  ))}
                  <button onClick={saveCardColors} disabled={colorSaving || colorSaved}
                    className="text-xs font-bold text-white px-4 py-2 rounded-xl disabled:opacity-50"
                    style={{ background: colorSaved ? '#10B981' : '#7C3AED' }}>
                    {colorSaved ? '✓ Guardado' : colorSaving ? 'Guardando...' : 'Guardar colores'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-zinc-50 dark:bg-gray-800 border border-zinc-200 dark:border-gray-700 px-4 py-3">
                <p className="text-xs text-zinc-500 dark:text-gray-400">🔒 Personalización de colores disponible en plan <strong>Pro</strong>.</p>
              </div>
            )}
          </div>

          {/* Logo */}
          <div className="p-5 border-b border-zinc-50 dark:border-gray-800">
            <p className="text-sm font-semibold text-zinc-800 dark:text-gray-100 mb-1">Logo del negocio</p>
            <p className="text-xs text-zinc-400 mb-4">Cuadrado de <strong>800 × 800 px</strong> (mínimo 400 × 400), PNG con fondo transparente, máx. 2 MB. Dejá un poco de margen alrededor del dibujo para que no quede cortado.</p>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-gray-700 flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-gray-800 flex-shrink-0">
                {program.logo_url ? <img src={program.logo_url} alt="" className="w-full h-full object-contain p-2" /> : <span className="text-3xl">🖼️</span>}
              </div>
              <div>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                  onChange={e => uploadFile(e, 'logo', url => onLogoUploaded(url), setUploading, setUploadError)} />
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="text-sm font-semibold border border-violet-200 text-violet-700 px-4 py-2 rounded-xl hover:bg-violet-50 transition-colors disabled:opacity-50">
                  {uploading ? 'Subiendo...' : program.logo_url ? 'Cambiar logo' : 'Subir logo'}
                </button>
                {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
                {program.logo_url && <p className="text-xs text-green-600 mt-1 font-medium">✓ Logo activo</p>}
              </div>
            </div>
          </div>

          {/* Ícono app */}
          <div className="p-5 border-b border-zinc-50 dark:border-gray-800">
            <p className="text-sm font-semibold text-zinc-800 dark:text-gray-100 mb-1">Ícono para app y notificaciones</p>
            <p className="text-xs text-zinc-400 mb-2">Aparece cuando tus clientes instalan la app y en las notificaciones push.</p>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-4 py-3 mb-3 space-y-1">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">Cómo tiene que ser el ícono para que se vea bien en Android e iPhone:</p>
              <p className="text-xs text-amber-700 dark:text-amber-300">• Tamaño: <strong>512 × 512 px</strong>, formato PNG, máx. 2 MB</p>
              <p className="text-xs text-amber-700 dark:text-amber-300">• El logo tiene que ocupar <strong>máximo el 60%</strong> y estar centrado</p>
              <p className="text-xs text-amber-700 dark:text-amber-300">• El <strong>fondo tiene que ser de color sólido</strong> (no transparente)</p>
            </div>
            {isPro ? (
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-gray-700 flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-gray-800 flex-shrink-0">
                  {appIconUrl ? <img src={appIconUrl} alt="" className="w-full h-full object-cover rounded-2xl" /> : <span className="text-3xl">📱</span>}
                </div>
                <div>
                  <input ref={appIconRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                    onChange={e => uploadFile(e, 'app_icon', url => setAppIconUrl(url + '?t=' + Date.now()), setAppIconUploading, setAppIconError)} />
                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => appIconRef.current?.click()} disabled={appIconUploading}
                      className="text-sm font-semibold border border-violet-200 text-violet-700 px-4 py-2 rounded-xl hover:bg-violet-50 transition-colors disabled:opacity-50">
                      {appIconUploading ? 'Subiendo...' : appIconUrl ? 'Cambiar ícono' : 'Subir ícono'}
                    </button>
                    {appIconUrl && (
                      <button onClick={async () => { await patchProgram({ app_icon_url: null }); setAppIconUrl(null) }}
                        className="text-sm font-semibold border border-red-200 text-red-500 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors">
                        Eliminar
                      </button>
                    )}
                  </div>
                  {appIconError && <p className="text-xs text-red-500 mt-1">{appIconError}</p>}
                  {appIconUrl && <p className="text-xs text-green-600 mt-1 font-medium">✓ Ícono activo</p>}
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-zinc-50 dark:bg-gray-800 border border-zinc-200 dark:border-gray-700 px-4 py-3">
                <p className="text-xs text-zinc-500 dark:text-gray-400">🔒 Disponible en plan <strong>Pro</strong> o superior.</p>
              </div>
            )}
          </div>

          {/* Ícono sellos */}
          <div className="p-5 border-b border-zinc-50 dark:border-gray-800">
            <p className="text-sm font-semibold text-zinc-800 dark:text-gray-100 mb-1">Ícono de los sellos</p>
            <p className="text-xs text-zinc-400 mb-2">Cada sello en la tarjeta del cliente muestra este ícono. Cuadrado de <strong>256 × 256 px</strong> (mínimo 128 × 128), PNG con fondo transparente, máx. 2 MB. Usá un dibujo simple y centrado: se ve chiquito.</p>
            {isPro ? (
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-gray-700 flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-gray-800 flex-shrink-0">
                  {stampIconUrl ? <img src={stampIconUrl} alt="" className="w-full h-full object-contain p-2" /> : <span className="text-3xl">🔖</span>}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input ref={stampIconRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                      onChange={e => uploadFile(e, 'stamp_icon', url => setStampIconUrl(url), setStampIconUploading, setStampIconError)} />
                    <button onClick={() => stampIconRef.current?.click()} disabled={stampIconUploading}
                      className="text-sm font-semibold border border-violet-200 text-violet-700 px-4 py-2 rounded-xl hover:bg-violet-50 transition-colors disabled:opacity-50">
                      {stampIconUploading ? 'Subiendo...' : stampIconUrl ? 'Cambiar ícono' : 'Subir ícono'}
                    </button>
                    {stampIconUrl && (
                      <button onClick={async () => { await patchProgram({ stamp_icon_url: null }); setStampIconUrl(null) }}
                        className="text-sm font-semibold border border-red-200 text-red-500 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors">
                        Eliminar
                      </button>
                    )}
                  </div>
                  {stampIconError && <p className="text-xs text-red-500">{stampIconError}</p>}
                  {stampIconUrl && <p className="text-xs text-green-600 font-medium">✓ Ícono activo</p>}
                  {stampIconUrl && (
                    <button onClick={() => saveStampNoBg(!stampNoBg)}
                      className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors ${stampNoBg ? 'bg-violet-50 border-violet-200 text-violet-700' : 'bg-zinc-50 dark:bg-gray-800 border-zinc-200 dark:border-gray-700 text-zinc-500'}`}>
                      <span className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${stampNoBg ? 'bg-violet-600 border-violet-600' : 'border-zinc-300'}`} />
                      Sin fondo en los sellos
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-zinc-50 dark:bg-gray-800 border border-zinc-200 dark:border-gray-700 px-4 py-3">
                <p className="text-xs text-zinc-500 dark:text-gray-400">🔒 Disponible en plan <strong>Pro</strong> o superior.</p>
              </div>
            )}
          </div>

          {/* Fondo de sellos */}
          <div className="p-5 border-b border-zinc-50 dark:border-gray-800">
            <p className="text-sm font-semibold text-zinc-800 dark:text-gray-100 mb-1">Fondo de sellos</p>
            <p className="text-xs text-zinc-400 mb-2">Imagen de fondo detrás de los sellos. Horizontal de <strong>1200 × 800 px</strong> (mínimo 800 × 530), JPG o PNG, máx. 2 MB. Recomendado: foto del local o producto, con lo importante en el centro.</p>
            {isPro ? (
              <div className="flex items-center gap-4">
                <div className="w-24 h-16 rounded-xl border-2 border-dashed border-zinc-200 dark:border-gray-700 flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-gray-800 flex-shrink-0">
                  {cardBgUrl ? <img src={cardBgUrl} alt="" className="w-full h-full object-cover rounded-xl" /> : <span className="text-2xl">🌄</span>}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input ref={cardBgRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                      onChange={e => uploadFile(e, 'card_background', url => setCardBgUrl(url), setCardBgUploading, setCardBgError)} />
                    <button onClick={() => cardBgRef.current?.click()} disabled={cardBgUploading}
                      className="text-sm font-semibold border border-violet-200 text-violet-700 px-4 py-2 rounded-xl hover:bg-violet-50 transition-colors disabled:opacity-50">
                      {cardBgUploading ? 'Subiendo...' : cardBgUrl ? 'Cambiar imagen' : 'Subir imagen'}
                    </button>
                    {cardBgUrl && (
                      <button onClick={async () => { await patchProgram({ card_background_url: null }); setCardBgUrl(null) }}
                        className="text-sm font-semibold border border-red-200 text-red-500 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors">
                        Eliminar
                      </button>
                    )}
                  </div>
                  {cardBgError && <p className="text-xs text-red-500">{cardBgError}</p>}
                  {cardBgUrl && <p className="text-xs text-green-600 font-medium">✓ Fondo activo</p>}
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-zinc-50 dark:bg-gray-800 border border-zinc-200 dark:border-gray-700 px-4 py-3">
                <p className="text-xs text-zinc-500 dark:text-gray-400">🔒 Disponible en plan <strong>Pro</strong> o superior.</p>
              </div>
            )}
          </div>

          {/* Google Wallet */}
          <div className="p-5 border-b border-zinc-50 dark:border-gray-800">
            {!canUse(plan, 'wallet') ? (
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-800 px-4 py-3">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-200 mb-0.5">🔒 Google Wallet es del plan Pro en adelante</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">Con Pro tus clientes pueden guardar la tarjeta en la billetera de su celular. Mientras tanto la usan desde el link o la app instalada.</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-zinc-400 mb-2">Si Google Wallet muestra "Ocurrió un error", sincronizá la tarjeta:</p>
                <button onClick={syncWallet} disabled={walletSyncing}
                  className="text-xs font-semibold border border-zinc-200 dark:border-gray-700 text-zinc-600 dark:text-gray-300 px-4 py-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {walletSyncing ? '⏳ Sincronizando...' : '🔄 Sincronizar Google Wallet'}
                </button>
                {walletSyncMsg && (
                  <p className={`text-xs mt-2 font-medium ${walletSyncMsg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>{walletSyncMsg}</p>
                )}
              </>
            )}
          </div>

          {/* Premio final */}
          <div className="p-5 border-t border-zinc-100 dark:border-gray-800">
            <p className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Premio final</p>
            <p className="text-xs text-zinc-400 mb-4">Cuántos sellos necesita el cliente y qué premio recibe al completar la tarjeta.</p>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1 bg-zinc-50 dark:bg-gray-800 border border-zinc-200 dark:border-gray-700 rounded-xl px-3 py-2">
                <span className="text-xs text-zinc-400 whitespace-nowrap">A los</span>
                <input type="number" min={1} max={30} value={rewardGoal} onChange={e => setRewardGoal(Number(e.target.value))}
                  className="w-12 bg-transparent text-center font-bold text-zinc-900 dark:text-white text-sm focus:outline-none" />
                <span className="text-xs text-zinc-400 whitespace-nowrap">sellos</span>
              </div>
              <input type="text" value={rewardDesc} onChange={e => setRewardDesc(e.target.value)}
                placeholder="Ej: 30% OFF en tu próxima compra"
                className="flex-1 border border-zinc-200 dark:border-gray-700 bg-transparent dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400" />
            </div>
            <div className="flex items-center gap-3 mt-3">
              <button onClick={saveReward} disabled={rewardSaving || rewardSaved || !rewardGoal || !rewardDesc.trim()}
                className="text-xs font-bold text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                style={{ background: rewardSaved ? '#10B981' : '#7C3AED' }}>
                {rewardSaved ? '✓ Guardado' : rewardSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
            {rewardError && <p className="text-xs text-red-500 mt-2">{rewardError}</p>}
          </div>

          {/* Premios intermedios */}
          <div className="p-5 border-t border-zinc-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-bold text-zinc-900 dark:text-white">Premios intermedios</p>
              <span className="text-[10px] bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">Opcional</span>
            </div>
            <p className="text-xs text-zinc-400 mb-4">Podés dar un premio antes de llegar a la meta. Ej: a los 3 sellos, 10% OFF.</p>
            {milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1 bg-zinc-50 dark:bg-gray-800 border border-zinc-200 dark:border-gray-700 rounded-xl px-3 py-2 flex-1">
                  <span className="text-xs text-zinc-400 whitespace-nowrap">Al sello</span>
                  <input type="number" min={1} max={program ? program.stamps_goal - 1 : 9} value={m.at}
                    onChange={e => setMilestones(ms => ms.map((x, idx) => idx === i ? { ...x, at: Number(e.target.value) } : x))}
                    className="w-12 bg-transparent text-center font-bold text-zinc-900 dark:text-white text-sm focus:outline-none" />
                </div>
                <input type="text" value={m.label}
                  onChange={e => setMilestones(ms => ms.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))}
                  placeholder="Ej: 10% OFF"
                  className="flex-1 border border-zinc-200 dark:border-gray-700 bg-transparent dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400" />
                <button onClick={() => setMilestones(ms => ms.filter((_, idx) => idx !== i))}
                  className="text-zinc-300 hover:text-red-400 transition-colors text-lg leading-none px-1">✕</button>
              </div>
            ))}
            <div className="flex items-center gap-3 mt-3">
              <button onClick={() => setMilestones(ms => [...ms, { at: Math.floor((program?.stamps_goal ?? 10) / 2), label: '10% OFF' }])}
                className="text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors">
                + Agregar premio intermedio
              </button>
              <button onClick={saveMilestones} disabled={milestoneSaving || milestoneSaved}
                className="text-xs font-bold text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                style={{ background: milestoneSaved ? '#10B981' : '#7C3AED' }}>
                {milestoneSaved ? '✓ Guardado' : milestoneSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
            {milestoneError && <p className="text-xs text-red-500 mt-2">{milestoneError}</p>}
          </div>
        </div>{/* end LEFT */}

        {/* RIGHT: sticky phone preview */}
        <div className="sticky top-6 hidden lg:flex flex-col items-center w-[400px] flex-shrink-0">
          {/* iOS/Android toggle */}
          <div className="flex gap-1 bg-zinc-100 dark:bg-gray-800 rounded-xl p-0.5 mb-5 self-stretch">
            {(['ios', 'android'] as const).map(d => (
              <button key={d} onClick={() => setPreviewDevice(d)}
                className={`flex-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${previewDevice === d ? 'bg-white dark:bg-gray-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}>
                {d === 'ios' ? '📱 iOS' : '🤖 Android'}
              </button>
            ))}
          </div>

          {/* Phone frame */}
          <div
            className={`relative w-[380px] h-[780px] border-[10px] border-zinc-800 bg-zinc-800 shadow-xl ${previewDevice === 'ios' ? 'rounded-[3rem]' : 'rounded-[2.2rem]'}`}
          >
            {/* Cámara / notch */}
            {previewDevice === 'ios' ? (
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />
            ) : (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-black rounded-full z-20" />
            )}
            {/* Botones físicos */}
            <div className="absolute left-[-13px] top-24 w-[3px] h-8 bg-zinc-700 rounded-l" />
            <div className="absolute left-[-13px] top-40 w-[3px] h-14 bg-zinc-700 rounded-l" />
            <div className="absolute left-[-13px] top-56 w-[3px] h-14 bg-zinc-700 rounded-l" />
            <div className="absolute right-[-13px] top-36 w-[3px] h-20 bg-zinc-700 rounded-r" />

            {/* Display: muestra la página real de la tarjeta (390px de ancho) escalada al celu */}
            <div
              className={`relative w-full h-full overflow-hidden ${previewDevice === 'ios' ? 'rounded-[2.2rem]' : 'rounded-[1.6rem]'}`}
              style={{ backgroundColor: pageBgColor }}
            >
              {/* Barra de estado */}
              <div
                className="absolute top-0 inset-x-0 px-7 pt-3.5 flex items-center justify-between z-10"
                style={{ color: isDarkColor(pageBgColor) ? '#ffffff' : '#18181b' }}
              >
                <span className="text-xs font-semibold">9:41</span>
                <div className="flex gap-1.5 items-center opacity-80">
                  <div className="w-5 h-2.5 rounded-sm bg-current" />
                  <div className="w-2 h-2 rounded-full bg-current" />
                </div>
              </div>

              <style>{`
                @keyframes pv-confetti-fall {
                  0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
                  100% { transform: translateY(90px) rotate(360deg); opacity: 0; }
                }
                .pv-confetti { animation: pv-confetti-fall 1.4s ease-in infinite; }
                @keyframes pv-push-in {
                  0% { transform: translateY(-120%); opacity: 0; }
                  100% { transform: translateY(0); opacity: 1; }
                }
                .pv-push { animation: pv-push-in .45s cubic-bezier(.2,.9,.3,1.2) both; }
                @keyframes pv-pop {
                  0% { transform: scale(.6); opacity: 0; }
                  100% { transform: scale(1); opacity: 1; }
                }
                .pv-pop { animation: pv-pop .35s ease-out both; }
              `}</style>

              {/* Notificación push simulada */}
              {pvPush && (
                <div className="pv-push absolute top-9 inset-x-3 z-40 bg-white/95 backdrop-blur rounded-2xl shadow-2xl px-3.5 py-3 flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
                    {appIconUrl ? <img src={appIconUrl} alt="" className="w-full h-full object-cover" /> : (program.businesses?.name ?? program.name).charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-zinc-900 truncate">{program.businesses?.name ?? program.name}</p>
                    <p className="text-[11px] text-zinc-600 leading-snug">{pvPush}</p>
                  </div>
                  <span className="text-[9px] text-zinc-400 ml-auto flex-shrink-0">ahora</span>
                </div>
              )}

              {/* Aviso "Sello sumado" */}
              {pvToast && (
                <div className="pv-pop absolute bottom-16 inset-x-0 z-30 flex justify-center pointer-events-none">
                  <div className="bg-zinc-900 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-xl">✓ ¡Sello sumado!</div>
                </div>
              )}

              {/* Pantalla de hito / premio (igual que ve el cliente al escanear) */}
              {pvEvent && (
                <div className="absolute inset-0 z-30 bg-white flex flex-col items-center justify-center text-center px-7 gap-4">
                  <div className="relative">
                    <div className="pv-pop text-7xl">{pvEvent.kind === 'reward' ? '🏆' : '🎁'}</div>
                    <div className="absolute -top-2 -inset-x-6 flex justify-around pointer-events-none">
                      {['🎊', '⭐', '✨', '🎉', '🎊'].map((e, i) => (
                        <span key={i} className="pv-confetti text-lg" style={{ animationDelay: `${i * 0.15}s` }}>{e}</span>
                      ))}
                    </div>
                  </div>
                  <h2 className="text-2xl font-extrabold text-zinc-900">
                    {pvEvent.kind === 'reward' ? '¡Completaste la tarjeta!' : '¡Ganaste un descuento!'}
                  </h2>
                  <div className={`rounded-2xl px-6 py-3.5 w-full border-2 ${pvEvent.kind === 'reward' ? 'bg-amber-50 border-amber-300' : 'bg-violet-50 border-violet-300'}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${pvEvent.kind === 'reward' ? 'text-amber-500' : 'text-violet-500'}`}>
                      {pvEvent.kind === 'reward' ? 'Tu premio' : 'Tu descuento'}
                    </p>
                    <p className="text-base font-bold text-zinc-900">{pvEvent.label}</p>
                  </div>
                  <div className="bg-zinc-900 rounded-2xl px-6 py-3.5 w-full">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">
                      {pvEvent.kind === 'reward' ? 'Código de canje' : 'Código de descuento'}
                    </p>
                    <p className="text-lg font-mono font-extrabold text-white tracking-widest">{pvEvent.code}</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Mostralo al encargado — un solo uso</p>
                  </div>
                  <p className="text-zinc-500 text-xs">
                    {pvEvent.kind === 'reward' ? 'Tu tarjeta fue reiniciada. ¡A juntar más sellos!' : '¡Seguí sumando sellos para tu premio final!'}
                  </p>
                  <button type="button" onClick={() => setPvEvent(null)}
                    className="text-violet-600 text-sm font-semibold underline underline-offset-2">
                    Ver mi tarjeta →
                  </button>
                </div>
              )}

              <div className="absolute inset-0 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex flex-col items-center origin-top-left" style={{ width: 390, minHeight: 823, transform: 'scale(0.9231)', marginBottom: 80 }}>

                {/* ── TARJETA ── */}
                <div className="w-full max-w-sm px-4 pt-10 pb-2">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl"
                    style={{ background: `linear-gradient(145deg, ${cardColor}f0, ${cardColor}bb)` }}>
                    {cardBgUrl && (
                      <div className="absolute inset-0"
                        style={{ backgroundImage: `url(${cardBgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3 }} />
                    )}
                    {cardBgUrl && (
                      <div className="absolute inset-0" style={{ background: `${cardColor}99` }} />
                    )}
                    {/* Header */}
                    <div className="relative px-6 pt-7 pb-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium mb-0.5" style={{ color: `${cardTextColor}99` }}>Juan García</p>
                        <p className="font-extrabold text-xl leading-tight" style={{ color: cardTextColor }}>
                          {program.businesses?.name ?? program.name}
                        </p>
                      </div>
                      {(appIconUrl || program.logo_url) ? (
                        appIconUrl ? (
                          <div className="w-14 h-14 rounded-2xl flex-shrink-0 overflow-hidden">
                            <img src={appIconUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <img src={program.logo_url!} alt="" className="w-11 h-11 object-contain" />
                          </div>
                        )
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-extrabold" style={{ color: cardTextColor }}>
                          {(program.businesses?.name ?? program.name).charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {/* Grid sellos */}
                    <div className="relative px-6 pb-4">
                      <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${Math.min(program.stamps_goal, 5)}, 1fr)` }}>
                        {Array.from({ length: Math.min(program.stamps_goal, 10) }).map((_, i) => {
                          const previewIcon = stampIconUrl ?? program.logo_url
                          const filled = i < pvStamps
                          return previewIcon ? (
                            stampNoBg ? (
                              <div key={i} className="aspect-square flex items-center justify-center p-1">
                                <img src={previewIcon} alt="" className="w-full h-full object-contain"
                                  style={filled ? {} : { filter: 'grayscale(100%) opacity(0.25)' }} />
                              </div>
                            ) : (
                              <div key={i} className={`aspect-square rounded-2xl flex items-center justify-center p-2 ${filled ? 'bg-white shadow-md' : 'bg-white/15'}`}>
                                <img src={previewIcon} alt="" className="w-full h-full object-contain"
                                  style={filled ? {} : { filter: 'grayscale(100%) brightness(1.5) opacity(0.3)' }} />
                              </div>
                            )
                          ) : (
                            <div key={i} className={`aspect-square rounded-full flex items-center justify-center text-base font-bold ${filled ? 'bg-white shadow-md' : 'bg-white/15'}`}
                              style={filled ? { color: cardColor } : { color: 'rgba(255,255,255,0.35)' }}>
                              {filled ? '✓' : '·'}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    {/* Escalera de recompensas */}
                    {milestones.length > 0 && (
                      <div className="relative px-6 pb-3">
                        <div className="relative">
                          <div className="absolute top-3 left-0 right-0 h-0.5 rounded-full" style={{ background: `${cardTextColor}25` }} />
                          <div className="absolute top-3 left-0 h-0.5 rounded-full"
                            style={{ width: `${Math.min((pvStamps / program.stamps_goal) * 100, 100)}%`, background: `${cardTextColor}70` }} />
                          <div className="flex justify-between relative">
                            {milestones.map(m => {
                              const reached = pvStamps >= m.at
                              return (
                                <div key={m.at} className="flex flex-col items-center" style={{ position: 'absolute', left: `${(m.at / program.stamps_goal) * 100}%`, transform: 'translateX(-50%)' }}>
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${reached ? 'border-white' : 'border-white/30'}`}
                                    style={{ background: reached ? cardTextColor : 'transparent', color: reached ? cardColor : `${cardTextColor}60` }}>
                                    🎁
                                  </div>
                                  <p className="text-[9px] mt-1 text-center leading-tight max-w-[52px]"
                                    style={{ color: reached ? cardTextColor : `${cardTextColor}60` }}>
                                    {m.label}
                                  </p>
                                </div>
                              )
                            })}
                            <div className="flex flex-col items-center" style={{ position: 'absolute', left: '100%', transform: 'translateX(-50%)' }}>
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 border-white/30"
                                style={{ background: 'transparent', color: `${cardTextColor}60` }}>
                                🏆
                              </div>
                              <p className="text-[9px] mt-1 text-center leading-tight max-w-[52px]" style={{ color: `${cardTextColor}60` }}>
                                {program.reward_description}
                              </p>
                            </div>
                          </div>
                          <div className="h-10" />
                        </div>
                      </div>
                    )}
                    {/* Progreso */}
                    <div className="relative px-6 py-5">
                      <div className="flex justify-between text-xs mb-2" style={{ color: `${cardTextColor}b3` }}>
                        <span className="font-bold text-sm" style={{ color: cardTextColor }}>{pvStamps} de {program.stamps_goal} sellos</span>
                        {milestones.length === 0 && <span>{program.reward_description}</span>}
                      </div>
                      <div className="rounded-full h-2" style={{ background: `${cardTextColor}30` }}>
                        <div className="h-2 rounded-full" style={{ width: `${Math.min((pvStamps / program.stamps_goal) * 100, 100)}%`, background: cardTextColor }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── SECCIÓN INFERIOR ── */}
                <div className="w-full max-w-sm px-4 mt-4 flex flex-col gap-3">
                  {/* Cupones ganados */}
                  {pvCoupons.map((c, i) => (
                    <div key={i} className="pv-pop bg-white rounded-3xl px-5 py-4">
                      <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: cardColor }}>Premio ganado 🎁</p>
                      <p className="text-sm font-semibold text-zinc-800 mb-3">{c.label}</p>
                      <div className="bg-zinc-900 rounded-xl px-4 py-3 text-center">
                        <p className="text-xs text-zinc-400 mb-1 uppercase tracking-widest">Código de descuento</p>
                        <p className="text-lg font-mono font-extrabold text-white tracking-widest">{c.code}</p>
                      </div>
                      <p className="text-xs text-zinc-400 mt-2 text-center">Mostralo al encargado — un solo uso</p>
                    </div>
                  ))}

                  {/* QR */}
                  <div className={`rounded-3xl p-6 text-center ${isDarkColor(pageBgColor) ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
                    <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${isDarkColor(pageBgColor) ? 'text-white/70' : 'text-zinc-500'}`}>
                      Mostrá este QR en el local
                    </p>
                    <p className={`text-xs mb-4 ${isDarkColor(pageBgColor) ? 'text-white/50' : 'text-zinc-400'}`}>para sumar tu sello</p>
                    <div className="flex justify-center">
                      <QRCanvas
                        data={`https://calificar.com.ar/fidelizacion/stamp?program=${program.id}&card=preview`}
                        dark={isDarkColor(pageBgColor) ? '#FFFFFF' : '#18181B'}
                        size={240}
                      />
                    </div>
                    <p className={`text-[11px] mt-4 ${isDarkColor(pageBgColor) ? 'text-white/50' : 'text-zinc-400'}`}>El encargado escanea y se suma automáticamente</p>
                  </div>

                  {/* Wallet */}
                  {previewDevice === 'ios' ? (
                    <div className="flex items-center justify-center gap-2 bg-black text-white font-bold px-6 py-4 rounded-full text-sm shadow-lg border border-white/10">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.18 1.27-2.16 3.8.02 3.02 2.65 4.03 2.68 4.04l-.07.28zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                      Agregar a Apple Wallet
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 bg-zinc-900 text-white font-bold px-6 py-4 rounded-full text-sm shadow-lg border border-white/10">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21.56 10.738l-9.52-9.52A1.5 1.5 0 0010.978.5H3.5A3 3 0 00.5 3.5v7.478c0 .398.158.78.44 1.062l9.52 9.52a3 3 0 004.242 0l6.858-6.858a3 3 0 000-4.243zM5.5 8a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>
                      </svg>
                      Agregar a Google Wallet
                    </div>
                  )}

                  <p className="text-center text-sm font-semibold" style={{ color: `${cardTextColor}cc` }}>✓ Notificaciones activadas</p>
                </div>
              </div>
              </div>

              {/* Barra de inicio */}
              {previewDevice === 'ios' && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full z-10"
                  style={{ background: isDarkColor(pageBgColor) ? '#ffffff66' : '#18181b66' }} />
              )}
            </div>
          </div>

          {/* Controles de la simulación */}
          <div className="mt-5 w-full flex flex-col gap-2">
            <button type="button" onClick={simulateStamp} disabled={!!pvEvent}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50"
              style={{ background: '#7C3AED' }}>
              ＋ Simular sello ({pvStamps}/{program.stamps_goal})
            </button>
            <button type="button" onClick={resetSimulation}
              className="text-xs font-semibold text-zinc-400 hover:text-zinc-600 transition-colors">
              Reiniciar simulación
            </button>
            <p className="text-[11px] text-zinc-400 text-center leading-snug">
              Demo: así ve el cliente cada sello, hito y premio. No crea cupones reales.
            </p>
          </div>
        </div>{/* end RIGHT */}

      </div>{/* end two-column flex */}
    </div>
  )
}

/** misma lógica que la página real de la tarjeta: true si el fondo es oscuro */
function isDarkColor(hex: string): boolean {
  const h = hex.replace('#', '')
  if (h.length < 6) return true
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}
