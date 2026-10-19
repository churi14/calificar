'use client'

import React, { useEffect, useState } from 'react'
import type { Card, PushLog } from '@/types/dashboard'
import { READY_AUDIENCES, type Audience, type AudienceRules, type ReadyAudienceId } from '@/lib/audience-types'

// ── tipos locales ─────────────────────────────────────────────────────────────
type NotifRecipient  = { name: string; phone: string; ok: boolean }
type PushSubscriber  = { id: string; card_id: string; name: string; phone: string; subscribed_at: string }

// ── props ─────────────────────────────────────────────────────────────────────
interface ViewPushProps {
  notifMsg: string
  setNotifMsg: (v: string) => void
  notifSending: boolean
  notifSent: boolean
  sendNotif: (audience?: Audience) => void
  notifError?: string
  notifSentCount?: number
  notifRecipients?: NotifRecipient[]
  setNotifSent?: (v: boolean) => void
  setNotifSentCount?: (v: number) => void
  setNotifRecipients?: (v: NotifRecipient[]) => void
  pushLogs?: PushLog[]
  pushSubscribers?: PushSubscriber[]
  cards?: Card[]
  selectedProgram?: string | null
  accessToken?: string
  /** Pro: listas de clientes ya armadas */
  canReadyAudiences?: boolean
  /** Ultimate: reglas propias */
  canCustomAudiences?: boolean
}

