'use client'

import React from 'react'
import { CHANGELOG, PLAN_LABEL, PLAN_ORDER, type ChangelogPlan } from '@/lib/changelog'

const PLAN_STYLE: Record<ChangelogPlan, string> = {
  todos: 'bg-zinc-100 text-zinc-700',
  starter: 'bg-blue-50 text-blue-600',
  pro: 'bg-violet-50 text-violet-700',
  ultimate: 'bg-amber-50 text-amber-700',
}

interface WhatsNewPopupProps {
  onClose: () => void
  /** Si se pasa, el popup muestra solo esa versión (la actual); si no, todo el historial */
  onlyLatest?: boolean
}

export default function WhatsNewPopup({ onClose, onlyLatest = true }: WhatsNewPopupProps) {
  const entries = onlyLatest ? CHANGELOG.slice(0, 1) : CHANGELOG

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(24,24,27,0.55)' }}>
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden shadow-2xl shadow-violet-900/20">
        <div className="px-6 pt-6 pb-4 text-center border-b border-zinc-100 relative flex-shrink-0" style={{ background: 'linear-gradient(180deg, #F3EEFF 0%, #FFFFFF 100%)' }}>
          <button onClick={onClose} aria-label="Cerrar" className="absolute right-5 top-5 text-zinc-400 hover:text-zinc-700 text-xl leading-none">✕</button>
          <div className="inline-block bg-violet-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            Versión {entries[0].version}
          </div>
          <h2 className="text-zinc-900 font-black text-2xl leading-tight">¡Novedades en Calificar!</h2>
          <p className="text-zinc-600 text-sm mt-1.5">Esto es lo nuevo, según tu plan.</p>
        </div>

        <div className="overflow-y-auto px-5 py-4 space-y-5">
          {entries.map(entry => (
            <div key={entry.version} className="space-y-4">
              {!onlyLatest && (
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  v{entry.version} · {new Date(entry.date + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
              {PLAN_ORDER.map(plan => {
                const items = entry.items.filter(i => i.plan === plan)
                if (!items.length) return null
                return (
                  <div key={plan}>
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full mb-2 ${PLAN_STYLE[plan]}`}>
                      {PLAN_LABEL[plan]}
                    </span>
                    <ul className="space-y-2.5">
                      {items.map(i => (
                        <li key={i.title} className="flex gap-2.5">
                          <span className="text-violet-500 mt-0.5">✦</span>
                          <div>
                            <p className="text-sm font-semibold text-zinc-900 leading-snug">{i.title}</p>
                            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{i.desc}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-zinc-100 flex-shrink-0">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold transition-colors">
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
