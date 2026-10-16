'use client'

import React, { useState, useEffect } from 'react'

// ── props ─────────────────────────────────────────────────────────────────────
interface ViewDominioPersonalizadoProps {
  selectedProgram: string | null
  accessToken: string
}

// ── componente ────────────────────────────────────────────────────────────────
export default function ViewDominioPersonalizado({
  selectedProgram,
  accessToken,
}: ViewDominioPersonalizadoProps) {
  const [domain, setDomain]             = useState('')
  const [savedDomain, setSavedDomain]   = useState<string | null>(null)
  const [verified, setVerified]         = useState(false)
  const [isUltimate, setIsUltimate]     = useState(false)
  const [loading, setLoading]           = useState(false)
  const [saving, setSaving]             = useState(false)
  const [deleting, setDeleting]         = useState(false)
  const [error, setError]               = useState('')
  const [success, setSuccess]           = useState('')
  const [cnameTarget, setCnameTarget]   = useState('cname.vercel-dns.com')
  const [showDnsHelp, setShowDnsHelp]   = useState(false)

  useEffect(() => {
    if (!selectedProgram) return
    setLoading(true)
    fetch(`/api/fidelizacion/custom-domain?program_id=${selectedProgram}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.json())
      .then(d => {
        setSavedDomain(d.custom_domain ?? null)
        setDomain(d.custom_domain ?? '')
        setVerified(d.verified ?? false)
        setIsUltimate(d.is_ultimate ?? false)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [selectedProgram, accessToken])

  async function save() {
    if (!domain.trim()) return
    setSaving(true); setError(''); setSuccess('')
    const res = await fetch('/api/fidelizacion/custom-domain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ program_id: selectedProgram, domain: domain.trim() }),
    })
    const d = await res.json()
    setSaving(false)
    if (!res.ok) { setError(d.error ?? 'Error guardando'); return }
    setSavedDomain(d.domain)
    setCnameTarget(d.cname_target ?? 'cname.vercel-dns.com')
    setSuccess('Dominio guardado. Configurá el CNAME en tu proveedor de DNS.')
    setShowDnsHelp(true)
  }

  async function remove() {
    if (!confirm('¿Eliminar el dominio personalizado?')) return
    setDeleting(true); setError(''); setSuccess('')
    await fetch(`/api/fidelizacion/custom-domain?program_id=${selectedProgram}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    setDeleting(false)
    setSavedDomain(null); setDomain(''); setVerified(false); setShowDnsHelp(false)
    setSuccess('Dominio eliminado.')
  }

  return (
    <div className="p-4 md:p-8 w-full">
      <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-1">Dominio personalizado</h1>
      <p className="text-zinc-400 dark:text-gray-500 text-sm mb-6">
        Hacé que tu tarjeta de fidelización sea accesible desde tu propio dominio —
        por ejemplo{' '}
        <span className="font-mono text-violet-600 dark:text-violet-400">tarjeta.milocal.com</span>{' '}
        en vez de calificar.com.ar.
      </p>

      {!isUltimate && !loading && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <span className="text-xl">🔒</span>
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Función Ultimate</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">El dominio personalizado está disponible en el plan Ultimate.</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-32 text-zinc-400 dark:text-gray-500 text-sm">Cargando...</div>
      )}

      {!loading && (
        <>
          {/* Estado actual */}
          {savedDomain && (
            <div className={`rounded-2xl p-4 mb-5 flex items-start gap-3 ${
              verified
                ? 'bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800'
                : 'bg-zinc-50 dark:bg-gray-900 border border-zinc-200 dark:border-gray-700'
            }`}>
              <span className="text-xl">{verified ? '✅' : '⏳'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-800 dark:text-gray-100 truncate">{savedDomain}</p>
                <p className="text-xs text-zinc-500 dark:text-gray-400 mt-0.5">
                  {verified ? 'Dominio verificado y activo' : 'Esperando configuración DNS'}
                </p>
              </div>
              <button
                onClick={remove}
                disabled={deleting}
                className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold shrink-0"
              >
                {deleting ? '...' : 'Eliminar'}
              </button>
            </div>
          )}

          {/* Input */}
          <div className="bg-white dark:bg-gray-900 border border-zinc-200 dark:border-gray-700 rounded-2xl p-5 mb-4">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-gray-500 block mb-2">
              Tu dominio
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={domain}
                onChange={e => { setDomain(e.target.value); setError('') }}
                placeholder="tarjeta.milocal.com"
                disabled={!isUltimate}
                className="flex-1 border border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-gray-600 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 disabled:opacity-50 transition-colors"
              />
              <button
                onClick={save}
                disabled={saving || !isUltimate || !domain.trim()}
                className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-5 py-3 rounded-xl text-sm disabled:opacity-50 transition-colors"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
            {error && <p className="text-xs text-red-500 dark:text-red-400 mt-2">{error}</p>}
            {success && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">{success}</p>}
          </div>

          {/* Instrucciones DNS */}
          {(showDnsHelp || savedDomain) && (
            <div className="bg-zinc-50 dark:bg-gray-900 border border-zinc-200 dark:border-gray-700 rounded-2xl p-5 mb-4">
              <button
                onClick={() => setShowDnsHelp(v => !v)}
                className="flex items-center justify-between w-full text-sm font-semibold text-zinc-700 dark:text-gray-300"
              >
                <span>📡 Instrucciones de configuración DNS</span>
                <span className="text-zinc-400 dark:text-gray-500">{showDnsHelp ? '▲' : '▼'}</span>
              </button>
              {showDnsHelp && (
                <div className="mt-4 space-y-3 text-sm text-zinc-600 dark:text-gray-400">
                  <p>Entrá al panel de DNS de tu dominio (Godaddy, Namecheap, NIC.ar, Cloudflare, etc.) y creá este registro:</p>
                  <div className="bg-white dark:bg-gray-800 border border-zinc-200 dark:border-gray-700 rounded-xl p-4 font-mono text-xs space-y-2">
                    <div className="flex gap-4">
                      <span className="text-zinc-400 dark:text-gray-500 w-16 shrink-0">Tipo</span>
                      <span className="font-bold text-zinc-900 dark:text-white">CNAME</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-zinc-400 dark:text-gray-500 w-16 shrink-0">Nombre</span>
                      <span className="font-bold text-violet-600 dark:text-violet-400">{savedDomain ?? domain}</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-zinc-400 dark:text-gray-500 w-16 shrink-0">Valor</span>
                      <span className="font-bold text-zinc-900 dark:text-white">{cnameTarget}</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-zinc-400 dark:text-gray-500 w-16 shrink-0">TTL</span>
                      <span className="text-zinc-600 dark:text-gray-400">3600 (o el valor más bajo disponible)</span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 dark:text-gray-500">
                    Los cambios DNS pueden tardar entre 5 minutos y 48 horas en propagarse.
                    Una vez activo, tu tarjeta quedará disponible en{' '}
                    <span className="font-mono">{savedDomain ?? domain}</span>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Cómo funciona */}
          <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500 mb-3">CÓMO FUNCIONA</p>
            <div className="space-y-3">
              {[
                { n: '1', text: 'Configurás un subdominio tuyo (ej: tarjeta.milocal.com) apuntando a nuestros servidores con un registro CNAME.' },
                { n: '2', text: 'Cuando un cliente visita ese dominio, ve tu tarjeta de fidelización — sin ninguna mención a calificar.com.ar.' },
                { n: '3', text: 'El QR de tu mostrador puede apuntar directamente a tu dominio para una experiencia 100% propia.' },
              ].map(s => (
                <div key={s.n} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {s.n}
                  </span>
                  <p className="text-sm text-zinc-600 dark:text-gray-400">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
