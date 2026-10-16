'use client'

import React, { useState, useEffect } from 'react'

// ── props ─────────────────────────────────────────────────────────────────────
interface ViewProximidadProps {
  selectedProgram: string | null
  isPro: boolean
  notifMsg: string
  setNotifMsg: (v: string) => void
  notifSending: boolean
  notifSent: boolean
  sendNotif: () => void
  accessToken?: string
}

// ── componente ────────────────────────────────────────────────────────────────
export default function ViewProximidad({
  selectedProgram,
  isPro,
  notifMsg,
  setNotifMsg,
  notifSending,
  notifSent,
  sendNotif,
  accessToken = '',
}: ViewProximidadProps) {
  const [tab,           setTab]           = useState<'push' | 'proximidad'>('proximidad')
  const [enabled,       setEnabled]       = useState(false)
  const [message,       setMessage]       = useState('')
  const [locationLabel, setLocationLabel] = useState('')
  const [lat,           setLat]           = useState('')
  const [lng,           setLng]           = useState('')
  const [detecting,     setDetecting]     = useState(false)
  const [saving,        setSaving]        = useState(false)
  const [saved,         setSaved]         = useState(false)
  const [loadError,     setLoadError]     = useState('')

  useEffect(() => {
    if (!selectedProgram) return
    fetch(`/api/fidelizacion/proximity?program_id=${selectedProgram}`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    })
      .then(r => r.json())
      .then(d => {
        setEnabled(d.proximity_enabled ?? false)
        setMessage(d.proximity_message ?? '')
        setLocationLabel(d.location_label ?? '')
        if (d.location_lat) setLat(String(d.location_lat))
        if (d.location_lng) setLng(String(d.location_lng))
      })
      .catch(() => setLoadError('No se pudo cargar la configuración.'))
  }, [selectedProgram, accessToken])

  function detectLocation() {
    if (!navigator.geolocation) return
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLat(String(pos.coords.latitude))
        setLng(String(pos.coords.longitude))
        setDetecting(false)
      },
      () => setDetecting(false)
    )
  }

  async function save() {
    if (!selectedProgram) return
    setSaving(true)
    await fetch('/api/fidelizacion/proximity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        program_id:     selectedProgram,
        lat:            lat ? parseFloat(lat) : null,
        lng:            lng ? parseFloat(lng) : null,
        location_label: locationLabel,
        message,
        enabled,
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="p-4 md:p-8 w-full">
      <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-1">Avisos de proximidad</h1>
      <p className="text-zinc-400 dark:text-gray-500 text-sm mb-6">
        Alguien que guardó tu tarjeta pasa cerca de tu negocio y ve tu recordatorio en la pantalla de bloqueo. Se envía solo — tú no enviás nada.
      </p>

      {/* Tabs Push / Proximidad */}
      <div className="flex gap-1 bg-zinc-100 dark:bg-gray-800 rounded-xl p-1 w-fit mb-6">
        {([['push', 'Push', 'Tú escribís y enviás'], ['proximidad', 'Proximidad', 'Se envía solo cuando pasan cerca']] as const).map(([id, label, sub]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all text-left ${
              tab === id
                ? 'bg-white dark:bg-gray-700 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-gray-400 hover:text-zinc-700 dark:hover:text-gray-200'
            }`}
          >
            {label}
            <span className="block text-[10px] font-normal text-zinc-400 dark:text-gray-500">{sub}</span>
          </button>
        ))}
      </div>

      {/* ── Tab: Push ── */}
      {tab === 'push' && (
        <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-white mb-0.5">Enviar notificación push</p>
            <p className="text-xs text-zinc-400 dark:text-gray-500">
              Se envía a todos los clientes que activaron notificaciones en su tarjeta.
            </p>
          </div>
          <textarea
            value={notifMsg}
            onChange={e => setNotifMsg(e.target.value)}
            placeholder="Ej: Esta semana 2x1 en café ☕ Pasate a buscar tu beneficio!"
            rows={4}
            className="w-full border border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-gray-600 focus:border-violet-400 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none transition-colors"
          />
          <button
            onClick={sendNotif}
            disabled={notifSending || !notifMsg.trim() || notifSent}
            className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50 transition-all"
            style={{ background: notifSent ? '#10B981' : '#7C3AED' }}
          >
            {notifSent ? '✓ Enviado a todos los clientes' : notifSending ? 'Enviando...' : 'Enviar push a todos los clientes →'}
          </button>
          {notifSent && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center">
              Los clientes con notificaciones activas lo recibieron al instante.
            </p>
          )}
        </div>
      )}

      {/* ── Tab: Proximidad ── */}
      {tab === 'proximidad' && (
        <>
          {!isPro && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-5 flex items-start gap-3">
              <span className="text-xl">🔒</span>
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Función Pro</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                  Los avisos de proximidad están disponibles en el plan Pro. Actualizá tu plan para activarlos.
                </p>
              </div>
            </div>
          )}

          {loadError && <p className="text-red-500 text-xs mb-4">{loadError}</p>}

          {isPro && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-800 rounded-2xl px-4 py-3 mb-4 flex items-start gap-2">
              <span className="text-base mt-0.5">⏳</span>
              <div>
                <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">Puede tardar varios días en activarse</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                  Google necesita verificar la ubicación del negocio antes de enviar avisos de proximidad. Los negocios nuevos pueden esperar hasta 5–7 días hábiles.
                </p>
              </div>
            </div>
          )}

          {/* Toggle activar */}
          <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">Activar avisos de proximidad</p>
                <p className="text-xs text-zinc-400 dark:text-gray-500 mt-0.5">
                  Cuando un cliente con tu tarjeta en Google Wallet pase cerca, recibirá el mensaje.
                </p>
              </div>
              <button
                onClick={() => isPro && setEnabled(e => !e)}
                disabled={!isPro}
                className={`relative w-12 h-6 rounded-full transition-colors ${enabled && isPro ? 'bg-violet-600' : 'bg-zinc-200 dark:bg-gray-700'} disabled:opacity-50`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${enabled && isPro ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Dónde avisás */}
          <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5 mb-4">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">Dónde avisás</p>
            <p className="text-xs text-zinc-400 dark:text-gray-500 mb-4">La zona donde el cliente recibe el aviso. Normalmente es tu local.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-gray-400 mb-1">Nombre del lugar</label>
                <input
                  type="text"
                  value={locationLabel}
                  onChange={e => setLocationLabel(e.target.value)}
                  placeholder="Ej: Cafetería San Martín 234"
                  disabled={!isPro}
                  className="w-full border border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-gray-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400 disabled:opacity-50 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-gray-400 mb-1">Latitud</label>
                  <input
                    type="text"
                    value={lat}
                    onChange={e => setLat(e.target.value)}
                    placeholder="-34.8019"
                    disabled={!isPro}
                    className="w-full border border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-gray-600 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-violet-400 disabled:opacity-50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-gray-400 mb-1">Longitud</label>
                  <input
                    type="text"
                    value={lng}
                    onChange={e => setLng(e.target.value)}
                    placeholder="-68.3030"
                    disabled={!isPro}
                    className="w-full border border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-gray-600 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-violet-400 disabled:opacity-50 transition-colors"
                  />
                </div>
              </div>
              <button
                onClick={detectLocation}
                disabled={detecting || !isPro}
                className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 border border-violet-200 dark:border-violet-700 px-3 py-1.5 rounded-xl disabled:opacity-50 transition-colors"
              >
                {detecting ? '📍 Detectando...' : '📍 Usar mi ubicación actual'}
              </button>
              {lat && lng && (
                <div className="text-[10px] text-zinc-400 dark:text-gray-500 bg-zinc-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                  Coordenadas: {parseFloat(lat).toFixed(5)}, {parseFloat(lng).toFixed(5)} · Radio: ~150 metros
                </div>
              )}
            </div>
          </div>

          {/* Qué dice */}
          <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5 mb-5">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">Qué dice</p>
            <p className="text-xs text-zinc-400 dark:text-gray-500 mb-3">El mensaje que aparece en la pantalla de bloqueo de tu cliente.</p>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              disabled={!isPro}
              placeholder="Ej: ¡Pasá a tomar tu café! Te esperamos con tu tarjeta de sellos."
              className="w-full border border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-gray-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400 resize-none disabled:opacity-50 transition-colors"
            />
            <p className="text-[10px] text-zinc-400 dark:text-gray-500 mt-1">{message.length}/100 caracteres recomendados</p>

            {/* Preview pantalla de bloqueo */}
            {message && (
              <div className="mt-4 bg-zinc-900 rounded-2xl p-4 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: '#7C3AED' }}
                >
                  C
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">Calificar · Tarjeta de sellos</p>
                  <p className="text-zinc-300 text-xs mt-0.5">{message}</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={save}
            disabled={saving || !isPro}
            className="font-bold px-6 py-3 rounded-2xl text-sm text-white transition-colors disabled:opacity-50"
            style={{ background: saved ? '#10B981' : '#7C3AED' }}
          >
            {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar configuración'}
          </button>
        </>
      )}
    </div>
  )
}
