'use client'

import { useState } from 'react'
import Link from 'next/link'

const WA_NUM = '5491123867934'

type Tier = { qty: number; price: number }
type Product = {
  id: string
  name: string
  size: string
  material: string
  nfc: boolean
  minQty: number
  tiers: Tier[]
  icon: string
  badge?: string
  photos?: string[] // Agregá las URLs de fotos acá, ej: ['/mayorista/a5-1.jpg', '/mayorista/a5-2.jpg']
}

const PRODUCTS: Product[] = [
  {
    id: 'a5',
    name: 'Cartel de mostrador A5',
    size: '15 × 21 cm',
    material: 'PVC 2mm · vinilo + laminado mate',
    nfc: true,
    minQty: 5,
    icon: '🪧',
    badge: 'Más vendido',
    photos: [
      '/mayorista/a5-4.jpg',
      '/mayorista/a5-1.png',
    ],
    tiers: [
      { qty: 5,  price: 8000 },
      { qty: 10, price: 7000 },
      { qty: 20, price: 6000 },
    ],
  },
  {
    id: 'a6',
    photos: [
      '/mayorista/a6-1.png',
      '/mayorista/a6-2.png',
    ],
    name: 'Cartel de mostrador A6',
    size: '10,5 × 14,8 cm',
    material: 'PVC 2mm · vinilo + laminado mate',
    nfc: true,
    minQty: 5,
    icon: '📋',
    tiers: [
      { qty: 5,  price: 6500 },
      { qty: 10, price: 5500 },
      { qty: 20, price: 4500 },
    ],
  },
  {
    id: 'sticker15',
    photos: [
      '/mayorista/sticker-1.png',
      '/mayorista/sticker-2.png',
    ],
    name: 'Cartel cuadrado 15×15 cm',
    size: '15 × 15 cm',
    material: 'PVC 2mm · vinilo + laminado mate',
    nfc: true,
    minQty: 10,
    icon: '🟪',
    tiers: [
      { qty: 10, price: 6000 },
      { qty: 20, price: 5000 },
    ],
  },
  {
    id: 'sticker',
    photos: [
      '/mayorista/sticker-3.jpg',
    ],
    name: 'Sticker de mesa / barra',
    size: 'Redondo o rectangular',
    material: 'PVC adhesivo · vinilo + laminado mate',
    nfc: true,
    minQty: 10,
    icon: '⬡',
    tiers: [
      { qty: 10, price: 4000 },
    ],
  },
  {
    id: 'tarjeta',
    photos: [
      '/mayorista/tarjeta-1.jpg',
      '/mayorista/tarjeta-2.jpg',
    ],
    name: 'Tarjeta para mozos',
    size: 'Tamaño tarjeta',
    material: 'PVC 2mm · vinilo + laminado mate',
    nfc: false,
    minQty: 10,
    icon: '🪪',
    tiers: [
      { qty: 10, price: 2000 },
    ],
  },
]

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR').format(n)
}

type Selection = { product: Product; qty: number; price: number } | null

