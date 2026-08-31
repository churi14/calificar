'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type LocalData = {
  business_name: string
  google_url: string | null
  menu_url: string | null
  code: string
}

type Screen = 'home' | 'mozo' | 'thanks'

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`w-10 h-10 transition-colors ${filled ? 'fill-yellow-400 stroke-yellow-400' : 'fill-transparent stroke-gray-300'}`} strokeWidth="1.5">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

const STAR_LABELS = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente']

export default function LinktreePage() {
  const params = useParams()
  const code = params.code as string

  const [local, setLocal] = useState<LocalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [screen, setScreen] = useState<Screen>('home')
  const [stars, setStars] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    fetch(`/api/linktree/${code}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setNotFound(true) } else { setLocal(d) }
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [code])

  // Countdown after thanks screen
  useEffect(() => {
    if (screen !== 'thanks') return
    if (countdown <= 0) {
      if (local?.google_url) window.location.href = local.google_url
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [screen, countdown, local])

  async function handleSubmit() {
    if (!stars) return
    setSubmitting(true)
    await fetch('/api/mozo/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, stars, comment }),
    })
    setSubmitting(false)
    setScreen('thanks')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (notFound || !local) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
        <p className="text-5xl mb-4">🔍</p>
        <h1 className="font-bold text-gray-900 text-xl mb-2">Local no encontrado</h1>
        <p className="text-gray-400 text-sm">Este código QR no está activo todavía.</p>
      </div>
    )
  }

  // PANTALLA PRINCIPAL
  if (screen === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex flex-col items-center justify-center px-6 py-12">
        {/* Logo / nombre */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-200">
            <span className="text-white text-3xl font-extrabold">
              {local.business_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <h1 className="font-extrabold text-2xl text-gray-900">{local.business_name}</h1>
          <p className="text-gray-400 text-sm mt-1">¿Qué querés hacer?</p>
        </div>

        {/* Botones */}
        <div className="w-full max-w-xs space-y-3">

          {local.menu_url && (
            <a
              href={local.menu_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all group"
            >
              <span className="text-2xl">🍽️</span>
              <div className="flex-1 text-left">
                <p className="font-bold text-gray-900">Ver el menú</p>
                <p className="text-xs text-gray-400">Carta completa del local</p>
              </div>
              <span className="text-gray-300 group-hover:text-gray-500 transition-colors">→</span>
            </a>
          )}

          <button
            onClick={() => setScreen('mozo')}
            className="flex items-center gap-4 w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md hover:border-yellow-300 transition-all group text-left"
          >
            <span className="text-2xl">👨‍🍳</span>
            <div className="flex-1">
              <p className="font-bold text-gray-900">Calificar al mozo</p>
              <p className="text-xs text-gray-400">Dejá tu opinión del servicio</p>
            </div>
            <span className="text-gray-300 group-hover:text-yellow-400 transition-colors">→</span>
          </button>

          {local.google_url && (
            <a
              href={local.google_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
            >
              <span className="text-2xl">🗺️</span>
              <div className="flex-1 text-left">
                <p className="font-bold text-gray-900">Calificar en Google Maps</p>
                <p className="text-xs text-gray-400">Dejá una reseña del local</p>
              </div>
              <span className="text-gray-300 group-hover:text-blue-400 transition-colors">→</span>
            </a>
          )}
        </div>

        <p className="mt-10 text-xs text-gray-300">Powered by Calificar.com.ar</p>
      </div>
    )
  }

  // PANTALLA CALIFICAR MOZO
  if (screen === 'mozo') {
    const active = hovered || stars
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white flex flex-col items-center justify-center px-6 py-12">
        <button
          onClick={() => setScreen('home')}
          className="self-start mb-6 text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
        >
          ← Volver
        </button>

        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="text-5xl mb-4 block">👨‍🍳</span>
            <h2 className="font-extrabold text-2xl text-gray-900 mb-1">¿Cómo fue el servicio?</h2>
            <p className="text-gray-400 text-sm">{local.business_name}</p>
          </div>

          {/* Estrellas */}
          <div className="flex justify-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map(i => (
              <button
                key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setStars(i)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <StarIcon filled={i <= active} />
              </button>
            ))}
          </div>

          <div className="text-center mb-6 h-5">
            {active > 0 && (
              <span className="text-sm font-semibold text-yellow-600">
                {STAR_LABELS[active]}
              </span>
            )}
          </div>

          {/* Comentario */}
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="¿Querés dejar algún comentario? (opcional)"
            rows={3}
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-yellow-400 resize-none mb-4"
          />

          <button
            onClick={handleSubmit}
            disabled={!stars || submitting}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-4 rounded-2xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-base"
          >
            {submitting ? 'Enviando…' : 'Enviar y calificar en Google →'}
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">
            Después de enviar te llevamos a Google para dejar tu reseña del local.
          </p>
        </div>
      </div>
    )
  }

  // PANTALLA GRACIAS
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center px-6 text-center">
      <span className="text-6xl mb-4">🙌</span>
      <h2 className="font-extrabold text-2xl text-gray-900 mb-2">¡Gracias por tu opinión!</h2>
      <p className="text-gray-500 text-base mb-6">
        Ahora te llevamos a Google para que puedas dejar tu reseña del local.
      </p>
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <span className="font-extrabold text-2xl text-green-600">{countdown}</span>
      </div>
      <p className="text-xs text-gray-400 mt-4">Redirigiendo en {countdown}…</p>
      {local.google_url && (
        <a href={local.google_url} className="mt-4 text-sm text-violet-600 underline">
          Ir ahora
        </a>
      )}
    </div>
  )
}
