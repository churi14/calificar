'use client'

import React, { useCallback, useEffect, useState } from 'react'

type Member = { id: string; email: string; branch_id: string | null; created_at: string; joined: boolean }

interface ViewEquipoProps {
  selectedProgram: string | null
  accessToken: string
  /** Sucursales reales (sin la principal) para limitar a una persona a un solo local */
  branches: { id: string; label: string }[]
}

export default function ViewEquipo({ selectedProgram, accessToken, branches }: ViewEquipoProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [branchId, setBranchId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [pending, setPending] = useState(false)

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  }

  const load = useCallback(async () => {
    if (!selectedProgram || !accessToken) return
    setLoading(true)
    try {
      const r = await fetch(`/api/fidelizacion/team?program_id=${selectedProgram}`, { headers })
      const d = await r.json()
      setMembers(d.members ?? [])
      setPending(!!d.migration_pending)
    } catch { /* se queda con la lista vacía */ }
    setLoading(false)
  }, [selectedProgram, accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load() }, [load])

  async function add() {
    setSaving(true); setError(''); setInfo('')
    const r = await fetch('/api/fidelizacion/team', {
      method: 'POST',
      headers,
      body: JSON.stringify({ program_id: selectedProgram, email, branch_id: branchId || undefined }),
    })
    const d = await r.json().catch(() => ({}))
    setSaving(false)
    if (!r.ok) { setError(d.error ?? 'No se pudo sumar a la persona'); return }
    setEmail(''); setBranchId('')
    setInfo('Listo. Pedile que entre a calificar.com.ar con ese mismo email.')
    load()
  }

  async function remove(m: Member) {
    if (!confirm(`¿Sacar a ${m.email} del equipo? Va a dejar de poder entrar.`)) return
    await fetch(`/api/fidelizacion/team?program_id=${selectedProgram}&member_id=${m.id}`, { method: 'DELETE', headers })
    load()
  }

  const branchLabel = (id: string | null) => (id ? branches.find(b => b.id === id)?.label ?? 'Una sucursal' : 'Todos los locales')

  return (
    <div className="p-4 md:p-8 w-full max-w-3xl">
      <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-1">Equipo</h1>
      <p className="text-sm text-zinc-500 dark:text-gray-400 mb-6 leading-relaxed">
        Sumá a tus empleados para que cada uno entre con su propio email, sin usar tu contraseña.
        Solo pueden <b>dar sellos, ver los clientes y canjear cupones</b>. No ven tus ventas ni pueden cambiar la tarjeta, los avisos ni los planes.
      </p>

      {pending && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl p-4 mb-5">
          El equipo todavía no está habilitado en la base de datos: falta correr la migración <b>team_members.sql</b>.
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5 mb-6">
        <p className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Sumar a una persona</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email@delempleado.com"
            aria-label="Email de la persona"
            className="flex-1 border-2 border-zinc-200 dark:border-gray-700 focus:border-violet-500 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-zinc-900 dark:text-white focus:outline-none"
          />
          {branches.length > 0 && (
            <select
              value={branchId}
              onChange={e => setBranchId(e.target.value)}
              aria-label="Local donde trabaja"
              className="border-2 border-zinc-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-zinc-900 dark:text-white focus:outline-none"
            >
              <option value="">Todos los locales</option>
              {branches.map(b => <option key={b.id} value={b.id}>Solo {b.label}</option>)}
            </select>
          )}
          <button
            onClick={add}
            disabled={saving || !email.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
            style={{ background: '#7C3AED' }}
          >
            {saving ? 'Sumando...' : 'Sumar'}
          </button>
        </div>
        <p className="text-xs text-zinc-400 mt-2">
          La persona entra con ese mismo email, con Google o con un email confirmado. Si la limitás a un local, todos sus sellos quedan en ese local.
        </p>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        {info && <p className="text-sm text-emerald-600 mt-2">{info}</p>}
      </div>

      <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl overflow-hidden">
        <p className="text-sm font-bold text-zinc-900 dark:text-white px-5 py-4 border-b border-zinc-100 dark:border-gray-800">
          Tu equipo {members.length > 0 && <span className="text-zinc-400 font-medium">({members.length})</span>}
        </p>
        {loading ? (
          <p className="text-sm text-zinc-400 px-5 py-6">Cargando...</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-zinc-400 px-5 py-6">Todavía no sumaste a nadie.</p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-gray-800">
            {members.map(m => (
              <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{m.email}</p>
                  <p className="text-xs text-zinc-400">
                    {branchLabel(m.branch_id)} · {m.joined ? 'ya entró' : 'todavía no entró'}
                  </p>
                </div>
                <button
                  onClick={() => remove(m)}
                  className="text-xs font-semibold text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50"
                >
                  Sacar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
