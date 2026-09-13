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
function Sidebar({ active, onNav, businessName, email, bdayBadge = 0 }: {
  active: string; onNav: (id: string) => void; businessName: string; email: string; bdayBadge?: number
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
  return (
    <aside className="w-60 flex-shrink-0 border-r border-zinc-100 bg-white flex flex-col h-screen sticky top-0 overflow-y-auto z-30">
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
        <button onClick={() => onNav('clientes')}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl font-semibold text-sm text-white"
          style={{ background: '#7C3AED' }}>
          ⊙ Escanear un cliente
        </button>
      </div>
      <nav className="flex-1 px-3 space-y-0.5 pb-2">
        {nav.map(item => (
          <button key={item.id} onClick={() => onNav(item.id)}
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
                <button key={id} onClick={() => onNav(id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                    active === id ? 'text-violet-700 font-semibold bg-violet-50' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'}`}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => onNav('ayuda')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-50 text-left">
          <span className="w-5 text-center">❓</span> Ayuda
        </button>
        <button onClick={() => onNav('primeros-pasos')}
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
        <button className="w-full text-left text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors">↩ Cerrar sesión</button>
      </div>
    </aside>
  )
}

// ── Vista: HOY ───────────────────────────────────────────────────────────────
function ViewHoy({ program, selectedProgram, stats, transactions, notifMsg, setNotifMsg, notifSending, notifSent, sendNotif, businessName, cards }:
  { program: Program | undefined; selectedProgram: string | null; stats: { total: number; stampsToday: number; rewardsTotal: number }
    transactions: Transaction[]; notifMsg: string; setNotifMsg: (v: string) => void
    notifSending: boolean; notifSent: boolean; sendNotif: () => void; businessName: string; cards: Card[] }) {
  const color = program?.color_primary ?? '#7C3AED'
  const greeting = (() => { const h = new Date().getHours(); return h < 12 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches' })()
  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-zinc-900">{greeting}, {businessName.split(' ')[0]}.</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Esto es lo que está pasando hoy en {businessName}.</p>
      </div>
      {/* QR Banner */}
      {program && (
        <div className="bg-white border border-zinc-100 rounded-2xl p-4 mb-6 flex items-center gap-4">
          <div className="bg-zinc-100 rounded-xl p-2 flex-shrink-0">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${encodeURIComponent(`https://calificar.com.ar/fidelizacion/unirse?program=${selectedProgram}`)}&color=0F172A&bgcolor=FFFFFF&qzone=1`}
              alt="QR" width={64} height={64} className="rounded-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-violet-600 mb-0.5">LISTO PARA COMPARTIR</p>
            <p className="font-bold text-zinc-900 text-sm">Tarjeta de sellos</p>
            <p className="text-xs text-zinc-400 mt-0.5">Ponelo en el mostrador o compartí el enlace.</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(`https://calificar.com.ar/fidelizacion/unirse?program=${selectedProgram}`)}&color=0F172A&bgcolor=FFFFFF&qzone=1`}
              download="qr-calificar.png" target="_blank" rel="noopener noreferrer"
              className="text-xs border border-zinc-200 text-zinc-600 px-3 py-2 rounded-xl hover:bg-zinc-50 font-medium">🖨️ Imprimir</a>
            <button onClick={() => navigator.clipboard.writeText(`https://calificar.com.ar/fidelizacion/unirse?program=${selectedProgram}`)}
              className="text-xs border border-zinc-200 text-zinc-600 px-3 py-2 rounded-xl hover:bg-zinc-50 font-medium">🔗 Copiar</button>
          </div>
        </div>
      )}
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'CLIENTES TOTALES', value: stats.total, sub: '— vs ayer' },
          { label: 'SELLOS HOY', value: stats.stampsToday, sub: '— vs ayer' },
          { label: 'PREMIOS ENTREGADOS', value: stats.rewardsTotal, sub: '— total' },
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
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-100 rounded-2xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">LO QUE ESTÁ PASANDO AHORA</p>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
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
                  <div className="min-w-0">
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
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-extrabold"
              style={{ background: `${color}18`, color }}>
              {stats.total}
            </div>
            <p className="text-xs text-zinc-400 mt-2">clientes registrados</p>
          </div>
        </div>
        <div className="bg-white border border-zinc-100 rounded-2xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">AVISOS PUSH</p>
          <textarea value={notifMsg} onChange={e => setNotifMsg(e.target.value)}
            placeholder="Ej: Esta semana 2x1 en café 🎉" rows={3}
            className="w-full border border-zinc-200 focus:border-violet-400 rounded-xl px-3 py-2 text-xs focus:outline-none resize-none mb-3" />
          <button onClick={sendNotif} disabled={notifSending || !notifMsg.trim() || notifSent}
            className="w-full py-2.5 rounded-xl font-bold text-white text-xs disabled:opacity-50 transition-colors"
            style={{ background: notifSent ? '#10B981' : '#7C3AED' }}>
            {notifSent ? '✓ Enviado' : notifSending ? 'Enviando...' : 'Enviar tu primer push →'}
          </button>
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
function ViewTarjeta({ program, selectedProgram, onLogoUploaded }:
  { program: Program | undefined; selectedProgram: string | null; onLogoUploaded: (url: string) => void }) {
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
      const res = await fetch('/api/fidelizacion/upload-logo', { method: 'POST', body: form })
      const data = await res.json()
      if (data.url) onLogoUploaded(data.url)
      else setUploadError(data.error ?? 'Error al subir')
    } catch {
      setUploadError('Error de red')
    }
    setUploading(false)
  }

  if (!program) return <div className="p-8 text-zinc-400 text-sm">No hay programa activo.</div>

  return (
    <div className="p-8 max-w-4xl">
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
      <div className="grid grid-cols-4 gap-3 mb-6">
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
  { cards: Card[]; program: Program | undefined; selectedProgram: string | null; loading: boolean; manualStamp: (id: string) => void }) {
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
    <div className="p-8 max-w-5xl">
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
                          <button onClick={() => manualStamp(c.id)}
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
    <div className="p-8 max-w-2xl">
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
function ViewProximidad({ selectedProgram, isPro }: { selectedProgram: string | null; isPro: boolean }) {
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
    fetch(`/api/fidelizacion/proximity?program_id=${selectedProgram}`)
      .then(r => r.json())
      .then(d => {
        setEnabled(d.proximity_enabled ?? false)
        setMessage(d.proximity_message ?? '')
        setLocationLabel(d.location_label ?? '')
        if (d.location_lat) setLat(String(d.location_lat))
        if (d.location_lng) setLng(String(d.location_lng))
      })
      .catch(() => setLoadError('No se pudo cargar la configuración.'))
  }, [selectedProgram])

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
      headers: { 'Content-Type': 'application/json' },
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
    <div className="p-8 max-w-2xl">
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
        <div className="bg-white border border-zinc-100 rounded-2xl p-6">
          <p className="text-sm text-zinc-500">Usá la sección <strong>Avisos push</strong> del menú izquierdo para enviar mensajes manuales.</p>
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
    <div className="p-8 max-w-3xl">
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
      <div className="grid grid-cols-3 gap-3 mb-4">
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

  async function renderTemplate(tpl: typeof DIGITAL_TEMPLATES[0]): Promise<string> {
    const scale = 1
    const cw = tpl.w * scale
    const ch = tpl.h * scale
    const canvas = document.createElement('canvas')
    canvas.width = cw; canvas.height = ch
    const ctx = canvas.getContext('2d')!
    const dark = isDark(color)
    const textColor = dark ? '#ffffff' : '#1a1a1a'
    const bgColor = dark ? color : '#f5f0eb'
    const accentColor = dark ? '#ffffff' : color

    // Background
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, cw, ch)

    // Decorative circle top-right
    ctx.beginPath()
    ctx.arc(cw * 0.85, ch * -0.05, cw * 0.45, 0, Math.PI * 2)
    ctx.fillStyle = dark ? lighten(color, 20) : lighten(color, 180)
    ctx.fill()

    const isVertical = ch > cw
    const qrSize = isVertical ? cw * 0.42 : Math.min(cw, ch) * 0.38
    const qrX = isVertical ? (cw - qrSize) / 2 : cw * 0.55
    const qrY = isVertical ? ch * 0.38 : (ch - qrSize) / 2

    // QR white card
    const pad = qrSize * 0.08
    ctx.fillStyle = '#ffffff'
    const rr = qrSize * 0.07
    const rx = qrX - pad, ry = qrY - pad, rw = qrSize + pad * 2, rh = qrSize + pad * 2
    ctx.beginPath()
    ctx.moveTo(rx + rr, ry)
    ctx.lineTo(rx + rw - rr, ry); ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rr)
    ctx.lineTo(rx + rw, ry + rh - rr); ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rr, ry + rh)
    ctx.lineTo(rx + rr, ry + rh); ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rr)
    ctx.lineTo(rx, ry + rr); ctx.quadraticCurveTo(rx, ry, rx + rr, ry)
    ctx.closePath(); ctx.fill()

    // QR image
    if (qrUrl) {
      const img = new Image()
      await new Promise<void>(res => { img.onload = () => res(); img.src = qrUrl })
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize)
    }

    // Text
    if (isVertical) {
      const textX = cw * 0.1
      if (tpl.id === 'story-activacion' || tpl.id === 'whatsapp') {
        ctx.fillStyle = accentColor
        ctx.font = `bold ${cw * 0.1}px system-ui`
        ctx.fillText('Escanealo.', textX, ch * 0.15)
        ctx.fillText('Guardalo.', textX, ch * 0.24)
        ctx.fillStyle = textColor
        ctx.font = `bold ${cw * 0.1}px system-ui`
        ctx.fillText('Empieza.', textX, ch * 0.33)
      } else {
        ctx.fillStyle = textColor
        ctx.font = `bold ${cw * 0.09}px system-ui`
        ctx.fillText('Tu pase digital,', textX, ch * 0.15)
        ctx.fillStyle = accentColor
        ctx.fillText('guardalo en', textX, ch * 0.24)
        ctx.fillText('tu Wallet.', textX, ch * 0.33)
      }
      // Business name
      ctx.fillStyle = textColor
      ctx.font = `${cw * 0.048}px system-ui`
      ctx.fillText(bizName, textX, ch * 0.78)
      // Escanea label
      ctx.fillStyle = dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)'
      ctx.font = `${cw * 0.038}px system-ui`
      ctx.textAlign = 'center'
      ctx.fillText('+ ESCANEA AQUÍ', cw / 2, qrY + qrSize + pad + cw * 0.06)
      ctx.fillText('Guardala en tu Wallet', cw / 2, qrY + qrSize + pad + cw * 0.11)
    } else {
      ctx.fillStyle = textColor
      ctx.font = `bold ${ch * 0.18}px system-ui`
      ctx.fillText('Tu pase', cw * 0.05, ch * 0.35)
      ctx.fillStyle = accentColor
      ctx.fillText('digital.', cw * 0.05, ch * 0.58)
      ctx.fillStyle = dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)'
      ctx.font = `${ch * 0.1}px system-ui`
      ctx.textAlign = 'left'
      ctx.fillText(bizName, cw * 0.05, ch * 0.78)
    }

    // Footer
    ctx.textAlign = 'center'
    ctx.fillStyle = dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)'
    ctx.font = `${Math.min(cw, ch) * 0.025}px system-ui`
    ctx.fillText('powered by calificar.com.ar', cw / 2, ch - Math.min(cw, ch) * 0.03)

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

  // Mini canvas preview per template
  function TemplatePreview({ tpl }: { tpl: typeof DIGITAL_TEMPLATES[0] }) {
    const ref = useRef<HTMLCanvasElement>(null)
    useEffect(() => {
      if (!ref.current || !qrUrl) return
      const canvas = ref.current
      const ctx = canvas.getContext('2d')!
      const scale = canvas.width / tpl.w
      const dark = isDark(color)
      const bgColor = dark ? color : '#f5f0eb'
      const accentColor = dark ? '#ffffff' : color
      const textColor = dark ? '#ffffff' : '#1a1a1a'
      ctx.fillStyle = bgColor; ctx.fillRect(0, 0, canvas.width, canvas.height)
      // deco circle
      ctx.beginPath()
      ctx.arc(canvas.width * 0.85, canvas.height * -0.05, canvas.width * 0.45, 0, Math.PI * 2)
      ctx.fillStyle = dark ? lighten(color, 20) : lighten(color, 180); ctx.fill()
      const isV = tpl.h > tpl.w
      const qSize = isV ? canvas.width * 0.42 : Math.min(canvas.width, canvas.height) * 0.38
      const qx = isV ? (canvas.width - qSize) / 2 : canvas.width * 0.55
      const qy = isV ? canvas.height * 0.38 : (canvas.height - qSize) / 2
      // white bg
      ctx.fillStyle = '#fff'
      const p = qSize * 0.08
      ctx.fillRect(qx - p, qy - p, qSize + p * 2, qSize + p * 2)
      // QR
      const img = new Image(); img.src = qrUrl
      img.onload = () => ctx.drawImage(img, qx, qy, qSize, qSize)
      // texts
      ctx.fillStyle = textColor
      ctx.font = `bold ${canvas.width * 0.09}px system-ui`
      if (isV) {
        ctx.fillStyle = accentColor; ctx.fillText('Tu pase', canvas.width * 0.1, canvas.height * 0.15)
        ctx.fillStyle = textColor;   ctx.fillText('digital', canvas.width * 0.1, canvas.height * 0.24)
        ctx.font = `${canvas.width * 0.045}px system-ui`
        ctx.fillStyle = dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.35)'
        ctx.textAlign = 'center'; ctx.fillText('ESCANEAR AQUÍ', canvas.width / 2, qy + qSize + p + canvas.width * 0.07)
      } else {
        ctx.fillStyle = accentColor; ctx.fillText('Tu pase', canvas.width * 0.04, canvas.height * 0.45)
        ctx.fillStyle = textColor;   ctx.fillText('digital', canvas.width * 0.04, canvas.height * 0.65)
      }
      ctx.textAlign = 'left'
    }, [qrUrl, tpl])
    const aspect = tpl.h / tpl.w
    const previewW = 140
    return <canvas ref={ref} width={previewW} height={Math.round(previewW * aspect)}
      className="rounded-xl block" style={{ maxHeight: 180, width: 'auto' }} />
  }

  return (
    <div className="p-8 max-w-4xl">
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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map(tpl => (
            <div key={tpl.id} className="bg-white border border-zinc-100 rounded-2xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-center bg-zinc-50 py-5 px-4 min-h-[160px]">
                {qrUrl ? <TemplatePreview tpl={tpl} /> : <div className="w-20 h-28 bg-zinc-100 rounded-xl animate-pulse" />}
              </div>
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

// ── Vista: PLACEHOLDER ───────────────────────────────────────────────────────
function ViewPlaceholder({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h1 className="text-xl font-extrabold text-zinc-900 mb-2">{title}</h1>
      <p className="text-zinc-400 text-sm">Esta sección está en desarrollo.</p>
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
  const [todayBdayCount, setTodayBdayCount] = useState(0)

  useEffect(() => {
    const seen = localStorage.getItem('cal_discount_seen')
    if (!seen) setTimeout(() => setShowDiscount(true), 1200)

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
  }, [selectedProgram])

  async function sendNotif() {
    if (!notifMsg.trim() || !selectedProgram) return
    setNotifSending(true)
    await fetch('/api/fidelizacion/push/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ program_id: selectedProgram, title: '📣 Novedad del local', body: notifMsg }),
    })
    setNotifSending(false); setNotifSent(true); setNotifMsg('')
    setTimeout(() => setNotifSent(false), 3000)
  }

  async function manualStamp(cardId: string) {
    await fetch('/api/fidelizacion/stamp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card_id: cardId, program_id: selectedProgram, registered_by: 'manual' }),
    })
    const r = await fetch(`/api/fidelizacion/admin/clients?program_id=${selectedProgram}`)
    const d = await r.json()
    setCards(d.cards ?? [])
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
    <div className="flex min-h-screen bg-zinc-50">
      {showDiscount && <DiscountPopup onClose={() => setShowDiscount(false)} />}
      <Sidebar active={activeNav} onNav={setActiveNav} businessName={businessName} email={userEmail} bdayBadge={todayBdayCount} />
      <main className="flex-1 overflow-y-auto">
        {activeNav === 'hoy' && (
          <ViewHoy program={program} selectedProgram={selectedProgram} stats={stats}
            transactions={transactions} notifMsg={notifMsg} setNotifMsg={setNotifMsg}
            notifSending={notifSending} notifSent={notifSent} sendNotif={sendNotif}
            businessName={businessName} cards={cards} />
        )}
        {activeNav === 'tarjeta' && (
          <ViewTarjeta program={program} selectedProgram={selectedProgram} onLogoUploaded={handleLogoUploaded} />
        )}
        {activeNav === 'clientes' && (
          <ViewClientes cards={cards} program={program} selectedProgram={selectedProgram}
            loading={loading} manualStamp={manualStamp} />
        )}
        {activeNav === 'push' && (
          <ViewPush notifMsg={notifMsg} setNotifMsg={setNotifMsg}
            notifSending={notifSending} notifSent={notifSent} sendNotif={sendNotif} />
        )}
        {activeNav === 'proximidad' && (
          <ViewProximidad selectedProgram={selectedProgram} isPro={true} />
        )}
        {activeNav === 'cumple' && (
          <ViewCumple selectedProgram={selectedProgram} cards={cards} isPro={true} />
        )}
        {activeNav === 'imprimir' && <ViewImprimir program={program} selectedProgram={selectedProgram} />}
        {activeNav === 'perfil' && <ViewPlaceholder title="Perfil del negocio" icon="🏢" />}
        {activeNav === 'plan' && <ViewPlaceholder title="Plan" icon="💳" />}
        {activeNav === 'ayuda' && <ViewPlaceholder title="Ayuda" icon="❓" />}
        {activeNav === 'primeros-pasos' && <ViewPlaceholder title="Primeros pasos" icon="🚀" />}
      </main>
    </div>
  )
}
