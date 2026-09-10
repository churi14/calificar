'use client'

import { useEffect, useState } from 'react'
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
  const [activeTab, setActiveTab] = useState<'clientes' | 'actividad' | 'notificaciones'>('clientes')

  useEffect(() => {
    fetch('/api/fidelizacion/admin')
      .then(r => r.json())
      .then(d => {
        setPrograms(d.programs ?? [])
        if (d.programs?.length > 0) setSelectedProgram(d.programs[0].id)
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
    // refresh
    const r = await fetch(`/api/fidelizacion/admin/clients?program_id=${selectedProgram}`)
    const d = await r.json()
    setCards(d.cards ?? [])
  }

  const program = programs.find(p => p.id === selectedProgram)
  const color = program?.color_primary ?? '#7C3AED'
  const filtered = cards.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  if (loading && programs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-extrabold text-zinc-900">calificar</Link>
            <span className="text-zinc-300">/</span>
            {programs.length > 1 ? (
              <select
                value={selectedProgram ?? ''}
                onChange={e => setSelectedProgram(e.target.value)}
                className="text-sm font-semibold text-zinc-700 bg-transparent border-none outline-none cursor-pointer"
              >
                {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            ) : (
              <span className="text-sm font-semibold text-zinc-700">{program?.name ?? 'Mi programa'}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {selectedProgram && (
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(`https://calificar.com.ar/fidelizacion/unirse?program=${selectedProgram}`)}&color=0F172A&bgcolor=FFFFFF&qzone=1`}
                download="qr-registro.png"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold border border-zinc-200 text-zinc-600 px-3 py-1.5 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                Descargar QR
              </a>
            )}
            <Link href="/admin/fidelizacion" className="text-xs font-semibold text-violet-600 hover:text-violet-500 transition-colors">
              Admin completo
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Clientes totales', value: stats.total, icon: '👥', color: 'bg-violet-50 border-violet-100' },
            { label: 'Sellos hoy', value: stats.stampsToday, icon: '⭐', color: 'bg-amber-50 border-amber-100' },
            { label: 'Premios entregados', value: stats.rewardsTotal, icon: '🏆', color: 'bg-emerald-50 border-emerald-100' },
          ].map(s => (
            <div key={s.label} className={`${s.color} border rounded-2xl p-5`}>
              <p className="text-2xl mb-2">{s.icon}</p>
              <p className="text-3xl font-extrabold text-zinc-900">{s.value}</p>
              <p className="text-sm text-zinc-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Program card preview */}
        {program && (
          <div className="mb-8 rounded-2xl p-6 text-white" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70 mb-1">Programa activo</p>
                <h2 className="text-2xl font-extrabold">{program.name}</h2>
                <p className="opacity-70 text-sm mt-1">Meta: {program.stamps_goal} sellos — Premio: {program.reward_description}</p>
              </div>
              {program.logo_url && (
                <img src={program.logo_url} alt="" className="h-14 max-w-[120px] object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
              )}
            </div>
            {/* QR registro inline */}
            <div className="mt-4 flex items-center gap-4">
              <div className="bg-white rounded-xl p-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`https://calificar.com.ar/fidelizacion/unirse?program=${selectedProgram}`)}&color=0F172A&bgcolor=FFFFFF&qzone=1`}
                  alt="QR registro"
                  width={80}
                  height={80}
                  className="rounded-lg"
                />
              </div>
              <div>
                <p className="font-semibold text-sm opacity-90">QR de registro</p>
                <p className="text-xs opacity-60 mt-0.5">Imprimilo y ponerlo en el mostrador</p>
                <p className="text-xs opacity-60">Los clientes escanean para registrarse</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-zinc-100 rounded-2xl p-1 w-fit">
          {(['clientes', 'actividad', 'notificaciones'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${activeTab === tab ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              {tab === 'clientes' ? `Clientes (${cards.length})` : tab === 'actividad' ? 'Actividad reciente' : 'Notificaciones'}
            </button>
          ))}
        </div>

        {/* CLIENTES TAB */}
        {activeTab === 'clientes' && (
          <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
            <div className="p-4 border-b border-zinc-100">
              <input
                type="text"
                placeholder="Buscar por nombre o teléfono..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full max-w-sm border border-zinc-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-violet-400 transition-colors"
              />
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-zinc-400">
                <p className="text-3xl mb-3">👥</p>
                <p className="font-semibold">Sin clientes todavía</p>
                <p className="text-sm mt-1">Compartí el QR de registro para que empiecen a sumarse.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50">
                      <th className="text-left px-5 py-3 font-semibold text-zinc-400 text-xs uppercase tracking-wide">Cliente</th>
                      <th className="text-left px-5 py-3 font-semibold text-zinc-400 text-xs uppercase tracking-wide">Teléfono</th>
                      <th className="text-center px-5 py-3 font-semibold text-zinc-400 text-xs uppercase tracking-wide">Sellos</th>
                      <th className="text-center px-5 py-3 font-semibold text-zinc-400 text-xs uppercase tracking-wide">Visitas</th>
                      <th className="text-center px-5 py-3 font-semibold text-zinc-400 text-xs uppercase tracking-wide">Cumpleaños</th>
                      <th className="text-center px-5 py-3 font-semibold text-zinc-400 text-xs uppercase tracking-wide">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {filtered.map(c => (
                      <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: color }}>
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-zinc-900">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-zinc-500">{c.phone}</td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <div className="w-full max-w-[80px] bg-zinc-100 rounded-full h-1.5 mr-2">
                              <div
                                className="h-1.5 rounded-full transition-all"
                                style={{ width: `${Math.min((c.stamps / (program?.stamps_goal ?? 10)) * 100, 100)}%`, backgroundColor: color }}
                              />
                            </div>
                            <span className="font-bold text-zinc-900 min-w-[32px] text-right">{c.stamps}/{program?.stamps_goal}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center text-zinc-500">{c.total_visits}</td>
                        <td className="px-5 py-4 text-center text-zinc-500 text-xs">
                          {c.birth_date ? new Date(c.birth_date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }) : '-'}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/fidelizacion/tarjeta?card=${c.id}&program=${selectedProgram}`}
                              className="text-xs text-violet-600 hover:underline"
                            >
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
        )}

        {/* ACTIVIDAD TAB */}
        {activeTab === 'actividad' && (
          <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
            {transactions.length === 0 ? (
              <div className="text-center py-16 text-zinc-400">
                <p className="text-3xl mb-3">📋</p>
                <p className="font-semibold">Sin actividad todavía</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-50">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between px-5 py-4 hover:bg-zinc-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${tx.type === 'reward' ? 'bg-amber-50' : 'bg-violet-50'}`}>
                        {tx.type === 'reward' ? '🏆' : '⭐'}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900 text-sm">{tx.loyalty_cards?.name ?? 'Cliente'}</p>
                        <p className="text-xs text-zinc-400">
                          {tx.type === 'reward' ? `Premio canjeado${tx.coupon_code ? ` — ${tx.coupon_code}` : ''}` : 'Sello sumado'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-zinc-400">
                      {new Date(tx.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* NOTIFICACIONES TAB */}
        {activeTab === 'notificaciones' && (
          <div className="bg-white rounded-2xl border border-zinc-100 p-6">
            <h3 className="font-bold text-lg mb-2">Enviar notificación</h3>
            <p className="text-zinc-500 text-sm mb-6">Se manda a todos los clientes que activaron notificaciones en este programa.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Mensaje</label>
                <textarea
                  value={notifMsg}
                  onChange={e => setNotifMsg(e.target.value)}
                  placeholder="Ej: Esta semana 2x1 en café. Te esperamos!"
                  rows={3}
                  className="w-full border border-zinc-200 focus:border-violet-400 rounded-2xl px-4 py-3 text-sm focus:outline-none transition-colors resize-none"
                />
                <p className="text-xs text-zinc-400 mt-1">{notifMsg.length}/160 caracteres</p>
              </div>
              <button
                onClick={sendNotif}
                disabled={notifSending || !notifMsg.trim() || notifSent}
                className={`font-bold px-6 py-3 rounded-2xl text-sm transition-colors ${notifSent ? 'bg-emerald-500 text-white' : 'bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50'}`}
              >
                {notifSent ? '✓ Enviado' : notifSending ? 'Enviando...' : 'Enviar a todos mis clientes'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
