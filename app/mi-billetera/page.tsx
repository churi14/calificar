'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type CardEntry = {
  programId: string
  cardId: string
  programName: string
  businessName: string
  stamps: number
  stampsGoal: number
  rewardDescription: string
  colorPrimary: string
  cardTextColor: string | null
  appIconUrl: string | null
  logoUrl: string | null
  loading: boolean
}

export default function MiBilletera() {
  const [cards, setCards] = useState<CardEntry[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Leer todos los loyalty_card_* del localStorage
    const entries: CardEntry[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith('loyalty_card_')) continue
      const programId = key.replace('loyalty_card_', '')
      const cardId = localStorage.getItem(key)
      if (!cardId) continue
      entries.push({
        programId,
        cardId,
        programName: '',
        businessName: '',
        stamps: 0,
        stampsGoal: 0,
        rewardDescription: '',
        colorPrimary: '#7C3AED',
        cardTextColor: null,
        appIconUrl: null,
        logoUrl: null,
        loading: true,
      })
    }

    setCards(entries)
    setReady(true)

    // Fetch datos de cada tarjeta
    entries.forEach(entry => {
      fetch(`/api/fidelizacion/card?card_id=${entry.cardId}`)
        .then(r => r.json())
        .then(data => {
          if (!data.card) return
          const prog = data.card.loyalty_programs
          setCards(prev => prev.map(c =>
            c.cardId === entry.cardId ? {
              ...c,
              programName: prog?.name ?? '',
              businessName: prog?.businesses?.name ?? prog?.name ?? '',
              stamps: data.card.stamps,
              stampsGoal: prog?.stamps_goal ?? 0,
              rewardDescription: prog?.reward_description ?? '',
              colorPrimary: prog?.color_primary ?? '#7C3AED',
              cardTextColor: prog?.card_text_color ?? null,
              appIconUrl: prog?.app_icon_url ?? null,
              logoUrl: prog?.logo_url ?? null,
              loading: false,
            } : c
          ))
        })
        .catch(() => {
          setCards(prev => prev.map(c => c.cardId === entry.cardId ? { ...c, loading: false } : c))
        })
    })
  }, [])

  if (!ready) return null

  if (cards.length === 0) {
    return (
      <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-4">🎴</div>
        <h1 className="text-xl font-extrabold text-white mb-2">Tu billetera está vacía</h1>
        <p className="text-sm text-zinc-400">Escaneá el QR de un local para sumar tu primera tarjeta.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 pt-12 pb-10">
      <div className="max-w-sm mx-auto">
        <h1 className="text-2xl font-extrabold text-white mb-1">Mi billetera</h1>
        <p className="text-sm text-zinc-400 mb-6">Todas tus tarjetas de fidelidad</p>

        <div className="flex flex-col gap-4">
          {cards.map(card => {
            const textColor = card.cardTextColor ?? '#FFFFFF'
            const progress = card.stampsGoal > 0 ? Math.min((card.stamps / card.stampsGoal) * 100, 100) : 0

            return (
              <Link
                key={card.cardId}
                href={`/fidelizacion/tarjeta?card=${card.cardId}&program=${card.programId}`}
                className="block rounded-3xl overflow-hidden active:scale-[0.98] transition-transform"
                style={{ backgroundColor: card.colorPrimary }}
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs font-medium opacity-70" style={{ color: textColor }}>Tarjeta de fidelidad</p>
                      <p className="text-lg font-extrabold leading-tight" style={{ color: textColor }}>
                        {card.loading ? '...' : card.businessName}
                      </p>
                    </div>
                    {card.appIconUrl ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={card.appIconUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : card.logoUrl ? (
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img src={card.logoUrl} alt="" className="w-9 h-9 object-contain" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-lg font-extrabold flex-shrink-0" style={{ color: textColor }}>
                        {card.businessName.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                  </div>

                  {/* Sellos */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold" style={{ color: textColor }}>
                      {card.loading ? '...' : `${card.stamps} de ${card.stampsGoal} sellos`}
                    </span>
                    <span className="text-xs opacity-70" style={{ color: textColor }}>
                      {card.rewardDescription}
                    </span>
                  </div>

                  {/* Barra progreso */}
                  <div className="w-full h-1.5 rounded-full bg-white/20">
                    <div
                      className="h-1.5 rounded-full bg-white/70 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <p className="text-xs text-zinc-600 text-center mt-8">
          Tus tarjetas se guardan en este dispositivo
        </p>
      </div>
    </main>
  )
}
