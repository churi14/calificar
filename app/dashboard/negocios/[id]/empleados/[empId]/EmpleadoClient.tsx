'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Employee = { id: string; name: string; slug: string; active: boolean; total_scans: number }

export default function EmpleadoClient({
  employee, bizId, funnelUrl
}: {
  employee: Employee
  bizId: string
  funnelUrl: string
}) {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [name, setName] = useState(employee.name)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [copied, setCopied] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    import('qrcode').then(QRCode => {
      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, funnelUrl, {
          width: 180, margin: 1,
          color: { dark: '#111111', light: '#FFFFFF' }
        })
      }
    })
  }, [funnelUrl])

  async function downloadQR(format: 'png' | 'svg') {
    const QRCode = await import('qrcode')
    if (format === 'png') {
      const url = await QRCode.toDataURL(funnelUrl, { width: 400, margin: 2 })
      const a = document.createElement('a'); a.href = url
      a.download = `qr-${employee.slug}.png`; a.click()
    } else {
      const svg = await QRCode.toString(funnelUrl, { type: 'svg', margin: 2 })
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url
      a.download = `qr-${employee.slug}.svg`; a.click()
    }
  }

  async function copyUrl() {
    await navigator.clipboard.writeText(funnelUrl)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  async function saveName() {
    if (!name.trim() || name.trim() === employee.name) { setEditing(false); return }
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('employees').update({ name: name.trim() }).eq('id', employee.id)
    if (error) { setMsg('Error al guardar'); }
    else { setMsg('Guardado ✓'); router.refresh() }
    setSaving(false); setEditing(false)
    setTimeout(() => setMsg(''), 3000)
  }

  async function toggleActive() {
    const supabase = createClient()
    await supabase.from('employees').update({ active: !employee.active }).eq('id', employee.id)
    router.refresh()
  }

  async function deleteEmployee() {
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('employees').delete().eq('id', employee.id)
    router.push(`/dashboard/negocios/${bizId}`)
  }

  return (
    <div className="space-y-4">

      {/* QR individual */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-5">QR personal de {employee.name}</h2>
        <div className="flex flex-col sm:flex-row gap-5 items-start mb-5">
          <div className="bg-gray-50 rounded-2xl p-3 flex-shrink-0 self-center sm:self-start">
            <canvas ref={canvasRef} className="block rounded-lg"/>
          </div>
          <div className="w-full">
            <p className="text-sm font-semibold text-gray-800 mb-1">Listo para imprimir</p>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Cuando un cliente escanea este QR, el scan queda registrado a nombre de {employee.name}.
            </p>
            <div className="flex sm:flex-col gap-2">
              <button onClick={() => downloadQR('png')}
                className="flex-1 sm:flex-none text-sm bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-2.5 transition-colors text-gray-600 flex items-center justify-center sm:justify-start gap-2 font-medium">
                ↓ Descargar PNG
              </button>
              <button onClick={() => downloadQR('svg')}
                className="flex-1 sm:flex-none text-sm bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-2.5 transition-colors text-gray-600 flex items-center justify-center sm:justify-start gap-2 font-medium">
                ↓ Descargar SVG
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
          <span className="text-sm text-gray-500 font-mono flex-1 truncate">{funnelUrl}</span>
          <button onClick={copyUrl}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'}`}>
            {copied ? '✓ Copiado' : 'Copiar'}
          </button>
        </div>
      </div>

      {/* Editar nombre + acciones */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-bold text-gray-900">Configuración</h2>

        {msg && (
          <div className={`text-sm p-3 rounded-xl ${msg.includes('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {msg}
          </div>
        )}

        {/* Nombre */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nombre</label>
          {editing ? (
            <div className="flex gap-2">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-400"
                onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditing(false) }}
              />
              <button onClick={saveName} disabled={saving}
                className="bg-gray-900 text-white text-sm font-semibold px-4 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50">
                {saving ? '...' : 'OK'}
              </button>
              <button onClick={() => { setEditing(false); setName(employee.name) }}
                className="text-sm text-gray-400 px-3 rounded-xl hover:text-gray-600">
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-900">{employee.name}</span>
              <button onClick={() => setEditing(true)}
                className="text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors">
                Editar
              </button>
            </div>
          )}
        </div>

        {/* Estado */}
        <div className="flex items-center justify-between py-3 border-t border-gray-50">
          <div>
            <p className="text-sm font-medium text-gray-900">Estado</p>
            <p className="text-xs text-gray-400">{employee.active ? 'El QR está activo y cuenta scans' : 'El QR está pausado'}</p>
          </div>
          <button onClick={toggleActive}
            className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors ${employee.active ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
            {employee.active ? 'Pausar' : 'Activar'}
          </button>
        </div>

        {/* Eliminar */}
        <div className="pt-3 border-t border-gray-50">
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)}
              className="text-sm text-red-400 hover:text-red-600 font-medium transition-colors">
              Eliminar empleado
            </button>
          ) : (
            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-red-700 mb-1">¿Eliminar a {employee.name}?</p>
              <p className="text-xs text-red-500 mb-3">Los scans históricos se conservan, pero el QR dejará de funcionar.</p>
              <div className="flex gap-2">
                <button onClick={deleteEmployee} disabled={deleting}
                  className="flex-1 bg-red-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">
                  {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
                <button onClick={() => setConfirmDelete(false)}
                  className="flex-1 bg-white text-gray-600 text-sm font-semibold py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
