'use client'

import { useEffect, useState } from 'react'

const STEP_LABELS: Record<string, string> = {
  tipo_negocio:        '1. Tipo de negocio',
  tipo_programa:       '2. Tipo de programa',
  diseno_tarjeta:      '3. Diseño de tarjeta',
  donde_vendes:        '4. Dónde vendés',
  datos_clientes:      '5. Datos de clientes',
  cantidad_sellos:     '6. Cantidad de sellos',
  premio_final:        '7. Premio final',
  premios_intermedios: '8. Premios intermedios',
  cumpleanios:         '9. Cumpleaños',
  nombre_negocio:      '10. Nombre del negocio',
  colores:             '11. Colores',
  registro:            '12. Registro',
}

const TIPO_LABELS: Record<string, string> = {
  cafeteria: 'Cafetería ☕', restaurante: 'Restaurante 🍽️',
  panaderia: 'Panadería 🥐', bar: 'Bar 🍺', salon: 'Salón ✂️',
  belleza: 'Belleza 💆', tienda: 'Tienda 🛍️', fitness: 'Fitness 🏋️',
  mascotas: 'Mascotas 🐾', otro: 'Otro 🔗',
}

const COLOR_LABELS: Record<string, { label: string; hex: string }> = {
  violet: { label: 'Violeta', hex: '#7C3AED' },
  navy:   { label: 'Noche',   hex: '#1E293B' },
  rose:   { label: 'Rosa',    hex: '#E11D48' },
  teal:   { label: 'Verde',   hex: '#0D9488' },
  orange: { label: 'Naranja', hex: '#EA580C' },
  blue:   { label: 'Azul',    hex: '#2563EB' },
}

type FunnelData = {
  steps: { step: number; step_name: string; sessions: number }[]
  total_sessions: number
  registrados: number
  conversion_rate: number
  tipo_negocio: Record<string, number>
  colores: Record<string, number>
  cumple: Record<string, number>
  stamps_goal_dist: Record<number, number>
  auth_methods: Record<string, number>
  recent: { session_id: string; step_name: string; event: string; data: Record<string, unknown>; created_at: string }[]
}

function Bar({ value, max, color = '#7C3AED' }: { value: number; max: number; color?: string }) {
  return (
    <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{ width: `${max > 0 ? Math.round((value / max) * 100) : 0}%`, background: color }}
      />
    </div>
  )
}

