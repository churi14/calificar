'use client'

import React, { useState, useEffect } from 'react'

// ── tipos locales ─────────────────────────────────────────────────────────────
type InsightsData = {
  period_days:        number
  total_stamps:       number
  total_cards:        number
  active_clients:     number
  conversion_rate:    number
  avg_return_days:    number | null
  peak_hour:          number
  peak_day:           string
  by_hour:            number[]
  by_dow:             { label: string; count: number }[]
  new_clients_weekly: { week: string; count: number }[]
}

type AdvancedData = {
  trend: {
    stamps:         { cur: number; prev: number; pct: number }
    active_clients: { cur: number; prev: number; pct: number }
    new_clients:    { cur: number; prev: number; pct: number }
    rewards:        { cur: number; prev: number; pct: number }
  }
  funnel:             { stage: string; count: number; pct: number }[]
  stamp_distribution: { stamps: number; count: number; label: string }[]
  top_clients:        { name: string; visits: number; stamps: number }[]
  churn_risk:         number
  avg_visits:         number
}

// ── sub-gráficos ──────────────────────────────────────────────────────────────
function BarChart({ data, color = '#7C3AED' }: { data: { label: string; count: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div className="flex items-end gap-1 h-24 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-1">
          <div
            className="w-full rounded-t-sm transition-all"
            style={{
              height: `${Math.round((d.count / max) * 80)}px`,
              minHeight: d.count > 0 ? '4px' : '0',
              background: color,
              opacity: d.count === max ? 1 : 0.4,
            }}
          />
          <span className="text-[9px] text-zinc-400 dark:text-gray-500 leading-none">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function HourChart({ data }: { data: number[] }) {
  const max    = Math.max(...data, 1)
  const labels = data.map((_, i) => i % 6 === 0 ? `${i}h` : '')
  return (
    <div className="flex items-end gap-0.5 h-24 w-full">
      {data.map((count, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-1">
          <div
            className="w-full rounded-t-sm transition-all"
            style={{
              height: `${Math.round((count / max) * 80)}px`,
              minHeight: count > 0 ? '3px' : '0',
              background: '#7C3AED',
              opacity: count === max ? 1 : 0.35,
            }}
          />
          <span className="text-[8px] text-zinc-400 dark:text-gray-500 leading-none">{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

function WeekChart({ data }: { data: { week: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div className="flex items-end gap-1 h-24 w-full">
      {data.map((d, i) => {
        const date  = new Date(d.week)
        const label = `${date.getDate()}/${date.getMonth() + 1}`
        return (
          <div key={i} className="flex flex-col items-center flex-1 gap-1">
            <div
              className="w-full rounded-t-sm transition-all"
              style={{
                height: `${Math.round((d.count / max) * 80)}px`,
                minHeight: d.count > 0 ? '4px' : '0',
                background: '#10B981',
                opacity: 0.5 + 0.5 * (d.count / max),
              }}
            />
            <span className="text-[9px] text-zinc-400 dark:text-gray-500 leading-none">{label}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── props ─────────────────────────────────────────────────────────────────────
interface ViewActivityInsightsProps {
  selectedProgram: string | null
  isPro: boolean
  accessToken: string
}

// ── componente ────────────────────────────────────────────────────────────────
export default function ViewActivityInsights({ selectedProgram, isPro, accessToken }: ViewActivityInsightsProps) {
  const [data,       setData]       = useState<InsightsData | null>(null)
  const [loading,    setLoading]    = useState(false)
  const [period,     setPeriod]     = useState(30)
  const [tab,        setTab]        = useState<'basic' | 'advanced'>('basic')
  const [advData,    setAdvData]    = useState<AdvancedData | null>(null)
  const [advLoading, setAdvLoading] = useState(false)

  useEffect(() => {
    if (!selectedProgram || !accessToken) return
    setLoading(true)
    fetch(`/api/fidelizacion/insights?program_id=${selectedProgram}&days=${period}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.json())
      .then(d => { if (!d?.error) setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [selectedProgram, period, accessToken])

  useEffect(() => {
    if (!selectedProgram || tab !== 'advanced') return
    setAdvLoading(true)
    fetch(`/api/fidelizacion/insights/advanced?program_id=${selectedProgram}&days=${period}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.json())
      .then(d => { setAdvData(d); setAdvLoading(false) })
      .catch(() => setAdvLoading(false))
  }, [selectedProgram, period, tab, accessToken])

  function formatHour(h: number) {
    if (h === 0)  return '12 AM'
    if (h < 12)   return `${h} AM`
    if (h === 12) return '12 PM'
    return `${h - 12} PM`
  }

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Activity Insights</h1>
        {/* Selector de período */}
        <div className="flex gap-1">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setPeriod(d)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                period === d
                  ? 'bg-violet-600 text-white'
                  : 'bg-zinc-100 dark:bg-gray-800 text-zinc-500 dark:text-gray-400 hover:bg-zinc-200 dark:hover:bg-gray-700'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>
      <p className="text-zinc-400 dark:text-gray-500 text-sm mb-6">
        Últimos {period} días · {data?.total_stamps ?? 0} sellos cargados
      </p>

      {!isPro && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <span className="text-xl">🔒</span>
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Función Pro</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Activity Insights está disponible a partir del plan Pro.</p>
          </div>
        </div>
      )}

      {/* Tabs Básico / Avanzado */}
      <div className="flex gap-1 bg-zinc-100 dark:bg-gray-800 rounded-xl p-1 w-fit mb-5">
        {(['basic', 'advanced'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              tab === t
                ? 'bg-white dark:bg-gray-700 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-gray-400 hover:text-zinc-700 dark:hover:text-gray-200'
            }`}
          >
            {t === 'basic' ? 'Básico' : 'Avanzado'}
          </button>
        ))}
      </div>

      {/* ── PANEL BÁSICO ── */}
      {tab === 'basic' && (
        <>
          {loading && (
            <div className="flex items-center justify-center h-40 text-zinc-400 dark:text-gray-500 text-sm">
              Cargando datos...
            </div>
          )}
          {!loading && data && (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'CLIENTES ACTIVOS',   value: data.active_clients,                                           sub: `de ${data.total_cards} totales` },
                  { label: 'CONVERSIÓN AL PREMIO', value: `${data.conversion_rate}%`,                                   sub: 'completaron la tarjeta' },
                  { label: 'RETORNO PROMEDIO',    value: data.avg_return_days ? `${data.avg_return_days}d` : '—',       sub: 'días entre visitas' },
                  { label: 'HORA PICO',           value: formatHour(data.peak_hour),                                    sub: `más sellos a las ${formatHour(data.peak_hour)}` },
                ].map(k => (
                  <div key={k.label} className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-4">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500 mb-1">{k.label}</p>
                    <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">{k.value}</p>
                    <p className="text-xs text-zinc-400 dark:text-gray-500 mt-0.5">{k.sub}</p>
                  </div>
                ))}
              </div>

              {/* Sellos por hora */}
              <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5 mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500 mb-1">SELLOS POR HORA DEL DÍA</p>
                <p className="text-xs text-zinc-400 dark:text-gray-500 mb-4">
                  Hora pico: <span className="font-semibold text-violet-600 dark:text-violet-400">{formatHour(data.peak_hour)}</span>
                </p>
                <HourChart data={data.by_hour} />
              </div>

              {/* Sellos por día de la semana */}
              <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5 mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500 mb-1">SELLOS POR DÍA DE LA SEMANA</p>
                <p className="text-xs text-zinc-400 dark:text-gray-500 mb-4">
                  Día más activo: <span className="font-semibold text-violet-600 dark:text-violet-400">{data.peak_day}</span>
                </p>
                <BarChart data={data.by_dow} />
              </div>

              {/* Clientes nuevos por semana */}
              <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500 mb-1">CLIENTES NUEVOS POR SEMANA</p>
                <p className="text-xs text-zinc-400 dark:text-gray-500 mb-4">Últimas 8 semanas</p>
                <WeekChart data={data.new_clients_weekly} />
              </div>
            </>
          )}
        </>
      )}

      {/* ── PANEL AVANZADO ── */}
      {tab === 'advanced' && (
        <>
          {advLoading && (
            <div className="flex items-center justify-center h-40 text-zinc-400 dark:text-gray-500 text-sm">
              Cargando datos avanzados...
            </div>
          )}
          {!advLoading && advData && (
            <>
              {/* Tendencia vs período anterior */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {([
                  { label: 'SELLOS',           key: 'stamps'         },
                  { label: 'CLIENTES ACTIVOS', key: 'active_clients' },
                  { label: 'CLIENTES NUEVOS',  key: 'new_clients'    },
                  { label: 'PREMIOS',          key: 'rewards'        },
                ] as { label: string; key: keyof AdvancedData['trend'] }[]).map(({ label, key }) => {
                  const t  = advData.trend[key]
                  const up = t.pct >= 0
                  return (
                    <div key={key} className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-4">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500 mb-1">{label}</p>
                      <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">{t.cur}</p>
                      <p className={`text-xs font-semibold mt-0.5 flex items-center gap-1 ${up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                        <span>{up ? '▲' : '▼'}</span>
                        <span>{Math.abs(t.pct)}% vs período anterior</span>
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Funnel de conversión */}
              <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5 mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500 mb-4">FUNNEL DE CONVERSIÓN</p>
                <div className="space-y-3">
                  {advData.funnel.map((f, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-zinc-700 dark:text-gray-300 font-medium">{f.stage}</span>
                        <span className="text-zinc-500 dark:text-gray-400">
                          {f.count}{' '}
                          <span className="text-zinc-400 dark:text-gray-500 text-xs">({f.pct}%)</span>
                        </span>
                      </div>
                      <div className="h-2.5 bg-zinc-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${f.pct}%`,
                            background: i === 0 ? '#7C3AED' : i === 1 ? '#8B5CF6' : i === 2 ? '#A78BFA' : '#C4B5FD',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Distribución de sellos */}
              <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5 mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500 mb-4">DISTRIBUCIÓN DE SELLOS (HOY)</p>
                <div className="flex items-end gap-1 h-20">
                  {advData.stamp_distribution.map(b => {
                    const max = Math.max(...advData.stamp_distribution.map(x => x.count), 1)
                    const pct = (b.count / max) * 100
                    return (
                      <div key={b.stamps} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-violet-500 rounded-t"
                          style={{ height: `${pct}%`, minHeight: b.count > 0 ? 4 : 0 }}
                        />
                        <span className="text-[9px] text-zinc-400 dark:text-gray-500">{b.stamps}</span>
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-zinc-400 dark:text-gray-500 mt-2 text-center">
                  Número de sellos actuales de cada cliente
                </p>
              </div>

              {/* Top 5 + Churn */}
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                {/* Top clientes */}
                <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500 mb-4">TOP 5 CLIENTES</p>
                  <div className="space-y-3">
                    {advData.top_clients.map((c, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-[10px] font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-zinc-800 dark:text-gray-100 truncate">{c.name || '—'}</p>
                          <p className="text-xs text-zinc-400 dark:text-gray-500">{c.visits} visitas · {c.stamps} sellos</p>
                        </div>
                      </div>
                    ))}
                    {advData.top_clients.length === 0 && (
                      <p className="text-sm text-zinc-400 dark:text-gray-500">Sin datos aún</p>
                    )}
                  </div>
                </div>

                {/* Riesgo de churn */}
                <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500 mb-4">RIESGO DE CHURN</p>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-extrabold border-4 shrink-0"
                      style={{
                        borderColor: advData.churn_risk >= 60 ? '#EF4444' : advData.churn_risk >= 30 ? '#F59E0B' : '#10B981',
                        color:       advData.churn_risk >= 60 ? '#EF4444' : advData.churn_risk >= 30 ? '#F59E0B' : '#10B981',
                      }}
                    >
                      {advData.churn_risk}%
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-800 dark:text-gray-100">
                        {advData.churn_risk >= 60 ? 'Riesgo alto' : advData.churn_risk >= 30 ? 'Riesgo medio' : 'Riesgo bajo'}
                      </p>
                      <p className="text-xs text-zinc-400 dark:text-gray-500 mt-1">
                        Clientes sin actividad en los últimos 30 días. Promedio de {advData.avg_visits} visitas por cliente activo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          {!advLoading && !advData && (
            <div className="flex items-center justify-center h-40 text-zinc-400 dark:text-gray-500 text-sm">
              No hay datos para mostrar.
            </div>
          )}
        </>
      )}
    </div>
  )
}
