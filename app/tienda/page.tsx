'use client'

import { useState } from 'react'
import Link from 'next/link'

const WA_NUM = '5491123867934'
const FREE_SHIPPING = 100000

type Variant = { label: string; price: number }

type Product = {
  id: number; name: string; sub: string; price: number
  badge?: string; desc: string; feats: string[]; ideal: string
  emoji: string; variants?: Variant[]; note?: string
}

const PRODUCTS: Product[] = [
  {
    id: 1, emoji: '🪧', name: 'Cartel de Mostrador', badge: 'El titular',
    sub: 'PVC 3mm o Acrílico · A5 (15×21cm)',
    desc: 'El que va al lado de la caja. Formato A5, diseño en 3 franjas: tu logo arriba, ícono NFC en el centro, QR abajo. Chip NFC + QR dinámico configurado.',
    feats: ['Formato A5 (15×21 cm)', 'NFC + QR Dinámico', 'Configuración incluida'],
    ideal: 'Zona de caja, mostrador, recepción',
    price: 14500,
    variants: [
      { label: 'PVC 3mm', price: 14500 },
      { label: 'Acrílico', price: 18000 },
    ],
  },
  {
    id: 2, emoji: '🔲', name: 'Cartel de Mesa', badge: '★ Popular',
    sub: 'PVC o Acrílico · A6 (10×15cm)',
    desc: 'Display tipo L o T con chip NFC y QR. No estorba en las mesas. El cliente apoya el celu o escanea y listo.',
    feats: ['Formato A6 (10×15 cm)', 'NFC + QR Dinámico', 'Configuración incluida'],
    ideal: 'Mesas de cafeterías, restaurantes y bares',
    price: 12000,
    variants: [
      { label: 'PVC', price: 12000 },
      { label: 'Acrílico', price: 15500 },
    ],
  },
  {
    id: 3, emoji: '⬡', name: 'Sticker de Mesa/Barra', badge: 'De combate',
    sub: 'PVC, Acrílico o Metal · 6×6 cm',
    desc: 'Discos o cuadrados de 6-7cm que van fijos. No los pueden tirar ni caen. Resistentes al agua y lavandina. QR + NFC integrado.',
    feats: ['6cm círculo o 6×6cm cuadrado', 'QR + NFC integrado', 'Resistente al agua y lavandina', 'Configuración incluida'],
    ideal: 'Mesas fijas, barras, mostradores',
    price: 8500,
    variants: [
      { label: 'PVC', price: 8500 },
      { label: 'Acrílico', price: 11000 },
      { label: 'Metal', price: 14000 },
    ],
  },
  {
    id: 4, emoji: '💳', name: 'Tarjeta para Mozos', badge: 'La carta maestra',
    sub: 'Por unidad · 8.6×5.4 cm',
    desc: 'Tamaño tarjeta de crédito. El mozo la lleva en el delantal. Al traer la cuenta dice "¿Me dejás una reseña?" y la acerca al celu.',
    feats: ['86×54mm (credit card)', 'QR + NFC integrado', 'Configuración incluida'],
    ideal: 'Mozos y vendedores, cobro en mesa',
    price: 4500,
  },
  {
    id: 5, emoji: '🖼️', name: 'Cartel de Pared', badge: '',
    sub: 'Alta visibilidad · 30×20 cm',
    desc: 'Cartel grande para colgar. Interior o exterior. Visible desde lejos. Ideal para locales con mucho flujo donde querés que todos lo vean al entrar.',
    feats: ['30×20 cm', 'QR + NFC', 'Interior o exterior', 'Configuración incluida'],
    ideal: 'Locales con alta afluencia, entradas, cajas',
    note: 'La medida puede variar, el precio corresponde a la medida indicada.',
    price: 19500,
  },
]

function fmt(n: number) { return '$' + n.toLocaleString('es-AR') }

type CartItem = { product: Product; qty: number; variantLabel?: string; variantPrice: number }

