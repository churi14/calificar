'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Program } from '@/types/dashboard'

// ── constantes ────────────────────────────────────────────────────────────────
const CALIFICAR_WA = '5491123867934'

const DIGITAL_TEMPLATES = [
  { id: 'story-anuncio',    label: 'IG Story · Anuncio',         size: '1080 × 1920 · 9:16',  tag: 'Stories', w: 1080, h: 1920 },
  { id: 'story-activacion', label: 'IG Story · Activación',      size: '1080 × 1920 · 9:16',  tag: 'Stories', w: 1080, h: 1920 },
  { id: 'whatsapp',         label: 'WhatsApp Status',            size: '1080 × 1920 · casual', tag: 'Feed',    w: 1080, h: 1920 },
  { id: 'post-feed',        label: 'Post IG / FB · 4:5',         size: '1080 × 1350 · 4:5',   tag: 'Feed',    w: 1080, h: 1350 },
  { id: 'post-twitter',     label: 'Post X / Twitter',           size: '1200 × 675 · 16:9',   tag: 'Feed',    w: 1200, h: 675  },
  { id: 'banner-linkedin',  label: 'Banner LinkedIn',            size: '1584 × 396 · 4:1',    tag: 'Banners', w: 1584, h: 396  },
]

const PHYSICAL_TEMPLATES = [
  { id: 'sticker',    label: 'Sticker circular',        size: 'Ø 90 mm · vinilo',         price: '$3.500',  desc: 'Ideal para el mostrador o la vidriera.' },
  { id: 'tabletent',  label: 'Table tent',              size: '180 × 270 mm · plegable',  price: '$4.900',  desc: 'Se para solo sobre la mesa o barra.' },
  { id: 'a4-anuncio', label: 'A4 Portrait · Anuncio',   size: '210 × 297 mm · papel',     price: '$2.500',  desc: 'Para enmarcar o pegar en el local.' },
  { id: 'mini',       label: 'Mini insert para tickets', size: '80 × 120 mm · papel mate', price: '$1.800',  desc: 'Se incluye en cada ticket o bolsa.' },
]

// ── props ─────────────────────────────────────────────────────────────────────
interface ViewImprimirProps {
  program: Program | undefined
  selectedProgram: string | null
  /** Sucursal del QR (null = Principal) */
  branchId?: string | null
  branchLabel?: string
}

