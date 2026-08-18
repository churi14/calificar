'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const WA_NUM = '5491123867934'

const TIERS = [
  { qty: 1,  label: '1 unidad',    price: 15000,  per: 15000,  badge: null,           highlight: false },
  { qty: 5,  label: '5 unidades',  price: 60000,  per: 12000,  badge: null,           highlight: false },
  { qty: 10, label: '10 unidades', price: 100000, per: 10000,  badge: 'Popular',      highlight: true  },
  { qty: 20, label: '20 unidades', price: 160000, per: 8000,   badge: 'Mejor precio', highlight: false },
  { qty: 50, label: '50 unidades', price: 350000, per: 7000,   badge: '↘ Más bajo',   highlight: false },
]

const FEATURES = [
  { icon: '🔲', title: 'QR dinámico', desc: 'URL editable en cualquier momento desde el dashboard. Sin límite de scans.' },
  { icon: '📡', title: 'NFC incluido', desc: 'Chip NFC integrado en el cartel. El cliente acerca el celu y accede directo.' },
  { icon: '👤', title: 'Dashboard de QR', desc: 'Cuenta propia para el cliente final. Ve sus scans, edita el destino, todo desde el celu.' },
  { icon: '📊', title: 'Estadísticas en tiempo real', desc: 'Scans por día, activaciones, historial. El cliente ve todo.' },
  { icon: '🔗', title: 'Cualquier destino', desc: 'Google Maps, Instagram, WhatsApp, menú digital, web, lo que sea.' },
  { icon: '♾️', title: 'Sin vencimiento', desc: 'El cartel funciona para siempre. Sin suscripciones, sin renovaciones.' },
]

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR').format(n)
}

export default function MayoristaPage() {
  const [selected, setSelected] = useState<typeof TIERS[0] | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [sent, setSent] = useState(false)

  function handleWA(tier?: typeof TIERS[0]) {
    const t = tier ?? selected
    if (!t) return
    const text = encodeURIComponent(
      `Hola! Quiero hacer un pedido mayorista:\n\n` +
      `• ${t.label} de carteles Calificar QR\n` +
      `• Total: $${fmt(t.price)} ARS\n` +
      (name ? `• Nombre: ${name}\n` : '') +
      (email ? `• Email: ${email}\n` : '') +
      (phone ? `• Tel: ${phone}\n` : '') +
      (notes ? `• Nota: ${notes}\n` : '') +
      `\n¿Cómo seguimos?`
    )
    window.open(`https://wa.me/${WA_NUM}?text=${text}`, '_blank')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
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
            className="text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors"
          >
            💬 Hablar por WhatsApp
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <span className="inline-block text-xs font-bold tracking-widest text-violet-400 uppercase mb-4 bg-violet-400/10 px-4 py-1.5 rounded-full">
          Catálogo mayorista
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
          Carteles Calificar QR<br />
          <span className="text-violet-400">para revendedores</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
          Cada cartel incluye QR dinámico, NFC y acceso al dashboard. Comprás al por mayor, revendés con tu margen.
        </p>
        <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-green-400 rounded-full"></span>Stock disponible</span>
          <span>·</span>
          <span>Envío a todo el país</span>
          <span>·</span>
          <span>Pago por transferencia</span>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="text-2xl mb-2">{f.icon}</div>
              <p className="font-bold text-sm text-white mb-1">{f.title}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-extrabold text-center mb-2">Precios por cantidad</h2>
        <p className="text-gray-400 text-sm text-center mb-8">A mayor cantidad, menor precio por unidad.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TIERS.map(t => (
            <button
              key={t.qty}
              onClick={() => setSelected(t)}
              className={`relative text-left rounded-2xl border-2 p-6 transition-all ${
                selected?.qty === t.qty
                  ? 'border-violet-500 bg-violet-500/10'
                  : t.highlight
                  ? 'border-violet-400/50 bg-white/5 hover:border-violet-400'
                  : 'border-white/10 bg-white/5 hover:border-white/30'
              }`}
            >
              {t.badge && (
                <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  t.highlight ? 'bg-violet-500 text-white' : 'bg-white/10 text-gray-300'
                }`}>
                  {t.badge}
                </span>
              )}
              <p className="font-bold text-white mb-1">{t.label}</p>
              <p className="text-3xl font-extrabold text-white">${fmt(t.per)}<span className="text-sm font-normal text-gray-400"> /u</span></p>
              <p className="text-xs text-gray-400 mt-1">Total: <span className="text-gray-200 font-semibold">${fmt(t.price)} ARS</span></p>
              {selected?.qty === t.qty && (
                <div className="mt-3 text-xs text-violet-400 font-semibold">✓ Seleccionado</div>
              )}
            </button>
          ))}
        </div>

        {/* Botón WA directo sin form */}
        {selected && (
          <div className="mt-6 text-center">
            <button
              onClick={() => handleWA()}
              className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-[#20b857] transition-colors text-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Pedir {selected.label} por WhatsApp
            </button>
          </div>
        )}
      </section>

      {/* Formulario */}
      <section className="max-w-2xl mx-auto px-6 pb-20">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h2 className="text-xl font-extrabold mb-1">Hacer un pedido</h2>
          <p className="text-gray-400 text-sm mb-6">Completá el formulario y te contactamos por WhatsApp para coordinar.</p>

          {sent ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <p className="font-bold text-lg mb-2">¡Pedido enviado!</p>
              <p className="text-gray-400 text-sm">Te redirigimos al WhatsApp. Si no abrió automáticamente,{' '}
                <button onClick={() => handleWA()} className="underline text-violet-400">tocá acá</button>.
              </p>
              <button onClick={() => { setSent(false); setSelected(null) }} className="mt-6 text-sm text-gray-500 hover:text-gray-300 underline">
                Hacer otro pedido
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Cantidad */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Cantidad <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TIERS.map(t => (
                    <button
                      type="button"
                      key={t.qty}
                      onClick={() => setSelected(t)}
                      className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                        selected?.qty === t.qty
                          ? 'border-violet-500 bg-violet-500/20 text-white'
                          : 'border-white/10 text-gray-400 hover:border-white/30'
                      }`}
                    >
                      <span className="font-bold">{t.qty}u</span>
                      <span className="block text-xs mt-0.5">${fmt(t.per)}/u</span>
                    </button>
                  ))}
                </div>
                {selected && (
                  <p className="text-xs text-violet-400 font-semibold mt-2">
                    {selected.label} · Total: ${fmt(selected.price)} ARS
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Nombre / Empresa</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Tu nombre o razón social"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Email</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="vos@mail.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Teléfono</label>
                  <input
                    type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="11 1234-5678"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Notas adicionales</label>
                <textarea
                  value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                  placeholder="Localidad, forma de pago preferida, etc."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={!selected}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-4 rounded-2xl hover:bg-[#20b857] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                {selected ? `Pedir ${selected.label} por WhatsApp` : 'Seleccioná una cantidad primero'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer mínimo */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-gray-600">
        <Link href="/" className="hover:text-gray-400 transition-colors">calificar.com.ar</Link>
        {' · '}
        <Link href="/qr" className="hover:text-gray-400 transition-colors">Calificar QR</Link>
      </footer>
    </div>
  )
}
