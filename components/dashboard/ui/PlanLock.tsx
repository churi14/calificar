'use client'

import React from 'react'

/** Cartel de "esta función es de otro plan", con botón para ver los planes */
export default function PlanLock({ title, minPlan, children, onSeePlans }: {
  title: string
  minPlan: 'Pro' | 'Ultimate'
  children?: React.ReactNode
  onSeePlans: () => void
}) {
  return (
    <div className="p-4 md:p-8 w-full">
      <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-1">{title}</h1>
      <div className="mt-6 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 flex items-start gap-4 max-w-2xl">
        <span className="text-2xl">🔒</span>
        <div>
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Función del plan {minPlan}</p>
          <div className="text-sm text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">{children}</div>
          <button
            onClick={onSeePlans}
            className="mt-4 text-sm font-bold text-white px-5 py-2.5 rounded-xl"
            style={{ background: '#7C3AED' }}
          >
            Ver planes →
          </button>
        </div>
      </div>
    </div>
  )
}
