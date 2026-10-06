'use client'

import { useEffect, useRef } from 'react'

interface QRCanvasProps {
  data: string
  dark?: string   // color de los módulos (default negro o blanco según fondo)
  size?: number
}

export function QRCanvas({ data, dark = '#18181B', size = 240 }: QRCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!ref.current || !data) return
    import('qrcode').then(QRCode => {
      QRCode.toCanvas(ref.current!, data, {
        width: size,
        margin: 2,
        color: {
          dark,
          light: '#00000000', // fondo 100% transparente
        },
      })
    })
  }, [data, dark, size])

  return <canvas ref={ref} width={size} height={size} className="rounded-xl" />
}
