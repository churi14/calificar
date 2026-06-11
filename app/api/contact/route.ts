import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json()
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { error } = await supabase.from('contact_messages').insert({ name, email, message })
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Error al enviar el mensaje' }, { status: 500 })
  }
}