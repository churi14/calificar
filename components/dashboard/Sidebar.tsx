'use client'

import React, { useState } from 'react'
import {
  House, Lightning, IdentificationCard, UsersThree, Tag, Bell, MapPin,
  Cake, ArrowCounterClockwise, ChartBar, Star, ShareNetwork,
  CirclesThree, GitBranch, Globe, Printer, Gear, Question,
  Rocket, MagnifyingGlass, QrCode, Sun, Moon,
} from '@phosphor-icons/react'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import type { ViewType } from '@/types/dashboard'

const supabaseClient = createSupabaseClient()

interface SidebarProps {
  active: ViewType
  onNav: (id: ViewType) => void
  businessName: string
  email: string
  bdayBadge?: number
  isDark: boolean
  onDarkToggle: () => void
  isOpen: boolean
  onClose: () => void
  plan?: string
  planExpiresAt?: string | null
  /** Sucursales (programas) del negocio y la elegida */
  branches?: { id: string; label: string }[]
  selectedBranch?: string | null
  onSelectBranch?: (id: string) => void
  /** Solo Ultimate/gifted: muestra "+ Nueva sucursal" */
  canAddBranch?: boolean
  onAddBranch?: () => void
}

const NAV_ITEMS: { id: ViewType; label: string; Icon: React.ElementType }[] = [
  { id: 'hoy',          label: 'Hoy',                    Icon: House },
  { id: 'sello-rapido', label: 'Sello rápido',           Icon: Lightning },
  { id: 'tarjeta',      label: 'Tarjeta',                Icon: IdentificationCard },
  { id: 'clientes',     label: 'Clientes',               Icon: UsersThree },
  { id: 'cupones',      label: 'Cupones',                Icon: Tag },
  { id: 'push',         label: 'Avisos push',            Icon: Bell },
  { id: 'proximidad',   label: 'Avisos de proximidad',   Icon: MapPin },
  { id: 'cumple',       label: 'Campañas de cumpleaños', Icon: Cake },
  { id: 'reactivacion', label: 'Reactivación',           Icon: ArrowCounterClockwise },
  { id: 'insights',     label: 'Activity Insights',      Icon: ChartBar },
  { id: 'reseñas',      label: 'Reseñas Google',         Icon: Star },
  { id: 'referencias',  label: 'Referencias',            Icon: ShareNetwork },
  { id: 'ruleta',       label: 'Ruleta de la suerte',    Icon: CirclesThree },
  { id: 'metricas',     label: 'Métricas por sucursal',  Icon: GitBranch },
  { id: 'dominio',      label: 'Dominio personalizado',  Icon: Globe },
  { id: 'imprimir',     label: 'Imprimir y compartir',   Icon: Printer },
]

