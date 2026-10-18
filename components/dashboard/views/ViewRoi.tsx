'use client'

import React from 'react'
import RoiCalculator from '@/components/roi/RoiCalculator'
import type { Program } from '@/types/dashboard'
import { ROI_PRESETS, type RoiReward } from '@/lib/roi'

interface ViewRoiProps {
  program: Program | undefined
}

/** Calculadora de ganancias del panel: arranca con la tarjeta real del negocio (sellos y premios) */
export default function ViewRoi({ program }: ViewRoiProps) {
  const base = ROI_PRESETS[ROI_PRESETS.length - 1]
  const goal = program?.stamps_goal ?? base.goal
  const ladder: RoiReward[] = [
    ...(program?.milestones ?? [])
      .filter(m => m.at > 0 && m.at < goal)
      .map(m => ({ at: m.at, name: m.label, cost: Math.round(base.ticket * 0.15 / 500) * 500 })),
    { at: goal, name: program?.reward_description?.trim() || 'Premio final', cost: Math.round(base.ticket * 0.3 / 500) * 500 },
  ]

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-1">Calculadora de ganancias</h1>
      <p className="text-sm text-zinc-500 dark:text-gray-400 mb-6 max-w-2xl">
        Cargamos tu tarjeta de {goal} sellos con tus premios. Poné cuánto te cuesta regalar cada uno y lo que cobrás por visita:
        te mostramos en pesos cuándo recuperás lo que pagás y cuánto te queda.
      </p>
      <RoiCalculator
        key={program?.id ?? 'sin-programa'}
        mode="full"
        initial={{ goal, rewards: ladder }}
      />
    </div>
  )
}
