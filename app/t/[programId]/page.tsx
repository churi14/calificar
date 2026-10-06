'use client'

/**
 * /t/[programId] — Vista de tarjeta del cliente con PWA aislada por negocio.
 *
 * La diferencia con /fidelizacion/tarjeta es que el programId está en el PATH.
 * Esto permite que cada negocio tenga scope PWA independiente:
 *   scope: /t/{programId}/
 * → La PWA de "Pepitos" y la de "OCN Ushuaia" NO se pisan entre sí.
 */

import { useParams, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Importamos el TarjetaContent refactorizado que acepta programId como prop
const TarjetaIsolated = dynamic(() => import('./TarjetaIsolated'), { ssr: false })

function TContent() {
  const { programId } = useParams<{ programId: string }>()
  const params = useSearchParams()
  const cardId = params.get('card')
  const walletLink = params.get('wallet')

  return <TarjetaIsolated programId={programId} cardId={cardId} walletLink={walletLink} />
}

export default function TarjetaByProgramPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </main>
    }>
      <TContent />
    </Suspense>
  )
}
