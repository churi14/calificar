'use client'

import { useState } from 'react'
import Link from 'next/link'

const WA_NUM = '5491100000000'
const FREE_SHIPPING = 100000

type Product = {
  id: number; name: string; sub: string; price: number; orig?: number
  badge?: string; desc: string; feats: string[]; ideal: string; emoji: string
}

const PRODUCTS: Product[] = [
  { id:1, emoji:'🪧', name:'Cartel de Mostrador', sub:'PVC o Acrílico · A5 (15×21cm)', price:14500, badge:'El titular',
    desc:'El que va al lado de la caja. Formato A5, diseño en 3 franjas: tu logo arriba, ícono NFC en el centro, QR abajo. Chip NFC + QR dinámico configurado.',
    feats:['Formato A5 (15×21 cm)','PVC 2mm o Acrílico 3mm','NFC + QR Dinámico','Configuración incluida'], ideal:'Zona de caja, mostrador, recepción' },
  { id:2, emoji:'🔲', name:'Cartel de Mesa', sub:'Display acrílico · A6 (10×15cm)', price:12000, badge:'★ Popular',
    desc:'Display acrílico tipo L o T con chip NFC y QR. No estorba en las mesas. El cliente apoya el celu o escanea y listo.',
    feats:['Formato A6 (10×15 cm)','Display acrílico tipo L o T','NFC + QR Dinámico','Configuración incluida'], ideal:'Mesas de cafeterías, restaurantes y bares' },
  { id:3, emoji:'⬡', name:'Sticker de Mesa/Barra', sub:'Vinilo laminado · 6×6 cm', price:8500, badge:'De combate',
    desc:'Discos o cuadrados de 6-7cm que van fijos. No los pueden tirar ni caen. Resistentes al agua y lavandina.',
    feats:['6cm círculo o 6×6cm cuadrado','Vinilo laminado premium','Resistente al agua','Configuración incluida'], ideal:'Mesas fijas, barras, mostradores' },
  { id:4, emoji:'💳', name:'Tarjeta PVC para Mozos', sub:'Pack de 5 · 8.6×5.4 cm', price:18000, badge:'La carta maestra',
    desc:'Tamaño tarjeta de crédito. El mozo la lleva en el delantal. Al traer la cuenta dice "¿Me dejás una reseña?" y la acerca al celu.',
    feats:['×5 tarjetas PVC','86×54mm (credit card)','QR + NFC integrado','Configuración de todas incluida'], ideal:'Mozos y vendedores, cobro en mesa' },
  { id:5, emoji:'📌', name:'Pin/Credencial para Mozos', sub:'Pack de 2 · 5 cm diámetro', price:9000, badge:'',
    desc:'Círculo de 5cm que el mozo se cuelga en el pecho. El cliente apoya el celu directo. La opción más natural.',
    feats:['5 cm diámetro','100% NFC (sin QR)','Pack de 2 unidades','Configuración incluida'], ideal:'Mozos, personal de atención, vendedores' },
  { id:6, emoji:'🖼️', name:'Cartel de Pared', sub:'Alta visibilidad · 30×20 cm', price:19500, badge:'',
    desc:'Cartel grande para colgar. Visible desde lejos. Ideal para locales con mucho flujo donde querés que todos lo vean al entrar.',
    feats:['30×20 cm','QR + NFC','Sistema de cuelgue incluido','Configuración incluida'], ideal:'Locales con alta afluencia, entradas, cajas' },
  { id:7, emoji:'📦', name:'Combo Local Completo', sub:'Mostrador + Mesa + Tarjetas', price:35000, orig:49500, badge:'Ahorrás $14.500',
    desc:'Todo lo necesario para cubrir los puntos de contacto del local: Cartel de Mostrador + Cartel de Mesa + Pack ×5 Tarjetas PVC.',
    feats:['1 Cartel de Mostrador (A5)','1 Cartel de Mesa (A6)','Pack ×5 Tarjetas PVC','Configuración de todo incluida'], ideal:'Para arrancar con presencia total' },
  { id:8, emoji:'⭐', name:'Combo Premium', sub:'Mostrador + Mesa + Sticker + Pins', price:33000, orig:44000, badge:'Ahorrás $11.000',
    desc:'Cartel de Mostrador + Cartel de Mesa + Stickers de barra + Pins para mozos. Cobertura total con presentación premium.',
    feats:['1 Cartel de Mostrador','1 Cartel de Mesa','Pack Stickers + Pins','Logo del local incluido'], ideal:'Restaurantes y bares con personal' },
]

function fmt(n: number) { return '$' + n.toLocaleString('es-AR') }

type CartItem = { product: Product; qty: number }

