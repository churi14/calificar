import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { formatDate, planLabel, planColor } from '@/lib/utils'
import PlanChanger from './PlanChanger'

type Business = { id: string; name: string; slug: string; active: boolean; total_scans: number; positive_scans: number; created_at: string }

export default async function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, email, plan, role, created_at')
    .eq('id', id)
    .single()

  if (!profile || profile.role === 'admin') notFound()

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, slug, active, total_scans, positive_scans, created_at')
    .eq('owner_id', id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/clientes" className="text-sm text-gray-400 hover:text-gray-600">← Clientes</Link>
        <span className="text-gray-200">/</span>
        <h1 className="text-2xl font-extrabold text-gray-900">{profile.name ?? profile.email}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* PERFIL + PLAN */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-600">
                {(profile.name ?? profile.email ?? '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900">{profile.name ?? '—'}</p>
                <p className="text-sm text-gray-400">{profile.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-2 border-t border-gray-50">
                <span className="text-gray-400">Plan actual</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${planColor(profile.plan)}`}>
                  {planLabel(profile.plan)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-gray-50">
                <span className="text-gray-400">Locales</span>
                <span className="font-semibold text-gray-900">{businesses?.length ?? 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-gray-50">
                <span className="text-gray-400">Registrado</span>
                <span className="text-gray-500 text-xs">{formatDate(profile.created_at)}</span>
              </div>
            </div>
          </div>

          {/* CAMBIAR PLAN — componente cliente */}
          <PlanChanger userId={id} currentPlan={profile.plan} />
        </div>

        {/* NEGOCIOS */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-5">Locales ({businesses?.length ?? 0})</h2>
            {!businesses?.length ? (
              <p className="text-sm text-gray-400 text-center py-8">Sin locales todavía</p>
            ) : (
              <div className="space-y-3">
                {businesses.map(b => {
                  const conv = b.total_scans ? Math.round((b.positive_scans / b.total_scans) * 100) : 0
                  return (
                    <div key={b.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-gray-900">{b.name}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${b.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                            {b.active ? 'Activo' : 'Pausado'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">calificar.com.ar/r/{b.slug}</p>
                      </div>
                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{b.total_scans ?? 0}</p>
                          <p className="text-[10px] text-gray-400">Scans</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-amber-500">{conv}%</p>
                          <p className="text-[10px] text-gray-400">Conv.</p>
                        </div>
                        <p className="text-xs text-gray-300 hidden lg:block">{formatDate(b.created_at)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
