'use client'

import React from 'react'

/**
 * Interruptor con etiquetas Off / On a los costados (violeta de la marca).
 * La perilla se posiciona con `left` explícito, así nunca se sale del botón.
 */
const SIZES = {
  sm: { h: 20, label: 'text-[9px]',  gap: 6 },
  md: { h: 26, label: 'text-[10px]', gap: 8 },
  lg: { h: 36, label: 'text-xs',     gap: 10 },
} as const

interface ToggleProps {
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
  size?: keyof typeof SIZES
  /** Mostrar las etiquetas Off / On (default true) */
  labels?: boolean
  'aria-label'?: string
}

export default function Toggle({
  checked, onChange, disabled = false, size = 'md', labels = true, 'aria-label': ariaLabel,
}: ToggleProps) {
  const { h, label, gap } = SIZES[size]
  const w = h * 2
  const knob = Math.round(h * 0.75)
  const pad = (h - knob) / 2

  return (
    <div className="inline-flex items-center flex-shrink-0" style={{ gap }}>
      {labels && (
        <span
          className={`${label} font-bold uppercase tracking-widest transition-opacity ${checked ? 'opacity-40' : 'opacity-100'} text-zinc-500 dark:text-gray-400`}
        >
          Off
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${checked ? 'bg-violet-600' : 'bg-zinc-300 dark:bg-gray-700'}`}
        style={{ width: w, height: h }}
      >
        <span
          className="absolute rounded-full bg-white shadow-md transition-[left] duration-200"
          style={{ width: knob, height: knob, top: pad, left: checked ? w - knob - pad : pad }}
        />
      </button>
      {labels && (
        <span
          className={`${label} font-bold uppercase tracking-widest transition-opacity ${checked ? 'opacity-100 text-violet-600 dark:text-violet-400' : 'opacity-40 text-zinc-500 dark:text-gray-400'}`}
        >
          On
        </span>
      )}
    </div>
  )
}
