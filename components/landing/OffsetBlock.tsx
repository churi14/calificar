'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type Props = {
  contentAlign: 'left' | 'right'
  bgColor: string
  textColorClass: string
  mutedColorClass: string
  imageUrl?: string
  imageAlt?: string
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
  imageUrl, imageAlt, title, description, ctaText, ctaHref,
}: Props) {
  const { ref, visible } = useInView(0.2)

  const imageOnLeft = contentAlign === 'right'

  return (
    <div
      ref={ref}
      className={`relative w-[90%] sm:w-[85%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[45%] flex flex-col md:flex-row md:items-center
        ${imageOnLeft ? 'ml-auto' : 'mr-auto'}
        transition-all duration-1000 ease-out transform
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
    >

      {/* IMAGEN FLOTANTE */}
      <div className={`
        relative z-20 w-[90%] sm:w-[80%] mx-auto aspect-[4/3]
        -mb-12 sm:-mb-16
        md:absolute md:mb-0 md:top-1/2 md:-translate-y-1/2 md:w-[50%] lg:w-[48%] md:max-w-[450px]
        ${imageOnLeft ? 'md:left-0' : 'md:right-0'}
      `}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt ?? title}
            fill
            className="object-contain scale-[1.15] drop-shadow-xl hover:scale-[1.20] transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm font-medium">
            Sin imagen
          </div>
        )}
      </div>

      {/* CAJA DE COLOR */}
      <div className={`
        relative z-10 w-full rounded-[2rem] ${bgColor} min-h-[350px]
        ${imageOnLeft ? 'md:rounded-r-none' : 'md:rounded-l-none'}
        pt-24 pb-10 px-6 sm:px-10
        md:w-[90%] flex flex-col justify-center
        ${imageOnLeft
          ? 'md:ml-auto md:pl-[45%] lg:pl-[42%] md:pr-10 lg:pr-16 md:py-16'
          : 'md:mr-auto md:pr-[45%] lg:pr-[42%] md:pl-10 lg:pl-16 md:py-16'
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