// ── componente ────────────────────────────────────────────────────────────────
export default function ViewImprimir({ program, selectedProgram, branchId = null, branchLabel }: ViewImprimirProps) {
  const [qrUrl, setQrUrl]           = useState<string | null>(null)
  const [activeTag, setActiveTag]   = useState<string>('Todos')
  const [downloading, setDownloading] = useState<string | null>(null)
  const [previewTpl, setPreviewTpl] = useState<typeof DIGITAL_TEMPLATES[0] | null>(null)
  const color   = program?.color_primary ?? '#7C3AED'
  const bizName = (program as any)?.businesses?.name ?? program?.name ?? 'Tu negocio'
  const scanUrl = selectedProgram
    ? `https://calificar.com.ar/s/${selectedProgram}${branchId ? `?b=${branchId}` : ''}`
    : 'https://calificar.com.ar'

  useEffect(() => {
    import('qrcode').then(QRCode => {
      QRCode.toDataURL(scanUrl, { width: 400, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
        .then(url => setQrUrl(url))
    })
  }, [scanUrl])

  // ── canvas helpers ──────────────────────────────────────────────────────────
  function hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return { r, g, b }
  }

  function lighten(hex: string, amount = 40) {
    const { r, g, b } = hexToRgb(hex)
    return `rgb(${Math.min(255, r + amount)},${Math.min(255, g + amount)},${Math.min(255, b + amount)})`
  }

  function isDark(hex: string) {
    const { r, g, b } = hexToRgb(hex)
    return (r * 299 + g * 587 + b * 114) / 1000 < 128
  }

  function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  async function drawQR(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    if (!qrUrl) return
    const pad = size * 0.08
    const rr  = size * 0.06
    ctx.fillStyle = '#ffffff'
    drawRoundRect(ctx, x - pad, y - pad, size + pad * 2, size + pad * 2, rr)
    ctx.fill()
    const img = new Image()
    await new Promise<void>(res => { img.onload = () => res(); img.src = qrUrl! })
    ctx.drawImage(img, x, y, size, size)
  }

  async function drawCanvas(
    ctx: CanvasRenderingContext2D,
    cw: number, ch: number,
    tpl: typeof DIGITAL_TEMPLATES[0],
    logoImg: HTMLImageElement | null
  ) {
    const dark       = isDark(color)
    const textColor  = dark ? '#ffffff' : '#1a1a1a'
    const bgColor    = dark ? color : '#f5f0eb'
    const accentColor = dark ? '#ffffff' : color
    const ratio = ch / cw
    const isStory  = ratio > 1.5
    const isFeed45 = ratio > 0.9 && ratio <= 1.5
    const isHoriz  = ratio < 0.9

    // Background
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, cw, ch)

    // Deco circle
    ctx.beginPath()
    ctx.arc(cw * 0.88, ch * (isHoriz ? -0.25 : -0.03), cw * (isHoriz ? 0.55 : 0.42), 0, Math.PI * 2)
    ctx.fillStyle = dark ? lighten(color, 25) : lighten(color, 165)
    ctx.fill()

    // ── STORY / WHATSAPP (9:16) ───────────────────────────────────────────────
    if (isStory) {
      const fs = cw * 0.1
      const qrSize = cw * 0.5
      const qrX = (cw - qrSize) / 2
      const qrY = ch * 0.42

      ctx.textAlign = 'center'
      ctx.font = `bold ${fs}px system-ui`
      const isActivacion = tpl.id === 'story-activacion' || tpl.id === 'whatsapp'
      const lines = isActivacion
        ? [{ t: 'Escanealo.', c: accentColor }, { t: 'Guardalo.', c: accentColor }, { t: 'Empieza.', c: textColor }]
        : [{ t: 'Tu pase digital,', c: textColor }, { t: 'guardalo en', c: accentColor }, { t: 'tu Wallet.', c: accentColor }]
      lines.forEach((l, i) => {
        ctx.fillStyle = l.c
        ctx.fillText(l.t, cw / 2, ch * 0.13 + i * fs * 1.25)
      })

      ctx.fillStyle = dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.45)'
      ctx.font = `600 ${cw * 0.045}px system-ui`
      ctx.fillText(bizName, cw / 2, qrY - cw * 0.06)

      await drawQR(ctx, qrX, qrY, qrSize)

      const pad = qrSize * 0.08
      ctx.fillStyle = dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.32)'
      ctx.font = `${cw * 0.036}px system-ui`
      ctx.fillText('+ ESCANEA AQUÍ', cw / 2, qrY + qrSize + pad + cw * 0.06)
      ctx.fillText('Guardala en tu Wallet', cw / 2, qrY + qrSize + pad + cw * 0.11)
    }

    // ── FEED 4:5 (1080×1350) ─────────────────────────────────────────────────
    if (isFeed45) {
      const qrSize = cw * 0.44
      const qrX = (cw - qrSize) / 2
      const qrY = ch * 0.40
      const maxW = cw * 0.82

      const fs = cw * 0.088
      ctx.textAlign = 'center'
      ctx.font = `bold ${fs}px system-ui`

      ctx.fillStyle = textColor
      ctx.fillText('Tu pase digital,', cw / 2, ch * 0.10, maxW)
      ctx.fillStyle = accentColor
      ctx.fillText('guardalo en', cw / 2, ch * 0.10 + fs * 1.3, maxW)
      ctx.fillText('tu Wallet.', cw / 2, ch * 0.10 + fs * 2.6, maxW)

      ctx.fillStyle = dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.45)'
      ctx.font = `600 ${cw * 0.046}px system-ui`
      ctx.fillText(bizName, cw / 2, qrY - cw * 0.07, maxW)

      await drawQR(ctx, qrX, qrY, qrSize)

      const pad = qrSize * 0.08
      ctx.fillStyle = dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.32)'
      ctx.font = `${cw * 0.036}px system-ui`
      ctx.fillText('+ ESCANEA AQUÍ · Guardala en tu Wallet', cw / 2, qrY + qrSize + pad + cw * 0.065, maxW)
    }

    // ── HORIZONTAL (16:9 Twitter, 4:1 LinkedIn) ───────────────────────────────
    if (isHoriz) {
      const isBanner = ratio < 0.35
      const qrSize = ch * (isBanner ? 0.52 : 0.66)
      const qrX = cw - qrSize - cw * 0.04
      const qrY = (ch - qrSize) / 2

      await drawQR(ctx, qrX, qrY, qrSize)

      const colRight = qrX - cw * 0.04
      const colCX = colRight / 2
      const colW = colRight * 0.88
      ctx.textAlign = 'center'

      if (isBanner) {
        const fs = ch * 0.27
        ctx.font = `bold ${fs}px system-ui`
        ctx.fillStyle = textColor
        ctx.fillText('Tu pase digital.', colCX, ch * 0.48, colW)
        ctx.fillStyle = dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.38)'
        ctx.font = `${ch * 0.17}px system-ui`
        ctx.fillText(bizName, colCX, ch * 0.78, colW)
      } else {
        const fs = ch * 0.13
        ctx.font = `bold ${fs}px system-ui`
        ctx.fillStyle = textColor
        ctx.fillText('Tu pase digital,', colCX, ch * 0.30, colW)
        ctx.fillStyle = accentColor
        ctx.fillText('guardalo en', colCX, ch * 0.30 + fs * 1.35, colW)
        ctx.fillText('tu Wallet.', colCX, ch * 0.30 + fs * 2.70, colW)
        ctx.fillStyle = dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.38)'
        ctx.font = `${ch * 0.075}px system-ui`
        ctx.fillText(bizName, colCX, ch * 0.84, colW)
      }
    }

    // Footer
    const unit = Math.min(cw, ch)
    ctx.textAlign = 'center'
    ctx.fillStyle = dark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.2)'
    ctx.font = `${unit * 0.022}px system-ui`
    ctx.fillText('powered by calificar.com.ar', cw / 2, ch - unit * 0.025)
  }

  async function renderTemplate(tpl: typeof DIGITAL_TEMPLATES[0]): Promise<string> {
    const canvas = document.createElement('canvas')
    canvas.width = tpl.w; canvas.height = tpl.h
    const ctx = canvas.getContext('2d')!
    let logoImg: HTMLImageElement | null = null
    if (program?.logo_url) {
      logoImg = new Image()
      logoImg.crossOrigin = 'anonymous'
      await new Promise<void>(res => { logoImg!.onload = () => res(); logoImg!.onerror = () => res(); logoImg!.src = program!.logo_url! })
    }
    await drawCanvas(ctx, tpl.w, tpl.h, tpl, logoImg)
    return canvas.toDataURL('image/png')
  }

  async function download(tpl: typeof DIGITAL_TEMPLATES[0]) {
    if (!qrUrl) return
    setDownloading(tpl.id)
    try {
      const dataUrl = await renderTemplate(tpl)
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `calificar-${bizName.toLowerCase().replace(/\s+/g, '-')}-${tpl.id}.png`
      a.click()
    } finally {
      setDownloading(null)
    }
  }

  function waLink(item: typeof PHYSICAL_TEMPLATES[0]) {
    const msg = encodeURIComponent(
      `Hola! Quiero pedir un *${item.label}* (${item.size}) para mi negocio *${bizName}* en Calificar. Precio: ${item.price}`
    )
    return `https://wa.me/${CALIFICAR_WA}?text=${msg}`
  }

  const tags     = ['Todos', ...Array.from(new Set(DIGITAL_TEMPLATES.map(t => t.tag)))]
  const filtered = activeTag === 'Todos' ? DIGITAL_TEMPLATES : DIGITAL_TEMPLATES.filter(t => t.tag === activeTag)

  // ── Sub-componentes ─────────────────────────────────────────────────────────
  function TemplatePreview({ tpl }: { tpl: typeof DIGITAL_TEMPLATES[0] }) {
    const ref = useRef<HTMLCanvasElement>(null)
    useEffect(() => {
      if (!ref.current || !qrUrl) return
      const canvas = ref.current
      const ctx = canvas.getContext('2d')!
      const sx = canvas.width / tpl.w
      const sy = canvas.height / tpl.h
      ctx.setTransform(sx, 0, 0, sy, 0, 0)
      const doRender = (logoImg: HTMLImageElement | null) => drawCanvas(ctx, tpl.w, tpl.h, tpl, logoImg)
      if (program?.logo_url) {
        const logoImg = new Image()
        logoImg.crossOrigin = 'anonymous'
        logoImg.onload = () => doRender(logoImg)
        logoImg.onerror = () => doRender(null)
        logoImg.src = program.logo_url
      } else {
        doRender(null)
      }
    }, [qrUrl, tpl])
    const previewW = 130
    const previewH = Math.round(previewW * tpl.h / tpl.w)
    return (
      <canvas
        ref={ref}
        width={previewW}
        height={previewH}
        className="rounded-xl block"
        style={{ maxHeight: 185, width: 'auto' }}
      />
    )
  }

  function PreviewModal({ tpl, onClose }: { tpl: typeof DIGITAL_TEMPLATES[0]; onClose: () => void }) {
    const ref = useRef<HTMLCanvasElement>(null)
    useEffect(() => {
      if (!ref.current || !qrUrl) return
      const canvas = ref.current
      const ctx = canvas.getContext('2d')!
      const sx = canvas.width / tpl.w
      const sy = canvas.height / tpl.h
      ctx.setTransform(sx, 0, 0, sy, 0, 0)
      const doRender = (logoImg: HTMLImageElement | null) => drawCanvas(ctx, tpl.w, tpl.h, tpl, logoImg)
      if (program?.logo_url) {
        const logoImg = new Image(); logoImg.crossOrigin = 'anonymous'
        logoImg.onload = () => doRender(logoImg)
        logoImg.onerror = () => doRender(null)
        logoImg.src = program.logo_url
      } else { doRender(null) }
    }, [tpl])
    const maxH     = Math.min(700, Math.round(window.innerHeight * 0.78))
    const previewH = maxH
    const previewW = Math.round(previewH * tpl.w / tpl.h)
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <div className="flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
          <canvas
            ref={ref}
            width={previewW}
            height={previewH}
            className="rounded-2xl shadow-2xl block"
            style={{ maxWidth: '90vw', maxHeight: '78vh', width: 'auto', height: 'auto' }}
          />
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-white font-bold text-sm">{tpl.label}</p>
              <p className="text-zinc-400 text-xs">{tpl.size} · PNG</p>
            </div>
            <button
              onClick={() => { download(tpl); onClose() }}
              disabled={!qrUrl || downloading === tpl.id}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: color }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Descargar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 border border-zinc-600 hover:border-zinc-400 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-8 w-full">
      <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-1">Compartí tu tarjeta</h1>
      <p className="text-zinc-400 dark:text-gray-500 text-sm mb-6">Todos los formatos con tu QR y colores de marca, listos para usar.</p>
      {branchLabel && (
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 dark:bg-violet-950 dark:text-violet-300 rounded-full px-3 py-1 -mt-3 mb-5">
          QR de la sucursal: {branchLabel}. Cambiá de sucursal desde el menú lateral.
        </p>
      )}

      {/* Digital */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500 mr-2">DESCARGA GRATIS</p>
          {tags.map(t => (
            <button
              key={t}
              onClick={() => setActiveTag(t)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                activeTag === t ? 'text-white' : 'bg-zinc-100 dark:bg-gray-800 text-zinc-500 dark:text-gray-400 hover:bg-zinc-200 dark:hover:bg-gray-700'
              }`}
              style={activeTag === t ? { background: color } : {}}
            >
              {t}
            </button>
          ))}
        </div>

        {!qrUrl && (
          <div className="flex items-center gap-2 text-zinc-400 dark:text-gray-500 text-sm py-8">
            <div className="w-4 h-4 border-2 border-zinc-300 dark:border-gray-600 border-t-violet-500 rounded-full animate-spin" />
            Generando QR...
          </div>
        )}

        {previewTpl && <PreviewModal tpl={previewTpl} onClose={() => setPreviewTpl(null)} />}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map(tpl => (
            <div key={tpl.id} className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl overflow-hidden flex flex-col group">
              <button
                onClick={() => qrUrl && setPreviewTpl(tpl)}
                className="flex items-center justify-center bg-zinc-50 dark:bg-gray-800 py-5 px-4 min-h-[160px] cursor-pointer relative transition-all hover:bg-zinc-100 dark:hover:bg-gray-700 w-full"
              >
                {qrUrl
                  ? <TemplatePreview tpl={tpl} />
                  : <div className="w-20 h-28 bg-zinc-100 dark:bg-gray-700 rounded-xl animate-pulse" />
                }
                {qrUrl && (
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(0,0,0,0.25)' }}
                  >
                    <div className="bg-white rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-zinc-800 shadow-lg">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="5" stroke="#18181b" strokeWidth="1.2" />
                        <circle cx="6" cy="6" r="2" fill="#18181b" />
                      </svg>
                      Vista previa
                    </div>
                  </div>
                )}
              </button>
              <div className="p-3 flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-white">{tpl.label}</p>
                  <p className="text-[10px] text-zinc-400 dark:text-gray-500 mt-0.5">{tpl.size} · PNG</p>
                </div>
                <button
                  onClick={() => download(tpl)}
                  disabled={!qrUrl || downloading === tpl.id}
                  className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-gray-800 hover:bg-zinc-200 dark:hover:bg-gray-700 flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-40"
                >
                  {downloading === tpl.id
                    ? <div className="w-3 h-3 border-2 border-zinc-400 border-t-zinc-800 rounded-full animate-spin" />
                    : (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Physical */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500 mb-4">
          MATERIALES FÍSICOS · PEDIDO POR WHATSAPP
        </p>
        <div className="grid grid-cols-2 gap-4">
          {PHYSICAL_TEMPLATES.map(item => (
            <div key={item.id} className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">{item.label}</p>
                  <p className="text-[10px] text-zinc-400 dark:text-gray-500 mt-0.5">{item.size}</p>
                </div>
                <span className="text-sm font-extrabold text-zinc-900 dark:text-white flex-shrink-0">{item.price}</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-gray-400">{item.desc}</p>
              <a
                href={waLink(item)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: '#25D366' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.554 4.103 1.523 5.824L.057 23.5l5.805-1.522A11.951 11.951 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.871 9.871 0 01-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374A9.861 9.861 0 012.118 12C2.118 6.985 6.985 2.118 12 2.118S21.882 6.985 21.882 12 17.015 21.882 12 21.882z" />
                </svg>
                Solicitar por WhatsApp
              </a>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-zinc-400 dark:text-gray-500 mt-3 text-center">
          Precios sin envío · Te contactamos para confirmar el pedido
        </p>
      </div>
    </div>
  )
}
