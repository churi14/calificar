'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatDate, planLabel, planColor } from '@/lib/utils'

type Profile = { id: string; name: string; email: string; plan: string; created_at: string }
type Business = { id: string; name: string; slug: string; active: boolean; total_scans: number; positive_scans: number; created_at: string }

const PLANS = [
  { value: 'free', label: 'Gratis', desc: 'Sin acceso a crear locales' },
  { value: 'basic', label: 'Básico', desc: 'Hasta 3 locales' },
  { value: 'pro', label: 'Pro', desc: 'Locales ilimitados' },
]

export default function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [selectedPlan, setSelectedPlan] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: p } = await supabase
        .from('profiles').select('id, name, email, plan, created_at').eq('id', id).single()
      const { data: b } = await supabase
        .from('businesses').select('id, name, slug, active, total_scans, positive_scans, created_at')
        .eq('owner_id', id).order('created_at', { ascending: false })
      setProfile(p)
      setBusinesses(b ?? [])
      setSelectedPlan(p?.plan ?? 'free')
      setLoading(false)
    }
    load()
  }, [id])

  async function savePlan() {
    if (!profile || selectedPlan === profile.plan) return
    setSaving(true); setSaveMsg('')
    const res = await fetch('/api/admin/update-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id, plan: selectedPlan })
    })
    if (res.ok) {
      setProfile(p => p ? { ...p, plan: selectedPlan } : p)
      setSaveMsg('Plan actualizado ✓')
    } else {
      setSaveMsg('Error al guardar')
    }
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-100 rounded-xl animate-pulse w-48"/>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 h-40 animate-pulse"/>
      </div>
    )
  }

  if (!profile) {
    return <div className="text-gray-400">Cliente no encontrado.</div>
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/clientes" className="text-sm text-gray-400 hover:text-gray-600">← Clientes</Link>
        <span className="text-gray-200">/</span>
        <h1 className="text-2xl font-extrabold text-gray-900">{profile.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* PERFIL + PLAN */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-600">
                {profile.name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="font-bold text-gray-900">{profile.name}</p>
                <p className="text-sm text-gray-400">{profile.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-2 border-t border-gray-50">
                <span className="text-gray-400">Plan actual</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${planColor(profile.plan)}`}>
                  {planLabel(profile.plan)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-gray-50">
                <span className="text-gray-400">Locales</span>
                <span className="font-semibold text-gray-900">{businesses.length}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-gray-50">
                <span className="text-gray-400">Registrado</span>
                <span className="text-gray-500 text-xs">{formatDate(profile.created_at)}</span>
              </div>
            </div>
          </div>

          {/* CAMBIAR PLAN */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Cambiar plan</h2>
            <div className="space-y-2 mb-4">
              {PLANS.map(p => (
                <label key={p.value}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${selectedPlan === p.value ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{p.label}</p>
                    <p className="text-xs text-gray-400">{p.desc}</p>
                  </div>
                  <input type="radio" name="plan" value={p.value}
                    checked={selectedPlan === p.value}
                    onChange={() => setSelectedPlan(p.value)}
                    className="hidden"/>
                  {selectedPlan === p.value && (
                    <span className="w-4 h-4 rounded-full bg-gray-900 flex-shrink-0"/>
                  )}
                </label>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={savePlan} disabled={saving || selectedPlan === profile.plan}
                className="flex-1 bg-gray-900 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-gray-700 transition-colors disabled:opacity-40">
                {saving ? 'Guardando...' : 'Guardar plan'}
              </button>
              {saveMsg && (
                <span className={`text-xs font-semibold ${saveMsg.includes('✓') ? 'text-green-600' : 'text-red-500'}`}>
                  {saveMsg}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* NEGOCIOS DEL CLIENTE */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-5">Locales ({businesses.length})</h2>
            {businesses.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Sin locales todavía</p>
            ) : (
              <div className="space-y-3">
                {businesses.map(b => {
                  const conv = b.total_scans ? Math.round((b.positive_scans / b.total_scans) * 100) : 0
                  return (
                    <div key={b.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-gray-900">{b.name}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${b.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                            {b.active ? 'Activo' : 'Pausado'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">calificar.com.ar/r/{b.slug}</p>
                      </div>
                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{b.total_scans ?? 0}</p>
                          <p className="text-[10px] text-gray-400">Scans</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-amber-500">{conv}%</p>
                          <p className="text-[10px] text-gray-400">Conv.</p>
                        </div>
                        <p className="text-xs text-gray-300">{formatDate(b.created_at)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
