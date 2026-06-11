'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type Props = {
  contentAlign: 'left' | 'right'
  bgColor: string
  textColorClass: string
  mutedColorClass: string
  imageLabel: string
  title: string
  description: string
  ctaText?: string
  ctaHref?: string
}

function useInView(threshold = 0.2) {
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
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, visible }
}

export default function OffsetBlock({
  contentAlign, bgColor, textColorClass, mutedColorClass,
  imageLabel, title, description, ctaText, ctaHref,
}: Props) {
  const { ref, visible } = useInView(0.2)

  // Si el texto va a la derecha, la imagen va a la izquierda
  const imageOnLeft = contentAlign === 'right'

  return (
    <div
      ref={ref}
      // ACÁ ESTÁ LA MAGIA: El bloque ahora ocupa el 85% del ancho máximo.
      // mr-auto empuja todo a la izquierda. ml-auto empuja todo a la derecha.
      className={`relative w-full lg:w-[90%] xl:w-[85%] flex flex-col md:flex-row md:items-center
        ${imageOnLeft ? 'md:mr-auto' : 'md:ml-auto'}
        transition-all duration-1000 ease-out transform
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
    >

      {/* IMAGEN BLANCA */}
      <div className={`
        z-20 w-[90%] sm:w-[80%] mx-auto aspect-[4/3] rounded-[2rem] bg-white shadow-2xl flex items-center justify-center text-gray-400 font-medium border border-gray-100
        relative -mb-12 sm:-mb-16
        md:absolute md:mb-0 md:top-1/2 md:-translate-y-1/2 md:w-[45%] lg:w-[42%] md:max-w-[500px]
        ${imageOnLeft ? 'md:left-0' : 'md:right-0'}
      `}>
        {imageLabel}
      </div>

      {/* CAJA DE COLOR */}
      <div className={`
        relative z-10 w-full rounded-[2rem] ${bgColor} min-h-[350px]
        pt-24 pb-10 px-6 sm:px-10
        md:w-[85%] flex flex-col justify-center
        ${imageOnLeft 
          ? 'md:ml-auto md:pl-[40%] lg:pl-[38%] md:pr-10 lg:pr-16 md:py-16' // Caja a la derecha, padding izq
          : 'md:mr-auto md:pr-[40%] lg:pr-[38%] md:pl-10 lg:pl-16 md:py-16' // Caja a la izquierda, padding der
        }
      `}>
        <div>
          <h3 className={`font-display font-extrabold text-3xl sm:text-4xl mb-4 leading-tight ${textColorClass}`}>
            {title}
          </h3>
          <p className={`text-lg leading-relaxed mb-6 ${mutedColorClass}`}>
            {description}
          </p>
          
          {ctaText && ctaHref && (
            <div>
              <Link href={ctaHref}
                className="inline-flex items-center justify-center bg-[#1A1A2E] text-white font-semibold px-8 py-3.5 rounded-full hover:bg-[#2A2A45] transition-colors shadow-lg">
                {ctaText}
              </Link>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}