'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { PLAN_PRICES_ARS, fmtARS, type PaidPlan } from '@/lib/plans'
import { calcRoi, ROI_PRESETS, type RoiPreset, type RoiReward } from '@/lib/roi'

type Initial = {
  presetId?: string
  ticket?: number
  visitsPerDay?: number
  goal?: number
  rewards?: RoiReward[]
}

type Props = {
  /** preview: pocos datos y resultado (home). full: todo editable (registro, panel, página de salones). */
  mode?: 'preview' | 'full'
  initial?: Initial
  /** Botón de abajo (solo preview y registro lo usan) */
  cta?: { href: string; label: string }
  /** Una sola columna (para contenedores angostos como el registro) */
  stacked?: boolean
  className?: string
}

const LIFT_OPTIONS = [
  { value: 10, label: 'Un poco', hint: '+10%' },
  { value: 15, label: 'Normal', hint: '+15%' },
  { value: 25, label: 'Mucho', hint: '+25%' },
]
const ADOPTION_OPTIONS = [
  { value: 40, label: 'Pocos' },
  { value: 70, label: 'La mayoría' },
  { value: 100, label: 'Todos' },
]
const PLAN_LABEL: Record<PaidPlan, string> = { beauty: 'Beauty', starter: 'Starter', pro: 'Pro', ultimate: 'Ultimate' }

const fmtNum = (n: number) => (n ? Math.round(n).toLocaleString('es-AR') : '')
const parseNum = (s: string) => Number(s.replace(/\D/g, '')) || 0

/** Campo numérico: en pesos se escribe con puntos de mil (25.000) */
function NumField({ value, onChange, money, suffix, max, width = 'w-full', label }: {
  value: number; onChange: (n: number) => void; money?: boolean; suffix?: string; max?: number; width?: string; label: string
}) {
  return (
    <div className={`flex items-center gap-1.5 border-2 border-zinc-200 dark:border-gray-700 focus-within:border-violet-500 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 ${width}`}>
      {money && <span className="text-zinc-400 font-semibold text-sm">$</span>}
      <input
        aria-label={label}
        inputMode="numeric"
        value={fmtNum(value)}
        onChange={e => {
          const n = parseNum(e.target.value)
          onChange(max !== undefined ? Math.min(max, n) : n)
        }}
        className="w-full min-w-0 bg-transparent text-sm font-bold text-zinc-900 dark:text-white focus:outline-none"
      />
      {suffix && <span className="text-zinc-400 text-xs font-medium whitespace-nowrap">{suffix}</span>}
    </div>
  )
}

function Q({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-2">
      <p className="text-sm font-bold text-zinc-900 dark:text-white leading-snug">{children}</p>
      {hint && <p className="text-xs text-zinc-500 dark:text-gray-400 mt-0.5 leading-snug">{hint}</p>}
    </div>
  )
}