export default function FunnelPage() {
  const [data, setData] = useState<FunnelData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/funnel')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) return <div className="p-8 text-zinc-500">Error cargando datos.</div>

  const maxSessions = data.steps[0]?.sessions ?? 1

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900">Funnel de Onboarding</h1>
            <p className="text-zinc-500 text-sm">¿Dónde abandona la gente el wizard?</p>
          </div>
          <button
            onClick={() => { setLoading(true); fetch('/api/admin/funnel').then(r => r.json()).then(d => { setData(d); setLoading(false) }) }}
            className="text-xs text-violet-600 hover:text-violet-700 font-semibold border border-violet-200 px-3 py-1.5 rounded-xl"
          >
            ↻ Actualizar
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Sesiones totales',  value: data.total_sessions, sub: 'entraron al wizard' },
            { label: 'Se registraron',    value: data.registrados,    sub: 'completaron todo' },
            { label: 'Conversión',        value: `${data.conversion_rate}%`, sub: 'inicio → registro' },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-2xl border border-zinc-200 p-4">
              <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-1">{k.label}</p>
              <p className="text-3xl font-extrabold text-zinc-900">{k.value}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Funnel steps */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 mb-5">
          <h2 className="text-sm font-bold text-zinc-700 uppercase tracking-wide mb-4">Pasos del wizard</h2>
          {data.steps.length === 0 ? (
            <p className="text-zinc-400 text-sm text-center py-4">Sin datos todavía. Esperá que alguien entre al onboarding.</p>
          ) : (
            <div className="space-y-3">
              {data.steps.map((s, i) => {
                const prev = i > 0 ? data.steps[i - 1].sessions : s.sessions
                const dropPct = prev > 0 ? Math.round(((prev - s.sessions) / prev) * 100) : 0
                return (
                  <div key={s.step} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-400 w-4 text-right">{s.step + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-zinc-700">{STEP_LABELS[s.step_name] ?? s.step_name}</span>
                        <span className="font-bold text-zinc-900">{s.sessions}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bar value={s.sessions} max={maxSessions} />
                        {i > 0 && dropPct > 0 && (
                          <span className={`text-xs font-bold whitespace-nowrap ${dropPct > 30 ? 'text-red-500' : dropPct > 15 ? 'text-amber-500' : 'text-zinc-400'}`}>
                            −{dropPct}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-5">
          {/* Tipo de negocio */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <h2 className="text-sm font-bold text-zinc-700 uppercase tracking-wide mb-3">Tipo de negocio</h2>
            {Object.keys(data.tipo_negocio).length === 0 ? (
              <p className="text-zinc-400 text-sm">Sin datos aún.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(data.tipo_negocio)
                  .sort(([,a],[,b]) => b - a)
                  .map(([tipo, count]) => {
                    const maxT = Math.max(...Object.values(data.tipo_negocio))
                    return (
                      <div key={tipo} className="flex items-center gap-2">
                        <span className="text-xs text-zinc-600 w-28 truncate">{TIPO_LABELS[tipo] ?? tipo}</span>
                        <Bar value={count} max={maxT} />
                        <span className="text-xs font-bold text-zinc-700 w-5 text-right">{count}</span>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Sellos goal */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <h2 className="text-sm font-bold text-zinc-700 uppercase tracking-wide mb-3">Sellos elegidos</h2>
            {Object.keys(data.stamps_goal_dist).length === 0 ? (
              <p className="text-zinc-400 text-sm">Sin datos aún.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(data.stamps_goal_dist)
                  .sort(([a],[b]) => Number(a) - Number(b))
                  .map(([g, count]) => {
                    const maxG = Math.max(...Object.values(data.stamps_goal_dist))
                    return (
                      <div key={g} className="flex items-center gap-2">
                        <span className="text-xs text-zinc-600 w-16">{g} sellos</span>
                        <Bar value={count} max={maxG} />
                        <span className="text-xs font-bold text-zinc-700 w-5 text-right">{count}</span>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Colores */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <h2 className="text-sm font-bold text-zinc-700 uppercase tracking-wide mb-3">Colores elegidos</h2>
            {Object.keys(data.colores).length === 0 ? (
              <p className="text-zinc-400 text-sm">Sin datos aún.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(data.colores)
                  .sort(([,a],[,b]) => b - a)
                  .map(([colorId, count]) => {
                    const maxC = Math.max(...Object.values(data.colores))
                    const meta = COLOR_LABELS[colorId]
                    return (
                      <div key={colorId} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: meta?.hex ?? '#999' }} />
                        <span className="text-xs text-zinc-600 w-16">{meta?.label ?? colorId}</span>
                        <Bar value={count} max={maxC} color={meta?.hex} />
                        <span className="text-xs font-bold text-zinc-700 w-5 text-right">{count}</span>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Auth methods + cumple */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-zinc-700 uppercase tracking-wide mb-3">Método de registro</h2>
              {Object.keys(data.auth_methods).length === 0 ? (
                <p className="text-zinc-400 text-sm">Sin datos aún.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(data.auth_methods).map(([m, c]) => {
                    const maxM = Math.max(...Object.values(data.auth_methods))
                    return (
                      <div key={m} className="flex items-center gap-2">
                        <span className="text-xs text-zinc-600 w-16 capitalize">{m === 'google' ? '🔵 Google' : '✉️ Email'}</span>
                        <Bar value={c} max={maxM} />
                        <span className="text-xs font-bold text-zinc-700 w-5 text-right">{c}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-700 uppercase tracking-wide mb-3">Cumpleaños</h2>
              {Object.keys(data.cumple).length === 0 ? (
                <p className="text-zinc-400 text-sm">Sin datos aún.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(data.cumple).map(([v, c]) => {
                    const maxCu = Math.max(...Object.values(data.cumple))
                    return (
                      <div key={v} className="flex items-center gap-2">
                        <span className="text-xs text-zinc-600 w-20">{v === 'celebrate' ? '🎂 Celebrar' : '⏭️ Ahora no'}</span>
                        <Bar value={c} max={maxCu} />
                        <span className="text-xs font-bold text-zinc-700 w-5 text-right">{c}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5">
          <h2 className="text-sm font-bold text-zinc-700 uppercase tracking-wide mb-3">Actividad reciente</h2>
          {data.recent.length === 0 ? (
            <p className="text-zinc-400 text-sm text-center py-4">Sin actividad todavía.</p>
          ) : (
            <div className="space-y-1">
              {data.recent.map((r, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5 border-b border-zinc-50 last:border-0">
                  <span className="text-xs text-zinc-300 font-mono w-16 flex-shrink-0">{r.session_id.slice(0, 8)}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    r.event === 'registered' ? 'bg-green-100 text-green-700' :
                    r.event === 'step_view' ? 'bg-zinc-100 text-zinc-500' :
                    r.event === 'auth_click' ? 'bg-violet-100 text-violet-700' :
                    'bg-blue-50 text-blue-600'
                  }`}>{r.event}</span>
                  <span className="text-xs text-zinc-500 flex-1 truncate">{STEP_LABELS[r.step_name] ?? r.step_name}</span>
                  {r.data && Object.keys(r.data).length > 0 && (
                    <span className="text-xs text-zinc-400 font-mono truncate max-w-[120px]">
                      {JSON.stringify(r.data)}
                    </span>
                  )}
                  <span className="text-xs text-zinc-300 flex-shrink-0">
                    {new Date(r.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