export default function MayoristaPage() {
  const [selection, setSelection] = useState<Selection>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [sent, setSent] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)

  function selectTier(product: Product, tier: Tier) {
    setSelection({ product, qty: tier.qty, price: tier.price })
  }

  function buildWAText() {
    if (!selection) return ''
    const { product, qty, price } = selection
    return encodeURIComponent(
      `Hola! Quiero hacer un pedido mayorista:\n\n` +
      `• Producto: ${product.name} (${product.size})\n` +
      `• Cantidad: ${qty} unidades\n` +
      `• Precio: $${fmt(price)} c/u · Total: $${fmt(price * qty)} ARS\n` +
      `• NFC: ${product.nfc ? 'Sí' : 'No'}\n` +
      (name ? `• Nombre: ${name}\n` : '') +
      (phone ? `• Tel: ${phone}\n` : '') +
      (notes ? `• Nota: ${notes}\n` : '') +
      `\n¿Cómo seguimos?`
    )
  }

  function handleWA() {
    window.open(`https://wa.me/${WA_NUM}?text=${buildWAText()}`, '_blank')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    handleWA()
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 z-40 bg-[#0F172A]/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Calificar" className="h-7 w-auto brightness-0 invert" />
            <span className="font-extrabold text-lg">Calificar</span>
          </Link>
          <a
            href={`https://wa.me/${WA_NUM}?text=${encodeURIComponent('Hola! Quiero info sobre el catálogo mayorista.')}`}
            target="_blank"
            className="flex items-center gap-2 text-sm font-semibold text-[#25D366] hover:text-green-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Consultar por WhatsApp
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-14 pb-10 text-center">
        <span className="inline-block text-xs font-bold tracking-widest text-violet-400 uppercase mb-4 bg-violet-400/10 px-4 py-1.5 rounded-full">
          Catálogo mayorista
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
          Carteles Calificar QR<br />
          <span className="text-violet-400">para revendedores</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-6">
          Todos los carteles incluyen QR dinámico, NFC y acceso al dashboard del cliente. Comprás al por mayor, revendés con tu margen.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>Stock disponible</span>
          <span>·</span><span>Entrega en 24 hs</span>
          <span>·</span><span>Pago por transferencia</span>
        </div>

        {/* Info logística */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
          {[
            { icon: '📍', title: 'Retiro en Merlo', desc: 'Gratis. Coordinamos día y horario por WhatsApp.' },
            { icon: '🚚', title: 'Envío a domicilio', desc: 'Disponible con costo según destino. Consultá.' },
            { icon: '⏱️', title: 'Entrega en 24 hs', desc: 'De un día para el otro una vez confirmado el pedido.' },
          ].map(i => (
            <div key={i.title} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-left">
              <div className="text-xl mb-2">{i.icon}</div>
              <p className="font-bold text-sm text-white mb-0.5">{i.title}</p>
              <p className="text-xs text-gray-400">{i.desc}</p>
            </div>
          ))}
        </div>

        {/* Aviso anticipo */}
        <div className="mt-4 max-w-3xl mx-auto bg-amber-400/10 border border-amber-400/30 rounded-2xl px-5 py-3 flex items-center gap-3 text-left">
          <span className="text-xl flex-shrink-0">💳</span>
          <p className="text-sm text-amber-200">
            <strong>Primer pedido:</strong> se requiere el 50% del total por anticipado para confirmar la producción.
          </p>
        </div>
      </section>

      {/* Lo que incluye */}
      <section className="max-w-5xl mx-auto px-6 pb-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '🔲', label: 'QR dinámico', desc: 'URL editable en cualquier momento' },
            { icon: '📡', label: 'NFC integrado', desc: 'Acercar el celu = acceso directo' },
            { icon: '👤', label: 'Dashboard del cliente', desc: 'Cuenta propia con estadísticas' },
            { icon: '♾️', label: 'Sin vencimiento', desc: 'Funciona para siempre' },
          ].map(f => (
            <div key={f.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl mb-2">{f.icon}</div>
              <p className="font-bold text-xs text-white mb-0.5">{f.label}</p>
              <p className="text-[11px] text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Productos */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-extrabold mb-1">Productos</h2>
        <p className="text-gray-400 text-sm mb-8">Seleccioná el producto y la cantidad para hacer tu pedido.</p>

        <div className="space-y-5">
          {PRODUCTS.map(product => (
            <div
              key={product.id}
              className={`rounded-2xl border overflow-hidden transition-all ${
                selection?.product.id === product.id
                  ? 'border-violet-500 bg-violet-500/5'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              {/* Header del producto */}
              <div className="flex items-start gap-4 px-6 py-5">
                <div className="text-3xl w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  {product.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h3 className="font-bold text-white">{product.name}</h3>
                    {product.badge && (
                      <span className="text-[10px] font-bold bg-violet-500 text-white px-2 py-0.5 rounded-full">{product.badge}</span>
                    )}
                    {!product.nfc && (
                      <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Sin NFC</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{product.size} · {product.material}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Compra mínima: {product.minQty} unidades</p>
                </div>
              </div>

              {/* Fotos del producto */}
              {product.photos && product.photos.length > 0 && (
                <div className="px-6 pb-4">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {product.photos.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setLightbox(src)}
                        className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-white/10 hover:border-violet-400 transition-all"
                      >
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-600 mt-2">
                    * Las imágenes son de muestra. Los QR y datos de cada cartel se personalizan para tu negocio. No representan errores de impresión.
                  </p>
                </div>
              )}

              {/* Tiers de precio */}
              <div className="px-6 pb-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {product.tiers.map(tier => {
                    const isSelected = selection?.product.id === product.id && selection.qty === tier.qty
                    return (
                      <button
                        key={tier.qty}
                        onClick={() => selectTier(product, tier)}
                        className={`text-left px-4 py-3.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-violet-500 bg-violet-500/20'
                            : 'border-white/10 hover:border-white/30 bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-white">{tier.qty} unidades</span>
                          {isSelected && <span className="text-violet-400 text-xs">✓</span>}
                        </div>
                        <p className="text-2xl font-extrabold text-white">${fmt(tier.price)}<span className="text-xs font-normal text-gray-400"> /u</span></p>
                        <p className="text-xs text-gray-500 mt-0.5">Total: <span className="text-gray-300">${fmt(tier.price * tier.qty)}</span> ARS</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Formulario de pedido */}
      <section className="max-w-2xl mx-auto px-6 pb-20">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h2 className="text-xl font-extrabold mb-1">Hacer un pedido</h2>
          <p className="text-gray-400 text-sm mb-6">Seleccioná un producto arriba y completá tus datos. Te contactamos por WhatsApp.</p>

          {sent ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <p className="font-bold text-lg mb-2">¡Pedido enviado!</p>
              <p className="text-gray-400 text-sm">Te abrió el WhatsApp con el detalle. Si no abrió,{' '}
                <button onClick={handleWA} className="underline text-violet-400">tocá acá</button>.
              </p>
              <button onClick={() => { setSent(false); setSelection(null) }} className="mt-6 text-sm text-gray-500 hover:text-gray-300 underline">
                Hacer otro pedido
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Resumen selección */}
              {selection ? (
                <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl px-4 py-3">
                  <p className="text-sm font-bold text-white">{selection.product.name}</p>
                  <p className="text-xs text-violet-300 mt-0.5">
                    {selection.qty} unidades · ${fmt(selection.price)} c/u · Total: <strong>${fmt(selection.price * selection.qty)} ARS</strong>
                  </p>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-500">
                  ↑ Seleccioná un producto y cantidad arriba
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Nombre / Empresa</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Tu nombre o razón social"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Teléfono / WhatsApp</label>
                <input
                  type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="11 1234-5678"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Notas adicionales</label>
                <textarea
                  value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                  placeholder="Localidad, forma de pago, preguntas..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={!selection}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-4 rounded-2xl hover:bg-[#20b857] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                {selection ? `Pedir por WhatsApp` : 'Seleccioná un producto primero'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-2xl shadow-2xl" />
          <button className="absolute top-4 right-4 text-white text-2xl font-bold">✕</button>
        </div>
      )}

      <footer className="border-t border-white/10 py-6 text-center text-xs text-gray-600">
        <Link href="/" className="hover:text-gray-400 transition-colors">calificar.com.ar</Link>
        {' · '}
        <Link href="/qr" className="hover:text-gray-400 transition-colors">Calificar QR</Link>
      </footer>
    </div>
  )
}
