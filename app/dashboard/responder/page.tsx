'use client'

import { useState } from 'react'

export default function ResponderPage() {
  const [businessId, setBusinessId] = useState('')
  const [businessName, setBizName]  = useState('')
  const [review, setReview]         = useState('')
  const [rating, setRating]         = useState(5)
  const [tone, setTone]             = useState('profesional')
  const [response, setResponse]     = useState('')
  const [loading, setLoading]       = useState(false)
  const [copied, setCopied]         = useState(false)
  const [error, setError]           = useState('')

  async function generate() {
    if (!review.trim() || !businessName.trim()) return
    setLoading(true); setError(''); setResponse('')
    try {
      const res = await fetch('/api/ai-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: businessId, business_name: businessName, review_text: review, rating, tone })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setResponse(data.response)
    } finally {
      setLoading(false)
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(response)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">🤖 Responder con IA</h1>
        <p className="text-gray-500 text-sm mt-1">Pegá una reseña de Google y la IA te redacta la respuesta perfecta</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">{error}</div>}

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nombre del local *</label>
          <input value={businessName} onChange={e => setBizName(e.target.value)}
            placeholder="Café El Molino"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-400 placeholder-gray-300"/>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Calificación de la reseña — {rating}★
          </label>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(s => (
              <button key={s} onClick={() => setRating(s)} type="button"
                className={`text-2xl transition-transform hover:scale-110 ${s <= rating ? 'opacity-100' : 'opacity-20'}`}>
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tono de la respuesta</label>
          <div className="flex gap-2 flex-wrap">
            {[['profesional', '💼 Profesional'], ['cercano', '😊 Cercano'], ['formal', '🎩 Formal']].map(([val, label]) => (
              <button key={val} type="button" onClick={() => setTone(val)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${tone === val ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Reseña del cliente *</label>
          <textarea value={review} onChange={e => setReview(e.target.value)} rows={4}
            placeholder="Pegá acá el texto de la reseña..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-400 placeholder-gray-300 resize-none"/>
        </div>

        <button onClick={generate} disabled={loading || !review.trim() || !businessName.trim()}
          className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl text-sm hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>
              Generando respuesta...
            </>
          ) : '✨ Generar respuesta'}
        </button>
      </div>

      {response && (
        <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 text-sm">Respuesta generada</h3>
            <button onClick={copy}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{response}</p>
          <p className="text-xs text-gray-400 mt-4 flex items-center gap-1.5">
            <span>💡</span> Revisá la respuesta antes de publicarla en Google. Podés editarla a tu gusto.
          </p>
          <button onClick={generate}
            className="mt-3 text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2">
            Regenerar otra versión
          </button>
        </div>
      )}
    </div>
  )
}
