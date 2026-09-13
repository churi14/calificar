'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Program = {
  id: string
  name: string
  stamps_goal: number
  reward_description: string
  color_primary: string
  logo_url: string | null
  businesses?: { name: string; id: string }
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

// ── Popup descuento ──────────────────────────────────────────────────────────
function DiscountPopup({ onClose }: { onClose: () => void }) {
  const [secs, setSecs] = useState(() => {
    const saved = localStorage.getItem('cal_discount_timer')
    if (saved) {
      const rem = parseInt(saved) - Math.floor(Date.now() / 1000)
      return rem > 0 ? rem : 0
    }
    const end = Math.floor(Date.now() / 1000) + 600
    localStorage.setItem('cal_discount_timer', String(end))
    return 600
  })
  useEffect(() => {
    if (secs <= 0) return
    const id = setInterval(() => setSecs(s => s - 1), 1000)
    return () => clearInterval(id)
  }, [secs])
  const mm = String(Math.floor(secs / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.65)' }}>
      <div className="bg-[#F5F0E8] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="px-6 pt-5 pb-4" style={{ background: '#1C1C1C' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">TU DESCUENTO ACABA DE BAJAR</p>
          <div className="flex items-baseline gap-2">
            <span className="text-zinc-500 text-xl line-through">$19.99</span>
            <span className="text-white font-extrabold text-4xl">50% OFF</span>
          </div>
          <p className="text-zinc-400 text-sm mt-0.5">tu primer mes</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wide">SE ACABA EN</span>
            <span className="font-mono font-bold text-white text-lg">{mm}:{ss}</span>
          </div>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-zinc-600 mb-4">Este es tu período de prueba. Al terminar el reloj, el precio vuelve a su valor normal.</p>
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
          <button onClick={onClose} className="w-full py-3.5 rounded-xl font-bold text-white text-sm" style={{ background: '#7C3AED' }}>
            Asegurar 50% — Actualizar plan
          </button>
          <button onClick={() => { localStorage.setItem('cal_discount_seen', '1'); onClose() }}
            className="w-full text-center text-xs text-zinc-400 mt-3 hover:text-zinc-600 transition-colors">
            Ahora no
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ active, onNav, businessName, email, bdayBadge = 0, isDark, onDarkToggle, isOpen, onClose }: {
  active: string; onNav: (id: string) => void; businessName: string; email: string
  bdayBadge?: number; isDark: boolean; onDarkToggle: () => void; isOpen: boolean; onClose: () => void
}) {
  const [settingsOpen, setSettingsOpen] = useState(active === 'perfil' || active === 'plan')
  const nav = [
    { id: 'hoy',         label: 'Hoy',                    icon: '⊞' },
    { id: 'tarjeta',     label: 'Tarjeta',                icon: '🪪' },
    { id: 'clientes',    label: 'Clientes',               icon: '👥' },
    { id: 'push',        label: 'Avisos push',            icon: '🔔' },
    { id: 'proximidad',  label: 'Avisos de proximidad',   icon: '📍' },
    { id: 'cumple',      label: 'Campañas de cumpleaños', icon: '🎂' },
    { id: 'imprimir',    label: 'Imprimir y compartir',   icon: '🖨️' },
  ]
  function navigate(id: string) { onNav(id); onClose() }
  return (
    <>
      {/* Overlay móvil */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" onClick={onClose} />
      )}
      <aside className={`w-60 flex-shrink-0 border-r border-zinc-100 bg-white flex flex-col h-screen overflow-y-auto z-50 transition-transform duration-200
        fixed top-0 left-0 md:static md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="px-5 py-5 border-b border-zinc-50">
        <Link href="/" className="font-extrabold text-xl text-zinc-900 tracking-tight">calificar</Link>
      </div>
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2">
          <span className="text-zinc-400 text-sm">🔍</span>
          <input type="text" placeholder="Buscar un cliente"
            className="bg-transparent text-sm text-zinc-700 placeholder-zinc-400 focus:outline-none w-full" />
        </div>
      </div>
      <div className="px-4 pb-3 pt-1">
        <button onClick={() => navigate('clientes')}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl font-semibold text-sm text-white"
          style={{ background: '#7C3AED' }}>
          ⊙ Escanear un cliente
        </button>
      </div>
      <nav className="flex-1 px-3 space-y-0.5 pb-2">
        {nav.map(item => (
          <button key={item.id} onClick={() => navigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
              active === item.id ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-zinc-600 hover:bg-zinc-50'}`}>
            <span className="text-base leading-none w-5 text-center">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.id === 'cumple' && bdayBadge > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                {bdayBadge}
              </span>
            )}
          </button>
        ))}
        <div>
          <button onClick={() => setSettingsOpen(o => !o)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-all">
            <span className="flex items-center gap-3"><span className="w-5 text-center">⚙️</span>Ajustes</span>
            <span className="text-zinc-400 text-xs">{settingsOpen ? '▲' : '▼'}</span>
          </button>
          {settingsOpen && (
            <div className="ml-8 mt-0.5 space-y-0.5">
              {[['perfil', 'Perfil del negocio'], ['plan', 'Plan']].map(([id, label]) => (
                <button key={id} onClick={() => navigate(id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                    active === id ? 'text-violet-700 font-semibold bg-violet-50' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'}`}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => navigate('ayuda')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-50 text-left">
          <span className="w-5 text-center">❓</span> Ayuda
        </button>
        <button onClick={() => navigate('primeros-pasos')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-50 text-left">
          <span className="w-5 text-center">🚀</span> Primeros pasos
        </button>
      </nav>
      <div className="border-t border-zinc-100 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: '#7C3AED' }}>
            {businessName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-zinc-900 truncate">{businessName}</p>
            <p className="text-[10px] text-zinc-400 truncate">{email}</p>
          </div>
        </div>
        <div className="bg-violet-50 rounded-lg px-3 py-2 mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-violet-600 font-semibold">● Prueba gratuita</span>
            <span className="text-[10px] text-zinc-400">1 programa</span>
          </div>
          <div className="w-full bg-violet-100 rounded-full h-1">
            <div className="bg-violet-500 h-1 rounded-full" style={{ width: '15%' }} />
          </div>
        </div>
        <div className="flex items-center justify-between mb-2">
          <button className="text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors">↩ Cerrar sesión</button>
          <button onClick={onDarkToggle} title={isDark ? 'Modo claro' : 'Modo oscuro'}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-sm transition-all hover:bg-zinc-100"
            style={{ background: isDark ? '#3f3f46' : '' }}>
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
      </aside>
    </>
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
        <h3 className="text-base font-extrabold text-zinc-900 mb-1">+ Sello para {cardName}</h3>
        <p className="text-xs text-zinc-400 mb-4">Opcional: ingresá el monto de la venta para registrar el gasto.</p>
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-semibold">$</span>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="0.00" min="0" step="0.01"
            className="w-full border border-zinc-200 rounded-xl pl-7 pr-3 py-3 text-sm focus:outline-none focus:border-violet-400" />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50">
            Cancelar
          </button>
          <button onClick={confirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: '#7C3AED' }}>
            {loading ? 'Sellando...' : 'Confirmar sello'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Vista: HOY ───────────────────────────────────────────────────────────────
function ActivityChart({ transactions, color }: { transactions: Transaction[]; color: string }) {
  const days = 30
  const today = new Date()
  const data = Array.from({ length: days }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (days - 1 - i))
    const key = d.toDateString()
    return {
      label: i % 7 === 0 ? `${d.getDate()}/${d.getMonth() + 1}` : '',
      stamps: transactions.filter(tx => tx.type === 'stamp' && new Date(tx.created_at).toDateString() === key).length,
    }
  })
  const maxVal = Math.max(...data.map(d => d.stamps), 1)
  const W = 560, H = 90, padL = 4, padR = 4, padT = 8, padB = 20
  const pts = data.map((d, i) => {
    const x = padL + (i / (days - 1)) * (W - padL - padR)
    const y = padT + (1 - d.stamps / maxVal) * (H - padT - padB)
    return { x, y, ...d }
  })
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area = `${path} L${pts[pts.length-1].x},${H - padB} L${pts[0].x},${H - padB} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 90 }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#chartGrad)" />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => p.stamps > 0 && (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
      ))}
      {pts.map((p, i) => p.label && (
        <text key={i} x={p.x} y={H - 4} textAnchor="middle" fontSize="9" fill="#a1a1aa">{p.label}</text>
      ))}
    </svg>
  )
}

function SalesChart({ salesByDay, cost, color }: { salesByDay: Record<string, number>; cost: number; color: string }) {
  const days = 30
  const today = new Date()
  const data = Array.from({ length: days }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (days - 1 - i))
    const key = d.toISOString().slice(0, 10)
    return {
      label: i % 7 === 0 ? `${d.getDate()}/${d.getMonth() + 1}` : '',
      sales: salesByDay[key] ?? 0,
    }
  })
  const maxVal = Math.max(...data.map(d => d.sales), cost * 2, 1)
  const W = 560, H = 100, padL = 4, padR = 4, padT = 8, padB = 20
  const pts = data.map((d, i) => {
    const x = padL + (i / (days - 1)) * (W - padL - padR)
    const y = padT + (1 - d.sales / maxVal) * (H - padT - padB)
    return { x, y, ...d }
  })
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area = `${path} L${pts[pts.length-1].x},${H - padB} L${pts[0].x},${H - padB} Z`
  // Línea costo mensual prorrateada diaria acumulativa — simplificamos: línea horizontal en costo/30 por día * días
  const costLineY = padT + (1 - (cost / days) / maxVal * days) * (H - padT - padB)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 100 }}>
      <defs>
        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Área ventas */}
      <path d={area} fill="url(#salesGrad)" />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Línea costo mensual */}
      <line x1={padL} y1={costLineY} x2={W - padR} y2={costLineY} stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 3" />
      <text x={W - padR - 2} y={costLineY - 4} textAnchor="end" fontSize="8" fill="#f43f5e">Costo ${cost}/mes</text>
      {pts.map((p, i) => p.sales > 0 && (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
      ))}
      {pts.map((p, i) => p.label && (
        <text key={i} x={p.x} y={H - 4} textAnchor="middle" fontSize="9" fill="#a1a1aa">{p.label}</text>
      ))}
    </svg>
  )
}

function ViewHoy({ program, selectedProgram, stats, transactions, notifMsg, setNotifMsg, notifSending, notifSent, sendNotif, businessName, cards, pushLogs, salesByDay, totalSales, onLogoNav }:
  { program: Program | undefined; selectedProgram: string | null; stats: { total: number; stampsToday: number; rewardsTotal: number }
    transactions: Transaction[]; notifMsg: string; setNotifMsg: (v: string) => void
    notifSending: boolean; notifSent: boolean; sendNotif: () => void; businessName: string; cards: Card[]
    pushLogs: { id: string; title: string; body: string; sent_to: number; created_at: string }[]
    salesByDay: Record<string, number>; totalSales: number; onLogoNav: () => void }) {
  const color = program?.color_primary ?? '#7C3AED'
  const greeting = (() => { const h = new Date().getHours(); return h < 12 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches' })()
  const totalStamps = transactions.filter(tx => tx.type === 'stamp').length
  const returningClients = cards.filter(c => c.total_visits > 1).length
  const hasLogo = !!program?.logo_url
  const [showQrBig, setShowQrBig] = useState(false)
  const qrUrl = `https://calificar.com.ar/fidelizacion/unirse?program=${selectedProgram}`
  // Costo mensual de Calificar (plan starter por defecto)
  const calificarCost = 9.99

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-zinc-900">{greeting}, {businessName.split(' ')[0]}.</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Esto es lo que está pasando hoy en {businessName}.</p>
      </div>

      {/* Modal QR ampliado */}
      {showQrBig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setShowQrBig(false)}>
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrUrl)}&color=0F172A&bgcolor=FFFFFF&qzone=2`}
              alt="QR grande" width={300} height={300} className="rounded-2xl" />
            <p className="text-sm font-bold text-zinc-900">{businessName}</p>
            <p className="text-xs text-zinc-400">Ponélo en el mostrador para que los clientes escaneen</p>
            <button onClick={() => setShowQrBig(false)} className="text-xs text-zinc-400 hover:text-zinc-600">Cerrar</button>
          </div>
        </div>
      )}

      {/* Banner logo */}
      {!hasLogo && (
        <div className="bg-white border border-zinc-100 rounded-2xl p-4 mb-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">☁️</div>
          <div className="flex-1">
            <p className="text-sm font-bold text-zinc-900">Poné tu logo en la tarjeta</p>
            <p className="text-xs text-zinc-400">Subí el logo de tu negocio para que la tarjeta se vea tuya.</p>
          </div>
          <button onClick={onLogoNav}
            className="text-xs font-bold text-white px-4 py-2 rounded-xl flex-shrink-0" style={{ background: color }}>
            Agregar logo
          </button>
        </div>
      )}

      {/* QR Banner */}
      {program && (
        <div className="bg-white border border-zinc-100 rounded-2xl p-4 mb-5 flex items-center gap-4">
          <div className="bg-zinc-100 rounded-xl p-2 flex-shrink-0 cursor-pointer" onClick={() => setShowQrBig(true)}>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${encodeURIComponent(qrUrl)}&color=0F172A&bgcolor=FFFFFF&qzone=1`}
              alt="QR" width={64} height={64} className="rounded-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color }}>LISTO PARA COMPARTIR</p>
            <p className="font-bold text-zinc-900 text-sm">Tarjeta de sellos</p>
            <p className="text-xs text-zinc-400 mt-0.5">Mostrásela al cliente — el primero en escanearlo aparece aquí con su nombre.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setShowQrBig(true)}
              className="text-xs border border-zinc-200 text-zinc-700 px-3 py-2 rounded-xl hover:bg-zinc-50 font-semibold transition-colors">⊞ Ampliar</button>
            <button onClick={() => navigator.clipboard.writeText(qrUrl)}
              className="text-xs border border-zinc-200 text-zinc-600 px-3 py-2 rounded-xl hover:bg-zinc-50 font-medium transition-colors hidden sm:block">🔗 Copiar</button>
            <a href={`https://wa.me/?text=${encodeURIComponent(`Acumulá sellos y ganá premios en ${businessName}! Guardá tu tarjeta digital: ${qrUrl}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="text-xs border border-zinc-200 text-zinc-600 px-3 py-2 rounded-xl hover:bg-zinc-50 font-medium transition-colors">💬 WA</a>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'CLIENTES TOTALES',   value: stats.total,          sub: 'registrados' },
          { label: 'SELLOS HOY',         value: stats.stampsToday,    sub: 'en el día' },
          { label: 'VUELVEN',            value: returningClients,     sub: 'más de 1 visita' },
          { label: 'PREMIOS ENTREGADOS', value: stats.rewardsTotal,   sub: 'en total' },
        ].map(k => (
          <div key={k.label} className={`bg-white border border-zinc-100 rounded-2xl p-4${k.value === 0 ? ' placeholder-glow' : ''}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">{k.label}</p>
            <p className="text-3xl font-extrabold text-zinc-900">{k.value}</p>
            <p className="text-[11px] text-zinc-400 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Mid grid: actividad + clientes + pushes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white border border-zinc-100 rounded-2xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">LO QUE ESTÁ PASANDO AHORA</p>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center placeholder-glow rounded-xl">
              <div className="w-10 h-10 bg-zinc-50 rounded-2xl flex items-center justify-center text-xl mb-2">✨</div>
              <p className="text-xs font-semibold text-zinc-700">La actividad aparecerá aquí.</p>
              <p className="text-[10px] text-zinc-400 mt-1">Activá tu primer cliente con el QR.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 5).map(tx => (
                <div key={tx.id} className="flex items-center gap-2 py-1">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${tx.type === 'reward' ? 'bg-amber-50' : 'bg-violet-50'}`}>
                    {tx.type === 'reward' ? '🏆' : '⭐'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-zinc-800 truncate">{tx.loyalty_cards?.name}</p>
                    <p className="text-[10px] text-zinc-400">{tx.type === 'reward' ? 'Premio' : 'Sello'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-zinc-100 rounded-2xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">CLIENTES QUE REGRESAN</p>
          <div className="flex flex-col items-center justify-center h-28">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-extrabold${returningClients === 0 ? ' placeholder-glow' : ''}`}
              style={{ background: `${color}18`, color }}>
              {returningClients}
            </div>
            <p className="text-xs text-zinc-400 mt-2">con más de 1 visita</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-100 rounded-2xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">PUSHES RECIENTES</p>
          {pushLogs.length === 0 ? (
            <div className="space-y-3 mb-3">
              <textarea value={notifMsg} onChange={e => setNotifMsg(e.target.value)}
                placeholder="Ej: Esta semana 2x1 en café 🎉" rows={3}
                className="w-full border border-zinc-200 focus:border-violet-400 rounded-xl px-3 py-2 text-xs focus:outline-none resize-none" />
              <button onClick={sendNotif} disabled={notifSending || !notifMsg.trim() || notifSent}
                className="w-full py-2.5 rounded-xl font-bold text-white text-xs disabled:opacity-50 transition-colors"
                style={{ background: notifSent ? '#10B981' : color }}>
                {notifSent ? '✓ Enviado' : notifSending ? 'Enviando...' : 'Enviar tu primer push →'}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {pushLogs.map(log => (
                <div key={log.id} className="py-2 border-b border-zinc-50 last:border-0">
                  <p className="text-xs font-semibold text-zinc-800 truncate">{log.body}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[10px] text-zinc-400">
                      {new Date(log.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })} · {log.sent_to} enviados
                    </p>
                  </div>
                </div>
              ))}
              <div className="pt-2 space-y-2">
                <textarea value={notifMsg} onChange={e => setNotifMsg(e.target.value)}
                  placeholder="Nuevo push..." rows={2}
                  className="w-full border border-zinc-200 focus:border-violet-400 rounded-xl px-3 py-2 text-xs focus:outline-none resize-none" />
                <button onClick={sendNotif} disabled={notifSending || !notifMsg.trim() || notifSent}
                  className="w-full py-2 rounded-xl font-bold text-white text-xs disabled:opacity-50 transition-colors"
                  style={{ background: notifSent ? '#10B981' : color }}>
                  {notifSent ? '✓ Enviado' : notifSending ? 'Enviando...' : 'Enviar push →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gráfico ventas vs costo + histórico */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 bg-white border border-zinc-100 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-sm font-bold text-zinc-900">Ventas registradas vs costo de Calificar</p>
              <p className="text-xs text-zinc-400 mt-0.5">Últimos 30 días · registrá el monto al sellar para ver el ROI</p>
            </div>
          </div>
          {totalSales === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center placeholder-glow rounded-xl">
              <p className="text-xs text-zinc-500 font-semibold mb-1">Registrá el gasto de tus clientes al sellar</p>
              <p className="text-[10px] text-zinc-400">En cada sello manual podés ingresar el monto de la venta</p>
            </div>
          ) : (
            <SalesChart salesByDay={salesByDay} cost={calificarCost} color={color} />
          )}
        </div>

        <div className="bg-white border border-zinc-100 rounded-2xl p-5 flex flex-col justify-center gap-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">HISTÓRICO</p>
          <div className="text-center">
            <p className="text-4xl font-extrabold text-zinc-900">{totalStamps}</p>
            <p className="text-xs text-zinc-400 mt-1">Sellos entregados</p>
          </div>
          <div className="w-full h-px bg-zinc-100" />
          <div className="text-center">
            <p className="text-4xl font-extrabold text-zinc-900">{stats.rewardsTotal}</p>
            <p className="text-xs text-zinc-400 mt-1">Recompensas entregadas</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Modal de planes ──────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$9.99',
    period: 'USD / mes',
    sub: '$0.33 al día · menos que un café',
    desc: 'PARA TU NEGOCIO',
    color: '#7C3AED',
    textColor: '#fff',
    features: ['1 programa de fidelidad con tu logo y colores', 'Notificaciones ilimitadas al celular de tus clientes', 'Cartelito NFC + QR para el mostrador', 'Panel: quién volvió, cuándo y cuántos sellos', 'Exportá tus clientes: nombre y teléfono', 'Soporte en español'],
    pills: ['Tarjetas ilimitadas', 'Notificaciones ilimitadas'],
    cta: 'Activar Starter',
    disabled: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19.99',
    period: 'USD / mes',
    sub: '$0.66 al día · menos que dos cafés',
    desc: 'PARA DESTACAR',
    color: '#7C3AED',
    textColor: '#fff',
    features: ['Todo lo de Starter', 'Hasta 3 programas de fidelidad', 'Campañas de cumpleaños automáticas', 'Formulario de registro personalizable', 'Cupones únicos al completar la tarjeta', 'Zonas de notificación por geolocalización', 'Soporte prioritario'],
    pills: ['Tarjetas ilimitadas', 'Notificaciones ilimitadas'],
    cta: 'Activar Pro',
    disabled: false,
    badge: 'RECOMENDADO',
    highlight: true,
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    price: '$49.99',
    period: 'USD / mes',
    sub: '$1.66 al día · para todas tus sucursales',
    desc: 'SIN LÍMITES',
    color: '#7C3AED',
    textColor: '#fff',
    features: ['Todo lo de Pro', 'Programas ilimitados', 'Sucursales ilimitadas', 'Múltiples usuarios por local', 'Zonas de notificación ilimitadas', 'Exportación detallada con historial', 'API + integración con tu sistema'],
    pills: ['Tarjetas ilimitadas', 'Notificaciones ilimitadas'],
    cta: 'Activar Ultimate',
    disabled: false,
  },
]

function PlansModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="bg-zinc-950 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="relative px-7 pt-6 pb-5 text-center border-b border-zinc-800">
          <button onClick={onClose} className="absolute right-5 top-5 text-zinc-500 hover:text-zinc-300 text-xl leading-none">✕</button>
          <div className="inline-block bg-violet-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            14 DÍAS GRATIS
          </div>
          <h2 className="text-xl font-extrabold text-white">Probá gratis y empezá a fidelizar desde el primer día.</h2>
          <p className="text-zinc-400 text-sm mt-1">Sin tarjeta de crédito. Sin compromiso.</p>
        </div>

        {/* Plans grid */}
        <div className="p-5 grid grid-cols-3 gap-4">
          {PLANS.map(plan => (
            <div key={plan.id} className={`relative rounded-2xl flex flex-col overflow-visible ${plan.highlight ? 'bg-white shadow-xl' : 'bg-zinc-900 border border-zinc-800'}`}>
              {/* Badge arriba del card, no dentro */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap z-10">
                  {plan.badge}
                </div>
              )}
              <div className="p-5 pt-6 flex-1">
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${plan.highlight ? 'text-violet-600' : 'text-zinc-400'}`}>{plan.desc}</p>
                <p className={`text-xl font-extrabold mb-1 ${plan.highlight ? 'text-zinc-900' : 'text-white'}`}>{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`text-3xl font-extrabold ${plan.highlight ? 'text-zinc-900' : 'text-white'}`}>{plan.price}</span>
                  <span className={`text-xs ${plan.highlight ? 'text-zinc-400' : 'text-zinc-500'}`}>{plan.period}</span>
                </div>
                <div className={`text-[10px] px-2.5 py-1 rounded-lg inline-block mb-3 ${plan.highlight ? 'bg-zinc-100 text-zinc-500' : 'bg-zinc-800 text-zinc-400'}`}>
                  {plan.sub}
                </div>
                {/* Pills */}
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
                <button className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all"
                  style={{ background: '#7C3AED' }}>
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="pb-5 text-center">
          <p className="text-xs text-zinc-500">¿Tenés dudas? <a href="mailto:hola@calificar.com.ar" className="text-violet-400 underline">Escribinos</a> y te ayudamos.</p>
        </div>
      </div>
    </div>
  )
}

// ── Vista: TARJETA ───────────────────────────────────────────────────────────
function ViewTarjeta({ program, selectedProgram, onLogoUploaded, accessToken }:
  { program: Program | undefined; selectedProgram: string | null; onLogoUploaded: (url: string) => void; accessToken: string }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [showPlans, setShowPlans] = useState(false)
  const color = program?.color_primary ?? '#7C3AED'
  const joinUrl = `https://calificar.com.ar/fidelizacion/unirse?program=${selectedProgram}`

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError('')
    const form = new FormData()
    form.append('file', file)
    form.append('program_id', selectedProgram ?? '')
    try {
      const res = await fetch('/api/fidelizacion/upload-logo', {
        method: 'POST',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        body: form,
      })
      const data = await res.json()
      if (data.url) onLogoUploaded(data.url)
      else setUploadError(data.error ?? 'Error al subir')
    } catch {
      setUploadError('Error de red')
    }
    setUploading(false)
  }

  if (!program) return <div className="p-4 md:p-8 text-zinc-400 text-sm">No hay programa activo.</div>

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
      {showPlans && <PlansModal onClose={() => setShowPlans(false)} />}

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-zinc-900">Tarjeta</h1>
        <p className="text-zinc-400 text-sm mt-0.5">1 programa activo</p>
      </div>

      {/* Banner trial */}
      <div className="border border-violet-200 bg-violet-50 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">🪪</span>
          <div>
            <p className="text-sm font-semibold text-violet-900">Estás en tu período de prueba gratuita.</p>
            <p className="text-xs text-violet-600 mt-0.5">Activá el plan Pro para desbloquear todas las funciones y seguir usando Calificar sin límites.</p>
          </div>
        </div>
        <button onClick={() => setShowPlans(true)}
          className="flex-shrink-0 text-xs font-bold text-white px-4 py-2 rounded-xl" style={{ background: '#7C3AED' }}>
          → Ver planes
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'PROGRAMAS ACTIVOS', value: '1 / 1' },
          { label: 'WALLETS ACTIVOS', value: '0' },
          { label: 'SELLOS OTORGADOS', value: '0' },
          { label: 'PREMIOS ENTREGADOS', value: '0' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-zinc-100 rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">{s.label}</p>
            <p className="text-xl font-extrabold text-zinc-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Programa card */}
      <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
        {/* Header del programa */}
        <div className="p-5 border-b border-zinc-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Preview mini de la tarjeta */}
              <div className="w-14 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                {program.logo_url
                  ? <img src={program.logo_url} alt="" className="w-10 h-8 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
                  : <span className="text-white font-extrabold text-xs">{program.name.charAt(0)}</span>
                }
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-zinc-900 text-sm">{program.name}</p>
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Recompensas</span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{program.stamps_goal} sellos para una recompensa</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href={joinUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs border border-zinc-200 text-zinc-600 px-3 py-1.5 rounded-xl hover:bg-zinc-50 font-medium flex items-center gap-1.5">
                🔗 Enlace
              </a>
              <a href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(joinUrl)}&color=0F172A&bgcolor=FFFFFF&qzone=1`}
                download="qr-calificar.png" target="_blank" rel="noopener noreferrer"
                className="text-xs border border-zinc-200 text-zinc-600 px-3 py-1.5 rounded-xl hover:bg-zinc-50 font-medium flex items-center gap-1.5">
                ⊞ QR
              </a>
            </div>
          </div>
        </div>

        {/* Logo upload */}
        <div className="p-5 border-b border-zinc-50">
          <p className="text-sm font-semibold text-zinc-800 mb-1">Logo del negocio</p>
          <p className="text-xs text-zinc-400 mb-4">Aparece en la tarjeta digital de tus clientes. PNG o JPG, máx. 2MB.</p>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden bg-zinc-50 flex-shrink-0">
              {program.logo_url
                ? <img src={program.logo_url} alt="" className="w-full h-full object-contain p-2" />
                : <span className="text-3xl">🖼️</span>
              }
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoUpload} />
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="text-sm font-semibold border border-violet-200 text-violet-700 px-4 py-2 rounded-xl hover:bg-violet-50 transition-colors disabled:opacity-50">
                {uploading ? 'Subiendo...' : program.logo_url ? 'Cambiar logo' : 'Subir logo'}
              </button>
              {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
              {program.logo_url && (
                <p className="text-xs text-green-600 mt-1 font-medium">✓ Logo activo</p>
              )}
            </div>
          </div>
        </div>

        {/* Preview tarjeta */}
        <div className="p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">PREVIEW DE LA TARJETA</p>
          <div className="rounded-2xl p-5 text-white max-w-xs" style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs opacity-70 font-medium">Tarjeta de sellos</p>
                <p className="font-extrabold text-lg leading-tight">{program.name.replace('Tarjeta de Sellos — ', '')}</p>
              </div>
              {program.logo_url && (
                <img src={program.logo_url} alt="" className="h-10 w-10 object-contain rounded-xl bg-white/20 p-1" />
              )}
            </div>
            <div className="grid grid-cols-5 gap-1.5 mb-3">
              {Array.from({ length: program.stamps_goal > 10 ? 10 : program.stamps_goal }).map((_, i) => (
                <div key={i} className="w-full aspect-square rounded-full border-2 border-white/40 bg-white/10" />
              ))}
            </div>
            <p className="text-xs opacity-60">Meta: {program.stamps_goal} sellos · {program.reward_description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Vista: CLIENTES ──────────────────────────────────────────────────────────
function ViewClientes({ cards, program, selectedProgram, loading, manualStamp }:
  { cards: Card[]; program: Program | undefined; selectedProgram: string | null; loading: boolean; manualStamp: (id: string, name: string) => void }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'todos' | 'activo' | 'inactivo'>('todos')
  const color = program?.color_primary ?? '#7C3AED'
  const joinUrl = `https://calificar.com.ar/fidelizacion/unirse?program=${selectedProgram}`

  const filtered = cards.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
    if (filter === 'activo') return matchSearch && c.stamps > 0
    if (filter === 'inactivo') return matchSearch && c.stamps === 0
    return matchSearch
  })

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900">Clientes</h1>
          <p className="text-zinc-400 text-sm mt-0.5">
            {cards.length === 0 ? 'Nadie está inscrito en tu programa todavía.' : `${cards.length} clientes registrados.`}
          </p>
        </div>
        <button className="flex items-center gap-2 text-sm font-bold text-white px-4 py-2.5 rounded-xl" style={{ background: '#7C3AED' }}>
          + Agregar un cliente
        </button>
      </div>

      {cards.length === 0 ? (
        /* Empty state con QR */
        <div className="bg-white border border-zinc-100 rounded-2xl p-12 flex flex-col items-center text-center">
          <h2 className="text-xl font-extrabold text-zinc-900 mb-2">Empieza por que te escaneen.</h2>
          <p className="text-zinc-400 text-sm mb-8 max-w-sm">
            Elegí con cuál tarjeta empezás y mostrala en el mostrador. La primera persona que la escanee aparece aquí con su nombre y sus sellos.
          </p>
          <div className="bg-zinc-50 rounded-2xl border border-zinc-100 p-6 flex flex-col items-center gap-4">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(joinUrl)}&color=0F172A&bgcolor=FFFFFF&qzone=1`}
              alt="QR" width={160} height={160} className="rounded-xl" />
            <p className="font-semibold text-zinc-800 text-sm">{program?.name?.replace('Tarjeta de Sellos — ', '') ?? 'Tarjeta de sellos'}</p>
            <div className="flex gap-2">
              <button onClick={() => window.open(joinUrl, '_blank')}
                className="text-xs font-bold bg-zinc-900 text-white px-4 py-2 rounded-xl">Ampliar</button>
              <button onClick={() => navigator.clipboard.writeText(joinUrl)}
                className="text-xs font-medium border border-zinc-200 text-zinc-600 px-4 py-2 rounded-xl hover:bg-zinc-50">Copiar</button>
              <a href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(joinUrl)}&color=0F172A&bgcolor=FFFFFF&qzone=1`}
                download="qr-calificar.png" target="_blank" rel="noopener noreferrer"
                className="text-xs font-medium border border-zinc-200 text-zinc-600 px-4 py-2 rounded-xl hover:bg-zinc-50 flex items-center gap-1">
                🖨️ Imprimir un cartel
              </a>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-4">O agregá a alguien a mano ↑</p>
        </div>
      ) : (
        <>
          {/* Filters + search */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-1 bg-zinc-100 rounded-xl p-1">
              {([['todos', 'Todos'], ['activo', 'Activo'], ['inactivo', 'Inactivo']] as const).map(([id, label]) => (
                <button key={id} onClick={() => setFilter(id)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === id ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}>
                  {label} {id === 'todos' ? cards.length : id === 'activo' ? cards.filter(c => c.stamps > 0).length : cards.filter(c => c.stamps === 0).length}
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2 border border-zinc-200 rounded-xl px-3 py-2 bg-white">
              <span className="text-zinc-400 text-sm">🔍</span>
              <input type="text" placeholder="Buscar por nombre, email o teléfono..." value={search} onChange={e => setSearch(e.target.value)}
                className="text-sm text-zinc-700 placeholder-zinc-400 focus:outline-none w-56" />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">
                <p className="text-sm font-semibold">Sin resultados</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50">
                    {['Cliente', 'Teléfono', 'Sellos', 'Visitas', 'Cumpleaños', 'Acciones'].map(h => (
                      <th key={h} className="text-left px-5 py-3 font-semibold text-zinc-400 text-[10px] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {filtered.map(c => (
                    <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                            style={{ backgroundColor: color }}>{c.name.charAt(0).toUpperCase()}</div>
                          <span className="font-semibold text-zinc-900">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-zinc-500 text-xs">{c.phone}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 bg-zinc-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full" style={{ width: `${Math.min((c.stamps / (program?.stamps_goal ?? 10)) * 100, 100)}%`, backgroundColor: color }} />
                          </div>
                          <span className="text-xs font-bold text-zinc-900">{c.stamps}/{program?.stamps_goal}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-zinc-500 text-xs text-center">{c.total_visits}</td>
                      <td className="px-5 py-4 text-zinc-500 text-xs">
                        {c.birth_date ? new Date(c.birth_date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }) : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/fidelizacion/tarjeta?card=${c.id}&program=${selectedProgram}`} className="text-xs text-violet-600 hover:underline">Ver</Link>
                          <button onClick={() => manualStamp(c.id, c.name)}
                            className="text-xs bg-violet-100 text-violet-700 hover:bg-violet-200 px-2.5 py-1 rounded-lg font-semibold transition-colors">
                            + Sello
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── Vista: PUSH ──────────────────────────────────────────────────────────────
function ViewPush({ notifMsg, setNotifMsg, notifSending, notifSent, sendNotif }:
  { notifMsg: string; setNotifMsg: (v: string) => void; notifSending: boolean; notifSent: boolean; sendNotif: () => void }) {
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto w-full">
      <h1 className="text-2xl font-extrabold text-zinc-900 mb-1">Avisos push</h1>
      <p className="text-zinc-400 text-sm mb-8">Mandá mensajes directos a los clientes que activaron notificaciones.</p>
      <div className="bg-white border border-zinc-100 rounded-2xl p-6">
        <label className="block text-sm font-semibold text-zinc-700 mb-2">Mensaje</label>
        <textarea value={notifMsg} onChange={e => setNotifMsg(e.target.value)}
          placeholder="Ej: Esta semana 2x1 en café. ¡Te esperamos!" rows={4}
          className="w-full border border-zinc-200 focus:border-violet-400 rounded-2xl px-4 py-3 text-sm focus:outline-none resize-none transition-colors" />
        <p className="text-xs text-zinc-400 mt-1 mb-4">{notifMsg.length}/160 caracteres</p>
        <button onClick={sendNotif} disabled={notifSending || !notifMsg.trim() || notifSent}
          className="font-bold px-6 py-3 rounded-2xl text-sm text-white transition-colors disabled:opacity-50"
          style={{ background: notifSent ? '#10B981' : '#7C3AED' }}>
          {notifSent ? '✓ Enviado' : notifSending ? 'Enviando...' : 'Enviar a todos mis clientes'}
        </button>
      </div>
    </div>
  )
}

// ── Vista: PROXIMIDAD ────────────────────────────────────────────────────────
function ViewProximidad({ selectedProgram, isPro, notifMsg, setNotifMsg, notifSending, notifSent, sendNotif, accessToken }: {
  selectedProgram: string | null; isPro: boolean
  notifMsg: string; setNotifMsg: (v: string) => void; accessToken: string
  notifSending: boolean; notifSent: boolean; sendNotif: () => void
}) {
  const [tab, setTab] = useState<'push' | 'proximidad'>('proximidad')
  const [enabled, setEnabled] = useState(false)
  const [message, setMessage] = useState('')
  const [locationLabel, setLocationLabel] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [detecting, setDetecting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!selectedProgram) return
    fetch(`/api/fidelizacion/proximity?program_id=${selectedProgram}`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    })
      .then(r => r.json())
      .then(d => {
        setEnabled(d.proximity_enabled ?? false)
        setMessage(d.proximity_message ?? '')
        setLocationLabel(d.location_label ?? '')
        if (d.location_lat) setLat(String(d.location_lat))
        if (d.location_lng) setLng(String(d.location_lng))
      })
      .catch(() => setLoadError('No se pudo cargar la configuración.'))
  }, [selectedProgram, accessToken])

  function detectLocation() {
    if (!navigator.geolocation) return
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLat(String(pos.coords.latitude))
        setLng(String(pos.coords.longitude))
        setDetecting(false)
      },
      () => setDetecting(false)
    )
  }

  async function save() {
    if (!selectedProgram) return
    setSaving(true)
    await fetch('/api/fidelizacion/proximity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: JSON.stringify({
        program_id: selectedProgram,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        location_label: locationLabel,
        message,
        enabled,
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto w-full">
      <h1 className="text-2xl font-extrabold text-zinc-900 mb-1">Avisos de proximidad</h1>
      <p className="text-zinc-400 text-sm mb-6">Alguien que guardó tu tarjeta pasa cerca de tu negocio y ve tu recordatorio en la pantalla de bloqueo. Se envía solo — tú no enviás nada.</p>

      {/* Tabs Push / Proximidad */}
      <div className="flex gap-1 bg-zinc-100 rounded-xl p-1 w-fit mb-6">
        <button onClick={() => setTab('push')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'push' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}>
          Push
          <span className="block text-[10px] font-normal text-zinc-400">Tú escribís y enviás</span>
        </button>
        <button onClick={() => setTab('proximidad')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'proximidad' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}>
          Proximidad
          <span className="block text-[10px] font-normal text-zinc-400">Se envía solo cuando pasan cerca</span>
        </button>
      </div>

      {tab === 'push' && (
        <div className="bg-white border border-zinc-100 rounded-2xl p-6 space-y-4">
          <div>
            <p className="text-sm font-bold text-zinc-900 mb-0.5">Enviar notificación push</p>
            <p className="text-xs text-zinc-400">Se envía a todos los clientes que activaron notificaciones en su tarjeta.</p>
          </div>
          <textarea
            value={notifMsg}
            onChange={e => setNotifMsg(e.target.value)}
            placeholder="Ej: Esta semana 2x1 en café ☕ Pasate a buscar tu beneficio!"
            rows={4}
            className="w-full border border-zinc-200 focus:border-violet-400 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
          />
          <button
            onClick={sendNotif}
            disabled={notifSending || !notifMsg.trim() || notifSent}
            className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50 transition-all"
            style={{ background: notifSent ? '#10B981' : '#7C3AED' }}>
            {notifSent ? '✓ Enviado a todos los clientes' : notifSending ? 'Enviando...' : 'Enviar push a todos los clientes →'}
          </button>
          {notifSent && (
            <p className="text-xs text-emerald-600 text-center">Los clientes con notificaciones activas lo recibieron al instante.</p>
          )}
        </div>
      )}

      {tab === 'proximidad' && (
        <>
          {!isPro && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
              <span className="text-xl">🔒</span>
              <div>
                <p className="text-sm font-semibold text-amber-800">Función Pro</p>
                <p className="text-xs text-amber-600 mt-0.5">Los avisos de proximidad están disponibles en el plan Pro. Actualizá tu plan para activarlos.</p>
              </div>
            </div>
          )}

          {loadError && <p className="text-red-500 text-xs mb-4">{loadError}</p>}

          {/* Enable toggle */}
          <div className="bg-white border border-zinc-100 rounded-2xl p-5 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-900">Activar avisos de proximidad</p>
                <p className="text-xs text-zinc-400 mt-0.5">Cuando un cliente con tu tarjeta en Google Wallet pase cerca, recibirá el mensaje.</p>
              </div>
              <button
                onClick={() => isPro && setEnabled(e => !e)}
                disabled={!isPro}
                className={`relative w-12 h-6 rounded-full transition-colors ${enabled && isPro ? 'bg-violet-600' : 'bg-zinc-200'} disabled:opacity-50`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${enabled && isPro ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Dónde avisas */}
          <div className="bg-white border border-zinc-100 rounded-2xl p-5 mb-4">
            <p className="text-sm font-semibold text-zinc-900 mb-1">Dónde avisás</p>
            <p className="text-xs text-zinc-400 mb-4">La zona donde el cliente recibe el aviso. Normalmente es tu local.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Nombre del lugar</label>
                <input type="text" value={locationLabel} onChange={e => setLocationLabel(e.target.value)}
                  placeholder="Ej: Cafetería San Martín 234" disabled={!isPro}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400 disabled:bg-zinc-50 disabled:text-zinc-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1">Latitud</label>
                  <input type="text" value={lat} onChange={e => setLat(e.target.value)} placeholder="-54.8019" disabled={!isPro}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-violet-400 disabled:bg-zinc-50 disabled:text-zinc-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1">Longitud</label>
                  <input type="text" value={lng} onChange={e => setLng(e.target.value)} placeholder="-68.3030" disabled={!isPro}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-violet-400 disabled:bg-zinc-50 disabled:text-zinc-400" />
                </div>
              </div>
              <button onClick={detectLocation} disabled={detecting || !isPro}
                className="text-xs font-semibold text-violet-600 hover:text-violet-700 border border-violet-200 px-3 py-1.5 rounded-xl disabled:opacity-50 transition-colors">
                {detecting ? '📍 Detectando...' : '📍 Usar mi ubicación actual'}
              </button>
              {lat && lng && (
                <div className="text-[10px] text-zinc-400 bg-zinc-50 rounded-lg px-3 py-2">
                  Coordenadas: {parseFloat(lat).toFixed(5)}, {parseFloat(lng).toFixed(5)} · Radio: ~150 metros
                </div>
              )}
            </div>
          </div>

          {/* Qué dice */}
          <div className="bg-white border border-zinc-100 rounded-2xl p-5 mb-5">
            <p className="text-sm font-semibold text-zinc-900 mb-1">Qué dice</p>
            <p className="text-xs text-zinc-400 mb-3">El mensaje que aparece en la pantalla de bloqueo de tu cliente.</p>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} disabled={!isPro}
              placeholder="Ej: ¡Pasá a tomar tu café! Te esperamos con tu tarjeta de sellos."
              className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400 resize-none disabled:bg-zinc-50 disabled:text-zinc-400" />
            <p className="text-[10px] text-zinc-400 mt-1">{message.length}/100 caracteres recomendados</p>

            {/* Preview pantalla de bloqueo */}
            {message && (
              <div className="mt-4 bg-zinc-900 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: '#7C3AED' }}>C</div>
                <div>
                  <p className="text-white text-xs font-semibold">Calificar · Tarjeta de sellos</p>
                  <p className="text-zinc-300 text-xs mt-0.5">{message}</p>
                </div>
              </div>
            )}
          </div>

          <button onClick={save} disabled={saving || !isPro}
            className="font-bold px-6 py-3 rounded-2xl text-sm text-white transition-colors disabled:opacity-50"
            style={{ background: saved ? '#10B981' : '#7C3AED' }}>
            {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar configuración'}
          </button>
        </>
      )}
    </div>
  )
}

// ── Vista: CUMPLEAÑOS ────────────────────────────────────────────────────────
type BirthdayCoupon = {
  id: string; coupon_code: string; valid_from: string; valid_until: string
  used_at: string | null; loyalty_cards: { name: string; phone: string }
}
type UpcomingBirthday = { id: string; name: string; birth_date: string }

function ViewCumple({ selectedProgram, cards, isPro }:
  { selectedProgram: string | null; cards: Card[]; isPro: boolean }) {
  const [cfg, setCfg] = useState({
    enabled: false, discount_type: 'percent', discount_value: 20,
    message_day0: '🎂 ¡Feliz cumpleaños, {nombre}! Durante este mes tenés {descuento}% OFF. Tu código exclusivo: {codigo}',
    message_mid: '⏰ {nombre}, todavía tenés tu descuento de cumpleaños activo. Código: {codigo}',
    message_last: '🚨 Últimos días de tu descuento de cumpleaños, {nombre}. Código: {codigo}',
  })
  const [coupons, setCoupons] = useState<BirthdayCoupon[]>([])
  const [upcoming, setUpcoming] = useState<UpcomingBirthday[]>([])
  const [totalWithBday, setTotalWithBday] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [triggering, setTriggering] = useState(false)
  const [triggerMsg, setTriggerMsg] = useState('')

  useEffect(() => {
    if (!selectedProgram) return
    fetch(`/api/fidelizacion/birthday?program_id=${selectedProgram}`)
      .then(r => r.json())
      .then(d => {
        if (d.config) setCfg(c => ({ ...c, ...d.config }))
        setCoupons(d.active_coupons ?? [])
        setUpcoming(d.upcoming_birthdays ?? [])
        setTotalWithBday(d.total_with_birthday ?? 0)
      })
  }, [selectedProgram])

  async function save() {
    setSaving(true)
    await fetch('/api/fidelizacion/birthday', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ program_id: selectedProgram, ...cfg }),
    })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function triggerToday() {
    setTriggering(true)
    const r = await fetch('/api/fidelizacion/birthday', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ program_id: selectedProgram }),
    })
    const d = await r.json()
    setTriggerMsg(d.generated > 0 ? `✓ ${d.generated} código(s) generado(s) y enviados` : 'Sin cumpleaños hoy')
    setTriggering(false)
    setTimeout(() => setTriggerMsg(''), 4000)
  }

  const totalWithBdayPct = cards.length > 0 ? Math.round((totalWithBday / cards.length) * 100) : 0

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-extrabold text-zinc-900 mb-1">Campañas de cumpleaños</h1>
      <p className="text-zinc-400 text-sm mb-6">Felicitá a tus clientes con un código exclusivo válido por 30 días.</p>

      {!isPro && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <span className="text-xl">🔒</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Función Pro</p>
            <p className="text-xs text-amber-600 mt-0.5">Las campañas de cumpleaños están disponibles en el plan Pro.</p>
          </div>
        </div>
      )}

      {/* Cómo funciona */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-5 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">LO QUE PASA DESPUÉS</p>
        <div className="space-y-3">
          {[
            { n: '1', text: 'El día del cumpleaños le llega un push con su código exclusivo.' },
            { n: '2', text: 'Tiene 30 días para usar ese código con el descuento especial.' },
            { n: '3', text: 'A los 15 y 25 días, le mandamos un recordatorio automático.' },
          ].map(s => (
            <div key={s.n} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center flex-shrink-0">{s.n}</span>
              <p className="text-sm text-zinc-600 mt-0.5">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-white border border-zinc-100 rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">CON CUMPLEAÑOS</p>
          <p className="text-2xl font-extrabold text-zinc-900">{totalWithBday}</p>
          <p className="text-xs text-zinc-400">{totalWithBdayPct}% de tus clientes</p>
        </div>
        <div className="bg-white border border-zinc-100 rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">CÓDIGOS ACTIVOS</p>
          <p className="text-2xl font-extrabold text-zinc-900">{coupons.filter(c => !c.used_at).length}</p>
          <p className="text-xs text-zinc-400">en los próximos 30 días</p>
        </div>
        <div className="bg-white border border-zinc-100 rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">PRÓXIMOS CUMPLES</p>
          <p className="text-2xl font-extrabold text-zinc-900">{upcoming.length}</p>
          <p className="text-xs text-zinc-400">en los próximos 30 días</p>
        </div>
      </div>

      {/* Configuración */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-zinc-900">Configuración</p>
          <button onClick={() => isPro && setCfg(c => ({ ...c, enabled: !c.enabled }))} disabled={!isPro}
            className={`relative w-12 h-6 rounded-full transition-colors ${cfg.enabled && isPro ? 'bg-violet-600' : 'bg-zinc-200'} disabled:opacity-50`}>
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${cfg.enabled && isPro ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {/* Descuento */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-zinc-600 mb-2">Descuento de cumpleaños</label>
          <div className="flex items-center gap-3">
            <div className="flex bg-zinc-100 rounded-xl p-1 gap-1">
              {(['percent', 'fixed'] as const).map(t => (
                <button key={t} onClick={() => setCfg(c => ({ ...c, discount_type: t }))} disabled={!isPro}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${cfg.discount_type === t ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}>
                  {t === 'percent' ? '% descuento' : '$ fijo'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 border border-zinc-200 rounded-xl px-3 py-2">
              <input type="number" value={cfg.discount_value} disabled={!isPro}
                onChange={e => setCfg(c => ({ ...c, discount_value: parseInt(e.target.value) || 0 }))}
                className="w-16 text-sm font-bold text-zinc-900 focus:outline-none text-center bg-transparent" />
              <span className="text-zinc-400 text-sm">{cfg.discount_type === 'percent' ? '%' : 'USD'}</span>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        <div className="space-y-3">
          {[
            { key: 'message_day0', label: '🎂 Mensaje del día del cumpleaños', hint: 'Usa {nombre}, {codigo}, {descuento}' },
            { key: 'message_mid',  label: '⏰ Recordatorio día 15',            hint: 'Recordatorio a mitad del mes' },
            { key: 'message_last', label: '🚨 Último aviso día 25',            hint: 'Urgencia antes de que expire' },
          ].map(m => (
            <div key={m.key}>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">{m.label}</label>
              <textarea
                value={cfg[m.key as keyof typeof cfg] as string}
                onChange={e => setCfg(c => ({ ...c, [m.key]: e.target.value }))}
                disabled={!isPro} rows={2}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-400 resize-none disabled:bg-zinc-50 disabled:text-zinc-400"
              />
              <p className="text-[10px] text-zinc-400 mt-0.5">{m.hint}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <button onClick={save} disabled={saving || !isPro}
          className="font-bold px-6 py-3 rounded-2xl text-sm text-white transition-colors disabled:opacity-50"
          style={{ background: saved ? '#10B981' : '#7C3AED' }}>
          {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar campaña'}
        </button>
        <button onClick={triggerToday} disabled={triggering || !isPro}
          className="text-xs font-semibold border border-zinc-200 text-zinc-600 px-4 py-3 rounded-2xl hover:bg-zinc-50 disabled:opacity-50 transition-colors">
          {triggering ? 'Procesando...' : '▷ Ejecutar hoy ahora'}
        </button>
        {triggerMsg && <p className="text-xs text-emerald-600 font-semibold">{triggerMsg}</p>}
      </div>

      {/* Próximos cumpleaños */}
      {upcoming.length > 0 && (
        <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden mb-4">
          <div className="px-5 py-3 border-b border-zinc-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">PRÓXIMOS CUMPLEAÑOS (30 días)</p>
          </div>
          <div className="divide-y divide-zinc-50">
            {upcoming.map(c => {
              const bd = new Date(c.birth_date)
              const today = new Date()
              const thisYear = new Date(today.getFullYear(), bd.getMonth(), bd.getDate())
              const diff = Math.floor((thisYear.getTime() - today.getTime()) / 86400000)
              return (
                <div key={c.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-xs">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-sm font-semibold text-zinc-900">{c.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-zinc-900">
                      {diff === 0 ? '🎂 Hoy' : diff === 1 ? 'Mañana' : `En ${diff} días`}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      {bd.toLocaleDateString('es-AR', { day: '2-digit', month: 'long' })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Códigos activos */}
      {coupons.length > 0 && (
        <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">CÓDIGOS ACTIVOS</p>
          </div>
          <div className="divide-y divide-zinc-50">
            {coupons.map(c => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{c.loyalty_cards?.name}</p>
                  <p className="text-xs font-mono text-violet-600 mt-0.5">{c.coupon_code}</p>
                </div>
                <div className="text-right">
                  {c.used_at
                    ? <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">USADO</span>
                    : <span className="text-[10px] bg-violet-100 text-violet-700 font-bold px-2 py-0.5 rounded-full">ACTIVO</span>
                  }
                  <p className="text-[10px] text-zinc-400 mt-1">Vence {new Date(c.valid_until).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Vista: IMPRIMIR Y COMPARTIR ──────────────────────────────────────────────
const CALIFICAR_WA = '5491123867934'

const DIGITAL_TEMPLATES = [
  { id: 'story-anuncio',    label: 'IG Story · Anuncio',       size: '1080 × 1920 · 9:16',  tag: 'Stories', w: 1080, h: 1920 },
  { id: 'story-activacion', label: 'IG Story · Activación',    size: '1080 × 1920 · 9:16',  tag: 'Stories', w: 1080, h: 1920 },
  { id: 'whatsapp',         label: 'WhatsApp Status',          size: '1080 × 1920 · casual', tag: 'Feed',    w: 1080, h: 1920 },
  { id: 'post-feed',        label: 'Post IG / FB · 4:5',       size: '1080 × 1350 · 4:5',   tag: 'Feed',    w: 1080, h: 1350 },
  { id: 'post-twitter',     label: 'Post X / Twitter',         size: '1200 × 675 · 16:9',   tag: 'Feed',    w: 1200, h: 675  },
  { id: 'banner-linkedin',  label: 'Banner LinkedIn',          size: '1584 × 396 · 4:1',    tag: 'Banners', w: 1584, h: 396  },
]

const PHYSICAL_TEMPLATES = [
  { id: 'sticker',    label: 'Sticker circular',       size: 'Ø 90 mm · vinilo',         price: '$3.500',  desc: 'Ideal para el mostrador o la vidriera.' },
  { id: 'tabletent',  label: 'Table tent',             size: '180 × 270 mm · plegable',  price: '$4.900',  desc: 'Se para solo sobre la mesa o barra.' },
  { id: 'a4-anuncio', label: 'A4 Portrait · Anuncio',  size: '210 × 297 mm · papel',     price: '$2.500',  desc: 'Para enmarcar o pegar en el local.' },
  { id: 'mini',       label: 'Mini insert para tickets', size: '80 × 120 mm · papel mate', price: '$1.800', desc: 'Se incluye en cada ticket o bolsa.' },
]

type ImprimirProps = { program: Program | undefined; selectedProgram: string | null }

function ViewImprimir({ program, selectedProgram }: ImprimirProps) {
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [activeTag, setActiveTag] = useState<string>('Todos')
  const [downloading, setDownloading] = useState<string | null>(null)
  const [previewTpl, setPreviewTpl] = useState<typeof DIGITAL_TEMPLATES[0] | null>(null)
  const color = program?.color_primary ?? '#7C3AED'
  const bizName = (program as any)?.businesses?.name ?? program?.name ?? 'Tu negocio'
  const scanUrl = selectedProgram
    ? `https://calificar.com.ar/s/${selectedProgram}`
    : 'https://calificar.com.ar'

  useEffect(() => {
    import('qrcode').then(QRCode => {
      QRCode.toDataURL(scanUrl, { width: 400, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
        .then(url => setQrUrl(url))
    })
  }, [scanUrl])

  function hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return { r, g, b }
  }

  function lighten(hex: string, amount = 40) {
    const { r, g, b } = hexToRgb(hex)
    return `rgb(${Math.min(255, r + amount)},${Math.min(255, g + amount)},${Math.min(255, b + amount)})`
  }

  function isDark(hex: string) {
    const { r, g, b } = hexToRgb(hex)
    return (r * 299 + g * 587 + b * 114) / 1000 < 128
  }

  function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  async function drawQR(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    if (!qrUrl) return
    const pad = size * 0.08
    const rr = size * 0.06
    ctx.fillStyle = '#ffffff'
    drawRoundRect(ctx, x - pad, y - pad, size + pad * 2, size + pad * 2, rr)
    ctx.fill()
    const img = new Image()
    await new Promise<void>(res => { img.onload = () => res(); img.src = qrUrl! })
    ctx.drawImage(img, x, y, size, size)
  }

  async function drawCanvas(
    ctx: CanvasRenderingContext2D,
    cw: number, ch: number,
    tpl: typeof DIGITAL_TEMPLATES[0],
    logoImg: HTMLImageElement | null
  ) {
    const dark = isDark(color)
    const textColor = dark ? '#ffffff' : '#1a1a1a'
    const bgColor = dark ? color : '#f5f0eb'
    const accentColor = dark ? '#ffffff' : color
    const ratio = ch / cw
    const isStory = ratio > 1.5          // 9:16 → 1080×1920
    const isFeed45 = ratio > 0.9 && ratio <= 1.5  // 4:5 → 1080×1350
    const isHoriz = ratio < 0.9          // 16:9 → 1200×675, 4:1 → 1584×396

    // ── Background ───────────────────────────────────────────────────────────
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, cw, ch)

    // Deco circle
    ctx.beginPath()
    ctx.arc(cw * 0.88, ch * (isHoriz ? -0.25 : -0.03), cw * (isHoriz ? 0.55 : 0.42), 0, Math.PI * 2)
    ctx.fillStyle = dark ? lighten(color, 25) : lighten(color, 165)
    ctx.fill()

    // ── STORY / WHATSAPP (9:16) ───────────────────────────────────────────────
    if (isStory) {
      const fs = cw * 0.1
      const qrSize = cw * 0.5
      const qrX = (cw - qrSize) / 2
      const qrY = ch * 0.42

      // Headline
      ctx.textAlign = 'center'
      ctx.font = `bold ${fs}px system-ui`
      const isActivacion = tpl.id === 'story-activacion' || tpl.id === 'whatsapp'
      const lines = isActivacion
        ? [{ t: 'Escanealo.', c: accentColor }, { t: 'Guardalo.', c: accentColor }, { t: 'Empieza.', c: textColor }]
        : [{ t: 'Tu pase digital,', c: textColor }, { t: 'guardalo en', c: accentColor }, { t: 'tu Wallet.', c: accentColor }]
      lines.forEach((l, i) => {
        ctx.fillStyle = l.c
        ctx.fillText(l.t, cw / 2, ch * 0.13 + i * fs * 1.25)
      })

      // Biz name strip
      ctx.fillStyle = dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.45)'
      ctx.font = `600 ${cw * 0.045}px system-ui`
      ctx.fillText(bizName, cw / 2, qrY - cw * 0.06)

      await drawQR(ctx, qrX, qrY, qrSize)

      // Sub-label below QR
      const pad = qrSize * 0.08
      ctx.fillStyle = dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.32)'
      ctx.font = `${cw * 0.036}px system-ui`
      ctx.fillText('+ ESCANEA AQUÍ', cw / 2, qrY + qrSize + pad + cw * 0.06)
      ctx.fillText('Guardala en tu Wallet', cw / 2, qrY + qrSize + pad + cw * 0.11)
    }

    // ── FEED 4:5 (1080×1350) ─────────────────────────────────────────────────
    if (isFeed45) {
      const qrSize = cw * 0.44
      const qrX = (cw - qrSize) / 2
      const qrY = ch * 0.40
      const maxW = cw * 0.82   // safe text width limit

      const fs = cw * 0.088   // ~95px @ 1080 — each line fits within maxW
      ctx.textAlign = 'center'
      ctx.font = `bold ${fs}px system-ui`

      ctx.fillStyle = textColor
      ctx.fillText('Tu pase digital,', cw / 2, ch * 0.10, maxW)
      ctx.fillStyle = accentColor
      ctx.fillText('guardalo en', cw / 2, ch * 0.10 + fs * 1.3, maxW)
      ctx.fillText('tu Wallet.', cw / 2, ch * 0.10 + fs * 2.6, maxW)

      // Biz name between headline and QR
      ctx.fillStyle = dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.45)'
      ctx.font = `600 ${cw * 0.046}px system-ui`
      ctx.fillText(bizName, cw / 2, qrY - cw * 0.07, maxW)

      await drawQR(ctx, qrX, qrY, qrSize)

      // Sub-label below QR
      const pad = qrSize * 0.08
      ctx.fillStyle = dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.32)'
      ctx.font = `${cw * 0.036}px system-ui`
      ctx.fillText('+ ESCANEA AQUÍ · Guardala en tu Wallet', cw / 2, qrY + qrSize + pad + cw * 0.065, maxW)
    }

    // ── HORIZONTAL (16:9 Twitter, 4:1 LinkedIn) ───────────────────────────────
    if (isHoriz) {
      const isBanner = ratio < 0.35   // 4:1
      // QR on the right — leave 8% margin from right edge
      const qrSize = ch * (isBanner ? 0.52 : 0.66)
      const qrX = cw - qrSize - cw * 0.04
      const qrY = (ch - qrSize) / 2

      await drawQR(ctx, qrX, qrY, qrSize)

      // Text on the left — column from 0 to qrX-gap, centered at colCX
      const colRight = qrX - cw * 0.04
      const colCX = colRight / 2
      const colW = colRight * 0.88   // usable text width
      ctx.textAlign = 'center'

      if (isBanner) {
        // 4:1 — one short headline line + biz name
        const fs = ch * 0.27
        ctx.font = `bold ${fs}px system-ui`
        ctx.fillStyle = textColor
        ctx.fillText('Tu pase digital.', colCX, ch * 0.48, colW)
        ctx.fillStyle = dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.38)'
        ctx.font = `${ch * 0.17}px system-ui`
        ctx.fillText(bizName, colCX, ch * 0.78, colW)
      } else {
        // 16:9 — three short lines so nothing overflows
        const fs = ch * 0.13
        ctx.font = `bold ${fs}px system-ui`
        ctx.fillStyle = textColor
        ctx.fillText('Tu pase digital,', colCX, ch * 0.30, colW)
        ctx.fillStyle = accentColor
        ctx.fillText('guardalo en', colCX, ch * 0.30 + fs * 1.35, colW)
        ctx.fillText('tu Wallet.', colCX, ch * 0.30 + fs * 2.70, colW)
        ctx.fillStyle = dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.38)'
        ctx.font = `${ch * 0.075}px system-ui`
        ctx.fillText(bizName, colCX, ch * 0.84, colW)
      }
    }

    // ── Footer ────────────────────────────────────────────────────────────────
    const unit = Math.min(cw, ch)
    ctx.textAlign = 'center'
    ctx.fillStyle = dark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.2)'
    ctx.font = `${unit * 0.022}px system-ui`
    ctx.fillText('powered by calificar.com.ar', cw / 2, ch - unit * 0.025)
  }

  async function renderTemplate(tpl: typeof DIGITAL_TEMPLATES[0]): Promise<string> {
    const canvas = document.createElement('canvas')
    canvas.width = tpl.w; canvas.height = tpl.h
    const ctx = canvas.getContext('2d')!
    let logoImg: HTMLImageElement | null = null
    if (program?.logo_url) {
      logoImg = new Image()
      logoImg.crossOrigin = 'anonymous'
      await new Promise<void>(res => { logoImg!.onload = () => res(); logoImg!.onerror = () => res(); logoImg!.src = program!.logo_url! })
    }
    await drawCanvas(ctx, tpl.w, tpl.h, tpl, logoImg)
    return canvas.toDataURL('image/png')
  }

  async function download(tpl: typeof DIGITAL_TEMPLATES[0]) {
    if (!qrUrl) return
    setDownloading(tpl.id)
    try {
      const dataUrl = await renderTemplate(tpl)
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `calificar-${bizName.toLowerCase().replace(/\s+/g, '-')}-${tpl.id}.png`
      a.click()
    } finally {
      setDownloading(null)
    }
  }

  function waLink(item: typeof PHYSICAL_TEMPLATES[0]) {
    const msg = encodeURIComponent(`Hola! Quiero pedir un *${item.label}* (${item.size}) para mi negocio *${bizName}* en Calificar. Precio: ${item.price}`)
    return `https://wa.me/${CALIFICAR_WA}?text=${msg}`
  }

  const tags = ['Todos', ...Array.from(new Set(DIGITAL_TEMPLATES.map(t => t.tag)))]
  const filtered = activeTag === 'Todos' ? DIGITAL_TEMPLATES : DIGITAL_TEMPLATES.filter(t => t.tag === activeTag)

  // Mini canvas preview — same drawCanvas, scaled down
  function TemplatePreview({ tpl }: { tpl: typeof DIGITAL_TEMPLATES[0] }) {
    const ref = useRef<HTMLCanvasElement>(null)
    useEffect(() => {
      if (!ref.current || !qrUrl) return
      const canvas = ref.current
      const ctx = canvas.getContext('2d')!
      // Scale context to preview size
      const sx = canvas.width / tpl.w
      const sy = canvas.height / tpl.h
      ctx.setTransform(sx, 0, 0, sy, 0, 0)
      // Load logo then draw
      const doRender = (logoImg: HTMLImageElement | null) =>
        drawCanvas(ctx, tpl.w, tpl.h, tpl, logoImg)
      if (program?.logo_url) {
        const logoImg = new Image()
        logoImg.crossOrigin = 'anonymous'
        logoImg.onload = () => doRender(logoImg)
        logoImg.onerror = () => doRender(null)
        logoImg.src = program.logo_url
      } else {
        doRender(null)
      }
    }, [qrUrl, tpl])
    const previewW = 130
    const previewH = Math.round(previewW * tpl.h / tpl.w)
    return <canvas ref={ref} width={previewW} height={previewH}
      className="rounded-xl block" style={{ maxHeight: 185, width: 'auto' }} />
  }

  // Modal de preview a tamaño grande
  function PreviewModal({ tpl, onClose }: { tpl: typeof DIGITAL_TEMPLATES[0]; onClose: () => void }) {
    const ref = useRef<HTMLCanvasElement>(null)
    useEffect(() => {
      if (!ref.current || !qrUrl) return
      const canvas = ref.current
      const ctx = canvas.getContext('2d')!
      const sx = canvas.width / tpl.w
      const sy = canvas.height / tpl.h
      ctx.setTransform(sx, 0, 0, sy, 0, 0)
      const doRender = (logoImg: HTMLImageElement | null) => drawCanvas(ctx, tpl.w, tpl.h, tpl, logoImg)
      if (program?.logo_url) {
        const logoImg = new Image(); logoImg.crossOrigin = 'anonymous'
        logoImg.onload = () => doRender(logoImg)
        logoImg.onerror = () => doRender(null)
        logoImg.src = program.logo_url
      } else { doRender(null) }
    }, [tpl])
    // Fit dentro de la pantalla: max 80vh
    const maxH = Math.min(700, Math.round(window.innerHeight * 0.78))
    const previewH = maxH
    const previewW = Math.round(previewH * tpl.w / tpl.h)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}>
        <div className="flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
          <canvas ref={ref} width={previewW} height={previewH}
            className="rounded-2xl shadow-2xl block"
            style={{ maxWidth: '90vw', maxHeight: '78vh', width: 'auto', height: 'auto' }} />
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-white font-bold text-sm">{tpl.label}</p>
              <p className="text-zinc-400 text-xs">{tpl.size} · PNG</p>
            </div>
            <button onClick={() => { download(tpl); onClose() }}
              disabled={!qrUrl || downloading === tpl.id}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: color }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Descargar
            </button>
            <button onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 border border-zinc-600 hover:border-zinc-400 transition-colors">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
      <h1 className="text-2xl font-extrabold text-zinc-900 mb-1">Compartí tu tarjeta</h1>
      <p className="text-zinc-400 text-sm mb-6">Todos los formatos con tu QR y colores de marca, listos para usar.</p>

      {/* Digital */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mr-2">DESCARGA GRATIS</p>
          {tags.map(t => (
            <button key={t} onClick={() => setActiveTag(t)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${activeTag === t ? 'text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
              style={activeTag === t ? { background: color } : {}}>
              {t}
            </button>
          ))}
        </div>

        {!qrUrl && (
          <div className="flex items-center gap-2 text-zinc-400 text-sm py-8">
            <div className="w-4 h-4 border-2 border-zinc-300 border-t-violet-500 rounded-full animate-spin" />
            Generando QR...
          </div>
        )}

        {previewTpl && <PreviewModal tpl={previewTpl} onClose={() => setPreviewTpl(null)} />}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map(tpl => (
            <div key={tpl.id} className="bg-white border border-zinc-100 rounded-2xl overflow-hidden flex flex-col group">
              <button onClick={() => qrUrl && setPreviewTpl(tpl)}
                className="flex items-center justify-center bg-zinc-50 py-5 px-4 min-h-[160px] cursor-pointer relative transition-all hover:bg-zinc-100 w-full">
                {qrUrl ? <TemplatePreview tpl={tpl} /> : <div className="w-20 h-28 bg-zinc-100 rounded-xl animate-pulse" />}
                {qrUrl && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(0,0,0,0.25)' }}>
                    <div className="bg-white rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-zinc-800 shadow-lg">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#18181b" strokeWidth="1.2"/><circle cx="6" cy="6" r="2" fill="#18181b"/></svg>
                      Vista previa
                    </div>
                  </div>
                )}
              </button>
              <div className="p-3 flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-zinc-900">{tpl.label}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{tpl.size} · PNG</p>
                </div>
                <button onClick={() => download(tpl)} disabled={!qrUrl || downloading === tpl.id}
                  className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-40">
                  {downloading === tpl.id
                    ? <div className="w-3 h-3 border-2 border-zinc-400 border-t-zinc-800 rounded-full animate-spin" />
                    : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Physical */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">MATERIALES FÍSICOS · PEDIDO POR WHATSAPP</p>
        <div className="grid grid-cols-2 gap-4">
          {PHYSICAL_TEMPLATES.map(item => (
            <div key={item.id} className="bg-white border border-zinc-100 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-zinc-900">{item.label}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{item.size}</p>
                </div>
                <span className="text-sm font-extrabold text-zinc-900 flex-shrink-0">{item.price}</span>
              </div>
              <p className="text-xs text-zinc-500">{item.desc}</p>
              <a href={waLink(item)} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: '#25D366' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.554 4.103 1.523 5.824L.057 23.5l5.805-1.522A11.951 11.951 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.871 9.871 0 01-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374A9.861 9.861 0 012.118 12C2.118 6.985 6.985 2.118 12 2.118S21.882 6.985 21.882 12 17.015 21.882 12 21.882z"/></svg>
                Solicitar por WhatsApp
              </a>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-zinc-400 mt-3 text-center">Precios sin envío · Te contactamos para confirmar el pedido</p>
      </div>
    </div>
  )
}

// ── Vista: PERFIL DEL NEGOCIO ────────────────────────────────────────────────
function ViewPerfil({ program, selectedProgram, businessName, onSaved }: {
  program: Program | undefined; selectedProgram: string | null; businessName: string; onSaved: (name: string) => void
}) {
  const [name, setName] = useState(businessName)
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const color = program?.color_primary ?? '#7C3AED'

  async function save() {
    if (!selectedProgram) return
    setSaving(true)
    await fetch('/api/fidelizacion/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ program_id: selectedProgram, business_name: name }),
    }).catch(() => {})
    setSaving(false); setSaved(true)
    onSaved(name)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto w-full">
      <h1 className="text-2xl font-extrabold text-zinc-900 mb-1">Perfil del negocio</h1>
      <p className="text-zinc-400 text-sm mb-6">Así te ven tus clientes en su wallet y en la app.</p>

      {/* Identidad */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-6 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">IDENTIDAD</p>
        <div className="flex items-start gap-6">
          <div className="flex-1 space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1.5">Nombre del negocio</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400"
                placeholder="Tu negocio" />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1.5">Teléfono de contacto</label>
              <input value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400"
                placeholder="+54 11 0000-0000" type="tel" />
            </div>
          </div>
          {/* Mini tarjeta preview */}
          <div className="flex-shrink-0 w-40">
            <p className="text-[10px] text-zinc-400 mb-2 text-center">ASÍ LA VEN TUS CLIENTES</p>
            <div className="rounded-2xl overflow-hidden border border-zinc-100 shadow-sm" style={{ background: color }}>
              <div className="bg-white px-2 py-1.5 flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                  style={{ background: color }}>
                  {(name || businessName).charAt(0).toUpperCase()}
                </div>
                <p className="text-[9px] font-semibold text-zinc-800 truncate">{name || businessName}</p>
              </div>
              <div className="px-2 py-2">
                <div className="flex flex-wrap gap-1 mb-2">
                  {Array.from({ length: program?.stamps_goal ?? 8 }).map((_, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border-2 border-white border-opacity-60 flex items-center justify-center">
                      {i < 3 && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-lg p-1.5 text-center">
                  <p className="text-[7px] text-zinc-400">powered by calificar.com.ar</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ubicación */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-6 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">UBICACIÓN</p>
        <p className="text-xs text-zinc-400 mb-3">Define dónde estás para aparecer en el mapa y en los avisos de proximidad.</p>
        <input value={address} onChange={e => setAddress(e.target.value)}
          className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400"
          placeholder="Ej: Encina 2818, Ushuaia, Tierra del Fuego" />
      </div>

      {/* Personalización */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-6 mb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">PERSONALIZACIÓN</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900">Tarjeta de sellos</p>
            <p className="text-xs text-zinc-400 mt-0.5">Logo, colores y diseño de la tarjeta digital.</p>
          </div>
          <button className="text-xs font-bold px-4 py-2 rounded-xl text-white flex-shrink-0" style={{ background: color }}>
            Personalizar →
          </button>
        </div>
      </div>

      <button onClick={save} disabled={saving}
        className="w-full py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-50 transition-all"
        style={{ background: saved ? '#10B981' : color }}>
        {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  )
}

// ── Vista: PLAN ───────────────────────────────────────────────────────────────
function ViewPlan({ onNav }: { onNav: (id: string) => void }) {
  const PLANS = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$9.99',
      period: '/mes',
      desc: 'Para empezar a fidelizar clientes con sellos digitales.',
      current: true,
      color: '#7C3AED',
      features: [
        '1 programa de sellos',
        'Clientes ilimitados',
        'Tarjeta digital en Google Wallet / Apple Wallet',
        'QR de acceso',
        'Panel de gestión',
        'Avisos push',
        'Campañas de cumpleaños',
        'Soporte por email',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$19.99',
      period: '/mes',
      desc: 'Para negocios que quieren más control y automatización.',
      current: false,
      color: '#059669',
      features: [
        'Todo lo de Starter',
        'Hasta 3 programas de sellos',
        'Avisos de proximidad (geofencing)',
        'Estadísticas avanzadas de clientes',
        'Templates de marketing incluidos',
        'Soporte prioritario',
      ],
    },
  ]

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-extrabold text-zinc-900 mb-1">Tu plan</h1>
      <p className="text-zinc-400 text-sm mb-6">Estás en el período de prueba gratuita. Tu plan actual es Starter.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {PLANS.map(plan => (
          <div key={plan.id} className={`bg-white border rounded-2xl p-6 flex flex-col relative ${plan.current ? 'border-violet-300' : 'border-zinc-100'}`}>
            {plan.current && (
              <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: plan.color }}>
                PLAN ACTUAL
              </span>
            )}
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: plan.color }}>{plan.name}</p>
              <div className="flex items-baseline gap-0.5">
                <span className="text-3xl font-extrabold text-zinc-900">{plan.price}</span>
                <span className="text-sm text-zinc-400">{plan.period}</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">{plan.desc}</p>
            </div>
            <div className="flex-1 space-y-2 mb-5">
              {plan.features.map(f => (
                <div key={f} className="flex items-start gap-2">
                  <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: plan.color }}>✓</span>
                  <p className="text-xs text-zinc-600">{f}</p>
                </div>
              ))}
            </div>
            {!plan.current && (
              <button className="w-full py-2.5 rounded-xl font-bold text-white text-sm" style={{ background: plan.color }}>
                Pasarme a {plan.name}
              </button>
            )}
            {plan.current && (
              <button className="w-full py-2.5 rounded-xl font-semibold text-sm border border-zinc-200 text-zinc-500" disabled>
                Plan activo
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Facturación */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-5 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">FACTURACIÓN</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900">Período de prueba gratuita</p>
            <p className="text-xs text-zinc-400 mt-0.5">Sin cargo hasta que elijas un plan.</p>
          </div>
          <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">ACTIVO</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-100 rounded-2xl p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">¿TENÉS DUDAS?</p>
        <p className="text-sm text-zinc-600 mb-3">Hablá con nosotros por WhatsApp y te ayudamos a elegir el plan que mejor se adapta a tu negocio.</p>
        <a href="https://wa.me/5491123867934?text=Hola!%20Tengo%20dudas%20sobre%20los%20planes%20de%20Calificar."
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: '#25D366' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.554 4.103 1.523 5.824L.057 23.5l5.805-1.522A11.951 11.951 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.871 9.871 0 01-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374A9.861 9.861 0 012.118 12C2.118 6.985 6.985 2.118 12 2.118S21.882 6.985 21.882 12 17.015 21.882 12 21.882z"/></svg>
          Hablar por WhatsApp
        </a>
      </div>
    </div>
  )
}

// ── Vista: AYUDA ─────────────────────────────────────────────────────────────
function ViewAyuda({ onNav }: { onNav: (id: string) => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const faqs = [
    { q: '¿Cómo se une un cliente al programa?', a: 'El cliente escanea el QR de tu local (lo encontrás en la sección "Hoy") o hace click en el enlace que le compartís. Automáticamente se crea su tarjeta de sellos digital.' },
    { q: '¿Cómo sello manualmente a un cliente?', a: 'Entrá a "Clientes", buscá al cliente por nombre o teléfono, y hacé click en "+ Sello". También podés usar el botón "Escanear un cliente" que abre la cámara para leer el QR de la tarjeta del cliente.' },
    { q: '¿Qué es Google Wallet / Apple Wallet?', a: 'Son las billeteras digitales de Android e iOS. Tus clientes pueden guardar ahí la tarjeta de sellos y la ven en la pantalla de bloqueo, junto con sus tarjetas bancarias.' },
    { q: '¿Cómo funciona la notificación push?', a: 'Los clientes que activaron las notificaciones en su tarjeta reciben el mensaje directamente en su teléfono, aunque no estén en la app. Desde "Avisos push" podés escribir y enviar el mensaje a todos.' },
    { q: '¿Puedo cambiar el diseño de la tarjeta?', a: 'Sí. En "Tarjeta" podés cambiar el color principal, subir tu logo, y personalizar el texto de bienvenida y la recompensa.' },
    { q: '¿Qué pasa cuando un cliente completa la tarjeta?', a: 'El sistema le muestra automáticamente el premio en su tarjeta. Vos lo ves en el panel de clientes. Podés marcar el premio como entregado desde ahí.' },
    { q: '¿Los datos de mis clientes son privados?', a: 'Sí. Los datos (nombre, teléfono) son solo tuyo. Calificar no los comparte ni los usa para publicidad.' },
    { q: '¿Cómo cancelo si no quiero seguir?', a: 'Escribinos por WhatsApp o por email a hola@calificar.com.ar y lo cancelamos al instante, sin preguntas.' },
  ]

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto w-full">
      <h1 className="text-2xl font-extrabold text-zinc-900 mb-1">Ayuda</h1>
      <p className="text-zinc-400 text-sm mb-6">Respuestas a las preguntas más frecuentes sobre Calificar.</p>

      {/* Contacto rápido */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <a href="https://wa.me/5491123867934?text=Hola!%20Necesito%20ayuda%20con%20Calificar."
          target="_blank" rel="noopener noreferrer"
          className="bg-white border border-zinc-100 rounded-2xl p-4 flex items-center gap-3 hover:border-green-200 transition-colors group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#25D366' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.554 4.103 1.523 5.824L.057 23.5l5.805-1.522A11.951 11.951 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.871 9.871 0 01-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374A9.861 9.861 0 012.118 12C2.118 6.985 6.985 2.118 12 2.118S21.882 6.985 21.882 12 17.015 21.882 12 21.882z"/></svg>
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900 group-hover:text-green-700 transition-colors">WhatsApp</p>
            <p className="text-xs text-zinc-400">Respuesta en minutos</p>
          </div>
        </a>
        <a href="mailto:hola@calificar.com.ar"
          className="bg-white border border-zinc-100 rounded-2xl p-4 flex items-center gap-3 hover:border-violet-200 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0 text-lg">✉️</div>
          <div>
            <p className="text-sm font-bold text-zinc-900 group-hover:text-violet-700 transition-colors">Email</p>
            <p className="text-xs text-zinc-400">hola@calificar.com.ar</p>
          </div>
        </a>
      </div>

      {/* Guía rápida */}
      <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-zinc-50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">GUÍA RÁPIDA</p>
        </div>
        {[
          { n: '1', t: 'Personalizá tu tarjeta', d: 'Subí tu logo y elegí el color en "Tarjeta"', nav: 'tarjeta' },
          { n: '2', t: 'Compartí el QR', d: 'Mostralo en tu mostrador o compartilo por WhatsApp', nav: 'hoy' },
          { n: '3', t: 'Sellá a tus clientes', d: 'Manualmente desde "Clientes" o escaneando su tarjeta', nav: 'clientes' },
          { n: '4', t: 'Enviá avisos push', d: 'Comunicá ofertas a todos tus clientes con un click', nav: 'push' },
        ].map(step => (
          <button key={step.n} onClick={() => onNav(step.nav)}
            className="w-full flex items-center gap-4 px-5 py-4 border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors text-left">
            <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 text-xs font-extrabold flex items-center justify-center flex-shrink-0">
              {step.n}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900">{step.t}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{step.d}</p>
            </div>
            <span className="text-zinc-300 text-sm">›</span>
          </button>
        ))}
      </div>

      {/* FAQ */}
      <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">PREGUNTAS FRECUENTES</p>
        </div>
        {faqs.map((faq, i) => (
          <div key={i} className="border-b border-zinc-50 last:border-0">
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-50 transition-colors">
              <p className="text-sm font-semibold text-zinc-900 pr-4">{faq.q}</p>
              <span className="text-zinc-400 text-sm flex-shrink-0">{openFaq === i ? '▲' : '▼'}</span>
            </button>
            {openFaq === i && (
              <div className="px-5 pb-4">
                <p className="text-sm text-zinc-500 leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function NegocioDashboard() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState({ total: 0, stampsToday: 0, rewardsTotal: 0 })
  const [loading, setLoading] = useState(true)
  const [notifMsg, setNotifMsg] = useState('')
  const [notifSending, setNotifSending] = useState(false)
  const [notifSent, setNotifSent] = useState(false)
  const [activeNav, setActiveNav] = useState('hoy')
  const [showDiscount, setShowDiscount] = useState(false)
  const [businessName, setBusinessName] = useState('Mi negocio')
  const [userEmail, setUserEmail] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [todayBdayCount, setTodayBdayCount] = useState(0)
  const [pushLogs, setPushLogs] = useState<{ id: string; title: string; body: string; sent_to: number; created_at: string }[]>([])
  const [salesByDay, setSalesByDay] = useState<Record<string, number>>({})
  const [totalSales, setTotalSales] = useState(0)
  const [stampModal, setStampModal] = useState<{ cardId: string; name: string } | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

  useEffect(() => {
    const seen = localStorage.getItem('cal_discount_seen')
    if (!seen) setTimeout(() => setShowDiscount(true), 1200)

    // Obtener token para requests autenticados
    supabaseClient.auth.getSession().then(({ data }) => {
      if (data.session?.access_token) setAccessToken(data.session.access_token)
    })

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
        const bd = new Date(card.birth_date)
        return bd.getMonth() + 1 === mm && bd.getDate() === dd
      }).length
      setTodayBdayCount(bdayToday)
      setLoading(false)
    }).catch(() => setLoading(false))

    // Stats extra: push logs + ventas
    fetch(`/api/fidelizacion/stats?program_id=${selectedProgram}`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    })
      .then(r => r.json())
      .then(d => {
        setPushLogs(d.push_logs ?? [])
        setSalesByDay(d.sales_by_day ?? {})
        setTotalSales(d.total_sales ?? 0)
      }).catch(() => {})
  }, [selectedProgram])

  async function sendNotif() {
    if (!notifMsg.trim() || !selectedProgram) return
    setNotifSending(true)
    const res = await fetch('/api/fidelizacion/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: JSON.stringify({ program_id: selectedProgram, title: '📣 Novedad del local', body: notifMsg }),
    })
    const d = await res.json()
    setNotifSending(false); setNotifSent(true); setNotifMsg('')
    // Refrescar push logs
    if (d.ok && d.sent > 0) {
      setPushLogs(prev => [{
        id: Date.now().toString(), title: '📣 Novedad del local', body: notifMsg,
        sent_to: d.sent, created_at: new Date().toISOString(),
      }, ...prev.slice(0, 4)])
    }
    setTimeout(() => setNotifSent(false), 3000)
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

  const program = programs.find(p => p.id === selectedProgram)

  if (loading && programs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-zinc-50" data-dark={String(isDark)}>
      <style>{`
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
        /* Mobile header dark mode */
        [data-dark="true"] header { background-color: #18181b !important; border-color: #3f3f46 !important; }
        /* Glow en placeholders / estados vacíos */
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
      `}</style>
      {showDiscount && <DiscountPopup onClose={() => setShowDiscount(false)} />}
      {/* Mobile top header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-4 h-14 bg-white border-b border-zinc-100">
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-xl hover:bg-zinc-50 text-zinc-600">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
        <span className="font-bold text-zinc-900 text-sm">Calificar</span>
        <button onClick={toggleDark} className="p-2 rounded-xl hover:bg-zinc-50 text-zinc-500">
          {isDark ? <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 1.78a1 1 0 011.42 1.42l-.71.7a1 1 0 01-1.41-1.41l.7-.71zM18 9a1 1 0 110 2h-1a1 1 0 110-2h1zM5.49 4.22a1 1 0 010 1.41l-.7.71a1 1 0 01-1.42-1.42l.71-.7a1 1 0 011.41 0zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-6.71-2.51a1 1 0 011.41 0l.71.7a1 1 0 01-1.41 1.42l-.71-.71a1 1 0 010-1.41zM4 10a1 1 0 100-2H3a1 1 0 000 2h1zm11.49 3.49a1 1 0 011.41 1.41l-.7.71a1 1 0 11-1.42-1.42l.71-.7zM10 6a4 4 0 100 8 4 4 0 000-8z"/></svg>
            : <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>}
        </button>
      </header>
      <Sidebar active={activeNav} onNav={setActiveNav} businessName={businessName} email={userEmail} bdayBadge={todayBdayCount} isDark={isDark} onDarkToggle={toggleDark} isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      {stampModal && (
        <StampModal
          cardName={stampModal.name}
          onConfirm={async (amount) => { await manualStamp(stampModal.cardId, amount); setStampModal(null) }}
          onClose={() => setStampModal(null)}
        />
      )}
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        {activeNav === 'hoy' && (
          <ViewHoy program={program} selectedProgram={selectedProgram} stats={stats}
            transactions={transactions} notifMsg={notifMsg} setNotifMsg={setNotifMsg}
            notifSending={notifSending} notifSent={notifSent} sendNotif={sendNotif}
            businessName={businessName} cards={cards}
            pushLogs={pushLogs} salesByDay={salesByDay} totalSales={totalSales}
            onLogoNav={() => setActiveNav('tarjeta')} />
        )}
        {activeNav === 'tarjeta' && (
          <ViewTarjeta program={program} selectedProgram={selectedProgram} onLogoUploaded={handleLogoUploaded} accessToken={accessToken} />
        )}
        {activeNav === 'clientes' && (
          <ViewClientes cards={cards} program={program} selectedProgram={selectedProgram}
            loading={loading} manualStamp={(id, name) => setStampModal({ cardId: id, name })} />
        )}
        {activeNav === 'push' && (
          <ViewPush notifMsg={notifMsg} setNotifMsg={setNotifMsg}
            notifSending={notifSending} notifSent={notifSent} sendNotif={sendNotif} />
        )}
        {activeNav === 'proximidad' && (
          <ViewProximidad selectedProgram={selectedProgram} isPro={true}
            notifMsg={notifMsg} setNotifMsg={setNotifMsg}
            notifSending={notifSending} notifSent={notifSent} sendNotif={sendNotif} accessToken={accessToken} />
        )}
        {activeNav === 'cumple' && (
          <ViewCumple selectedProgram={selectedProgram} cards={cards} isPro={true} />
        )}
        {activeNav === 'imprimir' && <ViewImprimir program={program} selectedProgram={selectedProgram} />}
        {activeNav === 'perfil' && (
          <ViewPerfil program={program} selectedProgram={selectedProgram}
            businessName={businessName} onSaved={name => setBusinessName(name)} />
        )}
        {activeNav === 'plan' && <ViewPlan onNav={setActiveNav} />}
        {activeNav === 'ayuda' && <ViewAyuda onNav={setActiveNav} />}
        {activeNav === 'primeros-pasos' && <ViewAyuda onNav={setActiveNav} />}
      </main>
    </div>
  )
}
