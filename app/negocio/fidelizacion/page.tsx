'use client'

import React, { useEffect, useState } from 'react'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import { Sun, Moon } from '@phosphor-icons/react'

// ── Componentes extraídos ────────────────────────────────────────────────────
import Sidebar from '@/components/dashboard/Sidebar'

// ── Vistas (Fase 2 — se crean en la próxima entrega) ────────────────────────
// Hasta que existan, mantenemos las definiciones inline al final de este archivo.
// Una vez que Fase 2 esté lista, reemplazá cada comentario por el import correspondiente:
// import ViewHoy        from '@/components/dashboard/views/ViewHoy'
// import ViewSelloRapido from '@/components/dashboard/views/ViewSelloRapido'
// import ViewTarjeta    from '@/components/dashboard/views/ViewTarjeta'
// import ViewClientes   from '@/components/dashboard/views/ViewClientes'
// import ViewCupones    from '@/components/dashboard/views/ViewCupones'
// import ViewPush       from '@/components/dashboard/views/ViewPush'
// import ViewProximidad from '@/components/dashboard/views/ViewProximidad'
// import ViewCumple     from '@/components/dashboard/views/ViewCumple'
// import ViewReactivacion from '@/components/dashboard/views/ViewReactivacion'
// import ViewInsights   from '@/components/dashboard/views/ViewInsights'
// import ViewReseñas    from '@/components/dashboard/views/ViewReseñas'
// import ViewReferencias from '@/components/dashboard/views/ViewReferencias'
// import ViewRuleta     from '@/components/dashboard/views/ViewRuleta'
// import ViewMetricasSucursal from '@/components/dashboard/views/ViewMetricasSucursal'
// import ViewDominioPersonalizado from '@/components/dashboard/views/ViewDominioPersonalizado'
// import ViewImprimir   from '@/components/dashboard/views/ViewImprimir'
// import ViewPerfil     from '@/components/dashboard/views/ViewPerfil'
// import ViewPlan       from '@/components/dashboard/views/ViewPlan'
// import ViewAyuda      from '@/components/dashboard/views/ViewAyuda'

// ── Types ────────────────────────────────────────────────────────────────────
import type {
  Program, Card, Transaction, Stats,
  PushLog, PushSubscriber, NotifRecipient,
  StampModalState, ViewType,
} from '@/types/dashboard'

// ── Inline temporal (hasta Fase 2) ──────────────────────────────────────────
// Estas funciones están definidas al final del archivo.
// Al agregar los imports de Fase 2, eliminá las definiciones inline correspondientes.

const supabaseClient = createSupabaseClient()

// ── Popup de descuento ───────────────────────────────────────────────────────
const DISCOUNT_PLANS = [
  { id: 'starter', name: 'Starter', origPrice: '$14.999', discPrice: '$7.499',   savings: '$7.500',  pill: 'Para empezar' },
  { id: 'pro',     name: 'Pro',     origPrice: '$29.999', discPrice: '$14.999',  savings: '$15.000', pill: 'Más popular', highlight: true },
  { id: 'ultimate',name: 'Ultimate',origPrice: '$69.999', discPrice: '$34.999',  savings: '$35.000', pill: 'Sin límites' },
]

