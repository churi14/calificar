'use client'

import { Storefront } from '@phosphor-icons/react'
import { QRCanvas } from '@/app/fidelizacion/tarjeta/QRCanvas'

/**
 * La tarjeta tal cual la ve el cliente en su celular (página /t/…), con datos de ejemplo:
 * un cliente de muestra, "Tu negocio" y un ícono neutro en lugar de un logo real.
 * Se dibuja a 390 px de ancho (un celular real) y se achica con `scale` para entrar en el marco.
 */
const COLOR = '#7C3AED'      // violeta de la marca
const TEXT = '#FFFFFF'
const GOAL = 5
const STAMPS = 3

export default function PhoneCardPreview() {
  return (
    <div
      className="origin-top-left scale-[0.697] sm:scale-[0.779] select-none pointer-events-none"
      style={{ width: 390, height: 896, backgroundColor: '#09090b' }}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center">

        {/* ── Tarjeta ── */}
        <div className="w-full max-w-sm px-4 pt-14 pb-2">
          <div
            className="relative rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: `linear-gradient(145deg, ${COLOR}f0, ${COLOR}bb)` }}
          >
            <div className="relative px-6 pt-7 pb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: `${TEXT}99` }}>María García</p>
                <p className="font-extrabold text-xl leading-tight" style={{ color: TEXT }}>Tu negocio</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Storefront size={30} weight="fill" color={TEXT} />
              </div>
            </div>

            <div className="relative px-6 pb-4">
              <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${GOAL}, 1fr)` }}>
                {Array.from({ length: GOAL }).map((_, i) => {
                  const filled = i < STAMPS
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-full flex items-center justify-center text-base font-bold ${filled ? 'bg-white shadow-md' : 'bg-white/15'}`}
                      style={filled ? { color: COLOR } : { color: 'rgba(255,255,255,0.35)' }}
                    >
                      {filled ? '✓' : '·'}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="relative px-6 py-5">
              <div className="flex justify-between text-xs mb-2" style={{ color: `${TEXT}b3` }}>
                <span className="font-bold text-sm" style={{ color: TEXT }}>{STAMPS} de {GOAL} sellos</span>
                <span>Tu premio acá</span>
              </div>
              <div className="rounded-full h-2" style={{ background: `${TEXT}30` }}>
                <div className="h-2 rounded-full" style={{ width: `${(STAMPS / GOAL) * 100}%`, background: TEXT }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Sección inferior ── */}
        <div className="w-full max-w-sm px-4 mt-4 flex flex-col gap-3">
          <div className="rounded-3xl p-6 text-center bg-white/5 border border-white/10">
            <p className="text-xs font-bold uppercase tracking-widest mb-1 text-white/70">Mostrá este QR en el local</p>
            <p className="text-xs mb-4 text-white/50">para sumar tu sello</p>
            <div className="flex justify-center">
              <QRCanvas data="https://calificar.com.ar/fidelizacion" dark="#FFFFFF" size={190} />
            </div>
            <p className="text-[11px] mt-4 text-white/50">El encargado escanea y se suma automáticamente</p>
          </div>

          <div className="flex items-center justify-center gap-2 bg-zinc-900 text-white font-bold px-6 py-4 rounded-full text-sm shadow-lg border border-white/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.56 10.738l-9.52-9.52A1.5 1.5 0 0010.978.5H3.5A3 3 0 00.5 3.5v7.478c0 .398.158.78.44 1.062l9.52 9.52a3 3 0 004.242 0l6.858-6.858a3 3 0 000-4.243zM5.5 8a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>
            </svg>
            Agregar a Google Wallet
          </div>

          <p className="text-center text-sm font-semibold" style={{ color: `${TEXT}cc` }}>✓ Notificaciones activadas</p>
        </div>
      </div>
    </div>
  )
}
