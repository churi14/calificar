'use client'

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { wheelTargetAngle } from '@/lib/wheel'

/**
 * Ruleta grande en canvas: borde dorado con tacos, segmentos por premio y una flecha
 * que "clava" cada vez que pasa un taco. El premio lo decide el servidor (o la demo):
 * la rueda siempre termina en el segmento pedido con spinTo(index).
 */
export type WheelPrize = { label: string; color: string; probability: number }
export type SpinWheelHandle = { spinTo: (index: number) => Promise<void> }

const TAU = Math.PI * 2
const PINS = 32
const SPIN_MS = 5200

interface SpinWheelProps {
  prizes: WheelPrize[]
  /** Ancho/alto en px CSS (default 340) */
  size?: number
}

const SpinWheel = forwardRef<SpinWheelHandle, SpinWheelProps>(function SpinWheel({ prizes, size = 340 }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const prizesRef = useRef(prizes)
  prizesRef.current = prizes
  const st = useRef({ angle: 0, ticker: 0, tickerVel: 0, raf: 0, running: false })

  const draw = useCallback(() => {
    const cv = canvasRef.current
    const ctx = cv?.getContext('2d')
    if (!cv || !ctx) return
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    if (cv.width !== size * dpr) { cv.width = size * dpr; cv.height = size * dpr }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size, size)

    const list = prizesRef.current
    const total = list.reduce((s, p) => s + (p.probability || 0), 0) || 1
    const rimW = size * 0.055
    const R = size * 0.5 - rimW - size * 0.05   // radio de los segmentos
    const cx = size / 2
    const cy = size / 2 + size * 0.02
    const { angle, ticker } = st.current

    // Borde dorado con sombra
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.35)'
    ctx.shadowBlur = size * 0.05
    ctx.shadowOffsetY = size * 0.025
    const rim = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R)
    rim.addColorStop(0, '#FFE08A')
    rim.addColorStop(0.5, '#F5B83D')
    rim.addColorStop(1, '#C98A16')
    ctx.fillStyle = rim
    ctx.beginPath()
    ctx.arc(cx, cy, R + rimW, 0, TAU)
    ctx.fill()
    ctx.restore()

    // Anillo oscuro fino entre borde y segmentos
    ctx.fillStyle = '#7A4A0C'
    ctx.beginPath()
    ctx.arc(cx, cy, R + 2, 0, TAU)
    ctx.fill()

    // Parte que gira
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate((angle * Math.PI) / 180)

    // Segmentos (0° = 12 en punto, sentido horario)
    let acc = 0
    list.forEach(p => {
      const a0 = (acc / total) * TAU - Math.PI / 2
      acc += p.probability || 0
      const a1 = (acc / total) * TAU - Math.PI / 2
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, R, a0, a1)
      ctx.closePath()
      ctx.fillStyle = p.color
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'
      ctx.lineWidth = Math.max(2, size * 0.006)
      ctx.stroke()

      // Texto a lo largo del radio
      const mid = (a0 + a1) / 2
      ctx.save()
      ctx.rotate(mid)
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#fff'
      ctx.shadowColor = 'rgba(0,0,0,0.45)'
      ctx.shadowBlur = 3
      const fontPx = Math.max(11, Math.min(size * 0.052, (a1 - a0) * R * 0.32))
      ctx.font = `800 ${fontPx}px system-ui, -apple-system, 'Segoe UI', sans-serif`
      // Ancho disponible: desde el borde hasta antes del centro
      const maxW = R - size * 0.045 - size * 0.1
      let txt = p.label
      // Primero achicar la letra (hasta 11px) y recién después recortar con "…"
      let fs = fontPx
      while (fs > 11 && ctx.measureText(txt).width > maxW) {
        fs -= 1
        ctx.font = `800 ${fs}px system-ui, -apple-system, 'Segoe UI', sans-serif`
      }
      while (txt.length > 3 && ctx.measureText(txt).width > maxW) txt = txt.slice(0, -2).trimEnd() + '…'
      ctx.fillText(txt, R - size * 0.045, 0)
      ctx.restore()
    })

    // Tacos sobre el borde
    for (let i = 0; i < PINS; i++) {
      const a = (i / PINS) * TAU
      const pr = R + rimW * 0.5
      const x = Math.cos(a) * pr
      const y = Math.sin(a) * pr
      ctx.beginPath()
      ctx.arc(x, y, size * 0.0125, 0, TAU)
      ctx.fillStyle = '#401911'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x - size * 0.003, y - size * 0.003, size * 0.004, 0, TAU)
      ctx.fillStyle = 'rgba(255,255,255,0.55)'
      ctx.fill()
    }
    ctx.restore()

    // Centro
    const hub = ctx.createRadialGradient(cx - size * 0.01, cy - size * 0.01, size * 0.005, cx, cy, size * 0.075)
    hub.addColorStop(0, '#FFF3C4')
    hub.addColorStop(1, '#C98A16')
    ctx.beginPath()
    ctx.arc(cx, cy, size * 0.07, 0, TAU)
    ctx.fillStyle = hub
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = '#7A4A0C'
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx, cy, size * 0.022, 0, TAU)
    ctx.fillStyle = '#401911'
    ctx.fill()

    // Flecha: pivota arriba y se desvía cuando pasa un taco
    const tipY = cy - R - rimW * 0.5 + size * 0.012
    const len = size * 0.13
    const pivotY = tipY - len
    ctx.save()
    ctx.translate(cx, pivotY)
    ctx.rotate(ticker)
    ctx.shadowColor = 'rgba(0,0,0,0.4)'
    ctx.shadowBlur = 6
    ctx.shadowOffsetY = 2
    ctx.beginPath()
    ctx.moveTo(-size * 0.035, 0)
    ctx.lineTo(size * 0.035, 0)
    ctx.lineTo(size * 0.012, len * 0.82)
    ctx.lineTo(0, len)
    ctx.lineTo(-size * 0.012, len * 0.82)
    ctx.closePath()
    ctx.fillStyle = '#401911'
    ctx.fill()
    ctx.lineWidth = 2.5
    ctx.strokeStyle = '#FFE08A'
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(0, size * 0.004, size * 0.012, 0, TAU)
    ctx.fillStyle = '#FFE08A'
    ctx.fill()
    ctx.restore()
  }, [size])

  // Dibujo estático al montar / cuando cambian premios o tamaño
  useEffect(() => { draw() }, [draw, prizes])
  useEffect(() => () => cancelAnimationFrame(st.current.raf), [])

  useImperativeHandle(ref, () => ({
    spinTo(index: number) {
      return new Promise<void>(resolve => {
        const s = st.current
        if (s.running) { resolve(); return }
        s.running = true
        const from = s.angle
        const to = wheelTargetAngle(from, prizesRef.current, index, 6)
        const t0 = performance.now()
        const pinStep = 360 / PINS
        let prev = from

        const frame = (now: number) => {
          const t = Math.min(1, (now - t0) / SPIN_MS)
          const e = 1 - Math.pow(1 - t, 4)           // frena suave al final
          s.angle = from + (to - from) * e

          // ¿Cuántos tacos pasaron bajo la flecha en este cuadro?
          const crossed = Math.floor(s.angle / pinStep) - Math.floor(prev / pinStep)
          if (crossed > 0) {
            s.ticker = -0.5
            s.tickerVel = 0
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator && t < 0.9) navigator.vibrate?.(8)
          }
          prev = s.angle

          // Resorte de la flecha
          s.tickerVel += -s.ticker * 0.32 - s.tickerVel * 0.2
          s.ticker += s.tickerVel

          draw()
          // Termina por tiempo (no por cantidad de cuadros): en una pestaña en segundo plano
          // el navegador dibuja muy pocos cuadros y el resorte de la flecha tardaría demasiado.
          if (t < 1 || (Math.abs(s.ticker) > 0.01 && now - t0 < SPIN_MS + 600)) {
            s.raf = requestAnimationFrame(frame)
          } else {
            s.ticker = 0
            s.running = false
            draw()
            resolve()
          }
        }
        s.raf = requestAnimationFrame(frame)
      })
    },
  }), [draw])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      aria-label="Ruleta de la suerte"
    />
  )
})

export default SpinWheel
