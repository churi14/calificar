'use client'

import React, { useState, useEffect, useCallback } from 'react'

// ── tipo ──────────────────────────────────────────────────────────────────────
interface Coupon {
  id: string
  coupon_code: string
  note: string
  created_at: string
  redeemed_at: string | null
  client_name: string | null
  client_phone: string | null
}

// ── props ─────────────────────────────────────────────────────────────────────
interface ViewCuponesProps {
  selectedProgram: string | null
  accessToken?: string
}

// ── componente ────────────────────────────────────────────────────────────────
export default function ViewCupones({ selectedProgram, accessToken }: ViewCuponesProps) {
  const [couponInput,     setCouponInput]     = useState('')
  const [couponLoading,   setCouponLoading]   = useState(false)
  const [couponResult,    setCouponResult]    = useState<{ ok: boolean; message: string } | null>(null)
  const [coupons,         setCoupons]         = useState<Coupon[]>([])
  const [loadingCoupons,  setLoadingCoupons]  = useState(true)
  const [search,          setSearch]          = useState('')
  const [redeemingId,     setRedeemingId]     = useState<string | null>(null)
  const [rowResult,       setRowResult]       = useState<Record<string, { ok: boolean; message: string }>>({})

  const authHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  }

  const refreshList = useCallback(async () => {
    if (!selectedProgram) return
    setLoadingCoupons(true)
    try {
      const res = await fetch(
        `/api/fidelizacion/coupons?program_id=${selectedProgram}`,
        { headers: authHeaders }
      )
      const d = await res.json()
      if (d.coupons) setCoupons(d.coupons)
    } catch { /* silent */ }
    setLoadingCoupons(false)
  }, [selectedProgram]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { refreshList() }, [refreshList])

  async function redeemByCode(code: string, rowId?: string) {
    if (!code.trim() || !selectedProgram) return
    if (rowId) {
      setRedeemingId(rowId)
    } else {
      setCouponLoading(true)
      setCouponResult(null)
    }

    const res = await fetch('/api/fidelizacion/coupons/redeem', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ coupon_code: code.trim(), program_id: selectedProgram }),
    })
    const d = await res.json()

    if (rowId) {
      setRedeemingId(null)
      setRowResult(prev => ({ ...prev, [rowId]: { ok: d.ok, message: d.message ?? (d.ok ? 'Canjeado' : 'Error') } }))
      if (d.ok) {
        setTimeout(() => {
          setRowResult(prev => { const n = { ...prev }; delete n[rowId]; return n })
          refreshList()
        }, 2500)
      }
    } else {
      setCouponLoading(false)
      setCouponResult({ ok: d.ok, message: d.message ?? (d.ok ? '¡Cupón canjeado!' : 'Código no válido') })
      if (d.ok) {
        setCouponInput('')
        refreshList()
      }
    }
  }

  const pending  = coupons.filter(c => !c.redeemed_at)
  const redeemed = coupons.filter(c =>  c.redeemed_at)

  const filtered = coupons.filter(c => {
    const q = search.toLowerCase()
    if (!q) return true
    return (
      c.coupon_code.toLowerCase().includes(q) ||
      (c.client_name?.toLowerCase().includes(q) ?? false) ||
      (c.client_phone?.includes(q) ?? false) ||
      c.note.toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-4 md:p-8 w-full">
      <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-1">Cupones</h1>
      <p className="text-zinc-400 dark:text-gray-500 text-sm mb-6">
        Gestioná y canjea los cupones de tu programa de fidelización.
      </p>

      {/* ── Canjear manualmente ── */}
      <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-6 mb-8">
        <h2 className="text-base font-bold text-zinc-800 dark:text-gray-100 mb-1">Canjear cupón</h2>
        <p className="text-xs text-zinc-400 dark:text-gray-500 mb-4">
          Ingresá el código del cupón para canjearlo manualmente.
        </p>
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            value={couponInput}
            onChange={e => { setCouponInput(e.target.value); setCouponResult(null) }}
            onKeyDown={e => e.key === 'Enter' && redeemByCode(couponInput)}
            placeholder="Código del cupón..."
            className="flex-1 min-w-48 border border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-gray-600 focus:border-violet-400 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
          />
          <button
            onClick={() => redeemByCode(couponInput)}
            disabled={couponLoading || !couponInput.trim()}
            className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50"
            style={{ background: '#7C3AED' }}
          >
            {couponLoading ? 'Canjeando...' : 'Canjear'}
          </button>
        </div>

        {couponResult && (
          <div
            className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${
              couponResult.ok
                ? 'bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-800 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400'
            }`}
          >
            {couponResult.ok ? '✓ ' : '✗ '}{couponResult.message}
          </div>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total cupones',   value: coupons.length,   color: 'bg-violet-50 dark:bg-violet-950 border-violet-100 dark:border-violet-800', text: 'text-violet-700 dark:text-violet-300' },
          { label: 'Pendientes',      value: pending.length,   color: 'bg-amber-50  dark:bg-amber-950  border-amber-100  dark:border-amber-800',  text: 'text-amber-700  dark:text-amber-300'  },
          { label: 'Canjeados',       value: redeemed.length,  color: 'bg-green-50  dark:bg-green-950  border-green-100  dark:border-green-800',  text: 'text-green-700  dark:text-green-300'  },
        ].map(s => (
          <div
            key={s.label}
            className={`${s.color} border rounded-2xl px-5 py-4 flex flex-col gap-1`}
          >
            <p className={`text-2xl font-extrabold tabular-nums ${s.text}`}>{s.value}</p>
            <p className="text-xs text-zinc-500 dark:text-gray-400 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Lista completa ── */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-sm font-bold text-zinc-500 dark:text-gray-400 uppercase tracking-wide">
            Todos los cupones
          </h2>
          <div className="flex items-center gap-2 border border-zinc-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-gray-900">
            <span className="text-zinc-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Buscar por código, cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="text-sm text-zinc-700 dark:text-gray-200 placeholder-zinc-400 dark:placeholder-gray-600 focus:outline-none w-48 bg-transparent"
            />
          </div>
        </div>

        {loadingCoupons ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-10 flex flex-col items-center text-center">
            <p className="text-zinc-400 dark:text-gray-500 text-sm">
              {search ? 'No se encontraron cupones con ese criterio.' : 'No hay cupones todavía.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(coupon => {
              const isRedeemed = !!coupon.redeemed_at
              const result     = rowResult[coupon.id]

              return (
                <div
                  key={coupon.id}
                  className={`bg-white dark:bg-gray-900 border rounded-2xl px-5 py-4 flex items-center justify-between gap-4 transition-all ${
                    isRedeemed
                      ? 'border-zinc-100 dark:border-gray-800 opacity-70'
                      : 'border-zinc-100 dark:border-gray-800 shadow-sm'
                  }`}
                >
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-zinc-900 dark:text-white text-sm">
                        {coupon.coupon_code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isRedeemed
                            ? 'bg-zinc-100 dark:bg-gray-800 text-zinc-500 dark:text-gray-400'
                            : 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400'
                        }`}
                      >
                        {isRedeemed ? 'Canjeado' : 'Pendiente'}
                      </span>
                    </div>

                    {coupon.note && (
                      <p className="text-xs text-zinc-500 dark:text-gray-400 mt-0.5 truncate">{coupon.note}</p>
                    )}

                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {coupon.client_name && (
                        <p className="text-xs text-zinc-400 dark:text-gray-500">
                          {coupon.client_name}
                          {coupon.client_phone ? ` · ${coupon.client_phone}` : ''}
                        </p>
                      )}
                      <p className="text-xs text-zinc-300 dark:text-gray-600">
                        Creado {new Date(coupon.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      {isRedeemed && coupon.redeemed_at && (
                        <p className="text-xs text-zinc-300 dark:text-gray-600">
                          Canjeado {new Date(coupon.redeemed_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Acción */}
                  <div className="flex-shrink-0">
                    {result ? (
                      <span
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl ${
                          result.ok
                            ? 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400'
                            : 'bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400'
                        }`}
                      >
                        {result.ok ? '✓ ' : '✗ '}{result.message}
                      </span>
                    ) : !isRedeemed ? (
                      <button
                        onClick={() => redeemByCode(coupon.coupon_code, coupon.id)}
                        disabled={redeemingId === coupon.id}
                        className="text-xs font-bold px-4 py-2 rounded-xl text-white transition-colors disabled:opacity-50"
                        style={{ background: '#7C3AED' }}
                      >
                        {redeemingId === coupon.id ? 'Canjeando...' : 'Canjear'}
                      </button>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
