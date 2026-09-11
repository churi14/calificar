'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

function CompleteContent() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'creating' | 'done' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function run() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Esperar a que la sesión esté lista (OAuth callback puede tardar un tick)
      let user = null
      for (let i = 0; i < 10; i++) {
        const { data } = await supabase.auth.getUser()
        if (data.user) { user = data.user; break }
        await new Promise(r => setTimeout(r, 400))
      }

      if (!user) {
        setErrorMsg('No pudimos verificar tu sesión. Intentá de nuevo.')
        setStatus('error')
        return
      }

      // Leer config guardada
      let config: {
        businessName?: string
        stampsGoal?: number
        reward?: string
        businessType?: string
        milestones?: { at: number; label: string }[]
        primaryColor?: string
      } = {}
      try {
        const raw = localStorage.getItem('cal_onboarding')
        if (raw) config = JSON.parse(raw)
      } catch {}

      if (!config.businessName) {
        // Si no hay config, ir al panel igual (el usuario puede haber llegado por otro camino)
        router.replace('/negocio/fidelizacion')
        return
      }

      setStatus('creating')

      try {
        const res = await fetch('/api/fidelizacion/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName: config.businessName,
            businessType: config.businessType,
            stampsGoal: config.stampsGoal ?? 8,
            rewardDescription: config.reward ?? 'Premio',
            milestones: config.milestones ?? [],
            primaryColor: config.primaryColor ?? '#7C3AED',
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error ?? 'Error creando el programa')
        }

        localStorage.removeItem('cal_onboarding')
        // Track conversión final
        const sid = localStorage.getItem('cal_ob_session') ?? 'unknown'
        fetch('/api/fidelizacion/onboarding/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sid, step: 11, step_name: 'registro', event: 'registered', data: { business_name: config.businessName } }),
        }).catch(() => {})
        setStatus('done')
        setTimeout(() => router.replace('/negocio/fidelizacion'), 1500)
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Error inesperado')
        setStatus('error')
      }
    }

    run()
  }, [router])

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: '#F5F0E8' }}
    >
      {status === 'loading' && (
        <>
          <div className="w-14 h-14 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-4" />
          <p className="text-zinc-600 font-semibold">Verificando tu cuenta...</p>
        </>
      )}

      {status === 'creating' && (
        <>
          <div className="w-14 h-14 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-4" />
          <p className="text-zinc-600 font-semibold">Creando tu programa de fidelidad...</p>
          <p className="text-zinc-400 text-sm mt-1">Solo un segundo</p>
        </>
      )}

      {status === 'done' && (
        <>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl mb-4"
            style={{ background: '#7C3AED' }}
          >
            ✓
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900 mb-1">¡Todo listo!</h1>
          <p className="text-zinc-500 text-sm">Creando tu programa...</p>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-xl font-bold text-zinc-900 mb-2">Algo salió mal</h1>
          <p className="text-zinc-500 text-sm mb-4">{errorMsg}</p>
          <a
            href="/fidelizacion/onboarding"
            className="text-violet-600 font-semibold text-sm underline underline-offset-2"
          >
            Volver al inicio
          </a>
        </>
      )}
    </main>
  )
}

export default function CompletePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center" style={{ background: '#F5F0E8' }}>
        <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </main>
    }>
      <CompleteContent />
    </Suspense>
  )
}