function DiscountPopup({ onClose, daysLeft }: { onClose: () => void; daysLeft: number }) {
  const [loading, setLoading] = useState<string | null>(null)
  const [err, setErr] = useState('')

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
          <h2 className="text-white font-black text-2xl leading-tight">Quedan {daysLeft} días de prueba</h2>
          <p className="text-zinc-400 text-sm mt-2">Activá tu plan ahora con 50% de descuento en el primer mes.</p>
        </div>
        <div className="p-4 space-y-3">
          {DISCOUNT_PLANS.map(p => (
            <button key={p.id} onClick={() => checkout(p.id)} disabled={!!loading}
              className={`w-full rounded-xl px-4 py-3.5 text-left transition-all ${
                p.highlight
                  ? 'bg-violet-600 hover:bg-violet-500 border-2 border-violet-400'
                  : 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700'
              } ${loading === p.id ? 'opacity-60 cursor-not-allowed' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full mr-2 ${p.highlight ? 'bg-white/20 text-white' : 'bg-zinc-600 text-zinc-300'}`}>{p.pill}</span>
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
          <button onClick={() => { localStorage.setItem('cal_discount_dismissed', '1'); onClose() }}
            className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors">
            No, seguir con la prueba gratuita
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal de sello con monto ─────────────────────────────────────────────────
function StampModal({ cardName, onConfirm, onClose }: {
  cardName: string; onConfirm: (amount?: number) => Promise<void>; onClose: () => void
}) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  async function confirm() {
    setLoading(true)
    await onConfirm(amount ? parseFloat(amount) : undefined)
    setLoading(false)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <h3 className="font-bold text-zinc-900 text-lg mb-1">Dar sello a {cardName}</h3>
        <p className="text-zinc-500 text-sm mb-4">Ingresá el monto de compra (opcional)</p>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
          placeholder="Ej: 5000"
          className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:border-violet-400 mb-4" />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 text-sm font-medium hover:bg-zinc-50 transition-colors">Cancelar</button>
          <button onClick={confirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50">
            {loading ? 'Guardando...' : 'Dar sello ✓'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Dashboard styles (dark mode overrides) ───────────────────────────────────
// Nota: Tailwind dark: classes activan con data-dark="true" (ver tailwind.config.ts).
// Este bloque de CSS maneja clases de zinc/gray que no tienen selector data-* en Tailwind.
const DASHBOARD_STYLES = `
  [data-dark="true"] { background-color: #09090b; color-scheme: dark; }
  [data-dark="true"] .bg-white { background-color: #18181b !important; }
  [data-dark="true"] .bg-zinc-50 { background-color: #27272a !important; }
  [data-dark="true"] .bg-zinc-100 { background-color: #3f3f46 !important; }
  [data-dark="true"] .bg-zinc-200 { background-color: #52525b !important; }
  [data-dark="true"] .border-zinc-50 { border-color: #27272a !important; }
  [data-dark="true"] .border-zinc-100 { border-color: #3f3f46 !important; }
  [data-dark="true"] .border-zinc-200 { border-color: #52525b !important; }
  [data-dark="true"] .border-r { border-color: #3f3f46 !important; }
  [data-dark="true"] .border-b { border-color: #3f3f46 !important; }
  [data-dark="true"] .border-t { border-color: #3f3f46 !important; }
  [data-dark="true"] .text-zinc-900 { color: #f4f4f5 !important; }
  [data-dark="true"] .text-zinc-800 { color: #e4e4e7 !important; }
  [data-dark="true"] .text-zinc-700 { color: #d4d4d8 !important; }
  [data-dark="true"] .text-zinc-600 { color: #a1a1aa !important; }
  [data-dark="true"] .text-zinc-500 { color: #71717a !important; }
  [data-dark="true"] .text-zinc-400 { color: #52525b !important; }
  [data-dark="true"] .hover\\:bg-zinc-50:hover { background-color: #27272a !important; }
  [data-dark="true"] .hover\\:bg-zinc-100:hover { background-color: #3f3f46 !important; }
  [data-dark="true"] .bg-violet-50 { background-color: rgba(109,40,217,0.18) !important; }
  [data-dark="true"] .bg-violet-100 { background-color: rgba(109,40,217,0.25) !important; }
  [data-dark="true"] .text-violet-700 { color: #a78bfa !important; }
  [data-dark="true"] .text-violet-600 { color: #8b5cf6 !important; }
  [data-dark="true"] .bg-amber-50 { background-color: rgba(217,119,6,0.15) !important; }
  [data-dark="true"] .bg-[\\#F5F0E8] { background-color: #27272a !important; }
  [data-dark="true"] input:not([type="range"]),
  [data-dark="true"] textarea,
  [data-dark="true"] select {
    background-color: #27272a !important;
    color: #f4f4f5 !important;
    border-color: #52525b !important;
  }
  [data-dark="true"] input::placeholder,
  [data-dark="true"] textarea::placeholder { color: #52525b !important; }
  [data-dark="true"] .focus\\:border-violet-400:focus { border-color: #7c3aed !important; }
  [data-dark="true"] header { background-color: #18181b !important; border-color: #3f3f46 !important; }
  .placeholder-glow {
    box-shadow: 0 0 0 1.5px rgba(124,58,237,0.18), 0 0 28px rgba(124,58,237,0.10);
    transition: box-shadow 0.2s;
  }
  [data-dark="true"] .placeholder-glow {
    box-shadow: 0 0 0 1.5px rgba(139,92,246,0.30), 0 0 32px rgba(139,92,246,0.18);
  }
  [data-dark="true"] .placeholder-glow:hover {
    box-shadow: 0 0 0 1.5px rgba(139,92,246,0.45), 0 0 40px rgba(139,92,246,0.28);
  }
  [data-dark="true"] .bg-[\\#F8F9FA] { background-color: #0a0a0a !important; }
  [data-dark="true"] .bg-gray-50  { background-color: #18181b !important; }
  [data-dark="true"] .bg-gray-100 { background-color: #27272a !important; }
  [data-dark="true"] .border-gray-50  { border-color: #27272a !important; }
  [data-dark="true"] .border-gray-100 { border-color: #3f3f46 !important; }
  [data-dark="true"] .border-gray-200 { border-color: #52525b !important; }
  [data-dark="true"] .text-gray-900 { color: #f9fafb !important; }
  [data-dark="true"] .text-gray-800 { color: #e5e7eb !important; }
  [data-dark="true"] .text-gray-700 { color: #d1d5db !important; }
  [data-dark="true"] .text-gray-600 { color: #9ca3af !important; }
  [data-dark="true"] .text-gray-500 { color: #9ca3af !important; }
  [data-dark="true"] .text-gray-400 { color: #6b7280 !important; }
  [data-dark="true"] .text-gray-300 { color: #4b5563 !important; }
  [data-dark="true"] .hover\\:bg-gray-50:hover  { background-color: #27272a !important; }
  [data-dark="true"] .hover\\:bg-gray-100:hover { background-color: #3f3f46 !important; }
  [data-dark="true"] .hover\\:bg-gray-800:hover { background-color: #27272a !important; }
  [data-dark="true"] .bg-indigo-50  { background-color: rgba(99,102,241,0.15) !important; }
  [data-dark="true"] .bg-emerald-50 { background-color: rgba(16,185,129,0.15) !important; }
  [data-dark="true"] .bg-rose-50    { background-color: rgba(244,63,94,0.15)  !important; }
  [data-dark="true"] .border-indigo-100  { border-color: rgba(99,102,241,0.25) !important; }
  [data-dark="true"] .border-amber-100   { border-color: rgba(217,119,6,0.25)  !important; }
  [data-dark="true"] .border-emerald-100 { border-color: rgba(16,185,129,0.25) !important; }
  [data-dark="true"] .border-rose-100    { border-color: rgba(244,63,94,0.25)  !important; }
  [data-dark="true"] .text-indigo-700 { color: #818cf8 !important; }
  [data-dark="true"] .text-indigo-500 { color: #818cf8 !important; }
  [data-dark="true"] .text-indigo-400 { color: #a5b4fc !important; }
  [data-dark="true"] .text-amber-700  { color: #fbbf24 !important; }
  [data-dark="true"] .text-amber-500  { color: #fcd34d !important; }
  [data-dark="true"] .text-emerald-500 { color: #34d399 !important; }
  [data-dark="true"] .text-rose-500   { color: #fb7185 !important; }
  [data-dark="true"] .sticky { background-color: #18181b !important; border-color: #3f3f46 !important; }
  [data-dark="true"] .focus\\:border-gray-400:focus { border-color: #6b7280 !important; }
`

// ── Main component ────────────────────────────────────────────────────────────
export default function NegocioDashboard() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [programs, setPrograms] = useState<Program[]>([])
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, stampsToday: 0, rewardsTotal: 0 })
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState<ViewType>('hoy')
  const [showDiscount, setShowDiscount] = useState(false)
  const [businessName, setBusinessName] = useState('Mi negocio')
  const [userEmail, setUserEmail] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [businessPlan, setBusinessPlan] = useState('trial')
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null)
  const [businessCreatedAt, setBusinessCreatedAt] = useState<string | null>(null)
  const [todayBdayCount, setTodayBdayCount] = useState(0)
  const [upcomingBdays, setUpcomingBdays] = useState<{ name: string; daysLeft: number }[]>([])
  const [pushLogs, setPushLogs] = useState<PushLog[]>([])
  const [pushSubscribers, setPushSubscribers] = useState<PushSubscriber[]>([])
  const [salesByDay, setSalesByDay] = useState<Record<string, number>>({})
  const [totalSales, setTotalSales] = useState(0)
  const [stampModal, setStampModal] = useState<StampModalState | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifMsg, setNotifMsg] = useState('')
  const [notifSending, setNotifSending] = useState(false)
  const [notifSent, setNotifSent] = useState(false)
  const [notifError, setNotifError] = useState('')
  const [notifSentCount, setNotifSentCount] = useState(0)
  const [notifRecipients, setNotifRecipients] = useState<NotifRecipient[]>([])
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('cal_dark') === '1'
    return false
  })

  function toggleDark() {
    setIsDark(d => {
      const next = !d
      localStorage.setItem('cal_dark', next ? '1' : '0')
      return next
    })
  }

  // ── Auth + programs fetch ──────────────────────────────────────────────────
  useEffect(() => {
    // Pre-load desde localStorage si viene de onboarding (evita flash)
    try {
      const newBizRaw = localStorage.getItem('cal_new_biz')
      if (newBizRaw) {
        const newBiz = JSON.parse(newBizRaw)
        if (newBiz.name) setBusinessName(newBiz.name)
        if (newBiz.plan) setBusinessPlan(newBiz.plan)
        if (newBiz.created_at) {
          setBusinessCreatedAt(newBiz.created_at)
          const isPaid = ['starter', 'pro', 'ultimate', 'gifted'].includes(newBiz.plan ?? '')
          if (!isPaid) {
            const diff = (Date.now() - new Date(newBiz.created_at).getTime()) / (1000 * 60 * 60 * 24)
            if (diff <= 30) {
              const dismissed = localStorage.getItem('cal_discount_dismissed')
              if (!dismissed) {
                const nextShow = parseInt(localStorage.getItem('cal_discount_next') ?? '0')
                if (Date.now() >= nextShow) setTimeout(() => setShowDiscount(true), 1500)
              }
            }
          }
        }
        localStorage.removeItem('cal_new_biz')
      }
    } catch {}

    let programsFetched = false

    async function loadPrograms(tok: string) {
      if (programsFetched) return
      try {
        const res = await fetch('/api/fidelizacion/my-programs', {
          headers: tok ? { Authorization: `Bearer ${tok}` } : {},
        })
        if (res.status === 401) return
        programsFetched = true
        const d = await res.json()
        if (!d.programs || d.programs.length === 0) {
          window.location.replace('/fidelizacion/onboarding')
          return
        }
        setPrograms(d.programs ?? [])
        if (d.programs?.length > 0) {
          setSelectedProgram(d.programs[0].id)
          const biz = d.programs[0].businesses
          if (biz?.name) setBusinessName(biz.name)
          if (biz?.plan) setBusinessPlan(biz.plan)
          if (biz?.plan_expires_at !== undefined) setPlanExpiresAt(biz.plan_expires_at)
          if (biz?.created_at) {
            setBusinessCreatedAt(biz.created_at)
            const isPaid = ['starter', 'pro', 'ultimate', 'gifted'].includes(biz.plan ?? '')
            if (!isPaid) {
              const diff = (Date.now() - new Date(biz.created_at).getTime()) / (1000 * 60 * 60 * 24)
              if (diff <= 30) {
                const dismissed = localStorage.getItem('cal_discount_dismissed')
                if (!dismissed) {
                  const nextShow = parseInt(localStorage.getItem('cal_discount_next') ?? '0')
                  if (Date.now() >= nextShow) setTimeout(() => setShowDiscount(true), 1500)
                }
              }
            }
          }
        }
        if (d.email) setUserEmail(d.email)
        setLoading(false)
      } catch {
        setLoading(false)
      }
    }

    const authTimeout = setTimeout(() => {
      if (!programsFetched) window.location.replace('/login')
    }, 6000)

    supabaseClient.auth.getSession().then(({ data }) => {
      const tok = data.session?.access_token ?? ''
      if (tok) setAccessToken(tok)
      loadPrograms(tok)
    })

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      const tok = session?.access_token ?? ''
      if (tok) { setAccessToken(tok); loadPrograms(tok) }
    })

    return () => { subscription.unsubscribe(); clearTimeout(authTimeout) }
  }, [])

  // ── Clients + transactions fetch ──────────────────────────────────────────
  useEffect(() => {
    if (!selectedProgram) return
    setLoading(true)
    Promise.all([
      fetch(`/api/fidelizacion/admin/clients?program_id=${selectedProgram}`).then(r => r.json()),
      fetch(`/api/fidelizacion/admin/transactions?program_id=${selectedProgram}&limit=20`).then(r => r.json()),
    ]).then(([clientsData, txData]) => {
      const c: Card[] = clientsData.cards ?? []
      const t: Transaction[] = txData.transactions ?? []
      setCards(c)
      setTransactions(t)
      const today = new Date()
      const mm = today.getMonth() + 1
      const dd = today.getDate()
      setStats({
        total: c.length,
        stampsToday: t.filter(tx => tx.type === 'stamp' && new Date(tx.created_at).toDateString() === today.toDateString()).length,
        rewardsTotal: t.filter(tx => tx.type === 'reward').length,
      })
      const bdayToday = c.filter(card => {
        if (!card.birth_date) return false
        const [, bdM, bdD] = card.birth_date.split('-').map(Number)
        return bdM === mm && bdD === dd
      }).length
      setTodayBdayCount(bdayToday)
      const upcoming = c.flatMap(card => {
        if (!card.birth_date) return []
        const [, bdM, bdD] = card.birth_date.split('-').map(Number)
        const thisYear = new Date(today.getFullYear(), bdM - 1, bdD)
        if (thisYear < today) thisYear.setFullYear(today.getFullYear() + 1)
        const diff = Math.floor((thisYear.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86400000)
        if (diff > 0 && diff <= 7) return [{ name: card.name, daysLeft: diff }]
        return []
      }).sort((a, b) => a.daysLeft - b.daysLeft)
      setUpcomingBdays(upcoming)
      setLoading(false)
    }).catch(() => setLoading(false))

    fetch(`/api/fidelizacion/stats?program_id=${selectedProgram}`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    })
      .then(r => r.json())
      .then(d => {
        setPushLogs(d.push_logs ?? [])
        setPushSubscribers(d.push_subscribers ?? [])
        setSalesByDay(d.sales_by_day ?? {})
        setTotalSales(d.total_sales ?? 0)
      }).catch(() => {})
  }, [selectedProgram])

  // ── Actions ───────────────────────────────────────────────────────────────
  async function sendNotif() {
    if (!notifMsg.trim() || !selectedProgram) return
    setNotifSending(true); setNotifError('')
    try {
      const res = await fetch('/api/fidelizacion/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
        body: JSON.stringify({ program_id: selectedProgram, title: `📣 ${businessName}`, body: notifMsg }),
      })
      const d = await res.json()
      setNotifSending(false)
      if (!res.ok || d.error) { setNotifError(d.error ?? `Error ${res.status}`); return }
      if (d.sent === 0) { setNotifError('Sin suscriptores — ningún cliente activó las notificaciones todavía.'); return }
      setNotifSentCount(d.sent)
      setNotifRecipients(d.recipients ?? [])
      setNotifSent(true)
      setNotifMsg('')
      setPushLogs(prev => [{
        id: Date.now().toString(), title: `📣 ${businessName}`, body: notifMsg,
        sent_to: d.sent, created_at: new Date().toISOString(),
      }, ...prev.slice(0, 4)])
    } catch { setNotifSending(false); setNotifError('Error de red al enviar. Revisá tu conexión.') }
  }

  async function manualStamp(cardId: string, purchaseAmount?: number) {
    await fetch('/api/fidelizacion/stamp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: JSON.stringify({ card_id: cardId, program_id: selectedProgram, registered_by: 'manual', purchase_amount: purchaseAmount ?? null }),
    })
    const r = await fetch(`/api/fidelizacion/admin/clients?program_id=${selectedProgram}`)
    const d = await r.json()
    setCards(d.cards ?? [])
    if (purchaseAmount) {
      const today = new Date().toISOString().slice(0, 10)
      setSalesByDay(prev => ({ ...prev, [today]: (prev[today] ?? 0) + purchaseAmount }))
      setTotalSales(prev => prev + purchaseAmount)
    }
  }

  function handleLogoUploaded(url: string) {
    setPrograms(ps => ps.map(p => p.id === selectedProgram ? { ...p, logo_url: url } : p))
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const program = programs.find(p => p.id === selectedProgram)
  const planExpired = !!(planExpiresAt && new Date(planExpiresAt) < new Date())
  const daysLeftDiscount = businessCreatedAt
    ? Math.max(0, 30 - Math.floor((Date.now() - new Date(businessCreatedAt).getTime()) / (1000 * 60 * 60 * 24)))
    : 30

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loading && programs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-zinc-50" data-dark={String(isDark)}>
      <style>{DASHBOARD_STYLES}</style>

      {/* Popup descuento */}
      {showDiscount && (
        <DiscountPopup onClose={() => setShowDiscount(false)} daysLeft={daysLeftDiscount} />
      )}

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-4 h-14 bg-white border-b border-zinc-100">
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-xl hover:bg-zinc-50 text-zinc-600">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
        <span className="font-bold text-zinc-900 text-sm">Calificar</span>
        <button onClick={toggleDark} className="p-2 rounded-xl hover:bg-zinc-50 text-zinc-500">
          {isDark
            ? <Sun size={18} weight="regular" />
            : <Moon size={18} weight="regular" />
          }
        </button>
      </header>

      {/* Sidebar */}
      <Sidebar
        active={activeNav}
        onNav={setActiveNav}
        businessName={businessName}
        email={userEmail}
        bdayBadge={todayBdayCount}
        isDark={isDark}
        onDarkToggle={toggleDark}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        plan={businessPlan}
        planExpiresAt={planExpiresAt}
      />

      {/* Stamp modal */}
      {stampModal && (
        <StampModal
          cardName={stampModal.name}
          onConfirm={async (amount) => { await manualStamp(stampModal.cardId, amount); setStampModal(null) }}
          onClose={() => setStampModal(null)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">

        {/* Banner plan vencido */}
        {planExpired && (
          <div className="flex items-center justify-between gap-4 px-5 py-3 text-sm bg-red-600 text-white">
            <p className="font-medium">⚠️ Tu plan venció. Algunas funciones están pausadas.</p>
            <button onClick={() => setActiveNav('plan')}
              className="flex-shrink-0 text-xs font-bold bg-white text-red-600 px-3 py-1.5 rounded-xl hover:opacity-90">
              Ver planes →
            </button>
          </div>
        )}

        {/* ── Vistas ── */}
        {activeNav === 'hoy' && (
          <ViewHoy program={program} selectedProgram={selectedProgram} stats={stats}
            transactions={transactions} notifMsg={notifMsg} setNotifMsg={setNotifMsg}
            notifSending={notifSending} notifSent={notifSent} sendNotif={sendNotif}
            businessName={businessName} cards={cards}
            pushLogs={pushLogs} salesByDay={salesByDay} totalSales={totalSales}
            onLogoNav={() => setActiveNav('tarjeta')}
            businessCreatedAt={businessCreatedAt} businessPlan={businessPlan}
            onNavPlan={() => setActiveNav('plan')}
            upcomingBdays={upcomingBdays} onNavBday={() => setActiveNav('cumple')} />
        )}
        {activeNav === 'sello-rapido' && (
          selectedProgram ? (
            <ViewSelloRapido
              cards={cards}
              selectedProgram={selectedProgram}
              accessToken={accessToken}
              manualStamp={(id: string, name: string) => setStampModal({ cardId: id, name })}
              plan={businessPlan}
              planExpiresAt={planExpiresAt}
            />
          ) : loading ? (
            <div className="p-6 flex items-center gap-3 text-zinc-400">
              <div className="w-5 h-5 border-2 border-zinc-300 border-t-violet-500 rounded-full animate-spin" />
              <span className="text-sm">Cargando...</span>
            </div>
          ) : (
            <div className="p-6 max-w-md mx-auto pt-10 text-center">
              <p className="text-4xl mb-4">⚡</p>
              <p className="text-zinc-500 text-sm">Todavía no configuraste tu programa de fidelidad.</p>
            </div>
          )
        )}
        {activeNav === 'tarjeta' && (
          <ViewTarjeta program={program} selectedProgram={selectedProgram}
            onLogoUploaded={handleLogoUploaded} accessToken={accessToken}
            plan={businessPlan} planExpiresAt={planExpiresAt}
            stats={stats} businessCreatedAt={businessCreatedAt} />
        )}
        {activeNav === 'clientes' && (
          <ViewClientes cards={cards} program={program} selectedProgram={selectedProgram}
            loading={loading} manualStamp={(id: string, name: string) => setStampModal({ cardId: id, name })}
            accessToken={accessToken}
            onClientDeleted={(cardId: string) => setCards(prev => prev.filter(c => c.id !== cardId))} />
        )}
        {activeNav === 'cupones' && (
          <ViewCupones selectedProgram={selectedProgram} accessToken={accessToken} />
        )}
        {activeNav === 'push' && (
          <ViewPush notifMsg={notifMsg} setNotifMsg={setNotifMsg}
            notifSending={notifSending} notifSent={notifSent} sendNotif={sendNotif}
            notifError={notifError} notifSentCount={notifSentCount} notifRecipients={notifRecipients}
            setNotifSent={setNotifSent} setNotifSentCount={setNotifSentCount} setNotifRecipients={setNotifRecipients}
            pushLogs={pushLogs} pushSubscribers={pushSubscribers}
            cards={cards} selectedProgram={selectedProgram} accessToken={accessToken} />
        )}
        {activeNav === 'proximidad' && (
          <ViewProximidad selectedProgram={selectedProgram} isPro={true}
            notifMsg={notifMsg} setNotifMsg={setNotifMsg}
            notifSending={notifSending} notifSent={notifSent} sendNotif={sendNotif}
            accessToken={accessToken} />
        )}
        {activeNav === 'cumple' && (
          <ViewCumple selectedProgram={selectedProgram} cards={cards} isPro={true} />
        )}
        {activeNav === 'reactivacion' && (
          <ViewReactivacion selectedProgram={selectedProgram} isPro={true} />
        )}
        {activeNav === 'insights' && (
          <ViewInsights selectedProgram={selectedProgram} isPro={true} accessToken={accessToken} />
        )}
        {activeNav === 'reseñas' && (
          <ViewReseñas selectedProgram={selectedProgram} isPro={true} />
        )}
        {activeNav === 'referencias' && (
          <ViewReferencias selectedProgram={selectedProgram} isPro={true} />
        )}
        {activeNav === 'ruleta' && (
          <ViewRuleta selectedProgram={selectedProgram} isPro={true} />
        )}
        {activeNav === 'metricas' && (
          <ViewMetricasSucursal accessToken={accessToken} />
        )}
        {activeNav === 'dominio' && (
          <ViewDominioPersonalizado selectedProgram={selectedProgram} accessToken={accessToken} />
        )}
        {activeNav === 'imprimir' && (
          <ViewImprimir program={program} selectedProgram={selectedProgram} />
        )}
        {activeNav === 'perfil' && (
          <ViewPerfil program={program} selectedProgram={selectedProgram}
            businessName={businessName} onSaved={(name: string) => setBusinessName(name)}
            accessToken={accessToken} />
        )}
        {activeNav === 'plan' && (
          <ViewPlan onNav={setActiveNav} businessCreatedAt={businessCreatedAt} />
        )}
        {activeNav === 'ayuda' && <ViewAyuda onNav={setActiveNav} />}
        {activeNav === 'primeros-pasos' && <ViewAyuda onNav={setActiveNav} mode="primeros-pasos" />}
      </main>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// VISTAS INLINE — Fase 2 las moverá a components/dashboard/views/*.tsx
// Al migrar cada vista, eliminá su definición de acá y agregá su import arriba.
// ─────────────────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProps = any

// Stub placeholder — reemplazar con implementación real en Fase 2
function _Placeholder({ label }: { label: string }) {
  return <div className="p-8 text-zinc-400 text-sm">{label} — pendiente migración (Fase 2)</div>
}

// ── Declaraciones de las vistas (inline hasta Fase 2) ────────────────────────
// Las implementaciones reales están en el archivo original (6100 líneas).
// Copiarlas acá es el trabajo de Fase 2.

declare function ViewHoy(props: AnyProps): JSX.Element
declare function ViewSelloRapido(props: AnyProps): JSX.Element
declare function ViewTarjeta(props: AnyProps): JSX.Element
declare function ViewClientes(props: AnyProps): JSX.Element
declare function ViewCupones(props: AnyProps): JSX.Element
declare function ViewPush(props: AnyProps): JSX.Element
declare function ViewProximidad(props: AnyProps): JSX.Element
declare function ViewCumple(props: AnyProps): JSX.Element
declare function ViewReactivacion(props: AnyProps): JSX.Element
declare function ViewInsights(props: AnyProps): JSX.Element
declare function ViewReseñas(props: AnyProps): JSX.Element
declare function ViewReferencias(props: AnyProps): JSX.Element
declare function ViewRuleta(props: AnyProps): JSX.Element
declare function ViewMetricasSucursal(props: AnyProps): JSX.Element
declare function ViewDominioPersonalizado(props: AnyProps): JSX.Element
declare function ViewImprimir(props: AnyProps): JSX.Element
declare function ViewPerfil(props: AnyProps): JSX.Element
declare function ViewPlan(props: AnyProps): JSX.Element
declare function ViewAyuda(props: AnyProps): JSX.Element
