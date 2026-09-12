'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

type Program = {
  id: string
  name: string
  stamps_goal: number
  reward_description: string
  color_primary: string
  logo_url: string | null
  businesses?: { name: string }
}

type Card = {
  id: string
  name: string
  phone: string
  stamps: number
  total_visits: number
  birth_date: string | null
  created_at: string
}

type Transaction = {
  id: string
  type: 'stamp' | 'reward'
  created_at: string
  loyalty_cards: { name: string }
  coupon_code: string | null
}

// ── Popup de descuento ──────────────────────────────────────────────────────
function DiscountPopup({ onClose }: { onClose: () => void }) {
  const DURATION = 10 * 60 // 10 minutos en segundos
  const [secs, setSecs] = useState(() => {
    const saved = localStorage.getItem('cal_discount_timer')
    if (saved) {
      const remaining = parseInt(saved) - Math.floor(Date.now() / 1000)
      return remaining > 0 ? remaining : 0
    }
    const end = Math.floor(Date.now() / 1000) + DURATION
    localStorage.setItem('cal_discount_timer', String(end))
    return DURATION
  })

  useEffect(() => {
    if (secs <= 0) return
    const id = setInterval(() => setSecs(s => s - 1), 1000)
    return () => clearInterval(id)
  }, [secs])

  const mm = String(Math.floor(secs / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="bg-[#F5F0E8] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        {/* Header oscuro */}
        <div className="px-6 pt-5 pb-4" style={{ background: '#1C1C1C' }}>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">TU DESCUENTO ACABA DE BAJAR</p>
          <div className="flex items-baseline gap-2">
            <span className="text-zinc-500 text-xl line-through">100%</span>
            <span className="text-white font-extrabold text-4xl">50% OFF</span>
          </div>
          <p className="text-zinc-400 text-sm mt-0.5">tu primer mes</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Se acaba en</span>
            <span className="font-mono font-bold text-white text-lg">{mm}:{ss}</span>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-zinc-600 mb-4">
            Este es tu período de prueba. Al terminar el reloj, el precio sube.
            No vuelve a bajar.
          </p>

          <div className="bg-white rounded-xl border border-zinc-200 p-4 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wide">Plan Pro</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-zinc-400 line-through text-sm">$19.99</span>
                  <span className="text-2xl font-extrabold text-zinc-900">$9.99</span>
                  <span className="text-xs text-zinc-400">/mes</span>
                </div>
              </div>
              <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2 py-1 rounded-lg">AHORRÁS $10</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all active:scale-95"
            style={{ background: '#7C3AED' }}
          >
            Asegurar 50% — Actualizar plan
          </button>
          <button
            onClick={() => {
              localStorage.setItem('cal_discount_seen', '1')
              onClose()
            }}
            className="w-full text-center text-xs text-zinc-400 mt-3 hover:text-zinc-600 transition-colors"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Sidebar ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'hoy',         label: 'Hoy',                    icon: '⊞' },
  { id: 'tarjeta',     label: 'Tarjeta',                icon: '🪪' },
  { id: 'clientes',    label: 'Clientes',               icon: '👥' },
  { id: 'push',        label: 'Avisos push',            icon: '🔔' },
  { id: 'cumple',      label: 'Campañas de cumpleaños', icon: '🎂' },
  { id: 'imprimir',    label: 'Imprimir y compartir',   icon: '🖨️' },
]

const SETTINGS_ITEMS = [
  { id: 'perfil',  label: 'Perfil del negocio' },
  { id: 'plan',    label: 'Plan' },
]

function Sidebar({
  active,
  onNav,
  businessName,
  email,
  programName,
}: {
  active: string
  onNav: (id: string) => void
  businessName: string
  email: string
  programName: string
}) {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <aside className="w-64 flex-shrink-0 border-r border-zinc-100 bg-white flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-zinc-100">
        <Link href="/" className="font-extrabold text-xl text-zinc-900 tracking-tight">calificar</Link>
      </div>

      {/* Search */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2">
          <span className="text-zinc-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Buscar un cliente"
            className="bg-transparent text-sm text-zinc-700 placeholder-zinc-400 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Scan button */}
      <div className="px-4 pb-4 pt-2">
        <button
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-white transition-all active:scale-95"
          style={{ background: '#7C3AED' }}
        >
          <span>⊙</span> Escanear QR / NFC
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
              active === item.id
                ? 'bg-violet-50 text-violet-700 font-semibold'
                : 'text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <span className="text-base leading-none">{item.icon}</span>
            {item.label}
          </button>
        ))}

        {/* Ajustes expandible */}
        <div>
          <button
            onClick={() => setSettingsOpen(o => !o)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-all"
          >
            <span className="flex items-center gap-3"><span>⚙️</span>Ajustes</span>
            <span className="text-zinc-400 text-xs">{settingsOpen ? '▲' : '▼'}</span>
          </button>
          {settingsOpen && (
            <div className="ml-9 space-y-0.5 mt-0.5">
              {SETTINGS_ITEMS.map(s => (
                <button
                  key={s.id}
                  onClick={() => onNav(s.id)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 transition-all"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => onNav('ayuda')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-all text-left"
        >
          <span>❓</span> Ayuda
        </button>

        <button
          onClick={() => onNav('primeros-pasos')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-all text-left"
        >
          <span>🚀</span> Primeros pasos
        </button>
      </nav>

      {/* Bottom: user info */}
      <div className="border-t border-zinc-100 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: '#7C3AED' }}
          >
            {businessName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900 truncate">{businessName}</p>
            <p className="text-xs text-zinc-400 truncate">{email}</p>
          </div>
        </div>
        <div className="bg-violet-50 rounded-lg px-3 py-2 mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-violet-600 font-semibold">● Prueba gratuita</span>
            <span className="text-xs text-zinc-400">1 programa</span>
          </div>
          <div className="w-full bg-violet-100 rounded-full h-1">
            <div className="bg-violet-500 h-1 rounded-full" style={{ width: '15%' }} />
          </div>
        </div>
        <button className="w-full text-left text-xs text-zinc-400 hover:text-zinc-600 transition-colors flex items-center gap-2">
          <span>↩</span> Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

// ── Dashboard principal ──────────────────────────────────────────────────────
export default function NegocioDashboard() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState({ total: 0, stampsToday: 0, rewardsTotal: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [notifMsg, setNotifMsg] = useState('')
  const [notifSending, setNotifSending] = useState(false)
  const [notifSent, setNotifSent] = useState(false)
  const [activeNav, setActiveNav] = useState('hoy')
  const [showDiscount, setShowDiscount] = useState(false)
  const [businessName, setBusinessName] = useState('Mi negocio')
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    // Mostrar popup de descuento si no lo vio todavía
    const seen = localStorage.getItem('cal_discount_seen')
    if (!seen) {
      setTimeout(() => setShowDiscount(true), 1200)
    }

    fetch('/api/fidelizacion/admin')
      .then(r => r.json())
      .then(d => {
        setPrograms(d.programs ?? [])
        if (d.programs?.length > 0) {
          setSelectedProgram(d.programs[0].id)
          const biz = d.programs[0].businesses?.name
          if (biz) setBusinessName(biz)
        }
        if (d.email) setUserEmail(d.email)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

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
      const today = new Date().toDateString()
      const stampsToday = t.filter(tx => tx.type === 'stamp' && new Date(tx.created_at).toDateString() === today).length
      const rewardsTotal = t.filter(tx => tx.type === 'reward').length
      setStats({ total: c.length, stampsToday, rewardsTotal })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [selectedProgram])

  async function sendNotif() {
    if (!notifMsg.trim() || !selectedProgram) return
    setNotifSending(true)
    await fetch('/api/fidelizacion/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ program_id: selectedProgram, title: '📣 Novedad del local', body: notifMsg }),
    })
    setNotifSending(false)
    setNotifSent(true)
    setNotifMsg('')
    setTimeout(() => setNotifSent(false), 3000)
  }

  async function manualStamp(cardId: string) {
    await fetch('/api/fidelizacion/stamp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card_id: cardId, program_id: selectedProgram, registered_by: 'manual' }),
    })
    const r = await fetch(`/api/fidelizacion/admin/clients?program_id=${selectedProgram}`)
    const d = await r.json()
    setCards(d.cards ?? [])
  }

  const program = programs.find(p => p.id === selectedProgram)
  const color = program?.color_primary ?? '#7C3AED'
  const filtered = cards.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  )

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 20) return 'Buenas tardes'
    return 'Buenas noches'
  })()

  if (loading && programs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Popup */}
      {showDiscount && <DiscountPopup onClose={() => setShowDiscount(false)} />}

      {/* Sidebar */}
      <Sidebar
        active={activeNav}
        onNav={setActiveNav}
        businessName={businessName}
        email={userEmail}
        programName={program?.name ?? ''}
      />

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">

          {/* Greeting */}
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-zinc-900">{greeting}, {businessName.split(' ')[0]}.</h1>
            <p className="text-zinc-400 text-sm mt-0.5">Esto es lo que está pasando hoy en {businessName}.</p>
          </div>

          {/* QR Banner */}
          {program && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-4 mb-6 flex items-center gap-4">
              <div className="bg-zinc-100 rounded-xl p-2 flex-shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${encodeURIComponent(`https://calificar.com.ar/fidelizacion/unirse?program=${selectedProgram}`)}&color=0F172A&bgcolor=FFFFFF&qzone=1`}
                  alt="QR"
                  width={64}
                  height={64}
                  className="rounded-lg"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-violet-600 mb-0.5">LISTO PARA COMPARTIR</p>
                <p className="font-bold text-zinc-900 text-sm">Tarjeta de sellos</p>
                <p className="text-xs text-zinc-400 mt-0.5">Ponelo en el mostrador o compartí el enlace — el primero en escanearlo aparece aquí con su nombre.</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(`https://calificar.com.ar/fidelizacion/unirse?program=${selectedProgram}`)}&color=0F172A&bgcolor=FFFFFF&qzone=1`}
                  download="qr-calificar.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs border border-zinc-200 text-zinc-600 px-3 py-2 rounded-xl hover:bg-zinc-50 transition-colors font-medium"
                >
                  🖨️ Imprimir
                </a>
                <button
                  onClick={() => navigator.clipboard.writeText(`https://calificar.com.ar/fidelizacion/unirse?program=${selectedProgram}`)}
                  className="text-xs border border-zinc-200 text-zinc-600 px-3 py-2 rounded-xl hover:bg-zinc-50 transition-colors font-medium"
                >
                  🔗 Copiar enlace
                </button>
              </div>
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'CLIENTES TOTALES',  value: stats.total,       sub: '— vs ayer' },
              { label: 'SELLOS HOY',        value: stats.stampsToday, sub: '— vs ayer' },
              { label: 'PREMIOS ENTREGADOS',value: stats.rewardsTotal,sub: '— total' },
            ].map(k => (
              <div key={k.label} className="bg-white border border-zinc-100 rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">{k.label}</p>
                <p className="text-3xl font-extrabold text-zinc-900">{k.value}</p>
                <div className="w-full h-px bg-zinc-100 my-2" />
                <p className="text-xs text-zinc-400">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Bottom grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Actividad */}
            <div className="col-span-1 bg-white border border-zinc-100 rounded-2xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">LO QUE ESTÁ PASANDO AHORA</p>
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-2xl mb-3">✨</div>
                  <p className="text-sm font-semibold text-zinc-700">La actividad aparecerá aquí.</p>
                  <p className="text-xs text-zinc-400 mt-1">Activá tu primer cliente con el QR.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className="flex items-center gap-3 py-1">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${tx.type === 'reward' ? 'bg-amber-50' : 'bg-violet-50'}`}>
                        {tx.type === 'reward' ? '🏆' : '⭐'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-zinc-800 truncate">{tx.loyalty_cards?.name}</p>
                        <p className="text-[10px] text-zinc-400">{tx.type === 'reward' ? 'Premio' : 'Sello'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Clientes que regresan */}
            <div className="col-span-1 bg-white border border-zinc-100 rounded-2xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">CLIENTES QUE REGRESAN</p>
              <div className="flex flex-col items-center justify-center h-32">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-extrabold text-white"
                  style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)`, color }}
                >
                  {stats.total}
                </div>
                <p className="text-xs text-zinc-400 mt-3">clientes registrados</p>
              </div>
            </div>

            {/* Pushes recientes / CTA */}
            <div className="col-span-1 bg-white border border-zinc-100 rounded-2xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">AVISOS PUSH</p>
              <div className="space-y-3 mb-4">
                <textarea
                  value={notifMsg}
                  onChange={e => setNotifMsg(e.target.value)}
                  placeholder="Ej: Esta semana 2x1 en café 🎉"
                  rows={3}
                  className="w-full border border-zinc-200 focus:border-violet-400 rounded-xl px-3 py-2.5 text-xs focus:outline-none transition-colors resize-none"
                />
              </div>
              <button
                onClick={sendNotif}
                disabled={notifSending || !notifMsg.trim() || notifSent}
                className="w-full py-2.5 rounded-xl font-bold text-white text-xs transition-all disabled:opacity-50"
                style={{ background: notifSent ? '#10B981' : '#7C3AED' }}
              >
                {notifSent ? '✓ Enviado' : notifSending ? 'Enviando...' : 'Enviar tu primer push →'}
              </button>
            </div>
          </div>

          {/* Clientes tabla */}
          <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">CLIENTES ({cards.length})</p>
              <input
                type="text"
                placeholder="Buscar por nombre o teléfono..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border border-zinc-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-violet-400 transition-colors w-56"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-zinc-400">
                <p className="text-3xl mb-3">👥</p>
                <p className="font-semibold text-sm">Sin clientes todavía</p>
                <p className="text-xs mt-1">Compartí el QR de registro para que empiecen a sumarse.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50">
                      {['Cliente', 'Teléfono', 'Sellos', 'Visitas', 'Cumpleaños', 'Acciones'].map(h => (
                        <th key={h} className="text-left px-5 py-3 font-semibold text-zinc-400 text-[10px] uppercase tracking-wide first:text-left text-center last:text-center">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {filtered.map(c => (
                      <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ backgroundColor: color }}>
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-zinc-900 text-sm">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-zinc-500 text-xs">{c.phone}</td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 bg-zinc-100 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full" style={{ width: `${Math.min((c.stamps / (program?.stamps_goal ?? 10)) * 100, 100)}%`, backgroundColor: color }} />
                            </div>
                            <span className="text-xs font-bold text-zinc-900 w-10 text-right">{c.stamps}/{program?.stamps_goal}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center text-zinc-500 text-xs">{c.total_visits}</td>
                        <td className="px-5 py-4 text-center text-zinc-500 text-xs">
                          {c.birth_date ? new Date(c.birth_date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }) : '-'}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/fidelizacion/tarjeta?card=${c.id}&program=${selectedProgram}`} className="text-xs text-violet-600 hover:underline">
                              Ver
                            </Link>
                            <button
                              onClick={() => manualStamp(c.id)}
                              className="text-xs bg-violet-100 text-violet-700 hover:bg-violet-200 px-2.5 py-1 rounded-lg font-semibold transition-colors"
                            >
                              + Sello
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}
