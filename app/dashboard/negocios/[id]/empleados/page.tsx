import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function EmpleadosPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id: bizId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, slug')
    .eq('id', bizId)
    .eq('owner_id', user.id)
    .single()

  if (!business) notFound()

  const { data: employees } = await supabase
    .from('employees')
    .select('id, name, slug, active, total_scans')
    .eq('business_id', bizId)
    .order('total_scans', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/negocios/${bizId}`} className="text-sm text-gray-400 hover:text-gray-600">
            ← {business.name}
          </Link>
          <span className="text-gray-200">/</span>
          <h1 className="text-2xl font-extrabold text-gray-900">Empleados</h1>
        </div>
        <Link href={`/dashboard/negocios/${bizId}/empleados/nuevo`}
          className="bg-gray-900 text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-gray-700 transition-colors">
          + Nuevo empleado
        </Link>
      </div>

      {!employees?.length ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-4xl mb-4">👤</p>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Sin empleados todavía</h2>
          <p className="text-sm text-gray-400 mb-6">Cada empleado tiene su propio QR para rastrear sus scans.</p>
          <Link href={`/dashboard/negocios/${bizId}/empleados/nuevo`}
            className="inline-block bg-gray-900 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-gray-700 transition-colors">
            Agregar primer empleado →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-0">
            {/* Header */}
            <div className="contents text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
              <div className="px-6 py-3">Empleado</div>
              <div className="px-6 py-3 text-right">Scans</div>
              <div className="px-6 py-3 text-center">Estado</div>
              <div className="px-6 py-3"/>
            </div>

            {/* Filas */}
            {employees.map((emp, i) => {
              const maxScans = Math.max(...(employees.map(e => e.total_scans) ?? [1]), 1)
              const pct = maxScans > 0 ? Math.round((emp.total_scans / maxScans) * 100) : 0
              return (
                <div key={emp.id} className={`contents ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                  <div className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{emp.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-900 rounded-full" style={{ width: `${pct}%` }}/>
                          </div>
                          <span className="text-[10px] text-gray-300">{pct}% del top</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 text-right">
                    <p className="text-sm font-bold text-gray-900">{emp.total_scans}</p>
                    <p className="text-[10px] text-gray-400">scans</p>
                  </div>
                  <div className="px-6 py-4 text-center">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${emp.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {emp.active ? 'Activo' : 'Pausado'}
                    </span>
                  </div>
                  <div className="px-6 py-4">
                    <Link href={`/dashboard/negocios/${bizId}/empleados/${emp.id}`}
                      className="text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg transition-colors">
                      Ver →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
