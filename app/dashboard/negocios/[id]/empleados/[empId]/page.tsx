import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import EmpleadoClient from './EmpleadoClient'

export const dynamic = 'force-dynamic'

export default async function EmpleadoDetailPage({
  params
}: {
  params: Promise<{ id: string; empId: string }>
}) {
  const { id: bizId, empId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verificar que el negocio pertenece al usuario
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, slug')
    .eq('id', bizId)
    .eq('owner_id', user.id)
    .single()

  if (!business) notFound()

  const { data: employee } = await supabase
    .from('employees')
    .select('id, name, slug, active, total_scans')
    .eq('id', empId)
    .eq('business_id', bizId)
    .single()

  if (!employee) notFound()

  // Scans de los últimos 30 días para este empleado
  const since = new Date()
  since.setDate(since.getDate() - 29)
  since.setHours(0, 0, 0, 0)

  const { data: scans } = await supabase
    .from('scans')
    .select('created_at, outcome')
    .eq('employee_id', empId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  const positive = scans?.filter(s => s.outcome === 'positive').length ?? 0
  const total = scans?.length ?? 0
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://calificar.com.ar'
  const funnelUrl = `${appUrl}/r/${business.slug}?emp=${employee.slug}`

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Link href={`/dashboard/negocios/${bizId}`} className="text-sm text-gray-400 hover:text-gray-600">
          ← {business.name}
        </Link>
        <span className="text-gray-200">/</span>
        <h1 className="text-xl font-extrabold text-gray-900">{employee.name}</h1>
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${employee.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
          {employee.active ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Scans totales', value: employee.total_scans ?? 0 },
          { label: 'Últimos 30 días', value: total },
          { label: 'Positivos (30d)', value: positive },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <EmpleadoClient
        employee={employee}
        bizId={bizId}
        funnelUrl={funnelUrl}
      />
    </div>
  )
}
