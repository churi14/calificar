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
function Sidebar({ active, onNav, businessName, email }: {
  active: string; onNav: (id: string) => void; businessName: string; email: string
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
            {item.label}
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

// ── Vista: TARJETA ───────────────────────────────────────────────────────────
function ViewTarjeta({ program, selectedProgram, onLogoUploaded }:
  { program: Program | undefined; selectedProgram: string | null; onLogoUploaded: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
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
        <button className="flex-shrink-0 text-xs font-bold text-white px-4 py-2 rounded-xl" style={{ background: '#7C3AED' }}>
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
      const today = new Date().toDateString()
      setStats({
        total: c.length,
        stampsToday: t.filter(tx => tx.type === 'stamp' && new Date(tx.created_at).toDateString() === today).length,
        rewardsTotal: t.filter(tx => tx.type === 'reward').length,
      })
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
      <Sidebar active={activeNav} onNav={setActiveNav} businessName={businessName} email={userEmail} />
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
        {activeNav === 'cumple' && <ViewPlaceholder title="Campañas de cumpleaños" icon="🎂" />}
        {activeNav === 'imprimir' && <ViewPlaceholder title="Imprimir y compartir" icon="🖨️" />}
        {activeNav === 'perfil' && <ViewPlaceholder title="Perfil del negocio" icon="🏢" />}
        {activeNav === 'plan' && <ViewPlaceholder title="Plan" icon="💳" />}
        {activeNav === 'ayuda' && <ViewPlaceholder title="Ayuda" icon="❓" />}
        {activeNav === 'primeros-pasos' && <ViewPlaceholder title="Primeros pasos" icon="🚀" />}
      </main>
    </div>
  )
}
