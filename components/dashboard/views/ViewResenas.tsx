'use client'

import React, { useState, useEffect } from 'react'

// ── props ─────────────────────────────────────────────────────────────────────
interface ViewResenasProps {
  selectedProgram: string | null
  isPro: boolean
  accessToken?: string
}

// ── componente ────────────────────────────────────────────────────────────────
export default function ViewResenas({ selectedProgram, isPro, accessToken }: ViewResenasProps) {
  const [cfg, setCfg] = useState({
    enabled:         false,
    google_maps_url: '',
    push_title:      '¡Ganaste tu premio! 🏆',
    push_body:       '¿Te gustó? Tu opinión nos ayuda mucho. ¡Dejanos una reseña en Google!',
  })
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [urlError, setUrlError] = useState('')
  const [saveError, setSaveError] = useState('')

  // La API exige el token del dueño del programa
  const authHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  }

  useEffect(() => {
    if (!selectedProgram) return
    fetch(`/api/fidelizacion/google-review?program_id=${selectedProgram}`, { headers: authHeaders })
      .then(r => r.json())
      .then(d => { if (d.config) setCfg(c => ({ ...c, ...d.config })) })
  }, [selectedProgram, accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  function validateUrl(url: string) {
    if (!url) return ''
    if (
      !url.startsWith('https://maps.google.com') &&
      !url.startsWith('https://g.page') &&
      !url.includes('google.com/maps')
    ) {
      return 'Tiene que ser una URL de Google Maps (maps.google.com o g.page/...)'
    }
    return ''
  }

  async function save() {
    const err = validateUrl(cfg.google_maps_url)
    if (err) { setUrlError(err); return }
    setUrlError('')
    setSaving(true)
    setSaveError('')
    const r = await fetch('/api/fidelizacion/google-review', {
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

  return (
    <div className="p-4 md:p-8 w-full">
      <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-1">Potenciador de reseñas Google</h1>
      <p className="text-zinc-400 dark:text-gray-500 text-sm mb-6">
        Cuando un cliente completa su tarjeta, le mandamos un push invitándolo a dejarte una reseña.
      </p>

      {!isPro && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <span className="text-xl">🔒</span>
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Función Pro</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              El potenciador de reseñas está disponible a partir del plan Pro.
            </p>
          </div>
        </div>
      )}

      {/* Cómo funciona */}
      <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500 mb-3">CÓMO FUNCIONA</p>
        <div className="space-y-3">
          {[
            { n: '1', text: 'El cliente completa su tarjeta y canjea su premio.' },
            { n: '2', text: 'Al instante le llega un push con el mensaje que configuraste y un link directo a tu reseña de Google.' },
            { n: '3', text: 'Con un toque deja su reseña — el momento de mayor satisfacción del cliente es justo después de ganar.' },
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

      {/* Toggle */}
      <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-white">Activar potenciador de reseñas</p>
            <p className="text-xs text-zinc-400 dark:text-gray-500 mt-0.5">Se dispara automáticamente al completar la tarjeta</p>
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

      {/* URL de Google Maps */}
      <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5 mb-4">
        <p className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Tu link de reseña en Google</p>
        <p className="text-xs text-zinc-400 dark:text-gray-500 mb-3">
          Buscá tu negocio en Google Maps → compartir → copiar link. O andá a{' '}
          <a
            href="https://business.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-600 dark:text-violet-400 underline"
          >
            business.google.com
          </a>{' '}
          → Pedir reseñas.
        </p>
        <input
          type="url"
          disabled={!isPro}
          value={cfg.google_maps_url}
          onChange={e => { setCfg(c => ({ ...c, google_maps_url: e.target.value })); setUrlError('') }}
          placeholder="https://g.page/r/tu-negocio/review"
          className="w-full text-sm border border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-gray-600 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-400 disabled:opacity-50 transition-colors"
        />
        {urlError && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{urlError}</p>}
      </div>

      {/* Mensaje del push */}
      <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5 mb-6">
        <p className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Mensaje del push</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-zinc-500 dark:text-gray-400 mb-1 block">Título</label>
            <input
              type="text"
              disabled={!isPro}
              value={cfg.push_title}
              onChange={e => setCfg(c => ({ ...c, push_title: e.target.value }))}
              className="w-full text-sm border border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-gray-600 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-400 disabled:opacity-50 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 dark:text-gray-400 mb-1 block">Cuerpo</label>
            <textarea
              rows={2}
              disabled={!isPro}
              value={cfg.push_body}
              onChange={e => setCfg(c => ({ ...c, push_body: e.target.value }))}
              className="w-full text-sm border border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-gray-600 rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-violet-400 disabled:opacity-50 transition-colors"
            />
          </div>
        </div>
      </div>

      {isPro && (
        <>
          <button
            onClick={save}
            disabled={saving}
            className="w-full py-3 rounded-2xl text-white font-bold text-sm transition-colors disabled:opacity-50"
            style={{ background: saved ? '#10B981' : '#7C3AED' }}
          >
            {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar configuración'}
          </button>
          {saveError && <p className="text-sm text-red-500 mt-2">{saveError}</p>}
        </>
      )}
    </div>
  )
}
