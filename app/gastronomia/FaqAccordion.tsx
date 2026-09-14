'use client'

import { useState } from 'react'

type Faq = { q: string; a: string }

export default function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="divide-y divide-white/8">
      {faqs.map((faq, i) => (
        <div key={i} className="py-5">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full text-left flex justify-between items-start gap-4"
            aria-expanded={open === i}
          >
            <span className="font-semibold text-white text-base leading-snug">{faq.q}</span>
            <span
              className="text-slate-400 text-2xl flex-shrink-0 leading-none transition-transform duration-200"
              style={{ transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)' }}
            >
              +
            </span>
          </button>
          {open === i && (
            <p className="mt-3 text-slate-400 text-sm leading-relaxed max-w-prose">{faq.a}</p>
          )}
        </div>
      ))}
    </div>
  )
}
