import React, { useState } from 'react';
import {
  TrendingUp,
  FileCheck2,
  Store,
  Layers,
  Award,
  Image as ImageIcon,
  Bell,
  Users,
  Shield,
  Settings,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';

export type MasterSection =
  | 'overview'
  | 'cadastros'
  | 'stores'
  | 'plans'
  | 'vendedores'
  | 'banners'
  | 'pushes'
  | 'users'
  | 'workers'
  | 'settings'
  | 'audit';

interface SidebarItem {
  id: MasterSection;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  highlightBadge?: boolean;
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

interface MasterSidebarProps {
  activeSection: MasterSection;
  onSelectSection: (section: MasterSection) => void;
  counts: {
    cadastros: number;
    stores: number;
    plans: number;
    sellers: number;
    banners: number;
    users: number;
    workers: number;
    audit: number;
  };
}

export const MasterSidebar: React.FC<MasterSidebarProps> = ({
  activeSection,
  onSelectSection,
  counts,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const groups: SidebarGroup[] = [
    {
      title: 'Governança & Finanças',
      items: [
        {
          id: 'overview' as MasterSection,
          label: 'Monitor Executivo',
          shortLabel: 'Monitor',
          icon: TrendingUp,
        },
        {
          id: 'plans' as MasterSection,
          label: 'Planos SaaS & Paywall',
          shortLabel: 'Planos SaaS',
          icon: Layers,
          badge: counts.plans,
        },
        {
          id: 'settings' as MasterSection,
          label: 'Taxas & Configurações',
          shortLabel: 'Configurações',
          icon: Settings,
        },
      ],
    },
    {
      title: 'Cadastros & Operação',
      items: [
        {
          id: 'cadastros' as MasterSection,
          label: 'Cadastros & Termos',
          shortLabel: 'Cadastros',
          icon: FileCheck2,
          badge: counts.cadastros,
          highlightBadge: counts.cadastros > 0,
        },
        {
          id: 'stores' as MasterSection,
          label: 'Lojas & Bloqueios',
          shortLabel: 'Lojas',
          icon: Store,
          badge: counts.stores,
        },
        {
          id: 'vendedores' as MasterSection,
          label: 'Vendedores & Metas',
          shortLabel: 'Vendedores',
          icon: Award,
          badge: counts.sellers,
        },
        {
          id: 'workers' as MasterSection,
          label: 'Equipe Interna',
          shortLabel: 'Equipe',
          icon: Shield,
          badge: counts.workers,
        },
        {
          id: 'users' as MasterSection,
          label: 'Base de Usuários',
          shortLabel: 'Usuários',
          icon: Users,
          badge: counts.users,
        },
      ],
    },
    {
      title: 'Comunicação & Mídia',
      items: [
        {
          id: 'banners' as MasterSection,
          label: 'Banners & Promoções',
          shortLabel: 'Banners',
          icon: ImageIcon,
          badge: counts.banners,
        },
        {
          id: 'pushes' as MasterSection,
          label: 'Mensagens Push Gerais',
          shortLabel: 'Push Geral',
          icon: Bell,
        },
      ],
    },
    {
      title: 'Segurança & Auditoria',
      items: [
        {
          id: 'audit' as MasterSection,
          label: 'Auditoria Imutável LGPD',
          shortLabel: 'Auditoria',
          icon: Terminal,
          badge: counts.audit,
        },
      ],
    },
  ];

  const handleSelect = (sec: MasterSection) => {
    onSelectSection(sec);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button (Visible only on small screens) */}
      <div className="lg:hidden w-full flex items-center justify-between p-3 bg-neutral-900 rounded-2xl border border-neutral-800 mb-2">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center gap-2 text-xs font-bold text-amber-400"
        >
          <Menu className="w-4 h-4" />
          <span>Menu Lateral Master</span>
        </button>
        <span className="text-[11px] text-neutral-400 capitalize">
          Seção: <strong>{activeSection}</strong>
        </span>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full lg:h-auto z-50 lg:z-10 transition-all duration-300 flex flex-col shrink-0 ${
          mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        <div className="bg-neutral-900 border border-neutral-800 rounded-none lg:rounded-3xl p-3 sm:p-4 space-y-5 h-full overflow-y-auto shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header with Collapse toggle */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 px-1">
              {!isCollapsed ? (
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className="font-extrabold text-white text-xs uppercase tracking-wider font-['Space_Grotesk']">
                      Navegação Master
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400">Governança Central</p>
                </div>
              ) : (
                <div className="w-full text-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                </div>
              )}

              {/* Desktop Collapse Toggle */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
                title={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
              >
                {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Menu Groups */}
            <div className="space-y-4">
              {groups.map((grp) => (
                <div key={grp.title} className="space-y-1">
                  {!isCollapsed && (
                    <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400 px-2 py-1">
                      {grp.title}
                    </div>
                  )}

                  <div className="space-y-1">
                    {grp.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition active:scale-98 ${
                            isActive
                              ? 'bg-amber-400 text-neutral-950 font-black shadow-lg shadow-amber-400/20'
                              : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                          } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                          title={item.label}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-neutral-950' : 'text-neutral-400'}`} />
                            {!isCollapsed && <span className="truncate">{item.label}</span>}
                          </div>

                          {!isCollapsed && item.badge !== undefined && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                                isActive
                                  ? 'bg-neutral-950 text-amber-300'
                                  : item.highlightBadge
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-neutral-800 text-neutral-400'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer inside Sidebar */}
          {!isCollapsed && (
            <div className="p-2.5 bg-neutral-950 rounded-2xl border border-neutral-800/80 text-[10px] text-neutral-400">
              <span className="text-amber-400 font-bold block">Acesso Master Ativo</span>
              Cachoeiras de Macacu / RJ
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
