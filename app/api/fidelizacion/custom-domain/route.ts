/**
 * GET  /api/fidelizacion/custom-domain?program_id=xxx  — obtiene estado del dominio
 * POST /api/fidelizacion/custom-domain                 — guarda dominio + lo registra en Vercel
 * PUT    /api/fidelizacion/custom-domain               — verifica el DNS (CNAME) y marca el dominio como verificado
 * DELETE /api/fidelizacion/custom-domain               — elimina dominio
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyProgramOwner } from '@/lib/business-auth'
import { promises as dns } from 'dns'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VERCEL_TOKEN      = process.env.VERCEL_API_TOKEN ?? ''
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID ?? ''
const VERCEL_TEAM_ID    = process.env.VERCEL_TEAM_ID   ?? ''   // opcional

function vercelHeaders() {
  return {
    Authorization: `Bearer ${VERCEL_TOKEN}`,
    'Content-Type': 'application/json',
  }
}

function vercelUrl(path: string) {
  const base = `https://api.vercel.com${path}`
  return VERCEL_TEAM_ID ? `${base}?teamId=${VERCEL_TEAM_ID}` : base
}

/** Normaliza el dominio: quita protocolo, www y barra final */
function normalizeDomain(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .trim()
}

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const program_id = req.nextUrl.searchParams.get('program_id')
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const owner = await verifyProgramOwner(req, program_id)
  if (!owner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data } = await supabase
    .from('loyalty_programs')
    .select('custom_domain, custom_domain_verified, custom_domain_added_at, businesses(plan)')
    .eq('id', program_id)
    .single()

  const plan = (data?.businesses as { plan?: string } | null)?.plan ?? 'trial'
  const isUltimate = ['ultimate', 'gifted'].includes(plan.toLowerCase())

  return NextResponse.json({
    custom_domain: data?.custom_domain ?? null,
    verified: data?.custom_domain_verified ?? false,
    added_at: data?.custom_domain_added_at ?? null,
    is_ultimate: isUltimate,
  })
}

// ── POST ──────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { program_id, domain: rawDomain } = body

  if (!program_id || !rawDomain) {
    return NextResponse.json({ error: 'program_id y domain requeridos' }, { status: 400 })
  }

  const owner = await verifyProgramOwner(req, program_id)
  if (!owner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Gate Ultimate
  const { data: prog } = await supabase
    .from('loyalty_programs')
    .select('businesses(plan)')
    .eq('id', program_id)
    .single()

  const plan = (prog?.businesses as { plan?: string } | null)?.plan ?? 'trial'
  if (!['ultimate', 'gifted'].includes(plan.toLowerCase())) {
    return NextResponse.json({ error: 'Función exclusiva del plan Ultimate' }, { status: 403 })
  }

  const domain = normalizeDomain(rawDomain)

  // Validación básica
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
    return NextResponse.json({ error: 'Dominio inválido' }, { status: 400 })
  }

  // Guardar en BD
  const { error: dbErr } = await supabase
    .from('loyalty_programs')
    .update({
      custom_domain: domain,
      custom_domain_verified: false,
      custom_domain_added_at: new Date().toISOString(),
    })
    .eq('id', program_id)

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })

  // Registrar en Vercel (si las vars están configuradas)
  let vercelStatus: 'added' | 'skipped' | 'error' = 'skipped'
  let vercelError: string | null = null

  if (VERCEL_TOKEN && VERCEL_PROJECT_ID) {
    try {
      const res = await fetch(
        vercelUrl(`/v10/projects/${VERCEL_PROJECT_ID}/domains`),
        {
          method: 'POST',
          headers: vercelHeaders(),
          body: JSON.stringify({ name: domain }),
        }
      )
      if (res.ok || res.status === 409) {
        // 409 = ya existe, ok igual
        vercelStatus = 'added'
      } else {
        const err = await res.json()
        vercelError = err?.error?.message ?? 'Error Vercel'
        vercelStatus = 'error'
      }
    } catch {
      vercelStatus = 'error'
      vercelError = 'No se pudo conectar con Vercel'
    }
  }

  return NextResponse.json({
    ok: true,
    domain,
    vercel_status: vercelStatus,
    vercel_error: vercelError,
    // Instrucciones DNS para el cliente
    cname_target: `cname.vercel-dns.com`,
    instructions: `Configurá un registro CNAME en tu DNS apuntando "${domain}" → "cname.vercel-dns.com"`,
  })
}

// ── PUT: verificar el DNS ─────────────────────────────────────────────────────
// Comprueba que el subdominio tenga un CNAME que apunte a Vercel. Es lo que hace que la tarjeta
// se vea en el dominio del cliente, así que si está bien lo marcamos como verificado.
export async function PUT(req: NextRequest) {
  const { program_id } = await req.json().catch(() => ({ program_id: null }))
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const owner = await verifyProgramOwner(req, program_id)
  if (!owner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: prog } = await supabase
    .from('loyalty_programs')
    .select('custom_domain')
    .eq('id', program_id)
    .single()

  const domain = prog?.custom_domain as string | null | undefined
  if (!domain) return NextResponse.json({ error: 'Todavía no guardaste ningún dominio' }, { status: 400 })

  let reason: 'ok' | 'not_found' | 'wrong_target' = 'not_found'
  let found: string[] = []
  try {
    found = await dns.resolveCname(domain)
    reason = found.some(t => /vercel-dns/i.test(t)) ? 'ok' : 'wrong_target'
  } catch {
    // ENODATA / ENOTFOUND: todavía no hay CNAME (o el DNS no se propagó)
    reason = 'not_found'
  }

  const verified = reason === 'ok'
  await supabase
    .from('loyalty_programs')
    .update({ custom_domain_verified: verified })
    .eq('id', program_id)

  return NextResponse.json({ verified, reason, found, domain })
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const program_id = req.nextUrl.searchParams.get('program_id')
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const owner = await verifyProgramOwner(req, program_id)
  if (!owner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Obtener dominio actual antes de borrar
  const { data: prog } = await supabase
    .from('loyalty_programs')
    .select('custom_domain')
    .eq('id', program_id)
    .single()

  const domain = prog?.custom_domain
  if (!domain) return NextResponse.json({ ok: true })

  // Borrar de la BD
  await supabase
    .from('loyalty_programs')
    .update({ custom_domain: null, custom_domain_verified: false, custom_domain_added_at: null })
    .eq('id', program_id)

  // Borrar de Vercel
  if (VERCEL_TOKEN && VERCEL_PROJECT_ID) {
    try {
      await fetch(
        vercelUrl(`/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}`),
        { method: 'DELETE', headers: vercelHeaders() }
      )
    } catch { /* no bloqueamos */ }
  }

  return NextResponse.json({ ok: true })
}