export default function TiendaPage() {
  const [cart, setCart]         = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [modal, setModal]       = useState<Product | null>(null)

  const total    = cart.reduce((s, i) => s + i.product.price * i.qty, 0)
  const cartQty  = cart.reduce((s, i) => s + i.qty, 0)
  const shipping = Math.min(total / FREE_SHIPPING * 100, 100)

  function addToCart(p: Product) {
    setCart(c => {
      const exists = c.find(i => i.product.id === p.id)
      if (exists) return c.map(i => i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i)
      return [...c, { product: p, qty: 1 }]
    })
    setCartOpen(true)
  }

  function removeFromCart(id: number) {
    setCart(c => c.filter(i => i.product.id !== id))
  }

  function updateQty(id: number, qty: number) {
    if (qty < 1) { removeFromCart(id); return }
    setCart(c => c.map(i => i.product.id === id ? { ...i, qty } : i))
  }

  function checkout() {
    const lines = cart.map(i => `• ${i.product.name} ×${i.qty} = ${fmt(i.product.price * i.qty)}`).join('\n')
    const msg = encodeURIComponent(`Hola! Quiero hacer este pedido:\n\n${lines}\n\nTOTAL: ${fmt(total)}${total >= FREE_SHIPPING ? '\n✓ Envío gratis!' : ''}`)
    window.open(`https://wa.me/${WA_NUM}?text=${msg}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-white">

      {/* TICKER */}
      <div className="bg-gray-900 text-white h-9 overflow-hidden flex items-center">
        <div className="flex whitespace-nowrap" style={{ animation: 'ticker 25s linear infinite' }}>
          {['✦ NFC + QR en cada producto', '★ Configuración del link incluida', '✦ Atención por WhatsApp', '★ Envío gratis superando $100.000', '✦ +200 negocios en Argentina'].concat(
          ['✦ NFC + QR en cada producto', '★ Configuración del link incluida', '✦ Atención por WhatsApp', '★ Envío gratis superando $100.000', '✦ +200 negocios en Argentina']
          ).map((t, i) => (
            <span key={i} className="text-xs font-medium tracking-widest uppercase px-8">{t}</span>
          ))}
        </div>
      </div>
      <style>{`@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>

      {/* NAV */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-4 h-15 flex items-center justify-between gap-4" style={{height:'60px'}}>
          <Link href="/" className="font-bold text-lg text-gray-900 flex items-center gap-1.5 flex-shrink-0">
            <span className="text-amber-500">★</span> calificar
          </Link>
          <div className="hidden md:flex items-center gap-1 text-sm text-gray-500">
            <Link href="/" className="px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">Inicio</Link>
            <Link href="/tienda" className="px-3 py-2 rounded-lg bg-gray-100 text-gray-900 font-medium">Tienda</Link>
            <Link href="/r/demo" className="px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">Demo</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 px-3 py-2 hidden sm:block">Mi cuenta</Link>
            <button onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <span>🛒</span> Carrito
              {cartQty > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 rounded-full text-xs font-bold flex items-center justify-center">
                  {cartQty}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO TIENDA */}
      <section className="bg-gray-50 border-b border-gray-100 py-12 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 tracking-widest uppercase">
          ★ STAR•TAG
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          Carteles NFC + QR para reseñas
        </h1>
        <p className="text-gray-500 text-lg max-w-lg mx-auto mb-2">
          El cliente apoya el celu o escanea el QR — y en 3 segundos está en tu perfil de Google listo para las 5 estrellas.
        </p>
        <p className="text-sm text-amber-600 font-semibold">✓ Envío gratis en Argentina superando los $100.000</p>
      </section>

      {/* PRODUCTOS */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRODUCTS.map(p => (
            <div key={p.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 hover:shadow-md transition-all group flex flex-col">
              {/* Imagen / emoji */}
              <div className="bg-gray-50 h-40 flex items-center justify-center relative cursor-pointer"
                onClick={() => setModal(p)}>
                <span className="text-7xl group-hover:scale-110 transition-transform duration-200">{p.emoji}</span>
                {p.badge && (
                  <div className="absolute top-3 left-3 bg-gray-900 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {p.badge}
                  </div>
                )}
                {p.orig && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    -{Math.round((1-p.price/p.orig)*100)}%
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 text-sm mb-0.5">{p.name}</h3>
                <p className="text-xs text-gray-400 mb-3">{p.sub}</p>
                <div className="mt-auto">
                  {p.orig && <p className="text-xs text-gray-300 line-through">{fmt(p.orig)}</p>}
                  <p className="text-xl font-extrabold text-gray-900 mb-3">{fmt(p.price)}</p>
                  <button onClick={() => addToCart(p)}
                    className="w-full bg-gray-900 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-700 transition-colors">
                    Agregar al carrito
                  </button>
                  <button onClick={() => setModal(p)}
                    className="w-full mt-1.5 text-xs text-gray-400 hover:text-gray-700 py-1.5 transition-colors">
                    Ver detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INFO BANNER */}
      <section className="bg-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { e:'⚡', t:'Configuración incluida', d:'Programamos el chip NFC con tu link de Google.' },
            { e:'📱', t:'Funciona sin apps', d:'El cliente apoya el celu o escanea. Sin descargar nada.' },
            { e:'🔗', t:'Link dinámico', d:'Cambiás el destino cuando quieras sin cambiar el cartel.' },
          ].map(({ e, t, d }) => (
            <div key={t}>
              <div className="text-3xl mb-3">{e}</div>
              <h3 className="font-bold text-white mb-1">{t}</h3>
              <p className="text-sm text-gray-400">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLATAFORMA CTA */}
      <section className="bg-amber-50 border-y border-amber-100 py-10 px-4">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">¿Ya tenés el cartel?</p>
            <h3 className="text-xl font-extrabold text-gray-900 mb-1">Sumale la plataforma Calificar</h3>
            <p className="text-sm text-gray-500">Filtro anti-haters, respuestas con IA, ranking de empleados y estadísticas en tiempo real.</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link href="/r/demo" className="border border-gray-200 text-gray-700 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors whitespace-nowrap">
              Ver demo
            </Link>
            <Link href="/" className="bg-gray-900 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-700 transition-colors whitespace-nowrap">
              Ver planes →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <Link href="/" className="font-bold text-gray-900 flex items-center gap-1.5">
            <span className="text-amber-500">★</span> calificar
          </Link>
          <p className="text-xs text-gray-400">Hecho en Argentina 🇦🇷 — Atención por WhatsApp</p>
        </div>
      </footer>

      {/* CART DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCartOpen(false)}/>
          <div className="relative bg-white w-full max-w-sm h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Tu carrito ({cartQty})</h2>
              <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>

            {/* Barra envío gratis */}
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              {total >= FREE_SHIPPING ? (
                <p className="text-xs font-semibold text-green-600">✓ ¡Conseguiste envío gratis!</p>
              ) : (
                <p className="text-xs text-gray-500">
                  Te faltan <span className="font-bold text-gray-900">{fmt(FREE_SHIPPING - total)}</span> para envío gratis
                </p>
              )}
              <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${shipping}%` }}/>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">🛒</p>
                  <p className="text-gray-400 text-sm">Tu carrito está vacío</p>
                </div>
              ) : cart.map(item => (
                <div key={item.product.id} className="flex gap-3">
                  <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {item.product.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-400">{item.product.sub}</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">{fmt(item.product.price)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <button onClick={() => removeFromCart(item.product.id)}
                      className="text-gray-300 hover:text-red-400 text-xs transition-colors">✕</button>
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-sm">
                      <button onClick={() => updateQty(item.product.id, item.qty - 1)}
                        className="px-2 py-1 hover:bg-gray-50 text-gray-500">−</button>
                      <span className="px-2 font-semibold">{item.qty}</span>
                      <button onClick={() => updateQty(item.product.id, item.qty + 1)}
                        className="px-2 py-1 hover:bg-gray-50 text-gray-500">+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-gray-100">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold text-gray-900">{fmt(total)}</span>
                </div>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-gray-500">Envío</span>
                  <span className={total >= FREE_SHIPPING ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                    {total >= FREE_SHIPPING ? '¡Gratis!' : 'A calcular'}
                  </span>
                </div>
                <button onClick={checkout}
                  className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Pedir por WhatsApp
                </button>
                <p className="text-xs text-gray-400 text-center mt-2">Te contactamos para coordinar el pago y envío</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DETALLE */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal(null)}/>
          <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="bg-gray-50 h-36 flex items-center justify-center">
              <span className="text-8xl">{modal.emoji}</span>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">{modal.name}</h3>
                  <p className="text-sm text-gray-400">{modal.sub}</p>
                </div>
                <button onClick={() => setModal(null)} className="text-gray-300 hover:text-gray-600 text-2xl leading-none ml-4">×</button>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{modal.desc}</p>
              <ul className="space-y-1.5 mb-4">
                {modal.feats.map(f => (
                  <li key={f} className="text-sm flex items-center gap-2 text-gray-700">
                    <span className="text-amber-500">✓</span>{f}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-400 mb-4">💡 Ideal para: {modal.ideal}</p>
              <div className="flex items-center justify-between">
                <div>
                  {modal.orig && <p className="text-xs text-gray-300 line-through">{fmt(modal.orig)}</p>}
                  <p className="text-2xl font-extrabold text-gray-900">{fmt(modal.price)}</p>
                </div>
                <button onClick={() => { addToCart(modal); setModal(null) }}
                  className="bg-gray-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors text-sm">
                  Agregar al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}