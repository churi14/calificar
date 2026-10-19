'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import type { Program, Card } from '@/types/dashboard'

interface ViewClientesProps {
  cards: Card[]
  program: Program | undefined
  selectedProgram: string | null
  loading: boolean
  manualStamp: (id: string, name: string) => void
  accessToken: string
  /** Exportar la lista de clientes es del plan Pro en adelante */
  canExport?: boolean
  onClientDeleted: (cardId: string) => void
}

export default function ViewClientes({
  cards,
  program,
  selectedProgram,
  loading,
  manualStamp,
  accessToken,
  canExport = true,
  onClientDeleted,
}: ViewClientesProps) {
  const [search,        setSearch]        = useState('')
  const [filter,        setFilter]        = useState<'todos' | 'activo' | 'inactivo'>('todos')
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)
  const [deleting,      setDeleting]      = useState(false)

  const color   = program?.color_primary ?? '#7C3AED'
  const joinUrl = `https://calificar.com.ar/fidelizacion/unirse?program=${selectedProgram}`

  async function deleteClient(cardId: string) {
    setDeleting(true)
    try {
      await fetch(`/api/fidelizacion/admin/clients?card_id=${cardId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      onClientDeleted(cardId)
    } catch { /* silent */ }
    setDeleting(false)
    setDeleteConfirm(null)
  }

  /** Descarga la lista de clientes (la que se ve filtrada) como CSV, listo para abrir en Excel */
  function exportClients() {
    const clean = (v: string | number | null | undefined) => {
      let t = String(v ?? '')
      if (/^[=+\-@]/.test(t)) t = `'${t}`          // evita que Excel lo tome como fórmula
      return `"${t.replace(/"/g, '""')}"`
    }
    const rows = [
      ['Nombre', 'Teléfono', 'Sellos actuales', 'Visitas totales', 'Cumpleaños', 'Cliente desde'],
      ...filtered.map(c => [
        c.name, c.phone, c.stamps, c.total_visits,
        c.birth_date ?? '',
        c.created_at ? new Date(c.created_at).toLocaleDateString('es-AR') : '',
      ]),
    ]
    const csv = String.fromCharCode(0xFEFF) + rows.map(r => r.map(clean).join(';')).join(String.fromCharCode(13, 10))
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `clientes-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const filtered = cards.filter(c => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.dni ? c.dni.includes(q) : false)
    if (filter === 'activo')   return matchSearch && c.stamps > 0
    if (filter === 'inactivo') return matchSearch && c.stamps === 0
    return matchSearch
  })

  return (
    <div className="p-4 md:p-8 w-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Clientes</h1>
          <p className="text-zinc-400 text-sm mt-0.5">
            {cards.length === 0
              ? 'Nadie está inscrito en tu programa todavía.'
              : `${cards.length} clientes registrados.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {cards.length > 0 && (
            <button
              onClick={canExport ? exportClients : undefined}
              disabled={!canExport}
              title={canExport ? undefined : 'Exportar clientes es del plan Pro en adelante'}
              className="flex items-center gap-2 text-sm font-semibold border border-zinc-200 dark:border-gray-700 text-zinc-700 dark:text-gray-200 px-4 py-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {canExport ? '⬇ Exportar clientes' : '🔒 Exportar (Pro)'}
            </button>
          )}
          <button className="flex items-center gap-2 text-sm font-bold text-white px-4 py-2.5 rounded-xl" style={{ background: '#7C3AED' }}>
            + Agregar un cliente
          </button>
        </div>
      </div>

      {cards.length === 0 ? (
        /* Empty state */
        <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-12 flex flex-col items-center text-center">
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white mb-2">Empieza por que te escaneen.</h2>
          <p className="text-zinc-400 text-sm mb-8 max-w-sm">
            Mostrá el QR en el mostrador. La primera persona que lo escanee aparece acá con su nombre y sus sellos.
          </p>
          <div className="bg-zinc-50 dark:bg-gray-800 rounded-2xl border border-zinc-100 dark:border-gray-700 p-6 flex flex-col items-center gap-4">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(joinUrl)}&color=0F172A&bgcolor=FFFFFF&qzone=1`}
              alt="QR" width={160} height={160} className="rounded-xl"
            />
            <p className="font-semibold text-zinc-800 dark:text-gray-100 text-sm">
              {program?.name?.replace('Tarjeta de Sellos — ', '') ?? 'Tarjeta de sellos'}
            </p>
            <div className="flex gap-2 flex-wrap justify-center">
              <button onClick={() => window.open(joinUrl, '_blank')}
                className="text-xs font-bold bg-zinc-900 dark:bg-zinc-700 text-white px-4 py-2 rounded-xl">
                Ampliar
              </button>
              <button onClick={() => navigator.clipboard.writeText(joinUrl)}
                className="text-xs font-medium border border-zinc-200 dark:border-gray-700 text-zinc-600 dark:text-gray-300 px-4 py-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-gray-800">
                Copiar
              </button>
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(joinUrl)}&color=0F172A&bgcolor=FFFFFF&qzone=1`}
                download="qr-calificar.png" target="_blank" rel="noopener noreferrer"
                className="text-xs font-medium border border-zinc-200 dark:border-gray-700 text-zinc-600 dark:text-gray-300 px-4 py-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-gray-800 flex items-center gap-1">
                🖨️ Imprimir un cartel
              </a>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-4">O agregá a alguien a mano ↑</p>
        </div>
      ) : (
        <>
          {/* Filtros + búsqueda */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="flex gap-1 bg-zinc-100 dark:bg-gray-800 rounded-xl p-1">
              {([['todos', 'Todos'], ['activo', 'Activo'], ['inactivo', 'Inactivo']] as const).map(([id, label]) => (
                <button key={id} onClick={() => setFilter(id)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filter === id
                      ? 'bg-white dark:bg-gray-700 text-zinc-900 dark:text-white shadow-sm'
                      : 'text-zinc-500 dark:text-gray-400 hover:text-zinc-700 dark:hover:text-gray-200'
                  }`}>
                  {label}{' '}
                  <span className="tabular-nums">
                    {id === 'todos'    ? cards.length
                    : id === 'activo'  ? cards.filter(c => c.stamps > 0).length
                    : cards.filter(c => c.stamps === 0).length}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2 border border-zinc-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-gray-900">
              <span className="text-zinc-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Buscar por nombre, teléfono o DNI..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="text-sm text-zinc-700 dark:text-gray-200 placeholder-zinc-400 dark:placeholder-gray-600 focus:outline-none w-56 bg-transparent"
              />
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">
                <p className="text-sm font-semibold">Sin resultados</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-gray-800 bg-zinc-50 dark:bg-gray-800">
                    {['Cliente', 'Teléfono', 'Sellos', 'Visitas', 'Cumpleaños', 'Acciones'].map(h => (
                      <th key={h} className="text-left px-5 py-3 font-semibold text-zinc-400 dark:text-gray-500 text-[10px] uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-gray-800">
                  {filtered.map(c => (
                    <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                            style={{ backgroundColor: color }}>
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-zinc-900 dark:text-white">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-zinc-500 dark:text-gray-400 text-xs">{c.phone}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 bg-zinc-100 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full"
                              style={{
                                width: `${Math.min((c.stamps / (program?.stamps_goal ?? 10)) * 100, 100)}%`,
                                backgroundColor: color,
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-zinc-900 dark:text-white tabular-nums">
                            {c.stamps}/{program?.stamps_goal}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-zinc-500 dark:text-gray-400 text-xs text-center tabular-nums">
                        {c.total_visits}
                      </td>
                      <td className="px-5 py-4 text-zinc-500 dark:text-gray-400 text-xs">
                        {c.birth_date
                          ? (() => {
                              const [, m, d] = c.birth_date.split('-')
                              return `${parseInt(d)}/${parseInt(m)}`
                            })()
                          : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/fidelizacion/tarjeta?card=${c.id}&program=${selectedProgram}`}
                            className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium">
                            Ver
                          </Link>
                          <button
                            onClick={() => manualStamp(c.id, c.name)}
                            className="text-xs bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-800 px-2.5 py-1 rounded-lg font-semibold transition-colors">
                            + Sello
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ id: c.id, name: c.name })}
                            className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg font-semibold transition-colors hover:bg-red-50 dark:hover:bg-red-950">
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Modal confirmar eliminar */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm p-6">
            <p className="text-2xl mb-3">🗑️</p>
            <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white mb-2">
              ¿Eliminar a {deleteConfirm.name}?
            </h2>
            <p className="text-sm text-zinc-500 dark:text-gray-400 mb-5">
              El cliente desaparecerá de tu lista. Si tiene la tarjeta guardada en el Wallet, seguirá viéndola pero no podrá acumular más sellos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 border border-zinc-200 dark:border-gray-700 text-zinc-600 dark:text-gray-300 font-semibold py-2.5 rounded-xl text-sm hover:bg-zinc-50 dark:hover:bg-gray-800 transition-colors">
                Cancelar
              </button>
              <button
                onClick={() => deleteClient(deleteConfirm.id)}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                {deleting ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
