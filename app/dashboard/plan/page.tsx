import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const WA = 'https://wa.me/5491123867934?text=Hola!%20Quiero%20mejorar%20mi%20plan%20de%20Calificar.'

export default async function PlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('name, plan').eq('id', user.id).single()

  const plan = profile?.plan ?? 'free'

  const FEATURES = [
    { label: 'Filtro inteligente de reseñas', free: true,  pro: true  },
    { label: 'Dashboard con estadísticas',    free: true,  pro: true  },
    { label: 'Feedback privado con datos',    free: true,  pro: true  },
    { label: 'Código QR descargable',         free: true,  pro: true  },
    { label: 'QR individual por empleado',    free: false, pro: true  },
    { label: 'Dominio propio (tunegocio.ar)', free: false, pro: true  },
    { label: 'QR dinámico de por vida',       free: false, pro: true  },
    { label: 'Linktree personalizado',        free: false, pro: true  },
    { label: 'Soporte prioritario',           free: false, pro: true  },
  ]

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mi plan</h1>
        <p className="text-sm text-gray-400 mt-0.5">Administrá tu suscripción</p>
      </div>

      {/* Plan actual */}
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Plan actual</p>
            <p className="text-2xl font-black text-gray-900">
              {plan === 'free' ? 'Gratis' : plan === 'pro' ? 'Pro' : 'Dominio Propio'}
            </p>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${plan === 'free' ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-700'}`}>
            {plan === 'free' ? 'Plan gratuito' : 'Activo'}
          </span>
        </div>

        {plan === 'free' && (
          <p className="text-sm text-gray-500">
            Estás usando el plan gratuito. Mejorá para desbloquear QR por empleado, dominio propio y más.
          </p>
        )}
      </div>

      {/* Comparativa */}
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden mb-6">
        <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100">
          <div className="p-4 col-span-1"/>
          <div className="p-4 text-center border-l border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gratis</p>
            <p className="text-lg font-black text-gray-900 mt-1">$0</p>
          </div>
          <div className="p-4 text-center bg-[#0F172A] border-l border-gray-700">
            <p className="text-xs font-bold text-[#FBCAD8] uppercase tracking-wider">Pro</p>
            <p className="text-lg font-black text-white mt-1">$5.000<span className="text-xs font-normal text-gray-400">/mes</span></p>
          </div>
        </div>
        {FEATURES.map(f => (
          <div key={f.label} className="grid grid-cols-3 border-b border-gray-50 last:border-0">
            <div className="px-5 py-3 text-sm text-gray-600">{f.label}</div>
            <div className="px-4 py-3 text-center border-l border-gray-50">
              {f.free ? <span className="text-[#056E4B] font-bold">✓</span> : <span className="text-gray-200">—</span>}
            </div>
            <div className="px-4 py-3 text-center bg-[#0F172A]/5 border-l border-gray-50">
              {f.pro ? <span className="text-[#056E4B] font-bold">✓</span> : <span className="text-gray-200">—</span>}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      {plan === 'free' && (
        <a href={WA} target="_blank"
          className="flex items-center justify-center gap-2 w-full bg-[#0F172A] text-white font-bold py-4 rounded-2xl hover:bg-[#1E293B] transition-colors shadow-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Mejorar al plan Pro — $5.000/mes
        </a>
      )}

      <p className="text-xs text-gray-400 text-center mt-4">
        Sin contratos. Cancelás cuando quieras.{' '}
        <Link href="/precios" className="underline underline-offset-2 hover:text-gray-600">Ver todos los planes →</Link>
      </p>
    </div>
  )
}
