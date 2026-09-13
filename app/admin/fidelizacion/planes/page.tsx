'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type BizRow = {
  id: string
  name: string
  plan: string
  plan_expires_at: string | null
  billing_notes: string | null
  owner_user_id: string
  created_at: string
  loyalty_programs: { id: string }[]
}

const PLAN_OPTIONS = [
  { value: 'trial',    label: 'Trial',    color: 'bg-zinc-100 text-zinc-600' },
  { value: 'starter',  label: 'Starter',  color: 'bg-blue-100 text-blue-700' },
  { value: 'pro',      label: 'Pro',      color: 'bg-violet-100 text-violet-700' },
  { value: 'ultimate', label: 'Ultimate', color: 'bg-amber-100 text-amber-700' },
  { value: 'gifted',   label: 'Gifted 🎁', color: 'bg-green-100 text-green-700' },
]

function planStyle(plan: string) {
  return PLAN_OPTIONS.find(p => p.value === plan)?.color ?? 'bg-zinc-100 text-zinc-500'
}
function planLabel(plan: string) {
  return PLAN_OPTIONS.find(p => p.value === plan)?.label ?? plan
}

function PlanEditor({ biz, onSaved }: { biz: BizRow; onSaved: (b: BizRow) => void }) {
  const [plan, setPlan] = useState(biz.plan ?? 'trial')
  const [months, setMonths] = useState('')
  const [notes, setNotes] = useState(biz.billing_notes ?? '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function save() {
    setSaving(true); setMsg('')
    const res = await fetch('/api/fidelizacion/admin/set-plan', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_id: biz.id,
        plan,
        months: months ? parseInt(months) : undefined,
        billing_notes: notes,
      }),
    })
    const d = await res.json()
    if (res.ok) {
      setMsg('✓ Guardado')
      onSaved({ ...biz, plan, billing_notes: notes, plan_expires_at: d.plan_expires_at })
    } else {
      setMsg(`Error: ${d.error}`)
    }
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  return (
    <div className="border-t border-zinc-50 pt-3 mt-3 space-y-3">
      {/* Selector de plan */}
      <div className="flex flex-wrap gap-2">
        {PLAN_OPTIONS.map(p => (
          <button key={p.value} onClick={() => setPlan(p.value)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
              plan === p.value ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
            }`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Meses (para billing mensual) */}
      {(plan === 'starter' || plan === 'pro' || plan === 'ultimate') && (
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500 w-24 flex-shrink-0">Meses activos</label>
          <input type="number" min="1" max="24" value={months} onChange={e => setMonths(e.target.value)}
            placeholder="1 = 30 días · vacío = no vence"
            className="flex-1 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-violet-400" />
        </div>
      )}

      {/* Notas internas */}
      <div className="flex items-start gap-2">
        <label className="text-xs text-zinc-500 w-24 flex-shrink-0 mt-1.5">Notas</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
          placeholder="Ej: Pagó $19.99 vía MercadoPago 12/sep · renovar 12/oct"
          className="flex-1 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-violet-400 resize-none" />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving}
          className="bg-zinc-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-zinc-700 disabled:opacity-50 transition-colors">
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
        {msg && <span className={`text-xs font-semibold ${msg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>{msg}</span>}
      </div>
    </div>
  )
}

export default function PlanesPage() {
  const [businesses, setBusinesses] = useState<BizRow[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetch('/api/fidelizacion/admin/list-businesses')
      .then(r => r.json())
      .then(d => { setBusinesses(d.businesses ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? businesses : businesses.filter(b => b.plan === filter)

  function isExpired(b: BizRow) {
    if (!b.plan_expires_at) return false
    return new Date(b.plan_expires_at) < new Date()
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/fidelizacion" className="text-sm text-zinc-400 hover:text-zinc-600">← Fidelización</Link>
        <h1 className="text-2xl font-extrabold text-zinc-900">Gestión de planes</h1>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5">
        {[['all', 'Todos'], ...PLAN_OPTIONS.map(p => [p.value, p.label])].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v as string)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
              filter === v ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-400 text-sm">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-zinc-400 text-sm">Sin negocios</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(biz => (
            <div key={biz.id} className="bg-white border border-zinc-100 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 font-extrabold text-sm flex-shrink-0">
                    {biz.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-zinc-900 text-sm truncate">{biz.name}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{biz.owner_user_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  {isExpired(biz) ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">VENCIDO</span>
                  ) : (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${planStyle(biz.plan)}`}>
                      {planLabel(biz.plan)}
                    </span>
                  )}
                  {biz.plan_expires_at && (
                    <span className="text-[10px] text-zinc-400">
                      hasta {new Date(biz.plan_expires_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                    </span>
                  )}
                  <button onClick={() => setExpanded(expanded === biz.id ? null : biz.id)}
                    className="text-xs text-violet-600 font-semibold hover:text-violet-800 px-2 py-1 rounded-lg hover:bg-violet-50 transition-colors">
                    {expanded === biz.id ? 'Cerrar' : 'Editar'}
                  </button>
                </div>
              </div>

              {biz.billing_notes && expanded !== biz.id && (
                <p className="text-[10px] text-zinc-400 mt-2 italic">{biz.billing_notes}</p>
              )}

              {expanded === biz.id && (
                <PlanEditor biz={biz} onSaved={updated => {
                  setBusinesses(bs => bs.map(b => b.id === updated.id ? updated : b))
                  setExpanded(null)
                }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
