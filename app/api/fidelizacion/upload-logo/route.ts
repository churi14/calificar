/**
 * POST /api/fidelizacion/upload-logo
 * Sube el logo del negocio a Supabase Storage y actualiza loyalty_programs.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const programId = form.get('program_id') as string | null

    if (!file || !programId) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo supera 2MB' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
    const path = `logos/${programId}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadErr } = await admin.storage
      .from('calificar-assets')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message }, { status: 500 })
    }

    const { data: { publicUrl } } = admin.storage
      .from('calificar-assets')
      .getPublicUrl(path)

    await admin
      .from('loyalty_programs')
      .update({ logo_url: publicUrl })
      .eq('id', programId)

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error('upload-logo error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
