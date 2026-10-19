'use client'

import React, { useState, useEffect } from 'react'
import Toggle from '@/components/dashboard/ui/Toggle'

// ── props ─────────────────────────────────────────────────────────────────────
interface ViewReferenciasProps {
  selectedProgram: string | null
  isPro: boolean
  accessToken?: string
}

// ── componente ────────────────────────────────────────────────────────────────
export default function ViewReferencias({ selectedProgram, isPro, accessToken }: ViewReferenciasProps) {
  const [cfg, setCfg] = useState({ enabled: false, referrer_stamps: 1, referred_stamps: 1 })
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const [saveError, setSaveError] = useState('')

  // La API exige el token del dueño del programa
  const authHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  }

  useEffect(() => {
    if (!selectedProgram) return
    fetch(`/api/fidelizacion/referral?program_id=${selectedProgram}`, { headers: authHeaders })
      .then(r => r.json())
      .then(d => { if (d.settings) setCfg(c => ({ ...c, ...d.settings })) })
  }, [selectedProgram, accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  async function save() {
    setSaving(true)
    setSaveError('')
    const r = await fetch('/api/fidelizacion/referral', {
      method:  'POST',
      headers: authHeaders,
      body:    JSON.stringify({ program_id: selectedProgram, ...cfg }),
    })
    setSaving(false)
    if (!r.ok) {
      setSaveError(r.status === 401 ? 'No autorizado. Volvé a iniciar sesión.' : 'No se pudo guardar. Intentá de nuevo.')
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  // ── stepper helper ──
  const Stepper = ({
    label, hint, value, onChange, min = 1, max = 10,
  }: {
    label: string; hint: string; value: number; onChange: (v: number) => void; min?: number; max?: number
  }) => (
    <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5 mb-4">
      <p className="font-semibold text-zinc-800 dark:text-gray-100 mb-1">{label}</p>
      <p className="text-xs text-zinc-400 dark:text-gray-500 mb-4">{hint}</p>
      <div className="flex items-center gap-4">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-gray-800 text-zinc-700 dark:text-gray-300 font-bold text-lg hover:bg-zinc-200 dark:hover:bg-gray-700 transition-colors"
        >
          −
        </button>
        <span className="text-3xl font-extrabold text-violet-700 dark:text-violet-400 w-12 text-center tabular-nums">
          {value}
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-gray-800 text-zinc-700 dark:text-gray-300 font-bold text-lg hover:bg-zinc-200 dark:hover:bg-gray-700 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  )

  return (
    <div className="p-4 md:p-8 w-full">
      <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-1">Referencias digitales</h1>
      <p className="text-zinc-400 dark:text-gray-500 text-sm mb-6">
        Cada cliente tiene un link único para compartir. Cuando alguien se une por ese link, ambos ganan sellos extra.
      </p>

      {!isPro && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <span className="text-xl">🔒</span>
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Función Pro</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              Las referencias digitales están disponibles a partir del plan Pro.
            </p>
          </div>
        </div>
      )}

      {/* Cómo funciona */}
      <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500 mb-3">CÓMO FUNCIONA</p>
        <div className="space-y-3">
          {[
            { n: '1', text: 'Cada cliente tiene un link único en su tarjeta (calificar.com.ar/ref/xxxxxxxx).' },
            { n: '2', text: 'Lo comparte con amigos. El amigo abre el link y se une al programa.' },
            { n: '3', text: 'Al registrarse, ambos reciben automáticamente los sellos bonus que configuraste.' },
          ].map(s => (
            <div key={s.n} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {s.n}
              </span>
              <p className="text-sm text-zinc-600 dark:text-gray-400">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Toggle activar */}
      <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5 mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-zinc-800 dark:text-gray-100">Activar referencias</p>
          <p className="text-xs text-zinc-400 dark:text-gray-500 mt-0.5">Habilita el botón de compartir en la tarjeta de cada cliente</p>
        </div>
        <Toggle checked={cfg.enabled} onChange={enabled => setCfg(c => ({ ...c, enabled }))} aria-label="Activar referencias" />
      </div>

      {cfg.enabled && (
        <>
          <Stepper
            label="Sellos para quien refiere"
            hint="Cuántos sellos gana el cliente que compartió el link cuando el amigo se registra"
            value={cfg.referrer_stamps}
            onChange={v => setCfg(c => ({ ...c, referrer_stamps: v }))}
          />
          <Stepper
            label="Sellos de bienvenida para el nuevo cliente"
            hint="Cuántos sellos recibe el amigo al registrarse con el link"
            value={cfg.referred_stamps}
            onChange={v => setCfg(c => ({ ...c, referred_stamps: v }))}
          />
        </>
      )}

      <button
        onClick={save}
        disabled={saving}
        className="w-full py-3 rounded-2xl text-white font-bold text-sm transition-colors disabled:opacity-50"
        style={{ background: saved ? '#10B981' : '#7C3AED' }}
      >
        {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar configuración'}
      </button>
      {saveError && <p className="text-sm text-red-500 mt-2">{saveError}</p>}
    </div>
  )
}
