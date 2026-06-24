'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function slugify(text: string) {
  return text.toLowerCase().normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
}

export default function NuevoEmpleadoPage() {
  const router = useRouter()
  const params = useParams()
  const bizId = params.id as string

  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true); setError('')

    const supabase = createClient()
    const slug = slugify(name) + '-' + Math.random().toString(36).slice(2, 6)

    const { error: err } = await supabase.from('employees').insert({
      business_id: bizId,
      name: name.trim(),
      slug,
      active: true,
      total_scans: 0,
    })

    if (err) {
      setError('Error al crear el empleado: ' + err.message)
      setLoading(false)
    } else {
      router.push(`/dashboard/negocios/${bizId}`)
    }
  }

  return (
    <div className="max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/dashboard/negocios/${bizId}`} className="text-sm text-gray-400 hover:text-gray-600">
          ← Volver
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900">Nuevo empleado</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <p className="text-sm text-gray-500 mb-6">
          Cada empleado tiene su propio QR. Así podés ver quién genera más reseñas y darle reconocimiento.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">{error}</div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Nombre del empleado
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: María García"
              autoFocus
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-400 placeholder-gray-300"
            />
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-700">¿Cómo funciona?</p>
            <p>Se genera un QR único para este empleado. Cuando un cliente lo escanea, el scan queda atribuido a su nombre.</p>
            <p>Podés imprimirlo en una tarjeta personal o pegarlo en su espacio de trabajo.</p>
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear empleado'}
          </button>
        </form>
      </div>
    </div>
  )
}
