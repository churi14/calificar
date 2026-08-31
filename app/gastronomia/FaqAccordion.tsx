'use client'

import { useState } from 'react'

type Faq = { q: string; a: string }

export default function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div>
      {faqs.map((faq, i) => (
        <div key={i} className="border-b border-zinc-200 py-5">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full text-left flex justify-between items-start gap-4"
            aria-expanded={open === i}
          >
            <span className="font-semibold text-zinc-900 text-base leading-snug">{faq.q}</span>
            <span
              className="text-zinc-400 text-2xl flex-shrink-0 leading-none transition-transform duration-200"
              style={{ transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)' }}
            >
              +
            </span>
          </button>
          {open === i && (
            <p className="mt-3 text-zinc-500 text-sm leading-relaxed max-w-prose">{faq.a}</p>
          )}
        </div>
      ))}
    </div>
  )
}