export default function Sidebar({
  active,
  onNav,
  businessName,
  email,
  bdayBadge = 0,
  isDark,
  onDarkToggle,
  isOpen,
  onClose,
  plan = 'trial',
  planExpiresAt = null,
  branches = [],
  selectedBranch = null,
  onSelectBranch,
  canAddBranch = false,
  onAddBranch,
}: SidebarProps) {
  const [settingsOpen, setSettingsOpen] = useState(active === 'perfil' || active === 'plan')
  const [branchOpen, setBranchOpen] = useState(false)
  // Se muestra el selector si hay más de una sucursal o si puede agregar
  const showBranchPicker = branches.length > 1 || canAddBranch
  const currentBranch = branches.find(b => b.id === selectedBranch) ?? branches[0]

  function navigate(id: ViewType) {
    onNav(id)
    onClose()
  }

  return (
    <>
      {/* Overlay móvil */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" onClick={onClose} />
      )}

      <aside className={`w-60 flex-shrink-0 border-r border-zinc-100 bg-white flex flex-col h-screen overflow-y-auto z-50 transition-transform duration-200
        fixed top-0 left-0 md:static md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Logo */}
        <div className="px-5 py-5 border-b border-zinc-100">
          <button onClick={() => onNav('hoy')} className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-zinc-900 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[10px] font-black tracking-tighter">ca</span>
            </span>
            <span className="font-semibold text-sm text-zinc-900 tracking-tight">calificar</span>
          </button>
        </div>

        {/* Selector de sucursal */}
        {showBranchPicker && (
          <div className="px-4 pt-3">
            <button
              onClick={() => setBranchOpen(o => !o)}
              className="w-full flex items-center gap-2 bg-zinc-50 border border-zinc-150 hover:border-zinc-300 rounded-lg px-3 py-2 text-left transition-colors"
              aria-expanded={branchOpen}
            >
              <GitBranch size={14} className="text-violet-500 flex-shrink-0" weight="bold" />
              <span className="flex-1 min-w-0">
                <span className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400 leading-none mb-0.5">Sucursal</span>
                <span className="block text-sm font-medium text-zinc-800 truncate">{currentBranch?.label ?? 'Principal'}</span>
              </span>
              <span className="text-zinc-400 text-[10px]">{branchOpen ? '▲' : '▼'}</span>
            </button>
            {branchOpen && (
              <div className="mt-1 rounded-lg border border-zinc-150 bg-white shadow-sm overflow-hidden">
                {branches.map(b => (
                  <button
                    key={b.id}
                    onClick={() => { onSelectBranch?.(b.id); setBranchOpen(false); onClose() }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      b.id === selectedBranch ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    {b.id === selectedBranch ? '✓ ' : ''}{b.label}
                  </button>
                ))}
                {canAddBranch && (
                  <button
                    onClick={() => { setBranchOpen(false); onAddBranch?.() }}
                    className="w-full text-left px-3 py-2 text-sm font-semibold text-violet-600 hover:bg-violet-50 border-t border-zinc-100 transition-colors"
                  >
                    ＋ Nueva sucursal
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Búsqueda + CTA */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-150 rounded-lg px-3 py-2">
            <MagnifyingGlass size={14} className="text-zinc-400 flex-shrink-0" weight="regular" />
            <input
              type="text"
              placeholder="Buscar un cliente"
              className="bg-transparent text-sm text-zinc-700 placeholder-zinc-400 focus:outline-none w-full"
            />
          </div>
        </div>
        <div className="px-4 pb-3 pt-1">
          <button
            onClick={() => navigate('clientes')}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-sm text-white bg-zinc-900 hover:bg-zinc-800 transition-colors active:scale-[0.98]"
          >
            <QrCode size={15} weight="bold" />
            Escanear un cliente
          </button>
        </div>

        {/* Nav principal */}
        <nav className="flex-1 px-3 space-y-0.5 pb-2">
          {NAV_ITEMS.map(item => {
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                  isActive
                    ? 'bg-zinc-900 text-white font-medium'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'
                }`}
              >
                <item.Icon
                  size={16}
                  weight={isActive ? 'fill' : 'regular'}
                  className="flex-shrink-0"
                />
                <span className="flex-1">{item.label}</span>
                {item.id === 'cumple' && bdayBadge > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                    {bdayBadge}
                  </span>
                )}
              </button>
            )
          })}

          {/* Ajustes (colapsable) */}
          <div>
            <button
              onClick={() => setSettingsOpen(o => !o)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 transition-all"
            >
              <span className="flex items-center gap-3">
                <Gear size={16} weight="regular" className="flex-shrink-0" />
                Ajustes
              </span>
              <span className="text-zinc-400 text-[10px]">{settingsOpen ? '▲' : '▼'}</span>
            </button>
            {settingsOpen && (
              <div className="ml-8 mt-0.5 space-y-0.5">
                {([['perfil', 'Perfil del negocio'], ['plan', 'Plan']] as [ViewType, string][]).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => navigate(id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                      active === id
                        ? 'text-zinc-900 font-semibold bg-zinc-100'
                        : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('ayuda')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 transition-all text-left"
          >
            <Question size={16} weight="regular" className="flex-shrink-0" /> Ayuda
          </button>
          <button
            onClick={() => navigate('primeros-pasos')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 transition-all text-left"
          >
            <Rocket size={16} weight="regular" className="flex-shrink-0" /> Primeros pasos
          </button>
        </nav>

        {/* Footer */}
        <div className="border-t border-zinc-100 p-4">
          {/* Business avatar */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 bg-zinc-800">
              {businessName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-900 truncate">{businessName}</p>
              <p className="text-[10px] text-zinc-400 truncate">{email}</p>
            </div>
          </div>

          {/* Plan badge */}
          {(() => {
            const isExpired = planExpiresAt ? new Date(planExpiresAt) < new Date() : false
            const isPaid = ['pro', 'ultimate', 'gifted', 'starter'].includes(plan) && !isExpired
            if (isPaid) {
              const planLabels: Record<string, string> = {
                starter: 'Starter', pro: 'Pro', ultimate: 'Ultimate', gifted: 'Ultimate 🎁',
              }
              const planColors: Record<string, string> = {
                starter: 'bg-blue-50 text-blue-600',
                pro: 'bg-violet-50 text-violet-700',
                ultimate: 'bg-amber-50 text-amber-700',
                gifted: 'bg-green-50 text-green-700',
              }
              const color = planColors[plan] ?? 'bg-zinc-50 text-zinc-500'
              return (
                <div className={`rounded-lg px-3 py-2 mb-2 ${color.split(' ')[0]}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-semibold ${color.split(' ')[1]}`}>
                      ● {planLabels[plan] ?? plan}
                    </span>
                    {planExpiresAt && (
                      <span className="text-[10px] text-zinc-400">
                        hasta {new Date(planExpiresAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>
              )
            }
            return (
              <button
                onClick={() => navigate('plan')}
                className={`w-full rounded-lg px-3 py-2.5 mb-2 text-left transition-all hover:opacity-90 active:scale-[0.98] ${
                  isExpired ? 'bg-red-600' : 'bg-zinc-900'
                }`}
              >
                <p className="text-white font-semibold text-xs">
                  {isExpired ? 'Plan vencido' : 'Prueba gratuita'}
                </p>
                <p className="text-white/60 text-[10px] mt-0.5">
                  {isExpired ? 'Renovar plan →' : 'Mejorar plan →'}
                </p>
              </button>
            )
          })()}

          {/* Cerrar sesión + Dark toggle */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={async () => {
                await supabaseClient.auth.signOut()
                window.location.href = '/'
              }}
              className="text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              ↩ Cerrar sesión
            </button>
            <button
              onClick={onDarkToggle}
              title={isDark ? 'Modo claro' : 'Modo oscuro'}
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:bg-zinc-100 ${isDark ? 'bg-zinc-700' : ''}`}
            >
              {isDark
                ? <Sun size={15} weight="regular" className="text-zinc-300" />
                : <Moon size={15} weight="regular" className="text-zinc-500" />
              }
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
