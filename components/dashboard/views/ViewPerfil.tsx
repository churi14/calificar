'use client'

import React, { useState } from 'react'
import { Program } from '@/types/dashboard'
import PasswordModal from '@/components/dashboard/ui/PasswordModal'
import { VENUE_TYPES, type VenueType } from '@/lib/venue-type'

// ── props ─────────────────────────────────────────────────────────────────────
interface ViewPerfilProps {
  program: Program | undefined
  selectedProgram: string | null
  businessName: string
  onSaved: (name: string) => void
  accessToken?: string
  /** Tipo de local actual (null = sin elegir) y aviso al padre cuando cambia */
  venueType?: string | null
  onVenueSaved?: (v: VenueType) => void
}

// ── componente ────────────────────────────────────────────────────────────────
export default function ViewPerfil({
  program,
  selectedProgram,
  businessName,
  onSaved,
  accessToken,
  venueType = null,
  onVenueSaved,
}: ViewPerfilProps) {
  const [venueSaving, setVenueSaving] = useState(false)
  const [venueError, setVenueError]   = useState('')
  const [name, setName]                       = useState(businessName)
  const [waNumber, setWaNumber]               = useState('')
  const [address, setAddress]                 = useState('')
  const [saving, setSaving]                   = useState(false)
  const [showPassword, setShowPassword]       = useState(false)
  const [saved, setSaved]                     = useState(false)
  const [deleting, setDeleting]               = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const color = program?.color_primary ?? '#7C3AED'

  async function deleteAccount() {
    setDeleting(true)
    try {
      const res = await fetch('/api/fidelizacion/delete-account', {
        method: 'POST',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      })
      if (res.ok) {
        localStorage.removeItem('cal_new_biz')
        localStorage.removeItem('cal_onboarding')
        localStorage.removeItem('cal_chosen_plan')
        localStorage.removeItem('cal_discount_dismissed')
        localStorage.removeItem('cal_discount_next')
        window.location.href = '/fidelizacion/onboarding'
      } else {
        alert('No se pudo eliminar la cuenta. Intentá de nuevo.')
      }
    } catch {
      alert('Error de red. Intentá de nuevo.')
    }
    setDeleting(false)
    setShowDeleteConfirm(false)
  }

  async function saveVenue(v: VenueType) {
    if (!selectedProgram || v === venueType) return
    setVenueSaving(true); setVenueError('')
    try {
      const res = await fetch('/api/fidelizacion/update-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
        body: JSON.stringify({ program_id: selectedProgram, venue_type: v }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) setVenueError(d.error ?? 'No se pudo guardar')
      else onVenueSaved?.(v)
    } catch {
      setVenueError('Error de red. Intentá de nuevo.')
    }
    setVenueSaving(false)
  }

  async function save() {
    if (!selectedProgram) return
    setSaving(true)
    await fetch('/api/fidelizacion/update-business', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        program_id: selectedProgram,
        business_name: name,
        whatsapp_number: waNumber.trim() || undefined,
      }),
    }).catch(() => {})
    setSaving(false); setSaved(true)
    onSaved(name)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="p-4 md:p-8 w-full">
      <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-1">Perfil del negocio</h1>
      <p className="text-zinc-400 dark:text-gray-500 text-sm mb-6">Así te ven tus clientes en su wallet y en la app.</p>

      {/* Identidad */}
      <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-6 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500 mb-4">IDENTIDAD</p>
        <div className="flex items-start gap-6">
          <div className="flex-1 space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-gray-300 block mb-1.5">Nombre del negocio</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400 transition-colors"
                placeholder="Tu negocio"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-gray-300 block mb-1.5">WhatsApp del local</label>
              <input
                value={waNumber}
                onChange={e => setWaNumber(e.target.value)}
                className="w-full border border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400 transition-colors"
                placeholder="5491112345678"
                type="tel"
              />
              <p className="text-[10px] text-zinc-400 dark:text-gray-500 mt-1">
                Los clientes verán un botón para contactarte directo desde su tarjeta.
              </p>
            </div>
          </div>

          {/* Mini tarjeta preview */}
          <div className="flex-shrink-0 w-40">
            <p className="text-[10px] text-zinc-400 dark:text-gray-500 mb-2 text-center">ASÍ LA VEN TUS CLIENTES</p>
            <div className="rounded-2xl overflow-hidden border border-zinc-100 dark:border-gray-800 shadow-sm" style={{ background: color }}>
              <div className="bg-white dark:bg-gray-900 px-2 py-1.5 flex items-center gap-1.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                  style={{ background: color }}
                >
                  {(name || businessName).charAt(0).toUpperCase()}
                </div>
                <p className="text-[9px] font-semibold text-zinc-800 dark:text-gray-200 truncate">{name || businessName}</p>
              </div>
              <div className="px-2 py-2">
                <div className="flex flex-wrap gap-1 mb-2">
                  {Array.from({ length: program?.stamps_goal ?? 8 }).map((_, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border-2 border-white border-opacity-60 flex items-center justify-center">
                      {i < 3 && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  ))}
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-1.5 text-center">
                  <p className="text-[7px] text-zinc-400 dark:text-gray-500">powered by calificar.com.ar</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tipo de local */}
      <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-6 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500 mb-1">TIPO DE LOCAL</p>
        <p className="text-xs text-zinc-400 dark:text-gray-500 mb-3">
          Cómo atendés a tus clientes. Ajusta los textos del panel; los sellos y los QR siguen funcionando igual.
        </p>
        <div className="space-y-2">
          {VENUE_TYPES.map(t => {
            const on = venueType === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => saveVenue(t.id)}
                disabled={venueSaving}
                aria-pressed={on}
                className="w-full text-left rounded-xl border px-4 py-3 transition-colors disabled:opacity-60"
                style={{ borderColor: on ? color : '#E4E4E7', background: on ? `${color}10` : undefined }}
              >
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">{on ? '● ' : '○ '}{t.label}</p>
                <p className="text-xs text-zinc-400 dark:text-gray-500 mt-0.5">{t.hint}</p>
              </button>
            )
          })}
        </div>
        {venueError && <p className="text-xs text-red-500 mt-2">{venueError}</p>}
      </div>

      {/* Ubicación */}
      <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-6 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500 mb-4">UBICACIÓN</p>
        <p className="text-xs text-zinc-400 dark:text-gray-500 mb-3">
          Define dónde estás para aparecer en el mapa y en los avisos de proximidad.
        </p>
        <input
          value={address}
          onChange={e => setAddress(e.target.value)}
          className="w-full border border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400 transition-colors"
          placeholder="Ej: Encina 2818, Ushuaia, Tierra del Fuego"
        />
      </div>

      {/* Personalización */}
      <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-6 mb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500 mb-4">PERSONALIZACIÓN</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Tarjeta de sellos</p>
            <p className="text-xs text-zinc-400 dark:text-gray-500 mt-0.5">Logo, colores y diseño de la tarjeta digital.</p>
          </div>
          <button
            className="text-xs font-bold px-4 py-2 rounded-xl text-white flex-shrink-0"
            style={{ background: color }}
          >
            Personalizar →
          </button>
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="w-full py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-50 transition-all"
        style={{ background: saved ? '#10B981' : color }}
      >
        {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}
      </button>

      {/* Seguridad de la cuenta */}
      <div className="mt-8 bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-6">
        <p className="text-sm font-bold text-zinc-900 dark:text-white mb-1">🔒 Contraseña de la cuenta</p>
        <p className="text-xs text-zinc-400 dark:text-gray-500 mb-4">
          Creá una contraseña para entrar más rápido, sin esperar un código por mail. También podés cambiarla cuando quieras.
        </p>
        <button
          onClick={() => setShowPassword(true)}
          className="text-sm font-semibold border border-violet-200 text-violet-700 px-4 py-2 rounded-xl hover:bg-violet-50 transition-colors"
        >
          Crear o cambiar contraseña
        </button>
      </div>
      {showPassword && <PasswordModal onClose={() => setShowPassword(false)} />}

      {/* Zona de peligro */}
      <div className="mt-8 border border-red-100 dark:border-red-900 rounded-2xl p-5 bg-red-50/40 dark:bg-red-950/20">
        <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 dark:text-red-500 mb-3">ZONA DE PELIGRO</p>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-gray-200">Eliminar cuenta</p>
            <p className="text-xs text-zinc-400 dark:text-gray-500 mt-0.5">
              Desactiva tu negocio y programa. Tus clientes y su historial se conservan.
            </p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-shrink-0 text-xs font-bold px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6">
            <p className="text-xl mb-1">⚠️</p>
            <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white mb-2">¿Eliminar tu cuenta?</h2>
            <p className="text-sm text-zinc-500 dark:text-gray-400 mb-1">Tu negocio y programa de fidelidad se desactivarán.</p>
            <p className="text-sm text-zinc-500 dark:text-gray-400 mb-5">
              Los datos de tus clientes (tarjetas y transacciones) quedan guardados.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 border border-zinc-200 dark:border-gray-700 text-zinc-600 dark:text-gray-300 font-semibold py-2.5 rounded-xl text-sm hover:bg-zinc-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={deleteAccount}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
