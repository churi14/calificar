'use client'

import React, { useState, useEffect } from 'react'

// ── tipos y constantes ────────────────────────────────────────────────────────
type SpinPrize = {
  id:             string
  label:          string
  type:           'stamps' | 'coupon' | 'none'
  value:          number
  probability:    number
  color:          string
  coupon_prefix?: string
}

const PRIZE_COLORS = [
  '#7C3AED', '#10B981', '#F59E0B', '#EF4444',
  '#3B82F6', '#EC4899', '#14B8A6', '#F97316',
]

const DEFAULT_PRIZES: SpinPrize[] = [
  { id: '1', label: '2 sellos',           type: 'stamps', value: 2, probability: 25, color: '#7C3AED' },
  { id: '2', label: '1 sello',            type: 'stamps', value: 1, probability: 35, color: '#10B981' },
  { id: '3', label: '¡Premio especial!',  type: 'coupon', value: 0, probability: 10, color: '#F59E0B', coupon_prefix: 'PREMIO' },
  { id: '4', label: 'Suerte próxima vez', type: 'none',   value: 0, probability: 30, color: '#6B7280' },
]

// ── rueda SVG ─────────────────────────────────────────────────────────────────
function WheelPreview({ prizes }: { prizes: SpinPrize[] }) {
  const total = prizes.reduce((s, p) => s + p.probability, 0) || 1
  let cumAngle = 0
  const segments = prizes.map(p => {
    const angle = (p.probability / total) * 360
    const start = cumAngle
    cumAngle += angle
    return { ...p, startAngle: start, angle }
  })

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  const cx = 120, cy = 120, r = 110

  return (
    <svg viewBox="0 0 240 240" className="w-full max-w-[220px] mx-auto drop-shadow-xl">
      {segments.map((seg, i) => {
        const start = polarToCartesian(cx, cy, r, seg.startAngle)
        const end   = polarToCartesian(cx, cy, r, seg.startAngle + seg.angle)
        const large = seg.angle > 180 ? 1 : 0
        const d     = `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y} Z`
        const midAngle = seg.startAngle + seg.angle / 2
        const txtR     = r * 0.65
        const txt      = polarToCartesian(cx, cy, txtR, midAngle)
        const rotate   = midAngle - 90
        const short    = seg.label.length > 10 ? seg.label.slice(0, 9) + '…' : seg.label
        return (
          <g key={i}>
            <path d={d} fill={seg.color} stroke="white" strokeWidth="2" />
            <text
              x={txt.x} y={txt.y}
              fill="white"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${rotate}, ${txt.x}, ${txt.y})`}
              style={{ pointerEvents: 'none' }}
            >
              {short}
            </text>
          </g>
        )
      })}
      {/* Centro */}
      <circle cx={cx} cy={cy} r={16} fill="white" stroke="#e5e7eb" strokeWidth="2" />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="14">🎰</text>
      {/* Puntero */}
      <polygon points={`${cx},${cy - r - 6} ${cx - 8},${cy - r + 10} ${cx + 8},${cy - r + 10}`} fill="#1f2937" />
    </svg>
  )
}

// ── props ─────────────────────────────────────────────────────────────────────
interface ViewRuletaProps {
  selectedProgram: string | null
  isPro: boolean
}

// ── componente ────────────────────────────────────────────────────────────────
export default function ViewRuleta({ selectedProgram, isPro }: ViewRuletaProps) {
  const [cfg, setCfg] = useState<{
    enabled:    boolean
    frequency:  'daily' | 'weekly'
    prizes:     SpinPrize[]
  }>({ enabled: false, frequency: 'daily', prizes: DEFAULT_PRIZES })
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)
  const [editingIdx, setEditingIdx] = useState<number | null>(null)

  useEffect(() => {
    if (!selectedProgram) return
    fetch(`/api/fidelizacion/spin-wheel?program_id=${selectedProgram}&owner=1`)
      .then(r => r.json())
      .then(d => {
        if (d.settings)
          setCfg(c => ({
            ...c,
            ...d.settings,
            prizes: d.settings.prizes?.length ? d.settings.prizes : DEFAULT_PRIZES,
          }))
      })
  }, [selectedProgram])

  async function save() {
    setSaving(true)
    await fetch('/api/fidelizacion/spin-wheel', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ program_id: selectedProgram, ...cfg }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function addPrize() {
    if (cfg.prizes.length >= 8) return
    const newPrize: SpinPrize = {
      id:          Date.now().toString(),
      label:       'Nuevo premio',
      type:        'stamps',
      value:       1,
      probability: 20,
      color:       PRIZE_COLORS[cfg.prizes.length % PRIZE_COLORS.length],
    }
    setCfg(c => ({ ...c, prizes: [...c.prizes, newPrize] }))
    setEditingIdx(cfg.prizes.length)
  }

  function removePrize(idx: number) {
    if (cfg.prizes.length <= 2) return
    setCfg(c => ({ ...c, prizes: c.prizes.filter((_, i) => i !== idx) }))
    setEditingIdx(null)
  }

  function updatePrize(idx: number, patch: Partial<SpinPrize>) {
    setCfg(c => ({ ...c, prizes: c.prizes.map((p, i) => i === idx ? { ...p, ...patch } : p) }))
  }

  const totalProb = cfg.prizes.reduce((s, p) => s + (p.probability || 0), 0)
  const probOk    = totalProb === 100

  return (
    <div className="p-4 md:p-8 w-full">
      <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-1">Ruleta de la suerte</h1>
      <p className="text-zinc-400 dark:text-gray-500 text-sm mb-6">
        Los clientes giran una vez al día (o semana) para ganar premios. Configurá los segmentos y sus probabilidades.
      </p>

      {!isPro && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <span className="text-xl">🔒</span>
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Función Pro</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">La ruleta está disponible a partir del plan Pro.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Panel izquierdo: config */}
        <div className="flex-1 space-y-4">

          {/* Toggle + frecuencia */}
          <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="font-semibold text-zinc-800 dark:text-gray-100">Activar ruleta</p>
                <p className="text-xs text-zinc-400 dark:text-gray-500 mt-0.5">Muestra el botón "Girar" en la tarjeta del cliente</p>
              </div>
              <button
                onClick={() => setCfg(c => ({ ...c, enabled: !c.enabled }))}
                className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${cfg.enabled ? 'bg-violet-600' : 'bg-zinc-200 dark:bg-gray-700'}`}
              >
                <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${cfg.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-600 dark:text-gray-400 mb-2">Frecuencia de giro</p>
              <div className="flex gap-2">
                {(['daily', 'weekly'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setCfg(c => ({ ...c, frequency: f }))}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                      cfg.frequency === f
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'border-zinc-200 dark:border-gray-700 text-zinc-500 dark:text-gray-400 hover:border-violet-300 dark:hover:border-violet-600'
                    }`}
                  >
                    {f === 'daily' ? '1 vez por día' : '1 vez por semana'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lista de premios */}
          <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-zinc-800 dark:text-gray-100">Premios ({cfg.prizes.length}/8)</p>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${probOk ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'}`}>
                  Σ {totalProb}% {probOk ? '✓' : '≠ 100'}
                </span>
                {cfg.prizes.length < 8 && (
                  <button
                    onClick={addPrize}
                    className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-800 bg-violet-50 dark:bg-violet-950 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    + Agregar
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {cfg.prizes.map((prize, idx) => (
                <div key={prize.id}>
                  <button
                    onClick={() => setEditingIdx(editingIdx === idx ? null : idx)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: prize.color }} />
                    <span className="flex-1 text-sm font-medium text-zinc-800 dark:text-gray-100 truncate">{prize.label}</span>
                    <span className="text-xs text-zinc-400 dark:text-gray-500 flex-shrink-0">{prize.probability}%</span>
                    <span className="text-zinc-300 dark:text-gray-600 text-xs">{editingIdx === idx ? '▲' : '▼'}</span>
                  </button>

                  {editingIdx === idx && (
                    <div className="mt-1 p-4 bg-zinc-50 dark:bg-gray-800 rounded-xl space-y-3">
                      {/* Label */}
                      <div>
                        <label className="text-xs font-semibold text-zinc-500 dark:text-gray-400 block mb-1">Nombre del premio</label>
                        <input
                          type="text"
                          value={prize.label}
                          maxLength={24}
                          onChange={e => updatePrize(idx, { label: e.target.value })}
                          className="w-full border border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-zinc-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400 transition-colors"
                        />
                      </div>

                      {/* Tipo */}
                      <div>
                        <label className="text-xs font-semibold text-zinc-500 dark:text-gray-400 block mb-1">Tipo de premio</label>
                        <div className="flex gap-2">
                          {(['stamps', 'coupon', 'none'] as const).map(t => (
                            <button
                              key={t}
                              onClick={() => updatePrize(idx, { type: t })}
                              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                                prize.type === t
                                  ? 'bg-violet-600 text-white border-violet-600'
                                  : 'border-zinc-200 dark:border-gray-700 text-zinc-500 dark:text-gray-400'
                              }`}
                            >
                              {t === 'stamps' ? '🎟 Sellos' : t === 'coupon' ? '🎁 Cupón' : '❌ Sin premio'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Cantidad de sellos */}
                      {prize.type === 'stamps' && (
                        <div>
                          <label className="text-xs font-semibold text-zinc-500 dark:text-gray-400 block mb-1">Cantidad de sellos</label>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updatePrize(idx, { value: Math.max(1, prize.value - 1) })}
                              className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-gray-700 text-zinc-700 dark:text-gray-300 font-bold transition-colors hover:bg-zinc-300 dark:hover:bg-gray-600"
                            >
                              −
                            </button>
                            <span className="text-xl font-extrabold text-violet-700 dark:text-violet-400 w-8 text-center">{prize.value}</span>
                            <button
                              onClick={() => updatePrize(idx, { value: Math.min(10, prize.value + 1) })}
                              className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-gray-700 text-zinc-700 dark:text-gray-300 font-bold transition-colors hover:bg-zinc-300 dark:hover:bg-gray-600"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Prefijo cupón */}
                      {prize.type === 'coupon' && (
                        <div>
                          <label className="text-xs font-semibold text-zinc-500 dark:text-gray-400 block mb-1">Prefijo del código (hasta 6 letras)</label>
                          <input
                            type="text"
                            value={prize.coupon_prefix ?? ''}
                            maxLength={6}
                            placeholder="CAFE, DESC20, POSTRE…"
                            onChange={e => updatePrize(idx, { coupon_prefix: e.target.value.toUpperCase().replace(/\s/g, '') })}
                            className="w-full border border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-zinc-900 dark:text-white rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:border-violet-400 transition-colors"
                          />
                          <p className="text-xs text-zinc-400 dark:text-gray-500 mt-1">El código final será algo como CAFE-A3X1-QW2P</p>
                        </div>
                      )}

                      {/* Probabilidad */}
                      <div>
                        <label className="text-xs font-semibold text-zinc-500 dark:text-gray-400 block mb-1">
                          Probabilidad: {prize.probability}%
                        </label>
                        <input
                          type="range"
                          min={1}
                          max={90}
                          value={prize.probability}
                          onChange={e => updatePrize(idx, { probability: parseInt(e.target.value) })}
                          className="w-full accent-violet-600"
                        />
                      </div>

                      {/* Color del segmento */}
                      <div>
                        <label className="text-xs font-semibold text-zinc-500 dark:text-gray-400 block mb-2">Color del segmento</label>
                        <div className="flex gap-2 flex-wrap">
                          {PRIZE_COLORS.map(c => (
                            <button
                              key={c}
                              onClick={() => updatePrize(idx, { color: c })}
                              className={`w-7 h-7 rounded-full border-2 transition-transform ${prize.color === c ? 'border-zinc-900 dark:border-white scale-110' : 'border-transparent'}`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>

                      {cfg.prizes.length > 2 && (
                        <button
                          onClick={() => removePrize(idx)}
                          className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold transition-colors"
                        >
                          🗑 Eliminar este premio
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!probOk && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-3">
                Las probabilidades suman {totalProb}%. Ajustalas para que sumen exactamente 100%.
              </p>
            )}
          </div>

          <button
            onClick={save}
            disabled={saving || !probOk}
            className="w-full py-3 rounded-2xl text-white font-bold text-sm transition-colors disabled:opacity-50"
            style={{ background: saved ? '#10B981' : '#7C3AED' }}
          >
            {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar configuración'}
          </button>
        </div>

        {/* Panel derecho: preview */}
        <div className="lg:w-56 flex flex-col items-center gap-4">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500">Vista previa</p>
          <WheelPreview prizes={cfg.prizes} />
          <p className="text-xs text-zinc-400 dark:text-gray-500 text-center leading-relaxed">
            Así verá el cliente la ruleta antes de girar.
          </p>
        </div>
      </div>
    </div>
  )
}
