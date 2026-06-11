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

      {/* TICKER (Azul Marino) */}
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
          <div className="flex items-center gap-4">
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
        </div>
      </nav>

      {/* HERO TIENDA (Beige con curva) */}
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

        {/* Curva SVG inferior */}
        <div className="absolute left-0 w-full top-full -mt-1 overflow-hidden leading-[0] z-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-[50px] sm:h-[80px] lg:h-[100px] text-white" preserveAspectRatio="none">
            <path d="M0 0 C 360 100 1080 100 1440 0 L 1440 100 L 0 100 Z" fill="currentColor"/>
          </svg>
        </div>
      </section>

      {/* PRODUCTOS */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRODUCTS.map(p => (
            <div key={p.id} className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden hover:border-[#FBCAD8] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col">
              {/* Imagen / emoji (Fondo Beige) */}
              <div className="bg-[#F5EFE7] h-48 flex items-center justify-center relative cursor-pointer"
                onClick={() => setModal(p)}>
                <span className="text-7xl group-hover:scale-110 transition-transform duration-300">{p.emoji}</span>
                {p.badge && (
                  <div className="absolute top-4 left-4 bg-[#0F172A] text-[#FBCAD8] text-xs font-extrabold px-3 py-1.5 rounded-full shadow-md">
                    {p.badge}
                  </div>
                )}
                {p.orig && (
                  <div className="absolute top-4 right-4 bg-[#056E4B] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                    -{Math.round((1-p.price/p.orig)*100)}%
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-display font-bold text-[#0F172A] text-lg mb-1">{p.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{p.sub}</p>
                <div className="mt-auto">
                  {p.orig && <p className="text-sm text-gray-400 line-through mb-0.5">{fmt(p.orig)}</p>}
                  <p className="text-2xl font-black text-[#0F172A] mb-4">{fmt(p.price)}</p>
                  <button onClick={() => addToCart(p)}
                    className="w-full bg-[#0F172A] text-white font-semibold py-3.5 rounded-full text-sm hover:bg-[#1e293b] transition-colors shadow-md">
                    Agregar al carrito
                  </button>
                  <button onClick={() => setModal(p)}
                    className="w-full mt-2 text-sm font-medium text-gray-500 hover:text-[#0F172A] py-2 transition-colors">
                    Ver detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INFO BANNER (Verde oscuro, estilo Landing) */}
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

      {/* PLATAFORMA CTA (Rosa) */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto bg-[#FBCAD8] rounded-[2.5rem] py-16 px-8 sm:px-16 flex flex-col md:flex-row items-center justify-between gap-10 shadow-lg border border-pink-100">
          <div className="text-center md:text-left max-w-xl">
            <p className="text-sm font-extrabold text-[#0F172A] uppercase tracking-widest mb-3 opacity-70">¿Ya tenés el cartel?</p>
            <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0F172A] mb-4">Sumale la plataforma Calificar</h3>
            <p className="text-[#0F172A]/80 text-lg leading-relaxed">Filtro anti-haters, respuestas con IA, ranking de empleados y estadísticas en tiempo real.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Link href="/r/demo" className="border-2 border-[#0F172A] text-[#0F172A] font-bold px-8 py-4 rounded-full text-center hover:bg-[#0F172A] hover:text-white transition-colors">
              Ver demo
            </Link>
            <Link href="/" className="bg-[#0F172A] text-white font-bold px-8 py-4 rounded-full text-center hover:bg-[#1e293b] shadow-xl transition-colors">
              Ver planes →
            </Link>
          </div>
        </div>
      </section>

      {/* MINIMAL FOOTER TIENDA */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <Link href="/" className="font-display font-extrabold text-xl text-[#0F172A] flex items-center gap-1.5">
            <span className="text-[#FBCAD8]">★</span> Calificar
          </Link>
          <p className="text-sm font-medium text-gray-400">Hecho en Argentina 🇦🇷 — Atención por WhatsApp</p>
        </div>
      </footer>

      {/* CART DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm transition-opacity" onClick={() => setCartOpen(false)}/>
          <div className="relative bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 rounded-l-[2rem] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-display font-bold text-xl text-[#0F172A]">Tu carrito ({cartQty})</h2>
              <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-[#0F172A] text-3xl leading-none transition-colors">×</button>
            </div>

            {/* Barra envío gratis */}
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

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-6xl mb-6 opacity-50">🛒</p>
                  <p className="text-gray-500 text-lg font-medium">Tu carrito está vacío</p>
                </div>
              ) : cart.map(item => (
                <div key={item.product.id} className="flex gap-4 items-center">
                  <div className="w-20 h-20 bg-[#F5EFE7] rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-sm">
                    {item.product.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-[#0F172A] truncate mb-0.5">{item.product.name}</p>
                    <p className="text-xs text-gray-500 mb-2">{item.product.sub}</p>
                    <p className="text-sm font-black text-[#056E4B]">{fmt(item.product.price)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <button onClick={() => removeFromCart(item.product.id)}
                      className="text-gray-300 hover:text-red-500 text-sm transition-colors font-bold">✕</button>
                    <div className="flex items-center bg-gray-50 rounded-full overflow-hidden text-sm border border-gray-200">
                      <button onClick={() => updateQty(item.product.id, item.qty - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors font-bold">−</button>
                      <span className="w-6 text-center font-bold text-[#0F172A]">{item.qty}</span>
                      <button onClick={() => updateQty(item.product.id, item.qty + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors font-bold">+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout */}
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

      {/* MODAL DETALLE DE PRODUCTO */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-sm transition-opacity" onClick={() => setModal(null)}/>
          <div className="relative bg-white rounded-[2rem] max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
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
              
              <div className="bg-[#F5EFE7] rounded-2xl p-5 mb-6">
                <ul className="space-y-3">
                  {modal.feats.map(f => (
                    <li key={f} className="text-sm font-medium flex items-start gap-3 text-[#0F172A]">
                      <span className="text-[#056E4B] mt-0.5">✓</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
              
              <p className="text-sm text-gray-500 mb-8 font-medium"><span className="mr-2">💡</span> Ideal para: {modal.ideal}</p>
              
              <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                <div>
                  {modal.orig && <p className="text-sm text-gray-400 line-through mb-0.5">{fmt(modal.orig)}</p>}
                  <p className="text-3xl font-black text-[#0F172A]">{fmt(modal.price)}</p>
                </div>
                <button onClick={() => { addToCart(modal); setModal(null) }}
                  className="bg-[#0F172A] text-white font-bold px-8 py-4 rounded-full hover:bg-[#1e293b] transition-colors shadow-lg">
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}