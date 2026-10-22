'use client'

import { useUnifiedQr } from '@/lib/use-unified-qr'
import React, { useState } from 'react'
import {
  UsersThree, Star, ArrowCounterClockwise, Trophy,
  Globe, Cake, ChartBar, TrendUp, MagnifyingGlass,
} from '@phosphor-icons/react'
import type { Program, Card, Transaction, Stats, PushLog } from '@/types/dashboard'
import { PLAN_PRICES_ARS } from '@/lib/plans'

// ── Props ─────────────────────────────────────────────────────────────────────
interface ViewHoyProps {
  accessToken?: string
  branchId?: string | null
  program: Program | undefined
  selectedProgram: string | null
  stats: Stats
  transactions: Transaction[]
  notifMsg: string
  setNotifMsg: (v: string) => void
  notifSending: boolean
  notifSent: boolean
  sendNotif: () => void
  businessName: string
  cards: Card[]
  pushLogs: PushLog[]
  salesByDay: Record<string, number>
  totalSales: number
  onLogoNav: () => void
  businessCreatedAt?: string | null
  businessPlan?: string
  onNavPlan?: () => void
  upcomingBdays?: { name: string; daysLeft: number }[]
  onNavBday?: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function SalesChart({ salesByDay, cost, color }: {
  salesByDay: Record<string, number>
  cost: number
  color: string
}) {
  const days = 30
  const today = new Date()
  const data = Array.from({ length: days }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (days - 1 - i))
    // Día en hora de Argentina (UTC-3), igual que el servidor: una venta de las 22:00 es de ese día
    const key = new Date(d.getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10)
    return {
      label:
        i === 0 || i === 7 || i === 14 || i === 21 || i === 29
          ? `${d.getDate()}/${d.getMonth() + 1}`
          : '',
      sales: salesByDay[key] ?? 0,
    }
  })

  const maxSales = Math.max(...data.map(d => d.sales), 1)
  const maxVal = Math.max(maxSales, cost > 0 ? cost * 1.5 : 0, 1)
  const W = 560, H = 130, padL = 40, padR = 16, padT = 12, padB = 24
  const chartW = W - padL - padR
  const chartH = H - padT - padB

  const pts = data.map((d, i) => ({
    x: padL + (i / (days - 1)) * chartW,
    y: padT + (1 - d.sales / maxVal) * chartH,
    ...d,
  }))
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area = `${path} L${pts[pts.length - 1].x},${padT + chartH} L${pts[0].x},${padT + chartH} Z`
  const costLineY = cost > 0 ? padT + (1 - cost / maxVal) * chartH : -1

  const yLabels = [0, Math.round(maxVal / 2), Math.round(maxVal)]

  return (
    <div className="mt-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 130 }}>
        <defs>
          <linearGradient id="salesGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid horizontales */}
        {yLabels.map((v, i) => {
          const y = padT + (1 - v / maxVal) * chartH
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#27272a" strokeWidth="1" />
              <text x={padL - 4} y={y + 3.5} textAnchor="end" fontSize="8" fill="#52525b">
                ${v > 999 ? `${(v / 1000).toFixed(1)}k` : v}
              </text>
            </g>
          )
        })}

        {/* Línea costo mensual */}
        {costLineY > padT && costLineY < padT + chartH && (
          <g>
            <line
              x1={padL} y1={costLineY} x2={W - padR} y2={costLineY}
              stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="5 3"
            />
            <rect x={W - padR - 96} y={costLineY - 12} width={94} height={13} rx="3" fill="#1a0a0f" />
            <text x={W - padR - 5} y={costLineY - 2} textAnchor="end" fontSize="8.5" fill="#f43f5e" fontWeight="600">
              Plan ${Math.round(cost).toLocaleString('es-AR')}/mes
            </text>
          </g>
        )}

        {/* Área y línea de ventas */}
        <path d={area} fill="url(#salesGrad2)" />
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Puntos en datos con ventas */}
        {pts.map((p, i) =>
          p.sales > 0 ? (
            <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} stroke="#09090b" strokeWidth="1.5" />
          ) : null
        )}

        {/* Eje X — etiquetas de fecha */}
        {pts.map((p, i) =>
          p.label ? (
            <text key={i} x={p.x} y={H - 4} textAnchor="middle" fontSize="8.5" fill="#52525b">
              {p.label}
            </text>
          ) : null
        )}

        {/* Eje X — línea base */}
        <line x1={padL} y1={padT + chartH} x2={W - padR} y2={padT + chartH} stroke="#3f3f46" strokeWidth="1" />
      </svg>

      {/* Leyenda */}
      <div className="flex items-center gap-5 mt-1 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[10px] text-zinc-500">Ventas registradas</span>
        </div>
        {cost > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              <div className="w-1 h-0.5 bg-rose-500 rounded-full" />
              <div className="w-1 h-0.5 bg-rose-500 rounded-full" />
              <div className="w-1 h-0.5 bg-rose-500 rounded-full" />
            </div>
            <span className="text-[10px] text-zinc-500">Costo del plan</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Vista principal ────────────────────────────────────────────────────────────

export default function ViewHoy({
  accessToken,
  branchId,
  program,
  selectedProgram,
  stats,
  transactions,
  notifMsg,
  setNotifMsg,
  notifSending,
  notifSent,
  sendNotif,
  businessName,
  cards,
  pushLogs,
  salesByDay,
  totalSales,
  onLogoNav,
  businessCreatedAt,
  businessPlan,
  onNavPlan,
  upcomingBdays = [],
  onNavBday,
}: ViewHoyProps) {
  const color = program?.color_primary ?? '#7C3AED'
  const greeting = (() => {
    const h = new Date().getHours()
    return h < 12 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches'
  })()
  const totalStamps = transactions.filter(tx => tx.type === 'stamp').length
  const returningClients = cards.filter(c => c.total_visits > 1).length
  const hasLogo = !!program?.logo_url
  const [showQrBig, setShowQrBig] = useState(false)
  const { qr: qrUrl, link: shareUrl } = useUnifiedQr(selectedProgram, accessToken, branchId)
  // Costo mensual real del plan en pesos (los mismos precios que se cobran). Prueba y regalo: sin costo.
  const calificarCost = (PLAN_PRICES_ARS as Record<string, number>)[(businessPlan ?? '').toLowerCase()] ?? 0
  const fmtARS = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`

  const trialDaysLeft = (() => {
    if (businessPlan && businessPlan !== 'trial') return null
    if (!businessCreatedAt) return null
    const days = Math.ceil(
      (new Date(businessCreatedAt).getTime() + 14 * 24 * 60 * 60 * 1000 - Date.now()) /
        (1000 * 60 * 60 * 24)
    )
    return Math.max(0, days)
  })()

  const kpis = [
    {
      label: 'Clientes totales',
      value: stats.total,
      sub: 'registrados',
      Icon: UsersThree,
      cardBg: 'bg-indigo-50 dark:bg-gray-900',
      cardBorder: 'border-indigo-100 dark:border-indigo-500/20',
      iconBg: 'bg-indigo-500 dark:bg-indigo-950',
      iconColor: 'text-white dark:text-indigo-400',
    },
    {
      label: 'Sellos hoy',
      value: stats.stampsToday,
      sub: 'en el día',
      Icon: Star,
      cardBg: 'bg-amber-50 dark:bg-gray-900',
      cardBorder: 'border-amber-100 dark:border-amber-500/20',
      iconBg: 'bg-amber-500 dark:bg-amber-950',
      iconColor: 'text-white dark:text-amber-400',
    },
    {
      label: 'Clientes que vuelven',
      value: returningClients,
      sub: 'más de 1 visita',
      Icon: ArrowCounterClockwise,
      cardBg: 'bg-emerald-50 dark:bg-gray-900',
      cardBorder: 'border-emerald-100 dark:border-emerald-500/20',
      iconBg: 'bg-emerald-500 dark:bg-emerald-950',
      iconColor: 'text-white dark:text-emerald-400',
    },
    {
      label: 'Premios entregados',
      value: stats.rewardsTotal,
      sub: 'en total',
      Icon: Trophy,
      cardBg: 'bg-rose-50 dark:bg-gray-900',
      cardBorder: 'border-rose-100 dark:border-rose-500/20',
      iconBg: 'bg-rose-500 dark:bg-rose-950',
      iconColor: 'text-white dark:text-rose-400',
    },
  ]

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-gray-950">

      {/* ── Top Bar (desktop) ─────────────────────────────────────── */}
      <div className="hidden md:flex items-center justify-between px-8 py-3.5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium capitalize">
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">
            {greeting}, {businessName}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
            <MagnifyingGlass size={13} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <input
              placeholder="Buscar clientes..."
              className="bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none w-40"
            />
          </div>
          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {businessName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 w-full">

        {/* Banner trial */}
        {trialDaysLeft !== null && (
          <div className="mb-5 bg-white dark:bg-gray-900 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  trialDaysLeft <= 3
                    ? 'bg-amber-50 dark:bg-amber-950'
                    : 'bg-indigo-50 dark:bg-indigo-950'
                }`}
              >
                <span
                  className={`text-xl font-extrabold tabular-nums ${
                    trialDaysLeft <= 3
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  {trialDaysLeft}
                </span>
              </div>
              <div>
                <p
                  className={`text-sm font-semibold ${
                    trialDaysLeft <= 3
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-gray-800 dark:text-gray-100'
                  }`}
                >
                  {trialDaysLeft === 0
                    ? 'Tu prueba gratuita venció hoy'
                    : trialDaysLeft === 1
                    ? 'Último día de prueba gratuita'
                    : 'días de prueba restantes'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Elegí un plan para continuar sin interrupciones.
                </p>
              </div>
            </div>
            {onNavPlan && (
              <button
                onClick={onNavPlan}
                className={`text-xs font-semibold px-4 py-2 rounded-lg text-white flex-shrink-0 transition-colors ${
                  trialDaysLeft <= 3
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-zinc-900 hover:bg-zinc-800'
                }`}
              >
                Ver planes →
              </button>
            )}
          </div>
        )}

        {/* Modal QR ampliado */}
        {showQrBig && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setShowQrBig(false)}
          >
            <div
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 flex flex-col items-center gap-4"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrUrl)}&color=0F172A&bgcolor=FFFFFF&qzone=2`}
                alt="QR grande"
                width={300}
                height={300}
                className="rounded-2xl"
              />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{businessName}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Ponélo en el mostrador para que los clientes escaneen
              </p>
              <button
                onClick={() => setShowQrBig(false)}
                className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Banner logo */}
        {!hasLogo && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 mb-4 flex items-center gap-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
              <Globe size={18} className="text-gray-400 dark:text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Agregá el logo de tu negocio
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Aparece en la tarjeta digital de cada cliente.
              </p>
            </div>
            <button
              onClick={onLogoNav}
              className="text-xs font-semibold text-white px-4 py-2 rounded-lg flex-shrink-0 bg-zinc-900 hover:bg-zinc-800 transition-colors"
            >
              Agregar logo
            </button>
          </div>
        )}

        {/* QR Banner */}
        {program && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 mb-5 flex items-center gap-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <div
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2 flex-shrink-0 cursor-pointer border border-gray-100 dark:border-gray-700"
              onClick={() => setShowQrBig(true)}
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${encodeURIComponent(qrUrl)}&color=0F172A&bgcolor=FFFFFF&qzone=1`}
                alt="QR"
                width={56}
                height={56}
                className="rounded-lg"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-0.5">
                QR DE REGISTRO
              </p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Listo para compartir</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                El cliente escanea, se registra y recibe su tarjeta digital.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowQrBig(true)}
                className="text-xs border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
              >
                Ampliar
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="text-xs border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors hidden sm:block"
              >
                Copiar
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Acumulá sellos y ganá premios en ${businessName}! Guardá tu tarjeta digital: ${shareUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* Banner cumpleaños */}
        {upcomingBdays.length > 0 && (
          <button
            onClick={onNavBday}
            className="w-full flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl px-5 py-4 mb-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm border border-gray-100 dark:border-gray-800"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center flex-shrink-0">
              <Cake size={18} className="text-amber-500 dark:text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {upcomingBdays.length === 1
                  ? `Cumpleaños de ${upcomingBdays[0].name} en ${
                      upcomingBdays[0].daysLeft === 1 ? 'mañana' : `${upcomingBdays[0].daysLeft} días`
                    }`
                  : `${upcomingBdays.length} cumpleaños en los próximos 7 días`}
              </p>
              {upcomingBdays.length > 1 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                  {upcomingBdays
                    .map(b => `${b.name} (en ${b.daysLeft === 1 ? 'mañana' : `${b.daysLeft}d`})`)
                    .join(' · ')}
                </p>
              )}
            </div>
            <span className="text-gray-300 dark:text-gray-600 flex-shrink-0">→</span>
          </button>
        )}

        {/* ── KPIs ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {kpis.map(k => (
            <div key={k.label} className={`rounded-2xl p-5 shadow-sm border ${k.cardBg} ${k.cardBorder}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${k.iconBg}`}>
                <k.Icon size={18} className={k.iconColor} weight="duotone" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{k.value}</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-1">{k.label}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Mid grid ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

          {/* Actividad reciente */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">Actividad reciente</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Lo que está pasando ahora</p>
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-2">
                  <ChartBar size={18} className="text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Sin actividad todavía</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                  Activá tu primer cliente con el QR.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        tx.type === 'reward'
                          ? 'bg-amber-50 dark:bg-amber-950'
                          : 'bg-indigo-50 dark:bg-indigo-950'
                      }`}
                    >
                      {tx.type === 'reward' ? (
                        <Trophy size={14} className="text-amber-500 dark:text-amber-400" />
                      ) : (
                        <Star size={14} className="text-indigo-500 dark:text-indigo-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">
                        {tx.loyalty_cards?.name}
                      </p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500">
                        {tx.type === 'reward' ? 'Premio canjeado' : 'Sello registrado'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Retención */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">Retención</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Clientes con más de 1 visita</p>
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-bold text-gray-900 dark:text-white"
                style={{ background: `${color}12` }}
              >
                {returningClients}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">de {stats.total} totales</p>
              {stats.total > 0 && (
                <div className="w-full mt-2">
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, Math.round((returningClients / stats.total) * 100))}%`,
                        background: color,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 text-center">
                    {Math.min(100, Math.round((returningClients / stats.total) * 100))}% de retención
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Push notifications */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">
              Notificaciones push
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              Enviá un mensaje a todos tus clientes
            </p>
            {pushLogs.length > 0 && (
              <div className="max-h-28 overflow-y-auto space-y-0 mb-3">
                {pushLogs.slice(0, 4).map(log => (
                  <div
                    key={log.id}
                    className="py-2 border-b border-gray-50 dark:border-gray-700 last:border-0"
                  >
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">
                      {log.body}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                      {new Date(log.created_at).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                      })}{' '}
                      · {log.sent_to} enviados
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2">
              <textarea
                value={notifMsg}
                onChange={e => setNotifMsg(e.target.value)}
                placeholder={
                  pushLogs.length === 0 ? 'Ej: Esta semana 2x1 en café' : 'Nuevo mensaje...'
                }
                rows={pushLogs.length === 0 ? 3 : 2}
                className="w-full border border-gray-200 dark:border-gray-700 focus:border-gray-400 dark:focus:border-gray-500 rounded-lg px-3 py-2 text-xs focus:outline-none resize-none text-gray-700 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-transparent dark:bg-gray-800"
              />
              <button
                onClick={sendNotif}
                disabled={notifSending || !notifMsg.trim() || notifSent}
                className="w-full py-2 rounded-lg font-semibold text-white text-xs disabled:opacity-50 transition-colors"
                style={{ background: notifSent ? '#10B981' : '#18181b' }}
              >
                {notifSent
                  ? '✓ Enviado'
                  : notifSending
                  ? 'Enviando...'
                  : pushLogs.length === 0
                  ? 'Enviar primer push →'
                  : 'Enviar push →'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Ventas vs costo + Resumen histórico ───────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Ventas registradas vs costo de tu plan
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Últimos 30 días · solo cuentan las ventas cuyo monto registrás al sellar
                </p>
              </div>
              {totalSales > 0 && (
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    {calificarCost > 0 ? 'Ventas vs plan' : 'Ventas 30 días'}
                  </p>
                  {calificarCost > 0 ? (
                    <>
                      <p className={`text-xl font-bold ${totalSales >= calificarCost ? 'text-emerald-500' : 'text-rose-500'}`}>
                        ×{(totalSales / calificarCost).toFixed(1).replace('.', ',')}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">
                        {fmtARS(totalSales)} en ventas · plan {fmtARS(calificarCost)}
                      </p>
                    </>
                  ) : (
                    <p className="text-xl font-bold text-emerald-500">{fmtARS(totalSales)}</p>
                  )}
                </div>
              )}
            </div>
            {totalSales === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-3">
                  <TrendUp size={18} className="text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Sin ventas registradas aún
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 max-w-xs">
                  Al dar un sello manual, ingresá el monto de la venta. Así vas a ver si Calificar
                  te rinde.
                </p>
              </div>
            ) : (
              <SalesChart salesByDay={salesByDay} cost={calificarCost} color={color} />
            )}
          </div>

          {/* Resumen histórico */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-4">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Resumen histórico</p>
            <div className="flex-1 flex flex-col gap-3">
              <div className="rounded-xl p-4 bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 tabular-nums">
                    {totalStamps}
                  </p>
                  <Star size={16} className="text-indigo-400 dark:text-indigo-500 mt-1" weight="fill" />
                </div>
                <p className="text-xs font-medium text-indigo-500 dark:text-indigo-400">
                  Sellos entregados
                </p>
              </div>
              <div className="rounded-xl p-4 bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                    {stats.rewardsTotal}
                  </p>
                  <Trophy size={16} className="text-amber-400 dark:text-amber-500 mt-1" weight="fill" />
                </div>
                <p className="text-xs font-medium text-amber-500 dark:text-amber-400">
                  Premios entregados
                </p>
              </div>
              {totalStamps > 0 && (
                <div className="rounded-xl p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-2xl font-bold text-gray-700 dark:text-gray-200 tabular-nums">
                      {program?.stamps_goal
                        ? `${Math.round(
                            (stats.rewardsTotal /
                              Math.max(totalStamps / program.stamps_goal, 0.01)) *
                              100
                          )}%`
                        : '—'}
                    </p>
                    <TrendUp size={16} className="text-gray-400 dark:text-gray-500 mt-1" />
                  </div>
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                    Conversión a premio
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