// ─── Subcomponente ProductCard con estado local de variante ───────────────────
function ProductCard({ p, onAdd, onDetail }: {
  p: Product
  onAdd: (p: Product, variantLabel: string | undefined, variantPrice: number) => void
  onDetail: (p: Product, variantIdx: number) => void
}) {
  const [variantIdx, setVariantIdx] = useState(0)
  const currentVariant = p.variants?.[variantIdx]
  const price = currentVariant?.price ?? p.price

  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden hover:border-[#FBCAD8] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col">

      {/* Imagen */}
      <div className="bg-[#F5EFE7] h-48 flex items-center justify-center relative cursor-pointer"
        onClick={() => onDetail(p, variantIdx)}>
        <span className="text-7xl group-hover:scale-110 transition-transform duration-300">{p.emoji}</span>
        {p.badge && (
          <div className="absolute top-4 left-4 bg-[#0F172A] text-[#FBCAD8] text-xs font-extrabold px-3 py-1.5 rounded-full shadow-md">
            {p.badge}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-display font-bold text-[#0F172A] text-lg mb-1">{p.name}</h3>
        <p className="text-sm text-gray-500 mb-4">{p.sub}</p>

        <div className="mt-auto">
          {/* Selector de material */}
          {p.variants && p.variants.length > 0 && (
            <div className="flex gap-1.5 mb-4 flex-wrap">
              {p.variants.map((v, i) => (
                <button key={v.label} onClick={() => setVariantIdx(i)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                    i === variantIdx
                      ? 'bg-[#0F172A] text-white border-[#0F172A]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                  }`}>
                  {v.label}
                </button>
              ))}
            </div>
          )}

          <p className="text-2xl font-black text-[#0F172A] mb-4">{fmt(price)}</p>

          {p.note && (
            <p className="text-xs text-gray-400 italic mb-3 leading-relaxed">{p.note}</p>
          )}

          <button onClick={() => onAdd(p, currentVariant?.label, price)}
            className="w-full bg-[#0F172A] text-white font-semibold py-3.5 rounded-full text-sm hover:bg-[#1e293b] transition-colors shadow-md">
            Agregar al carrito
          </button>
          <button onClick={() => onDetail(p, variantIdx)}
            className="w-full mt-2 text-sm font-medium text-gray-500 hover:text-[#0F172A] py-2 transition-colors">
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────────────────

export default function TiendaPage() {
  const [cart, setCart]         = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [modal, setModal]             = useState<Product | null>(null)
  const [modalVariantIdx, setModalVariantIdx] = useState(0)

  const total    = cart.reduce((s, i) => s + i.variantPrice * i.qty, 0)
  const cartQty  = cart.reduce((s, i) => s + i.qty, 0)
  const shipping = Math.min(total / FREE_SHIPPING * 100, 100)

  function addToCart(p: Product, variantLabel: string | undefined, variantPrice: number) {
    setCart(c => {
      const key = `${p.id}-${variantLabel ?? ''}`
      const exists = c.find(i => `${i.product.id}-${i.variantLabel ?? ''}` === key)
      if (exists) return c.map(i => `${i.product.id}-${i.variantLabel ?? ''}` === key ? { ...i, qty: i.qty + 1 } : i)
      return [...c, { product: p, qty: 1, variantLabel, variantPrice }]
    })
    setCartOpen(true)
  }

  function removeFromCart(key: string) {
    setCart(c => c.filter(i => `${i.product.id}-${i.variantLabel ?? ''}` !== key))
  }

  function updateQty(key: string, qty: number) {
    if (qty < 1) { removeFromCart(key); return }
    setCart(c => c.map(i => `${i.product.id}-${i.variantLabel ?? ''}` === key ? { ...i, qty } : i))
  }

  function checkout() {
    const lines = cart.map(i => {
      const variant = i.variantLabel ? ` (${i.variantLabel})` : ''
      return `• ${i.product.name}${variant} ×${i.qty} = ${fmt(i.variantPrice * i.qty)}`
    }).join('\n')
    const msg = encodeURIComponent(`Hola! Quiero hacer este pedido:\n\n${lines}\n\nTOTAL: ${fmt(total)}${total >= FREE_SHIPPING ? '\n✓ Envío gratis!' : ''}`)
    window.open(`https://wa.me/${WA_NUM}?text=${msg}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-white">

      {/* TICKER */}
      <div className="bg-[#0F172A] text-white h-10 overflow-hidden flex items-center">
        <div className="flex whitespace-nowrap" style={{ animation: 'ticker 25s linear infinite' }}>
          {['✦ NFC + QR en cada producto', '★ Configuración del link incluida', '✦ Atención por WhatsApp', '★ Envío gratis superando $100.000', '✦ +200 negocios en Argentina'].concat(
          ['✦ NFC + QR en cada producto', '★ Configuración del link incluida', '✦ Atención por WhatsApp', '★ Envío gratis superando $100.000', '✦ +200 negocios en Argentina']
          ).map((t, i) => (
            <span key={i} className="text-xs font-medium tracking-widest uppercase px-8 text-[#FBCAD8]">{t}</span>
          ))}
        </div>
      </div>
      <style>{`@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>

      {/* NAV */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="font-display font-extrabold text-2xl text-[#0F172A] flex items-center gap-2 flex-shrink-0">
            <span className="text-[#FBCAD8]">★</span> Calificar
          </Link>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 font-medium">
            <Link href="/" className="px-4 py-2 rounded-full hover:bg-gray-50 hover:text-[#0F172A] transition-colors">Inicio</Link>
            <Link href="/tienda" className="px-4 py-2 rounded-full bg-[#F5EFE7] text-[#0F172A]">Tienda</Link>
            <Link href="/r/demo" className="px-4 py-2 rounded-full hover:bg-gray-50 hover:text-[#0F172A] transition-colors">Demo</Link>
          </div>
          <button onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 bg-[#0F172A] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#1e293b] transition-colors shadow-md">
            <span>🛒</span> Carrito
            {cartQty > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#FBCAD8] text-[#0F172A] rounded-full text-xs font-extrabold flex items-center justify-center shadow-sm">
                {cartQty}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative bg-[#F5EFE7] pt-20 pb-32 px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-[#FBCAD8] text-[#0F172A] text-xs font-extrabold px-4 py-2 rounded-full mb-6 tracking-widest uppercase shadow-sm">
          ★ TIENDA OFICIAL
        </div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight mb-6">
          Carteles NFC + QR para reseñas
        </h1>
        <p className="text-[#0F172A]/70 text-lg max-w-2xl mx-auto mb-6 leading-relaxed">
          El cliente apoya el celu o escanea el QR — y en 3 segundos está en tu perfil de Google listo para dejarte las 5 estrellas.
        </p>
        <p className="text-sm text-[#056E4B] font-bold bg-[#056E4B]/10 inline-block px-4 py-2 rounded-full">
          ✓ Envío gratis en Argentina superando los {fmt(FREE_SHIPPING)}
        </p>
        <div className="absolute left-0 w-full top-full -mt-1 overflow-hidden leading-[0] z-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-[50px] sm:h-[80px] lg:h-[100px] text-white" preserveAspectRatio="none">
            <path d="M0 0 C 360 100 1080 100 1440 0 L 1440 100 L 0 100 Z" fill="currentColor"/>
          </svg>
        </div>
      </section>

      {/* PRODUCTOS */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {PRODUCTS.map(p => (
            <ProductCard key={p.id} p={p} onAdd={addToCart} onDetail={(prod, idx) => { setModal(prod); setModalVariantIdx(idx) }}/>
          ))}
        </div>
      </section>

      {/* INFO BANNER */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto bg-[#056E4B] rounded-[2.5rem] py-16 px-8 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
            {[
              { e:'⚡', t:'Configuración incluida', d:'Programamos el chip NFC con tu link de Google.' },
              { e:'📱', t:'Funciona sin apps', d:'El cliente apoya el celu o escanea. Sin descargar nada.' },
              { e:'🔗', t:'Link dinámico', d:'Cambiás el destino cuando quieras sin cambiar el cartel.' },
            ].map(({ e, t, d }) => (
              <div key={t} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl mb-6">{e}</div>
                <h3 className="font-display font-bold text-white text-xl mb-3">{t}</h3>
                <p className="text-white/80 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CARRITO DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm" onClick={() => setCartOpen(false)}/>
          <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="font-display font-bold text-xl text-[#0F172A]">Tu carrito 🛒</h2>
              <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-[#0F172A] text-2xl transition-colors leading-none">×</button>
            </div>

            <div className="px-6 py-5 bg-[#F5EFE7] border-b border-gray-100">
              {total >= FREE_SHIPPING ? (
                <p className="text-sm font-bold text-[#056E4B] flex items-center gap-2"><span>✨</span> ¡Conseguiste envío gratis!</p>
              ) : (
                <p className="text-sm text-gray-600">
                  Te faltan <span className="font-bold text-[#0F172A]">{fmt(FREE_SHIPPING - total)}</span> para envío gratis
                </p>
              )}
              <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#056E4B] rounded-full transition-all duration-500 ease-out" style={{ width: `${shipping}%` }}/>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-6xl mb-6 opacity-50">🛒</p>
                  <p className="text-gray-500 text-lg font-medium">Tu carrito está vacío</p>
                </div>
              ) : cart.map(item => {
                const key = `${item.product.id}-${item.variantLabel ?? ''}`
                return (
                  <div key={key} className="flex gap-4 items-center">
                    <div className="w-20 h-20 bg-[#F5EFE7] rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-sm">
                      {item.product.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-[#0F172A] truncate mb-0.5">{item.product.name}</p>
                      {item.variantLabel && <p className="text-xs text-gray-400 mb-1">{item.variantLabel}</p>}
                      <p className="text-sm font-black text-[#056E4B]">{fmt(item.variantPrice)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <button onClick={() => removeFromCart(key)}
                        className="text-gray-300 hover:text-red-500 text-sm transition-colors font-bold">✕</button>
                      <div className="flex items-center bg-gray-50 rounded-full overflow-hidden text-sm border border-gray-200">
                        <button onClick={() => updateQty(key, item.qty - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors font-bold">−</button>
                        <span className="w-6 text-center font-bold text-[#0F172A]">{item.qty}</span>
                        <button onClick={() => updateQty(key, item.qty + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors font-bold">+</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-white">
                <div className="flex justify-between text-base mb-2">
                  <span className="text-gray-500 font-medium">Subtotal</span>
                  <span className="font-bold text-[#0F172A]">{fmt(total)}</span>
                </div>
                <div className="flex justify-between text-base mb-6">
                  <span className="text-gray-500 font-medium">Envío</span>
                  <span className={total >= FREE_SHIPPING ? 'text-[#056E4B] font-bold' : 'text-gray-500 font-medium'}>
                    {total >= FREE_SHIPPING ? '¡Gratis!' : 'A calcular'}
                  </span>
                </div>
                <button onClick={checkout}
                  className="w-full bg-[#056E4B] text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-[#045c3f] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Pedir por WhatsApp
                </button>
                <p className="text-xs text-gray-500 text-center mt-4 font-medium">Te contactamos para coordinar el pago y envío</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DETALLE */}
      {modal && (() => {
        const modalVariant = modal.variants?.[modalVariantIdx]
        const modalPrice = modalVariant?.price ?? modal.price
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-sm" onClick={() => setModal(null)}/>
            <div className="relative bg-white rounded-[2rem] max-w-md w-full shadow-2xl overflow-hidden">
              <div className="bg-[#FBCAD8] h-48 flex items-center justify-center relative">
                <span className="text-8xl drop-shadow-md">{modal.emoji}</span>
                <button onClick={() => setModal(null)} className="absolute top-4 right-4 text-[#0F172A]/50 hover:text-[#0F172A] text-3xl leading-none bg-white/30 w-10 h-10 rounded-full flex items-center justify-center transition-colors pb-1">×</button>
              </div>
              <div className="p-8">
                <div className="mb-5">
                  <h3 className="font-display font-extrabold text-[#0F172A] text-2xl mb-1">{modal.name}</h3>
                  <p className="text-sm font-medium text-gray-500">{modal.sub}</p>
                </div>
                <p className="text-base text-gray-600 leading-relaxed mb-6">{modal.desc}</p>
                <div className="bg-[#F5EFE7] rounded-2xl p-5 mb-4">
                  <ul className="space-y-3">
                    {modal.feats.map(f => (
                      <li key={f} className="text-sm font-medium flex items-start gap-3 text-[#0F172A]">
                        <span className="text-[#056E4B] mt-0.5">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
                {modal.note && (
                  <p className="text-xs text-gray-400 italic mb-4 leading-relaxed px-1">{modal.note}</p>
                )}
                <p className="text-sm text-gray-500 mb-6 font-medium"><span className="mr-2">💡</span> Ideal para: {modal.ideal}</p>

                {/* Selector de variantes en el modal */}
                {modal.variants && modal.variants.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Material</p>
                    <div className="flex gap-2 flex-wrap">
                      {modal.variants.map((v, i) => (
                        <button key={v.label} onClick={() => setModalVariantIdx(i)}
                          className={`text-sm font-semibold px-4 py-2 rounded-full border transition-all ${
                            i === modalVariantIdx
                              ? 'bg-[#0F172A] text-white border-[#0F172A]'
                              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                          }`}>
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                  <p className="text-3xl font-black text-[#0F172A]">{fmt(modalPrice)}</p>
                  <button onClick={() => { addToCart(modal, modalVariant?.label, modalPrice); setModal(null) }}
                    className="bg-[#0F172A] text-white font-bold px-8 py-4 rounded-full hover:bg-[#1e293b] transition-colors shadow-lg">
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}