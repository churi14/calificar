'use client'

import React, { useState, useEffect } from 'react'

// ── tipos ─────────────────────────────────────────────────────────────────────
type SucursalMetrics = {
  program_id: string
  program_name: string
  stamps_goal: number
  total_stamps: number
  active_clients: number
  new_clients: number
  total_clients: number
  conversion_rate: number
  peak_hour: number
  peak_day: string
  rewards_redeemed: number
}

// ── props ─────────────────────────────────────────────────────────────────────
interface ViewMetricasSucursalProps {
  accessToken: string
}

// ── componente ────────────────────────────────────────────────────────────────
export default function ViewMetricasSucursal({ accessToken }: ViewMetricasSucursalProps) {
  const [days, setDays]                       = useState(30)
  const [results, setResults]                 = useState<SucursalMetrics[]>([])
  const [loading, setLoading]                 = useState(false)
  const [upgradeRequired, setUpgradeRequired] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/fidelizacion/insights/multi?days=${days}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.json())
      .then(d => {
        if (d.upgrade_required) { setUpgradeRequired(true); setLoading(false); return }
        setResults(d.results ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [days, accessToken])

  if (upgradeRequired) {
    return (
      <div className="p-4 md:p-8 w-full">
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-1">Métricas por sucursal</h1>
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mt-4 flex items-start gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300">Función Ultimate</p>
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
              La comparativa entre sucursales está disponible en el plan Ultimate. Con Ultimate podés tener programas ilimitados y ver el rendimiento de cada uno de un vistazo.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const PERIOD_OPTIONS = [
    { value: 7,  label: 'Últimos 7 días' },
    { value: 30, label: 'Últimos 30 días' },
    { value: 90, label: 'Últimos 90 días' },
  ]

  const maxStamps  = Math.max(...results.map(r => r.total_stamps), 1)
  const maxClients = Math.max(...results.map(r => r.active_clients), 1)

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Métricas por sucursal</h1>
          <p className="text-zinc-400 dark:text-gray-500 text-sm mt-0.5">Comparativa de rendimiento entre todos tus programas</p>
        </div>
        <div className="flex gap-1 bg-zinc-100 dark:bg-gray-800 rounded-xl p-1">
          {PERIOD_OPTIONS.map(o => (
            <button
              key={o.value}
              onClick={() => setDays(o.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                days === o.value
                  ? 'bg-white dark:bg-gray-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-gray-400 hover:text-zinc-700 dark:hover:text-gray-200'
              }`}
            >
              {o.value === 7 ? '7d' : o.value === 30 ? '30d' : '90d'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-violet-200 dark:border-violet-900 border-t-violet-600 rounded-full animate-spin" />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 dark:text-gray-500">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-sm">No hay datos para mostrar aún.</p>
        </div>
      ) : (
        <>
          {/* Tarjetas comparativas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {results.map(r => (
              <div key={r.program_id} className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                <p className="font-extrabold text-zinc-900 dark:text-white text-base mb-4 truncate">{r.program_name}</p>

                {/* Barra de sellos */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-zinc-500 dark:text-gray-400 mb-1">
                    <span>Sellos cargados</span>
                    <span className="font-bold text-zinc-800 dark:text-gray-200">{r.total_stamps.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-zinc-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-violet-500 transition-all"
                      style={{ width: `${(r.total_stamps / maxStamps) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Barra de clientes activos */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs text-zinc-500 dark:text-gray-400 mb-1">
                    <span>Clientes activos</span>
                    <span className="font-bold text-zinc-800 dark:text-gray-200">{r.active_clients.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-zinc-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all"
                      style={{ width: `${(r.active_clients / maxClients) * 100}%` }}
                    />
                  </div>
                </div>

                {/* KPIs en grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                    <p className="text-lg font-extrabold text-zinc-900 dark:text-white">{r.conversion_rate}%</p>
                    <p className="text-[11px] text-zinc-500 dark:text-gray-400 mt-0.5">Tasa de retorno</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                    <p className="text-lg font-extrabold text-zinc-900 dark:text-white">{r.new_clients}</p>
                    <p className="text-[11px] text-zinc-500 dark:text-gray-400 mt-0.5">Nuevos clientes</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                    <p className="text-lg font-extrabold text-zinc-900 dark:text-white">
                      {r.peak_hour.toString().padStart(2, '0')}:00
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-gray-400 mt-0.5">Hora pico</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                    <p className="text-lg font-extrabold text-zinc-900 dark:text-white">{r.peak_day}</p>
                    <p className="text-[11px] text-zinc-500 dark:text-gray-400 mt-0.5">Día pico</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-gray-800 flex justify-between text-xs text-zinc-400 dark:text-gray-500">
                  <span>{r.total_clients.toLocaleString()} clientes totales</span>
                  <span>{r.rewards_redeemed} premios canjeados</span>
                </div>
              </div>
            ))}
          </div>

          {/* Tabla resumen */}
          <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-gray-800">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500">Resumen comparativo</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500 border-b border-zinc-100 dark:border-gray-800">
                    <th className="text-left px-5 py-3">Programa</th>
                    <th className="text-right px-4 py-3">Sellos</th>
                    <th className="text-right px-4 py-3">Activos</th>
                    <th className="text-right px-4 py-3">Nuevos</th>
                    <th className="text-right px-4 py-3">Retorno</th>
                    <th className="text-right px-4 py-3">Premios</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={r.program_id} className={i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-zinc-50/50 dark:bg-gray-800/50'}>
                      <td className="px-5 py-3 font-semibold text-zinc-800 dark:text-gray-200 max-w-[160px] truncate">{r.program_name}</td>
                      <td className="px-4 py-3 text-right text-zinc-700 dark:text-gray-300">{r.total_stamps.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-zinc-700 dark:text-gray-300">{r.active_clients.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-zinc-700 dark:text-gray-300">{r.new_clients}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${
                          r.conversion_rate >= 50
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : r.conversion_rate >= 20
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-zinc-500 dark:text-gray-400'
                        }`}>
                          {r.conversion_rate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-700 dark:text-gray-300">{r.rewards_redeemed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
