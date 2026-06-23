'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PLANS = [
  { value: 'free',  label: 'Gratis',  desc: 'Sin acceso a crear locales' },
  { value: 'basic', label: 'Básico',  desc: 'Hasta 3 locales' },
  { value: 'pro',   label: 'Pro',     desc: 'Locales ilimitados' },
]

export default function PlanChanger({ userId, currentPlan }: { userId: string; currentPlan: string }) {
  const router = useRouter()
  const [selected, setSelected] = useState(currentPlan)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function save() {
    if (selected === currentPlan) return
    setSaving(true); setMsg('')
    const res = await fetch('/api/admin/update-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, plan: selected })
    })
    if (res.ok) {
      setMsg('Plan actualizado ✓')
      router.refresh()
    } else {
      setMsg('Error al guardar')
    }
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="font-bold text-gray-900 mb-4">Cambiar plan</h2>
      <div className="space-y-2 mb-4">
        {PLANS.map(p => (
          <label key={p.value}
            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${selected === p.value ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}>
            <div>
              <p className="text-sm font-semibold text-gray-900">{p.label}</p>
              <p className="text-xs text-gray-400">{p.desc}</p>
            </div>
            <input type="radio" name="plan" value={p.value}
              checked={selected === p.value}
              onChange={() => setSelected(p.value)}
              className="hidden"/>
            {selected === p.value && <span className="w-4 h-4 rounded-full bg-gray-900 flex-shrink-0"/>}
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving || selected === currentPlan}
          className="flex-1 bg-gray-900 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-gray-700 transition-colors disabled:opacity-40">
          {saving ? 'Guardando...' : 'Guardar plan'}
        </button>
        {msg && (
          <span className={`text-xs font-semibold ${msg.includes('✓') ? 'text-green-600' : 'text-red-500'}`}>
            {msg}
          </span>
        )}
      </div>
    </div>
  )
}