function Chips<T extends number | string>({ options, value, onChange }: {
  options: { value: T; label: string; hint?: string }[]; value: T; onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-3.5 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${
            value === o.value
              ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300'
              : 'border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-zinc-600 dark:text-gray-300 hover:border-zinc-300'
          }`}
        >
          {o.label}{o.hint && <span className="ml-1 text-xs font-medium opacity-70">{o.hint}</span>}
        </button>
      ))}
    </div>
  )
}

export default function RoiCalculator({ mode = 'full', initial, cta, stacked = false, className = '' }: Props) {
  const startPreset = ROI_PRESETS.find(p => p.id === initial?.presetId) ?? ROI_PRESETS[0]
  const [presetId, setPresetId] = useState(startPreset.id)
  const [ticket, setTicket] = useState(initial?.ticket ?? startPreset.ticket)
  const [visitsPerDay, setVisitsPerDay] = useState(initial?.visitsPerDay ?? startPreset.visitsPerDay)
  const [daysPerWeek, setDaysPerWeek] = useState(startPreset.daysPerWeek)
  const [margin, setMargin] = useState(startPreset.margin)
  const [goal, setGoal] = useState(initial?.goal ?? startPreset.goal)
  const [rewards, setRewards] = useState<RoiReward[]>(initial?.rewards?.length ? initial.rewards : startPreset.rewards)
  const [lift, setLift] = useState(15)
  const [adoption, setAdoption] = useState(70)
  // En el ejemplo de salones se ofrece el plan Beauty (solo existe para ese rubro)
  const beautyMode = ['peluqueria', 'unas', 'estetica'].includes(initial?.presetId ?? '')
  const [plan, setPlan] = useState<PaidPlan>(beautyMode ? 'beauty' : 'starter')

  const full = mode === 'full'

  function applyPreset(p: RoiPreset) {
    setPresetId(p.id)
    setTicket(p.ticket)
    setVisitsPerDay(p.visitsPerDay)
    setDaysPerWeek(p.daysPerWeek)
    setMargin(p.margin)
    setGoal(p.goal)
    setRewards(p.rewards)
  }

  function setReward(i: number, patch: Partial<RoiReward>) {
    setRewards(rs => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  }

  const r = useMemo(
    () => calcRoi({ ticket, visitsPerDay, daysPerWeek, margin, goal, rewards, lift, adoption, planPrice: PLAN_PRICES_ARS[plan] }),
    [ticket, visitsPerDay, daysPerWeek, margin, goal, rewards, lift, adoption, plan],
  )

  const wins = r.net > 0
  const rewardLine = rewards.length === 1
    ? rewards[0].name
    : `${rewards.length} premios (${rewards.map(x => x.name).join(', ')})`

  return (
    <div className={`grid gap-6 ${stacked ? '' : 'lg:grid-cols-[1fr_1fr]'} ${className}`}>

      {/* ── Datos ── */}
      <div className="space-y-6 min-w-0">

        <div>
          <Q>¿Qué tipo de negocio tenés?</Q>
          <div className="flex flex-wrap gap-2">
            {ROI_PRESETS.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${
                  presetId === p.id
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300'
                    : 'border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-zinc-600 dark:text-gray-300 hover:border-zinc-300'
                }`}
              >
                <span className="mr-1">{p.icon}</span>{p.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-500 dark:text-gray-400 mt-2">Cargamos números de ejemplo. Cambialos por los tuyos.</p>
        </div>

        <div>
          <Q hint="Lo que paga en promedio cada vez que viene.">¿Cuánto gasta un cliente por visita?</Q>
          <NumField label="Gasto por visita" money value={ticket} onChange={setTicket} />
        </div>

        <div className={full ? 'grid grid-cols-2 gap-3' : ''}>
          <div>
            <Q>¿Cuántos clientes atendés por día?</Q>
            <NumField label="Clientes por día" value={visitsPerDay} onChange={setVisitsPerDay} suffix="por día" />
          </div>
          {full && (
            <div>
              <Q>¿Cuántos días abrís por semana?</Q>
              <NumField label="Días por semana" value={daysPerWeek} onChange={setDaysPerWeek} max={7} suffix="días" />
            </div>
          )}
        </div>

        {full && (
          <>
            <div>
              <Q hint="Si no sabés, dejá 50. Es lo que te queda después de pagar insumos, alquiler y sueldos.">
                De cada $100 que cobrás, ¿cuántos te quedan de ganancia?
              </Q>
              <NumField label="Ganancia de cada 100 pesos" value={margin} onChange={setMargin} max={100} suffix="de cada $100" width="w-52" />
            </div>

            <div>
              <Q>¿Cuántos sellos tiene la tarjeta?</Q>
              <NumField label="Cantidad de sellos" value={goal} onChange={n => setGoal(Math.max(1, Math.min(30, n)))} suffix="sellos" width="w-40" />
            </div>

            <div>
              <Q hint="“Te cuesta” es lo que gastás vos en regalarlo, no lo que cobrarías. Ej: un corte que cobrás $25.000 y te cuesta $8.000 en materiales y tiempo.">
                ¿Qué premios das y en qué sello?
              </Q>
              <div className="space-y-3">
                {rewards.map((rw, i) => (
                  <div key={i} className="rounded-2xl border border-zinc-200 dark:border-gray-700 bg-zinc-50 dark:bg-gray-800/50 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-500 dark:text-gray-400 whitespace-nowrap">En el sello</span>
                      <NumField label={`Sello del premio ${i + 1}`} value={rw.at} max={goal} onChange={n => setReward(i, { at: n })} width="w-20" />
                      <input
                        aria-label={`Nombre del premio ${i + 1}`}
                        value={rw.name}
                        onChange={e => setReward(i, { name: e.target.value })}
                        placeholder="Qué regalás"
                        className="flex-1 min-w-0 border-2 border-zinc-200 dark:border-gray-700 focus:border-violet-500 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 text-zinc-900 dark:text-white focus:outline-none"
                      />
                      {rewards.length > 1 && (
                        <button
                          type="button"
                          aria-label="Quitar este premio"
                          onClick={() => setRewards(rs => rs.filter((_, idx) => idx !== i))}
                          className="w-8 h-8 shrink-0 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 text-lg leading-none"
                        >×</button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-500 dark:text-gray-400 whitespace-nowrap">Te cuesta</span>
                      <NumField label={`Costo del premio ${i + 1}`} money value={rw.cost} onChange={n => setReward(i, { cost: n })} width="w-36" />
                    </div>
                  </div>
                ))}
              </div>
              {rewards.length < 4 && (
                <button
                  type="button"
                  onClick={() => setRewards(rs => [...rs, { at: Math.max(1, Math.round(goal / 2)), name: '', cost: Math.round(ticket * 0.15 / 500) * 500 }])}
                  className="mt-3 text-sm font-semibold text-violet-600 hover:text-violet-500"
                >+ Agregar otro premio</button>
              )}
            </div>

            <div>
              <Q hint="Nadie sabe el número exacto. Si querés ser prudente, elegí “Un poco”.">¿Cuánto más van a volver tus clientes?</Q>
              <Chips options={LIFT_OPTIONS} value={lift} onChange={setLift} />
            </div>

            <div>
              <Q>De tus clientes de siempre, ¿cuántos van a usar la tarjeta?</Q>
              <Chips options={ADOPTION_OPTIONS} value={adoption} onChange={setAdoption} />
            </div>

            <div>
              <Q>¿Qué plan de Calificar?</Q>
              <Chips
                options={(Object.keys(PLAN_PRICES_ARS) as PaidPlan[]).filter(p => beautyMode ? p !== 'starter' : p !== 'beauty').map(p => ({ value: p, label: PLAN_LABEL[p], hint: fmtARS(PLAN_PRICES_ARS[p]) }))}
                value={plan}
                onChange={setPlan}
              />
            </div>
          </>
        )}
      </div>

      {/* ── Resultado ── */}
      <div className="min-w-0">
        <div className={`rounded-3xl border border-violet-200 dark:border-violet-500/30 bg-gradient-to-b from-violet-50 to-white dark:from-violet-500/10 dark:to-gray-900 p-6`}>
          <p className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300 mb-1">Tu resultado</p>
          <p className="text-sm text-zinc-600 dark:text-gray-300 mb-4 leading-snug">
            Con {full ? `${rewards.length > 1 ? 'tus premios' : 'tu premio'}` : `una tarjeta de ${goal} sellos`}: <span className="font-semibold">{rewardLine}</span>
          </p>

          {wins ? (
            <>
              <p className="text-sm font-semibold text-zinc-700 dark:text-gray-200">Cada mes te queda de ganancia extra:</p>
              <p className="text-4xl sm:text-5xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight my-1">{fmtARS(r.net)}</p>
              <p className="text-sm text-zinc-600 dark:text-gray-300">
                Eso ya descontando los premios y el plan de {fmtARS(r.planPrice)}.
              </p>
            </>
          ) : (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-amber-900">
              <p className="font-bold text-sm mb-1">Con estos números todavía no conviene</p>
              <p className="text-sm leading-snug">
                Los premios te cuestan más de lo que ganás con las visitas extra. Probá poner el premio en un sello más lejano, un premio que te cueste menos, o subir “Cuánto más van a volver”.
              </p>
            </div>
          )}

          {wins && r.paybackOpenDays !== null && (
            <div className="mt-4 rounded-2xl bg-white dark:bg-gray-800 border border-zinc-200 dark:border-gray-700 p-4">
              <p className="text-sm font-bold text-zinc-900 dark:text-white">
                {r.paybackOpenDays <= r.openDaysPerMonth
                  ? `Pagás el plan del mes en ${Math.max(1, Math.ceil(r.paybackOpenDays))} ${Math.ceil(r.paybackOpenDays) <= 1 ? 'día' : 'días'} de atención`
                  : `Recuperás el plan en ${(r.paybackOpenDays / r.openDaysPerMonth).toFixed(1).replace('.', ',')} meses`}
              </p>
              <p className="text-xs text-zinc-500 dark:text-gray-400 mt-0.5">Después de eso, todo lo que queda es ganancia.</p>
            </div>
          )}

          <div className="mt-4 space-y-2 text-sm">
            <Row label={`Vuelven ${Math.round(r.extraVisits).toLocaleString('es-AR')} veces más por mes`} value={`+${fmtARS(r.extraRevenue)}`} sub="lo que cobrás de más" />
            <Row label="De eso te queda de ganancia" value={`+${fmtARS(r.extraProfit)}`} />
            <Row label="Premios que regalás" value={`−${fmtARS(r.rewardCost)}`} negative />
            <Row label="Plan de Calificar" value={`−${fmtARS(r.planPrice)}`} negative />
            <div className="border-t border-zinc-200 dark:border-gray-700 pt-2">
              <Row label="Te queda por mes" value={fmtARS(r.net)} strong good={wins} />
            </div>
            {wins && <Row label="En un año" value={fmtARS(r.net12)} strong good />}
          </div>

          {r.breakEvenExtraVisits !== null && (
            <p className="mt-4 text-xs text-zinc-600 dark:text-gray-300 leading-snug">
              Para empezar a ganar necesitás que vuelvan <b>{Math.ceil(r.breakEvenExtraVisits).toLocaleString('es-AR')} visitas más por mes</b>
              {r.breakEvenLift !== null && <> (un {Math.ceil(r.breakEvenLift)}% más)</>}.
            </p>
          )}

          {full && <Track r={r} />}

          <p className="mt-4 text-[11px] text-zinc-400 dark:text-gray-500 leading-snug">
            Es una estimación con los números que cargaste, no una promesa. Suponemos un sello por visita y que cada premio te cuesta lo que ponés.
          </p>

          {cta && (
            <Link
              href={cta.href}
              className="mt-5 block text-center bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3.5 rounded-2xl text-sm transition-colors"
            >
              {cta.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, sub, negative, strong, good }: {
  label: string; value: string; sub?: string; negative?: boolean; strong?: boolean; good?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className={`${strong ? 'font-bold text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-gray-300'} leading-snug`}>
        {label}{sub && <span className="block text-xs text-zinc-400 dark:text-gray-500">{sub}</span>}
      </span>
      <span className={`whitespace-nowrap font-bold ${negative ? 'text-red-500' : good === false ? 'text-red-500' : good ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-white'}`}>{value}</span>
    </div>
  )
}

/** Un cliente, sello por sello: cuánto te dejó y cuánto le regalaste */
function Track({ r }: { r: ReturnType<typeof calcRoi> }) {
  return (
    <div className="mt-5 pt-5 border-t border-zinc-200 dark:border-gray-700">
      <p className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Un cliente, sello por sello</p>
      <p className="text-xs text-zinc-500 dark:text-gray-400 mb-3 leading-snug">
        Cada sello es una visita: te deja {fmtARS(r.profitPerVisit)} de ganancia. Los regalos 🎁 son lo que le das.
      </p>
      <div className="space-y-1.5">
        {r.track.map(t => (
          <div key={t.n} className="flex items-center gap-2 text-xs">
            <span className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center font-bold ${t.balance >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>{t.n}</span>
            <span className="flex-1 text-zinc-600 dark:text-gray-300 min-w-0 truncate">
              {t.rewards.length > 0 ? `🎁 ${t.rewards.map(x => x.name || 'Premio').join(' + ')}` : 'Vino y sumó su sello'}
            </span>
            <span className={`font-bold whitespace-nowrap ${t.balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {t.balance >= 0 ? '+' : '−'}{fmtARS(Math.abs(t.balance))}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-zinc-600 dark:text-gray-300 leading-snug">
        Al completar la tarjeta, ese cliente te dejó <b>{fmtARS(r.profitPerCard)}</b>, le regalaste <b>{fmtARS(r.rewardsPerCard)}</b> y te quedan <b className={r.netPerCard >= 0 ? 'text-emerald-600' : 'text-red-500'}>{fmtARS(r.netPerCard)}</b>.
        {r.breakEvenStamp !== null && r.breakEvenStamp > 1 && <> Desde el sello {r.breakEvenStamp} ya vas ganando con él.</>}
        {r.breakEvenStamp === null && <> Con estos premios, ese cliente nunca llega a dejarte ganancia.</>}
      </p>
    </div>
  )
}
