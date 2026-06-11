'use client'

import { useState } from 'react'

const WA = 'https://wa.me/5491100000000?text=Hola!%20Quiero%20info%20sobre%20Calificar%20para%20mi%20local.'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function ContactForm() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', message: '' })
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          message: form.message,
        }),
      })
      if (!res.ok) throw new Error()
      setStatus('sent')
      setForm({ firstName: '', lastName: '', email: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-violet-400 placeholder-gray-400"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input required placeholder="Nombre *" value={form.firstName}
          onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
          className={inputClass}/>
        <input required placeholder="Apellido *" value={form.lastName}
          onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
          className={inputClass}/>
      </div>
      <input required type="email" placeholder="Email *" value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        className={inputClass}/>
      <textarea required rows={4} placeholder="Dejanos un mensaje..." value={form.message}
        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
        className={`${inputClass} resize-none`}/>

      <div className="flex items-center gap-4 flex-wrap">
        <button type="submit" disabled={status === 'sending'}
          className="bg-violet-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-violet-700 transition-colors disabled:opacity-60 text-sm">
          {status === 'sending' ? 'Enviando...' : 'Enviar'}
        </button>
        {status === 'sent' && (
          <p className="text-sm text-green-600 font-medium">¡Gracias! Te respondemos a la brevedad.</p>
        )}
        {status === 'error' && (
          <p className="text-sm text-red-500">
            Hubo un error. Probá escribirnos por{' '}
            <a href={WA} target="_blank" className="underline font-medium">WhatsApp</a>.
          </p>
        )}
      </div>
    </form>
  )
}