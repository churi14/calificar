import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { business_id, rating, message, contact } = await req.json()
    if (!business_id || !message) {
      return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { error } = await supabase.from('feedback').insert({ business_id, rating, message, contact })
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Error al guardar feedback' }, { status: 500 })
  }
}
