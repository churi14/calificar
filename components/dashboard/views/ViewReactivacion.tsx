'use client'

import React, { useState, useEffect } from 'react'

// ── tipos y constantes ────────────────────────────────────────────────────────
type ReactivationCfg = {
  enabled:            boolean
  trigger_5_enabled:  boolean
  trigger_15_enabled: boolean
  trigger_30_enabled: boolean
  message_5:  string
  message_15: string
  message_30: string
}

const REACTIVATION_DEFAULTS: ReactivationCfg = {
  enabled:            false,
  trigger_5_enabled:  true,
  trigger_15_enabled: true,
  trigger_30_enabled: false,
  message_5:  '¡Hace 5 días que no te vemos! Tu tarjeta te espera, volvé y seguí sumando 🎁',
  message_15: 'Hace 15 días que no pasás. ¡Volvé y seguí sumando sellos hacia tu próximo premio! ✨',
  message_30: 'Hace un mes sin verte 😢 Tu próximo sello puede acercarte al premio. ¡Te esperamos! 🏆',
}

const TRIGGERS: {
  key:    keyof Pick<ReactivationCfg, 'trigger_5_enabled' | 'trigger_15_enabled' | 'trigger_30_enabled'>
  msgKey: keyof Pick<ReactivationCfg, 'message_5' | 'message_15' | 'message_30'>
  days:   number
  label:  string
}[] = [
  { key: 'trigger_5_enabled',  msgKey: 'message_5',  days: 5,  label: '5 días sin visita' },
  { key: 'trigger_15_enabled', msgKey: 'message_15', days: 15, label: '15 días sin visita' },
  { key: 'trigger_30_enabled', msgKey: 'message_30', days: 30, label: '30 días sin visita' },
]

// ── props ─────────────────────────────────────────────────────────────────────
interface ViewReactivacionProps {
  selectedProgram: string | null
  isPro: boolean
}

// ── componente ────────────────────────────────────────────────────────────────
export default function ViewReactivacion({ selectedProgram, isPro }: ViewReactivacionProps) {
  const [cfg,        setCfg]        = useState<ReactivationCfg>(REACTIVATION_DEFAULTS)
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)
  const [triggering, setTriggering] = useState(false)
  const [triggerMsg, setTriggerMsg] = useState('')

  useEffect(() => {
    if (!selectedProgram) return
    fetch(`/api/fidelizacion/reactivation?program_id=${selectedProgram}`)
      .then(r => r.json())
      .then(d => { if (d.config) setCfg(c => ({ ...c, ...d.config })) })
  }, [selectedProgram])

  async function save() {
    setSaving(true)
    await fetch('/api/fidelizacion/reactivation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ program_id: selectedProgram, ...cfg }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function triggerNow() {
    setTriggering(true)
    const r = await fetch('/api/fidelizacion/reactivation', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ program_id: selectedProgram }),
    })
    const d = await r.json()
    setTriggerMsg(d.sent > 0 ? `✓ ${d.sent} push(es) enviados` : 'Sin clientes para reactivar ahora')
    setTriggering(false)
    setTimeout(() => setTriggerMsg(''), 4000)
  }

  return (
    <div className="p-4 md:p-8 w-full">
      <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-1">Reactivación automática</h1>
      <p className="text-zinc-400 dark:text-gray-500 text-sm mb-6">
        Recuperá clientes que dejaron de venir con un push en el momento justo.
      </p>

      {!isPro && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <span className="text-xl">🔒</span>
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Función Pro</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              La reactivación automática está disponible a partir del plan Pro.
            </p>
          </div>
        </div>
      )}

      {/* Cómo funciona */}
      <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500 mb-3">CÓMO FUNCIONA</p>
        <div className="space-y-3">
          {[
            { n: '1', text: 'Cada mañana el sistema detecta clientes que llevan exactamente 5, 15 o 30 días sin cargar un sello.' },
            { n: '2', text: 'Les manda automáticamente el push que configuraste para ese trigger.' },
            { n: '3', text: 'El cliente ve la notificación, toca y vuelve a tu tarjeta de fidelización.' },
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

      {/* Toggle global */}
      <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-white">Activar reactivación automática</p>
            <p className="text-xs text-zinc-400 dark:text-gray-500 mt-0.5">El cron se ejecuta todos los días a las 10 AM</p>
          </div>
          <button
            onClick={() => isPro && setCfg(c => ({ ...c, enabled: !c.enabled }))}
            disabled={!isPro}
            className={`relative w-12 h-6 rounded-full transition-colors ${cfg.enabled && isPro ? 'bg-violet-600' : 'bg-zinc-200 dark:bg-gray-700'} disabled:opacity-50`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${cfg.enabled && isPro ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Triggers individuales */}
      <div className="space-y-3 mb-4">
        {TRIGGERS.map(t => (
          <div key={t.days} className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-zinc-900 dark:text-white">{t.label}</p>
              <button
                onClick={() => isPro && setCfg(c => ({ ...c, [t.key]: !c[t.key] }))}
                disabled={!isPro}
                className={`relative w-10 h-5 rounded-full transition-colors ${cfg[t.key] && isPro ? 'bg-violet-500' : 'bg-zinc-200 dark:bg-gray-700'} disabled:opacity-50`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${cfg[t.key] && isPro ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
            <textarea
              rows={2}
              disabled={!isPro}
              value={cfg[t.msgKey]}
              onChange={e => setCfg(c => ({ ...c, [t.msgKey]: e.target.value }))}
              className="w-full text-sm border border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-gray-600 rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-violet-400 disabled:opacity-50 transition-colors"
              placeholder="Mensaje del push..."
            />
            <p className="text-[10px] text-zinc-400 dark:text-gray-500 mt-1">
              Máx. 120 caracteres recomendado · {cfg[t.msgKey].length} / 120
            </p>
          </div>
        ))}
      </div>

      {isPro && (
        <>
          {/* Trigger manual */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <button
              onClick={triggerNow}
              disabled={triggering}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-zinc-100 dark:bg-gray-800 text-zinc-700 dark:text-gray-300 hover:bg-zinc-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {triggering ? 'Ejecutando...' : 'Probar ahora'}
            </button>
            {triggerMsg && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{triggerMsg}</p>
            )}
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="w-full py-3 rounded-2xl text-white font-bold text-sm transition-colors disabled:opacity-50"
            style={{ background: saved ? '#10B981' : '#7C3AED' }}
          >
            {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar configuración'}
          </button>
        </>
      )}
    </div>
  )
}