// ── componente ────────────────────────────────────────────────────────────────
export default function ViewPush({
  notifMsg,
  setNotifMsg,
  notifSending,
  notifSent,
  sendNotif,
  notifError = '',
  notifSentCount = 0,
  notifRecipients = [],
  setNotifSent,
  setNotifSentCount,
  setNotifRecipients,
  pushLogs = [],
  pushSubscribers = [],
  cards = [],
  selectedProgram,
  accessToken,
  canReadyAudiences = true,
  canCustomAudiences = true,
}: ViewPushProps) {
  const [tab,          setTab]          = useState<'todos' | 'individual'>('todos')
  const [search,       setSearch]       = useState('')
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [indivMsg,     setIndivMsg]     = useState('')
  const [indivSending, setIndivSending] = useState(false)
  const [indivSent,    setIndivSent]    = useState(false)
  const [indivError,   setIndivError]   = useState('')

  // ── Audiencia (a quién se manda) ──
  const [audienceKey, setAudienceKey] = useState<'all' | 'rules' | ReadyAudienceId>('all')
  const [rules, setRules] = useState<AudienceRules>({})
  const [preview, setPreview] = useState<{ count: number; with_push: number } | null>(null)
  const audience: Audience =
    audienceKey === 'all' ? { kind: 'all' }
    : audienceKey === 'rules' ? { kind: 'rules', rules }
    : { kind: 'ready', id: audienceKey }

  useEffect(() => {
    if (!selectedProgram || !accessToken) return
    const t = setTimeout(() => {
      fetch(`/api/fidelizacion/audiences?program_id=${selectedProgram}&audience=${encodeURIComponent(JSON.stringify(audience))}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then(r => r.json())
        .then(d => setPreview(d.count !== undefined ? { count: d.count, with_push: d.with_push } : null))
        .catch(() => setPreview(null))
    }, 350)
    return () => clearTimeout(t)
  }, [selectedProgram, accessToken, audienceKey, rules]) // eslint-disable-line react-hooks/exhaustive-deps

  const setNum = (k: keyof AudienceRules, v: string) =>
    setRules(r => {
      const next = { ...r }
      if (v === '') delete next[k]
      else (next as Record<string, number | boolean>)[k] = Math.max(0, Number(v) || 0)
      return next
    })
  const setFlag = (k: 'birthdayThisMonth' | 'nearReward', v: boolean) =>
    setRules(r => { const next = { ...r }; if (v) next[k] = true; else delete next[k]; return next })

  const filtered = search.trim()
    ? cards.filter(
        c =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.phone.includes(search)
      )
    : []

  async function sendIndividual() {
    if (!selectedCard || !indivMsg.trim() || !selectedProgram) return
    setIndivSending(true)
    setIndivError('')
    const res = await fetch('/api/fidelizacion/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        program_id: selectedProgram,
        card_id: selectedCard.id,
        title: '🔔 Mensaje de tu local',
        body: indivMsg,
      }),
    })
    const d = await res.json()
    setIndivSending(false)
    if (d.ok) {
      setIndivSent(true)
      setIndivMsg('')
      setTimeout(() => setIndivSent(false), 3000)
    } else {
      setIndivError(d.error ?? 'Error al enviar')
    }
  }

  return (
    <div className="p-4 md:p-8 w-full">
      <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-1">Avisos push</h1>
      <p className="text-zinc-400 dark:text-gray-500 text-sm mb-6">
        Mandá mensajes directos a los clientes que activaron notificaciones.
      </p>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-100 dark:bg-gray-800 rounded-xl p-1 w-fit mb-6">
        {([['todos', 'Todos los clientes'], ['individual', 'Cliente específico']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === id
                ? 'bg-white dark:bg-gray-700 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-gray-400 hover:text-zinc-700 dark:hover:text-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab: todos ── */}
      {tab === 'todos' && (
        <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-6">
          <label className="block text-sm font-semibold text-zinc-700 dark:text-gray-200 mb-2">
            ¿A quién se lo mandás?
          </label>
          <select
            value={audienceKey}
            onChange={e => { setAudienceKey(e.target.value as typeof audienceKey); if (notifSent) { setNotifSent?.(false); setNotifSentCount?.(0); setNotifRecipients?.([]) } }}
            className="w-full border border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-zinc-900 dark:text-white rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-violet-400 mb-3"
          >
            <option value="all">Todos mis clientes</option>
            {READY_AUDIENCES.map(a => (
              <option key={a.id} value={a.id} disabled={!canReadyAudiences}>
                {a.label}{canReadyAudiences ? '' : ' 🔒 Pro'}
              </option>
            ))}
            <option value="rules" disabled={!canCustomAudiences}>Armar mi propio grupo{canCustomAudiences ? '' : ' 🔒 Ultimate'}</option>
          </select>

          {audienceKey === 'rules' && (
            <div className="rounded-2xl border border-violet-200 dark:border-violet-500/30 bg-violet-50/50 dark:bg-violet-500/5 p-4 mb-3 grid sm:grid-cols-2 gap-3 text-sm">
              {([
                ['minStamps', 'Tienen al menos', 'sellos'],
                ['maxStamps', 'Tienen como mucho', 'sellos'],
                ['minVisits', 'Vinieron al menos', 'veces'],
                ['idleDaysMin', 'Hace al menos', 'días que no vienen'],
                ['idleDaysMax', 'Vinieron hace menos de', 'días'],
                ['joinedWithinDays', 'Se sumaron en los últimos', 'días'],
              ] as [keyof AudienceRules, string, string][]).map(([k, pre, post]) => (
                <label key={k} className="flex items-center gap-2 text-zinc-700 dark:text-gray-300">
                  <span className="flex-1 leading-snug">{pre}</span>
                  <input
                    type="number" min={0} inputMode="numeric"
                    value={rules[k] === undefined ? '' : String(rules[k])}
                    onChange={e => setNum(k, e.target.value)}
                    className="w-16 border border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-2 py-1.5 text-center font-bold focus:outline-none focus:border-violet-400"
                  />
                  <span className="text-xs text-zinc-500 w-24 leading-tight">{post}</span>
                </label>
              ))}
              <label className="flex items-center gap-2 text-zinc-700 dark:text-gray-300">
                <input type="checkbox" checked={!!rules.birthdayThisMonth} onChange={e => setFlag('birthdayThisMonth', e.target.checked)} /> Cumplen años este mes
              </label>
              <label className="flex items-center gap-2 text-zinc-700 dark:text-gray-300">
                <input type="checkbox" checked={!!rules.nearReward} onChange={e => setFlag('nearReward', e.target.checked)} /> Les falta poco para el premio
              </label>
            </div>
          )}

          {preview && (
            <p className="text-xs text-zinc-500 dark:text-gray-400 mb-4">
              {audienceKey === 'all' ? 'Tenés' : 'Este grupo tiene'} <b>{preview.count}</b> {preview.count === 1 ? 'cliente' : 'clientes'};{' '}
              <b>{preview.with_push}</b> {preview.with_push === 1 ? 'tiene' : 'tienen'} las notificaciones activadas y {preview.with_push === 1 ? 'lo va' : 'los van'} a recibir.
            </p>
          )}

          <label className="block text-sm font-semibold text-zinc-700 dark:text-gray-200 mb-2">
            Mensaje
          </label>
          <textarea
            value={notifMsg}
            onChange={e => {
              setNotifMsg(e.target.value)
              if (notifSent) {
                setNotifSent?.(false)
                setNotifSentCount?.(0)
                setNotifRecipients?.([])
              }
            }}
            placeholder="Ej: Esta semana 2x1 en café. ¡Te esperamos!"
            rows={4}
            className="w-full border border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-gray-600 focus:border-violet-400 rounded-2xl px-4 py-3 text-sm focus:outline-none resize-none transition-colors"
          />
          <p className="text-xs text-zinc-400 dark:text-gray-500 mt-1 mb-4">
            {notifMsg.length}/160 caracteres
          </p>
          <button
            onClick={() => sendNotif(audience)}
            disabled={notifSending || !notifMsg.trim() || notifSent}
            className="font-bold px-6 py-3 rounded-2xl text-sm text-white transition-colors disabled:opacity-50"
            style={{ background: notifSent ? '#10B981' : '#7C3AED' }}
          >
            {notifSent
              ? `✓ Enviado a ${notifSentCount} cliente${notifSentCount !== 1 ? 's' : ''}`
              : notifSending
              ? 'Enviando...'
              : audienceKey === 'all' ? 'Enviar a todos mis clientes' : 'Enviar a este grupo'}
          </button>

          {notifError && (
            <p className="text-sm text-red-500 mt-3 bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-800 rounded-xl px-4 py-3">
              {notifError}
            </p>
          )}

          {notifSent && notifRecipients.length > 0 && (
            <div className="mt-4 border border-zinc-100 dark:border-gray-800 rounded-2xl overflow-hidden">
              <p className="text-xs font-semibold text-zinc-500 dark:text-gray-400 px-4 py-2 bg-zinc-50 dark:bg-gray-800 border-b border-zinc-100 dark:border-gray-700">
                Destinatarios
              </p>
              {notifRecipients.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-50 dark:border-gray-800 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-800 dark:text-gray-100">{r.name}</p>
                    <p className="text-xs text-zinc-400 dark:text-gray-500">{r.phone}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      r.ok
                        ? 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400'
                        : 'bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400'
                    }`}
                  >
                    {r.ok ? '✓ Enviado' : '✗ Falló'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: individual ── */}
      {tab === 'individual' && (
        <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-6 space-y-4">
          {/* Buscador */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-gray-200 mb-2">
              Buscar cliente
            </label>
            {selectedCard ? (
              <div className="flex items-center justify-between border border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">{selectedCard.name}</p>
                  <p className="text-xs text-zinc-400 dark:text-gray-500">
                    {selectedCard.phone} · {selectedCard.stamps} sellos
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="text-zinc-400 dark:text-gray-500 hover:text-zinc-600 dark:hover:text-gray-300 text-sm"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Nombre o teléfono..."
                  className="w-full border border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-gray-600 focus:border-violet-400 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                />
                {filtered.length > 0 && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-zinc-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {filtered.map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedCard(c); setSearch('') }}
                        className="w-full text-left px-4 py-3 hover:bg-zinc-50 dark:hover:bg-gray-800 border-b border-zinc-50 dark:border-gray-800 last:border-0"
                      >
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">{c.name}</p>
                        <p className="text-xs text-zinc-400 dark:text-gray-500">
                          {c.phone} · {c.stamps} sellos
                        </p>
                      </button>
                    ))}
                  </div>
                )}
                {search.trim() && filtered.length === 0 && (
                  <p className="text-xs text-zinc-400 dark:text-gray-500 mt-2">
                    No se encontró ningún cliente con ese nombre o teléfono.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Mensaje */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-gray-200 mb-2">
              Mensaje personalizado
            </label>
            <textarea
              value={indivMsg}
              onChange={e => setIndivMsg(e.target.value)}
              placeholder={`Ej: Hola ${selectedCard?.name?.split(' ')[0] ?? 'Juan'}, te tenemos una sorpresa especial 🎁`}
              rows={4}
              className="w-full border border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-gray-600 focus:border-violet-400 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none transition-colors"
            />
            <p className="text-xs text-zinc-400 dark:text-gray-500 mt-1">
              {indivMsg.length}/160 caracteres
            </p>
          </div>

          {indivError && <p className="text-red-500 text-xs">{indivError}</p>}

          <button
            onClick={sendIndividual}
            disabled={indivSending || !indivMsg.trim() || !selectedCard || indivSent}
            className="font-bold px-6 py-3 rounded-2xl text-sm text-white transition-colors disabled:opacity-50"
            style={{ background: indivSent ? '#10B981' : '#7C3AED' }}
          >
            {indivSent
              ? '✓ Enviado'
              : indivSending
              ? 'Enviando...'
              : selectedCard
              ? `Enviar a ${selectedCard.name.split(' ')[0]}`
              : 'Seleccioná un cliente'}
          </button>
        </div>
      )}

      {/* ── Suscriptores activos ── */}
      <div className="mt-8">
        <h2 className="text-sm font-bold text-zinc-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Suscriptores activos ({pushSubscribers.length})
        </h2>
        {pushSubscribers.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-gray-500">
            Ningún cliente activó notificaciones todavía.
          </p>
        ) : (
          <div className="border border-zinc-100 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900">
            {pushSubscribers.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center justify-between px-4 py-3 ${
                  i < pushSubscribers.length - 1 ? 'border-b border-zinc-50 dark:border-gray-800' : ''
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-zinc-800 dark:text-gray-100">{s.name}</p>
                  <p className="text-xs text-zinc-400 dark:text-gray-500">{s.phone}</p>
                </div>
                <p className="text-xs text-zinc-400 dark:text-gray-500">
                  {new Date(s.subscribed_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Historial ── */}
      {pushLogs.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-bold text-zinc-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Historial de envíos
          </h2>
          <div className="space-y-2">
            {pushLogs.map(log => (
              <div
                key={log.id}
                className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl px-5 py-4 flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-gray-100 truncate">
                    {log.title}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-gray-400 truncate">{log.body}</p>
                  <p className="text-xs text-zinc-400 dark:text-gray-500 mt-1">
                    {new Date(log.created_at).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className="flex-shrink-0 text-xs font-bold bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 px-3 py-1 rounded-full whitespace-nowrap">
                  {log.sent_to} cliente{log.sent_to !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
