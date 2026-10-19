'use client'

import React, { useState, useEffect } from 'react'
import type { Card } from '@/types/dashboard'

// ── tipos locales ─────────────────────────────────────────────────────────────
type BirthdayCoupon = {
  id: string
  coupon_code: string
  valid_from: string
  valid_until: string
  used_at: string | null
  loyalty_cards: { name: string; phone: string }
}

type UpcomingBirthday = {
  id: string
  name: string
  birth_date: string
}

type BirthdayCfg = {
  enabled:      boolean
  discount_type:  'percent' | 'fixed'
  discount_value: number
  message_day0:   string
  message_mid:    string
  message_last:   string
}

// ── props ─────────────────────────────────────────────────────────────────────
interface ViewCumpleanosProps {
  selectedProgram: string | null
  cards: Card[]
  isPro: boolean
  accessToken?: string
}

// ── componente ────────────────────────────────────────────────────────────────
export default function ViewCumpleanos({ selectedProgram, cards, isPro, accessToken }: ViewCumpleanosProps) {
  const authHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  }
  const [cfg, setCfg] = useState<BirthdayCfg>({
    enabled:        false,
    discount_type:  'percent',
    discount_value: 20,
    message_day0:   '🎂 ¡Feliz cumpleaños, {nombre}! Durante este mes tenés {descuento}% OFF. Tu código exclusivo: {codigo}',
    message_mid:    '⏰ {nombre}, todavía tenés tu descuento de cumpleaños activo. Código: {codigo}',
    message_last:   '🚨 Últimos días de tu descuento de cumpleaños, {nombre}. Código: {codigo}',
  })
  const [coupons,       setCoupons]       = useState<BirthdayCoupon[]>([])
  const [upcoming,      setUpcoming]      = useState<UpcomingBirthday[]>([])
  const [totalWithBday, setTotalWithBday] = useState(0)
  const [saving,        setSaving]        = useState(false)
  const [saved,         setSaved]         = useState(false)
  const [triggering,    setTriggering]    = useState(false)
  const [triggerMsg,    setTriggerMsg]    = useState('')

  useEffect(() => {
    if (!selectedProgram) return
    fetch(`/api/fidelizacion/birthday?program_id=${selectedProgram}`, { headers: authHeaders })
      .then(r => r.json())
      .then(d => {
        if (d.config) setCfg(c => ({ ...c, ...d.config }))
        setCoupons(d.active_coupons ?? [])
        setUpcoming(d.upcoming_birthdays ?? [])
        setTotalWithBday(d.total_with_birthday ?? 0)
      })
  }, [selectedProgram, accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  async function save() {
    setSaving(true)
    await fetch('/api/fidelizacion/birthday', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ program_id: selectedProgram, ...cfg }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function triggerToday() {
    setTriggering(true)
    const r = await fetch('/api/fidelizacion/birthday', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ program_id: selectedProgram }),
    })
    const d = await r.json()
    setTriggerMsg(d.generated > 0 ? `✓ ${d.generated} código(s) generado(s) y enviados` : 'Sin cumpleaños hoy')
    setTriggering(false)
    setTimeout(() => setTriggerMsg(''), 4000)
  }

  const totalWithBdayPct = cards.length > 0 ? Math.round((totalWithBday / cards.length) * 100) : 0

  return (
    <div className="p-4 md:p-8 w-full">
      <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-1">Campañas de cumpleaños</h1>
      <p className="text-zinc-400 dark:text-gray-500 text-sm mb-6">
        Felicitá a tus clientes con un código exclusivo válido por 30 días.
      </p>

      {!isPro && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <span className="text-xl">🔒</span>
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Función Pro</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              Las campañas de cumpleaños están disponibles en el plan Pro.
            </p>
          </div>
        </div>
      )}

      {/* Cómo funciona */}
      <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500 mb-3">LO QUE PASA DESPUÉS</p>
        <div className="space-y-3">
          {[
            { n: '1', text: 'El día del cumpleaños le llega un push con su código exclusivo.' },
            { n: '2', text: 'Tiene 30 días para usar ese código con el descuento especial.' },
            { n: '3', text: 'A los 15 y 25 días, le mandamos un recordatorio automático.' },
          ].map(s => (
            <div key={s.n} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                {s.n}
              </span>
              <p className="text-sm text-zinc-600 dark:text-gray-400 mt-0.5">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {[
          { label: 'CON CUMPLEAÑOS',  value: totalWithBday,                         sub: `${totalWithBdayPct}% de tus clientes` },
          { label: 'CÓDIGOS ACTIVOS', value: coupons.filter(c => !c.used_at).length, sub: 'en los próximos 30 días' },
          { label: 'PRÓXIMOS CUMPLES', value: upcoming.length,                       sub: 'en los próximos 30 días' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-zinc-400 dark:text-gray-500">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Configuración */}
      <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-zinc-900 dark:text-white">Configuración</p>
          <button
            onClick={() => isPro && setCfg(c => ({ ...c, enabled: !c.enabled }))}
            disabled={!isPro}
            className={`relative w-12 h-6 rounded-full transition-colors ${cfg.enabled && isPro ? 'bg-violet-600' : 'bg-zinc-200 dark:bg-gray-700'} disabled:opacity-50`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${cfg.enabled && isPro ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {/* Descuento */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-zinc-600 dark:text-gray-400 mb-2">Descuento de cumpleaños</label>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex bg-zinc-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
              {(['percent', 'fixed'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setCfg(c => ({ ...c, discount_type: t }))}
                  disabled={!isPro}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    cfg.discount_type === t
                      ? 'bg-white dark:bg-gray-700 text-zinc-900 dark:text-white shadow-sm'
                      : 'text-zinc-500 dark:text-gray-400'
                  }`}
                >
                  {t === 'percent' ? '% descuento' : '$ fijo'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 border border-zinc-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-gray-800">
              <input
                type="number"
                value={cfg.discount_value}
                disabled={!isPro}
                onChange={e => setCfg(c => ({ ...c, discount_value: parseInt(e.target.value) || 0 }))}
                className="w-16 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none text-center bg-transparent disabled:opacity-50"
              />
              <span className="text-zinc-400 dark:text-gray-500 text-sm">{cfg.discount_type === 'percent' ? '%' : '$'}</span>
            </div>
          </div>
        </div>

        {/* Mensajes automáticos */}
        <div className="space-y-3">
          {[
            { key: 'message_day0', label: '🎂 Mensaje del día del cumpleaños', hint: 'Usá {nombre}, {codigo}, {descuento}' },
            { key: 'message_mid',  label: '⏰ Recordatorio día 15',            hint: 'Recordatorio a mitad del mes' },
            { key: 'message_last', label: '🚨 Último aviso día 25',            hint: 'Urgencia antes de que expire' },
          ].map(m => (
            <div key={m.key}>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-gray-400 mb-1">{m.label}</label>
              <textarea
                value={cfg[m.key as keyof BirthdayCfg] as string}
                onChange={e => setCfg(c => ({ ...c, [m.key]: e.target.value }))}
                disabled={!isPro}
                rows={2}
                className="w-full border border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-gray-600 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-400 resize-none disabled:opacity-50 transition-colors"
              />
              <p className="text-[10px] text-zinc-400 dark:text-gray-500 mt-0.5">{m.hint}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          onClick={save}
          disabled={saving || !isPro}
          className="font-bold px-6 py-3 rounded-2xl text-sm text-white transition-colors disabled:opacity-50"
          style={{ background: saved ? '#10B981' : '#7C3AED' }}
        >
          {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar campaña'}
        </button>
        <button
          onClick={triggerToday}
          disabled={triggering || !isPro}
          className="text-xs font-semibold border border-zinc-200 dark:border-gray-700 text-zinc-600 dark:text-gray-300 px-4 py-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {triggering ? 'Procesando...' : '▷ Ejecutar hoy ahora'}
        </button>
        {triggerMsg && <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{triggerMsg}</p>}
      </div>

      {/* Próximos cumpleaños */}
      {upcoming.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl overflow-hidden mb-4">
          <div className="px-5 py-3 border-b border-zinc-100 dark:border-gray-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500">
              PRÓXIMOS CUMPLEAÑOS (30 días)
            </p>
          </div>
          <div className="divide-y divide-zinc-50 dark:divide-gray-800">
            {upcoming.map(c => {
              const [, bdM, bdD] = c.birth_date.split('-').map(Number)
              const today    = new Date()
              const thisYear = new Date(today.getFullYear(), bdM - 1, bdD)
              const diff     = Math.floor((thisYear.getTime() - today.getTime()) / 86400000)
              return (
                <div key={c.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-950 flex items-center justify-center text-violet-700 dark:text-violet-300 font-bold text-xs">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">{c.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-zinc-900 dark:text-white">
                      {diff === 0 ? '🎂 Hoy' : diff === 1 ? 'Mañana' : `En ${diff} días`}
                    </p>
                    <p className="text-[10px] text-zinc-400 dark:text-gray-500">
                      {new Date(today.getFullYear(), bdM - 1, bdD).toLocaleDateString('es-AR', { day: '2-digit', month: 'long' })}
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
        <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-100 dark:border-gray-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500">CÓDIGOS ACTIVOS</p>
          </div>
          <div className="divide-y divide-zinc-50 dark:divide-gray-800">
            {coupons.map(c => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">{c.loyalty_cards?.name}</p>
                  <p className="text-xs font-mono text-violet-600 dark:text-violet-400 mt-0.5">{c.coupon_code}</p>
                </div>
                <div className="text-right">
                  {c.used_at ? (
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                      USADO
                    </span>
                  ) : (
                    <span className="text-[10px] bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-400 font-bold px-2 py-0.5 rounded-full">
                      ACTIVO
                    </span>
                  )}
                  <p className="text-[10px] text-zinc-400 dark:text-gray-500 mt-1">
                    Vence {new Date(c.valid_until).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
