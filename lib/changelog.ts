/**
 * Novedades del panel. Para anunciar mejoras: agregá una versión NUEVA arriba de todo en CHANGELOG
 * (no edites las viejas). El popup le aparece una vez a cada cliente cuando cambia APP_VERSION.
 */
export type ChangelogPlan = 'todos' | 'starter' | 'pro' | 'ultimate'

export interface ChangelogItem {
  plan: ChangelogPlan
  title: string
  desc: string
}

export interface ChangelogEntry {
  version: string
  date: string // AAAA-MM-DD
  items: ChangelogItem[]
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.0',
    date: '2026-10-27',
    items: [
      { plan: 'pro', title: 'Solo sella el negocio', desc: 'En Sello rápido podés hacer que los clientes no puedan sellarse solos: el QR del local solo muestra su tarjeta y los sellos los cargás vos o tu equipo.' },
      { plan: 'pro', title: 'Tiempo entre sellos a tu medida', desc: 'Elegí que un cliente reciba un sello cada 4 horas, cada 12 horas o 1 por día. Con "solo sella el negocio", el límite vale también para tus empleados.' },
      { plan: 'todos', title: 'QR para ver mi tarjeta', desc: 'En Sello rápido hay un QR nuevo para que tus clientes entren a su tarjeta sin sumar un sello.' },
      { plan: 'todos', title: 'Novedades en el panel', desc: 'Ahora te avisamos acá cada mejora nueva, ordenada por plan, y podés ver la versión del panel.' },
      { plan: 'pro', title: 'Sucursales con una sola tarjeta', desc: 'Todos tus locales comparten la misma tarjeta de sellos y ves las métricas de cada uno.' },
      { plan: 'ultimate', title: 'Hasta 50 sucursales', desc: 'Sumá todos los locales que necesites con una sola tarjeta compartida.' },
    ],
  },
]

export const APP_VERSION = CHANGELOG[0].version

export const PLAN_LABEL: Record<ChangelogPlan, string> = {
  todos: 'Todos los planes',
  starter: 'Starter',
  pro: 'Pro',
  ultimate: 'Ultimate',
}

/** Orden en que se muestran los grupos dentro del popup */
export const PLAN_ORDER: ChangelogPlan[] = ['todos', 'starter', 'pro', 'ultimate']
