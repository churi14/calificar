'use client'

import React, { useEffect, useState } from 'react'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import { Sun, Moon } from '@phosphor-icons/react'

// ── Componentes de UI ─────────────────────────────────────────────────────────
import Sidebar        from '@/components/dashboard/Sidebar'
import DiscountPopup  from '@/components/dashboard/ui/DiscountPopup'
import StampModal     from '@/components/dashboard/ui/StampModal'

// ── Vistas ────────────────────────────────────────────────────────────────────
import ViewHoy              from '@/components/dashboard/views/ViewHoy'
import ViewSelloRapido      from '@/components/dashboard/views/ViewSelloRapido'
import ViewTarjeta          from '@/components/dashboard/views/ViewTarjeta'
import ViewClientes         from '@/components/dashboard/views/ViewClientes'
import ViewCupones          from '@/components/dashboard/views/ViewCupones'
import ViewPush             from '@/components/dashboard/views/ViewPush'
import ViewProximidad       from '@/components/dashboard/views/ViewProximidad'
import ViewCumple           from '@/components/dashboard/views/ViewCumpleanos'
import ViewReactivacion     from '@/components/dashboard/views/ViewReactivacion'
import ViewInsights         from '@/components/dashboard/views/ViewActivityInsights'
import ViewReseñas          from '@/components/dashboard/views/ViewResenas'
import ViewReferencias      from '@/components/dashboard/views/ViewReferencias'
import ViewRuleta           from '@/components/dashboard/views/ViewRuleta'
import ViewMetricasSucursal     from '@/components/dashboard/views/ViewMetricasSucursal'
import ViewDominioPersonalizado from '@/components/dashboard/views/ViewDominioPersonalizado'
import ViewImprimir         from '@/components/dashboard/views/ViewImprimir'
import ViewPerfil           from '@/components/dashboard/views/ViewPerfil'
import ViewPlan             from '@/components/dashboard/views/ViewPlan'
import ViewAyuda            from '@/components/dashboard/views/ViewAyuda'

// ── Types ─────────────────────────────────────────────────────────────────────
import type {
  Program, Card, Transaction, Stats,
  PushLog, PushSubscriber, NotifRecipient,
  StampModalState, ViewType,
} from '@/types/dashboard'

// ── Supabase client ───────────────────────────────────────────────────────────
const supabaseClient = createSupabaseClient()

// ── Main component ────────────────────────────────────────────────────────────
export default function NegocioDashboard() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [programs, setPrograms]                   = useState<Program[]>([])
  const [selectedProgram, setSelectedProgram]     = useState<string | null>(null)
  const [cards, setCards]                         = useState<Card[]>([])
  const [transactions, setTransactions]           = useState<Transaction[]>([])
  const [stats, setStats]                         = useState<Stats>({ total: 0, stampsToday: 0, rewardsTotal: 0 })
  const [loading, setLoading]                     = useState(true)
  const [activeNav, setActiveNav]                 = useState<ViewType>('hoy')
  const [showDiscount, setShowDiscount]           = useState(false)
  const [businessName, setBusinessName]           = useState('Mi negocio')
  const [userEmail, setUserEmail]                 = useState('')
  const [accessToken, setAccessToken]             = useState('')
  const [businessPlan, setBusinessPlan]           = useState('trial')
  const [planExpiresAt, setPlanExpiresAt]         = useState<string | null>(null)
  const [businessCreatedAt, setBusinessCreatedAt] = useState<string | null>(null)
  const [todayBdayCount, setTodayBdayCount]       = useState(0)
  const [upcomingBdays, setUpcomingBdays]         = useState<{ name: string; daysLeft: number }[]>([])
  const [pushLogs, setPushLogs]                   = useState<PushLog[]>([])
  const [pushSubscribers, setPushSubscribers]     = useState<PushSubscriber[]>([])
  const [salesByDay, setSalesByDay]               = useState<Record<string, number>>({})
  const [totalSales, setTotalSales]               = useState(0)
  const [stampModal, setStampModal]               = useState<StampModalState | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen]       = useState(false)
  const [notifMsg, setNotifMsg]                   = useState('')
  const [notifSending, setNotifSending]           = useState(false)
  const [notifSent, setNotifSent]                 = useState(false)
  const [notifError, setNotifError]               = useState('')
  const [notifSentCount, setNotifSentCount]       = useState(0)
  const [notifRecipients, setNotifRecipients]     = useState<NotifRecipient[]>([])
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
          <ViewReactivacion selectedProgram={selectedProgram} isPro={true} accessToken={accessToken} />
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
          <ViewPlan onNav={(id) => setActiveNav(id as ViewType)} businessCreatedAt={businessCreatedAt} />
        )}
        {activeNav === 'ayuda' && <ViewAyuda onNav={(id) => setActiveNav(id as ViewType)} />}
        {activeNav === 'primeros-pasos' && <ViewAyuda onNav={(id) => setActiveNav(id as ViewType)} mode="primeros-pasos" />}
      </main>
    </div>
  )
}
