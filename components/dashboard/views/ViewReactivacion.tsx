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
  send_hour:  number   // 0-23, hora de Argentina
  smart_enabled: boolean
  smart_factor:  number  // cuántas veces su frecuencia habitual
  smart_message: string
}

const SMART_DEFAULT_MESSAGE = '¡Hola {nombre}! Hace un tiempito que no te vemos. Tu tarjeta te espera 🎁'

const SMART_FACTORS = [
  { value: 1.5, label: 'Enseguida', hint: 'un poco más de lo normal' },
  { value: 2,   label: 'Normal',    hint: 'el doble de lo normal' },
  { value: 3,   label: 'Con paciencia', hint: 'el triple de lo normal' },
]

type SmartPreview = { available: boolean; count: number; sample: { name: string | null; avg_gap: number; days_since: number }[] }

const REACTIVATION_DEFAULTS: ReactivationCfg = {
  send_hour:          10,
  smart_enabled:      false,
  smart_factor:       2,
  smart_message:      SMART_DEFAULT_MESSAGE,
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
  accessToken?: string
}

const hourLabel = (h: number) => `${String(h).padStart(2, '0')}:00`

// ── componente ────────────────────────────────────────────────────────────────
export default function ViewReactivacion({ selectedProgram, isPro, accessToken }: ViewReactivacionProps) {
  const [cfg,        setCfg]        = useState<ReactivationCfg>(REACTIVATION_DEFAULTS)
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)
  const [saveError,  setSaveError]  = useState('')
  const [hourWarning, setHourWarning] = useState('')
  const [preview,    setPreview]    = useState<SmartPreview | null>(null)
  const [triggering, setTriggering] = useState(false)
  const [triggerMsg, setTriggerMsg] = useState('')

  // La API exige el token del dueño del programa
  const authHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  }

  useEffect(() => {
    if (!selectedProgram) return
    fetch(`/api/fidelizacion/reactivation?program_id=${selectedProgram}`, { headers: authHeaders })
      .then(r => r.json())
      .then(d => {
        if (d.config) setCfg(c => ({
          ...c, ...d.config,
          send_hour: d.config.send_hour ?? 10,
          smart_enabled: d.config.smart_enabled ?? false,
          smart_factor: Number(d.config.smart_factor ?? 2),
          smart_message: d.config.smart_message || SMART_DEFAULT_MESSAGE,
        }))
      })
  }, [selectedProgram, accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cuántos clientes ya pasaron su ritmo habitual (se recalcula al cambiar la sensibilidad)
  useEffect(() => {
    if (!selectedProgram) return
    fetch(`/api/fidelizacion/reactivation?program_id=${selectedProgram}&smart_preview=1&factor=${cfg.smart_factor}`, { headers: authHeaders })
      .then(r => r.json())
      .then(d => setPreview(d))
      .catch(() => setPreview(null))
  }, [selectedProgram, accessToken, cfg.smart_factor]) // eslint-disable-line react-hooks/exhaustive-deps

  async function save() {
    setSaving(true)
    setSaveError('')
    setHourWarning('')
    const r = await fetch('/api/fidelizacion/reactivation', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ program_id: selectedProgram, ...cfg }),
    })
    setSaving(false)
    if (!r.ok) {
      setSaveError(r.status === 401 ? 'No autorizado. Volvé a iniciar sesión.' : 'No se pudo guardar. Intentá de nuevo.')
      return
    }
    const d = await r.json().catch(() => ({}))
    if (d.smart_saved === false) {
      setHourWarning('El resto se guardó, pero el aviso según la frecuencia todavía no está disponible: falta actualizar la base de datos (migración reactivation_smart.sql).')
    } else if (d.send_hour_saved === false) {
      setHourWarning('El resto de la configuración se guardó, pero el horario todavía no se puede guardar: falta actualizar la base de datos (migración reactivation_send_hour.sql).')
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function triggerNow() {
    setTriggering(true)
    const r = await fetch('/api/fidelizacion/reactivation', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ program_id: selectedProgram }),
    })
    const d = await r.json().catch(() => ({}))
    setTriggerMsg(!r.ok ? 'No se pudo ejecutar' : d.sent > 0 ? `✓ ${d.sent} push(es) enviados` : 'Sin clientes para reactivar ahora')
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
            { n: '1', text: 'Cada día el sistema detecta a los clientes que dejaron de venir: los que llevan 5, 15 o 30 días sin sello, o los que pasaron su ritmo habitual.' },
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
            <p className="text-xs text-zinc-400 dark:text-gray-500 mt-0.5">Se envía todos los días a las {hourLabel(cfg.send_hour)} (hora de Argentina)</p>
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

      {/* Horario de envío */}
      <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-white">Horario de envío</p>
            <p className="text-xs text-zinc-400 dark:text-gray-500 mt-0.5">
              Elegí a qué hora llega el push (hora de Argentina). Conviene un rato antes de que abras o antes del horario en que tus clientes suelen pedir.
            </p>
          </div>
          <select
            value={cfg.send_hour}
            disabled={!isPro}
            onChange={e => setCfg(c => ({ ...c, send_hour: Number(e.target.value) }))}
            className="border border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-violet-400 disabled:opacity-50"
          >
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>{hourLabel(h)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Aviso según la frecuencia de cada cliente */}
      <div className="bg-white dark:bg-gray-900 border border-violet-200 dark:border-violet-500/30 rounded-2xl p-5 mb-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-white">⏱️ Aviso según la frecuencia de cada cliente</p>
            <p className="text-xs text-zinc-500 dark:text-gray-400 mt-1 leading-snug">
              Mira cada cuánto suele venir cada cliente y le avisa cuando tarda más de lo normal. Quien viene cada 15 días y lleva un mes sin aparecer recibe el aviso; quien viene una vez al mes, no.
            </p>
          </div>
          <button
            onClick={() => isPro && setCfg(c => ({ ...c, smart_enabled: !c.smart_enabled }))}
            disabled={!isPro}
            className={`relative w-10 h-5 rounded-full shrink-0 transition-colors ${cfg.smart_enabled && isPro ? 'bg-violet-500' : 'bg-zinc-200 dark:bg-gray-700'} disabled:opacity-50`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${cfg.smart_enabled && isPro ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>

        <p className="text-xs font-semibold text-zinc-700 dark:text-gray-300 mb-2">¿Cuándo avisar?</p>
        <div className="flex flex-wrap gap-2 mb-1">
          {SMART_FACTORS.map(f => (
            <button
              key={f.value}
              type="button"
              disabled={!isPro}
              onClick={() => setCfg(c => ({ ...c, smart_factor: f.value }))}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-colors disabled:opacity-50 ${
                cfg.smart_factor === f.value
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300'
                  : 'border-zinc-200 dark:border-gray-700 text-zinc-600 dark:text-gray-300'
              }`}
            >
              {f.label} <span className="text-xs font-medium opacity-70">· {f.hint}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-400 dark:text-gray-500 mb-4">
          Ejemplo: si alguien viene cada 15 días, con esta opción le avisamos a los {Math.round(15 * cfg.smart_factor)} días sin venir.
          Hace falta que tenga al menos 3 visitas para conocer su ritmo, y se avisa una sola vez por ausencia.
        </p>

        <textarea
          rows={2}
          disabled={!isPro}
          value={cfg.smart_message}
          onChange={e => setCfg(c => ({ ...c, smart_message: e.target.value }))}
          className="w-full text-sm border border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-zinc-900 dark:text-white rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-violet-400 disabled:opacity-50 transition-colors"
          placeholder="Mensaje del push..."
        />
        <p className="text-[10px] text-zinc-400 dark:text-gray-500 mt-1">
          Escribí <b>{'{nombre}'}</b> y se reemplaza por el nombre de cada cliente · {cfg.smart_message.length} / 120
        </p>

        {preview?.available && (
          <div className="mt-4 rounded-xl bg-violet-50 dark:bg-violet-500/10 px-4 py-3 text-sm">
            {preview.count === 0 ? (
              <p className="text-zinc-600 dark:text-gray-300">Hoy ningún cliente pasó su ritmo habitual.</p>
            ) : (
              <>
                <p className="font-semibold text-violet-800 dark:text-violet-200">
                  Hoy {preview.count === 1 ? '1 cliente pasó' : `${preview.count} clientes pasaron`} su ritmo habitual
                </p>
                <ul className="mt-1.5 space-y-0.5 text-xs text-zinc-600 dark:text-gray-300">
                  {preview.sample.map((p, i) => (
                    <li key={i}>
                      {p.name?.trim() || 'Cliente'}: viene cada {Math.round(p.avg_gap)} días y lleva {p.days_since} sin venir
                    </li>
                  ))}
                  {preview.count > preview.sample.length && <li>y {preview.count - preview.sample.length} más…</li>}
                </ul>
              </>
            )}
          </div>
        )}
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
          {saveError && <p className="text-sm text-red-500 mt-2">{saveError}</p>}
          {hourWarning && <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">{hourWarning}</p>}
        </>
      )}
    </div>
  )
}
