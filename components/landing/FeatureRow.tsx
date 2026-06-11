'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type Props = {
  title: string
  description: string
  imageSide: 'left' | 'right'
  imageLabel: string
  ctaText?: string
  ctaHref?: string
}

export default function FeatureRow({ title, description, imageSide, imageLabel, ctaText, ctaHref }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`flex flex-col ${imageSide === 'left' ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10 md:gap-16
        transition-all duration-700 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      {/* Placeholder de imagen — siempre primero en mobile */}
      <div className="w-full md:w-1/2">
        <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg flex items-center justify-center text-gray-400 text-sm">
          {imageLabel}
        </div>
      </div>

      {/* Texto */}
      <div className="w-full md:w-1/2">
        <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-gray-900 mb-4">
          {title}
        </h3>
        <p className="text-gray-500 leading-relaxed mb-6">
          {description}
        </p>
        {ctaText && ctaHref && (
          <Link href={ctaHref}
            className="inline-flex items-center justify-center bg-[#1A1A2E] text-white font-semibold px-8 py-4 rounded-full hover:bg-[#2A2A45] transition-colors text-sm">
            {ctaText}
          </Link>
        )}
      </div>
    </div>
  )
}