/**
 * POST /api/fidelizacion/admin/upload-logo
 * Sube un logo (png/svg/jpg) a Supabase Storage y devuelve la URL pública.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BUCKET = 'loyalty-logos'

export async function POST(req: NextRequest) {
  // Verificar que es admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Sin acceso' }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
  const fileName = `logo-${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  // Asegurar que el bucket existe
  const { data: buckets } = await admin.storage.listBuckets()
  if (!buckets?.find(b => b.name === BUCKET)) {
    await admin.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 2097152 }) // 2MB
  }

  const { error } = await admin.storage.from(BUCKET).upload(fileName, buffer, {
    contentType: file.type,
    upsert: true,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(fileName)

  return NextResponse.json({ url: publicUrl })
}
