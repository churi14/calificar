import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyProgramOwner } from '@/lib/business-auth'
import { createOrUpdateLoyaltyClass } from '@/lib/wallet/google-wallet'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const { data: program, error } = await supabase
    .from('loyalty_programs')
    .select('*, businesses(name)')
    .eq('id', id)
    .eq('active', true)
    .single()

  if (error || !program) return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 })

  return NextResponse.json({ program })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { program_id, milestones, sync_wallet } = body
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  // Verificar que el usuario es dueño del programa
  const owner = await verifyProgramOwner(req, program_id)
  if (!owner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Actualizar milestones si se enviaron
  if (milestones !== undefined) {
    const { error } = await supabase
      .from('loyalty_programs')
      .update({ milestones })
      .eq('id', program_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Sincronizar clase en Google Wallet si se pide
  if (sync_wallet) {
    const { data: program } = await supabase
      .from('loyalty_programs')
      .select('*, businesses(name)')
      .eq('id', program_id)
      .single()

    if (program) {
      try {
        await createOrUpdateLoyaltyClass({
          classId: program.id,
          programName: program.name,
          issuerName: (program.businesses as { name: string })?.name ?? program.name,
          logoUrl: program.logo_url ?? `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://calificar.com.ar'}/logo-wallet.png`,
          hexBgColor: program.color_primary ?? '#7C3AED',
          stampsGoal: program.stamps_goal,
          rewardDescription: program.reward_description,
        })
        return NextResponse.json({ ok: true, wallet_synced: true })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        return NextResponse.json({ ok: true, wallet_synced: false, wallet_error: msg })
      }
    }
  }

  return NextResponse.json({ ok: true })
}
