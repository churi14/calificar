import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { business_id, employee_id, rating, outcome } = await req.json()
    if (!business_id) return NextResponse.json({ error: 'business_id requerido' }, { status: 400 })

    const supabase = createServiceClient()

    // Registrar el scan
    await supabase.from('scans').insert({ business_id, employee_id, rating, outcome })

    // Actualizar contadores en el negocio
    if (outcome === 'positive') {
      await supabase.rpc('increment_business_scans', { bid: business_id, positive: true })
    } else if (outcome === 'negative') {
      await supabase.rpc('increment_business_scans', { bid: business_id, positive: false })
    }

    // Actualizar contador de empleado si aplica
    if (employee_id) {
      await supabase.from('employees')
        .update({ total_scans: supabase.rpc('coalesce', {}) })
        .eq('id', employee_id)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
