import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cliente service_role para buscar dominio personalizado
// (no se usa en Edge — usar fetch directo a Supabase REST)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

// Dominios propios de Calificar — no redirigir
const OWN_HOSTS = new Set([
  'calificar.com.ar',
  'www.calificar.com.ar',
  'localhost',
])

async function resolveProgramIdForDomain(host: string): Promise<string | null> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null
  try {
    const url = `${SUPABASE_URL}/rest/v1/loyalty_programs?custom_domain=eq.${encodeURIComponent(host)}&active=eq.true&select=id&limit=1`
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      next: { revalidate: 60 }, // cache 1 min
    })
    if (!res.ok) return null
    const rows = await res.json() as { id: string }[]
    return rows[0]?.id ?? null
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')?.split(':')[0] ?? ''
  const pathname = request.nextUrl.pathname

  // ── Dominio personalizado ─────────────────────────────────────────────────
  // Si el hostname no es calificar.com.ar ni localhost, buscamos en BD
  const isOwnHost = OWN_HOSTS.has(hostname) || hostname.endsWith('.vercel.app')
  if (!isOwnHost && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
    const programId = await resolveProgramIdForDomain(hostname)
    if (programId) {
      // Reescribir a /t/[programId] preservando query string
      const search = request.nextUrl.search
      const url = request.nextUrl.clone()
      url.pathname = `/t/${programId}`
      url.search = search
      return NextResponse.rewrite(url)
    }
  }

  // ── Sesión Supabase (comportamiento original) ─────────────────────────────
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as any)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}