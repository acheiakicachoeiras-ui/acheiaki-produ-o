import React from 'react';
import {
  Home,
  Store,
  ClipboardList,
  MessageSquare,
  User,
  LayoutDashboard,
  Briefcase,
  Award,
  ArrowRightLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { normalizeRole } from '../services/supabaseService';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenChat: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenChat,
}) => {
  const { activeRole, activeEnvironment, setActiveEnvironment } = useAuth();
  const normalized = normalizeRole(activeRole);

  const getDashboardTab = () => {
    switch (normalized) {
      case 'super_admin':
        return { tab: 'master', label: 'Master', icon: LayoutDashboard };
      case 'merchant':
        return { tab: 'merchant', label: 'Loja', icon: LayoutDashboard };
      case 'manager':
        return { tab: 'manager', label: 'Gerência', icon: Briefcase };
      case 'seller':
        return { tab: 'seller', label: 'Vendas', icon: Award };
      case 'service_provider':
        return { tab: 'provider', label: 'Serviços', icon: LayoutDashboard };
      case 'driver':
        return { tab: 'driver', label: 'Entregas', icon: LayoutDashboard };
      case 'staff':
        return { tab: 'worker', label: 'Equipe', icon: LayoutDashboard };
      case 'client':
      default:
        return { tab: 'profile', label: 'Conta', icon: User };
    }
  };

  const dashboardInfo = getDashboardTab();
  const DashboardIcon = dashboardInfo.icon;
  const isCommercial = normalized !== 'client';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 py-2 px-3 md:hidden shadow-lg pb-[env(safe-area-inset-bottom,8px)]">
      <div className="flex items-center justify-around">
        {/* Início / Marketplace */}
        <button
          onClick={() => {
            setActiveEnvironment('marketplace');
            setActiveTab('home');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition text-[10px] font-medium ${
            activeTab === 'home'
              ? 'text-emerald-600 font-extrabold'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span>Início</span>
        </button>

        {/* Lojas / Comércio */}
        <button
          onClick={() => {
            setActiveEnvironment('marketplace');
            setActiveTab('marketplace');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition text-[10px] font-medium ${
            activeTab === 'marketplace'
              ? 'text-emerald-600 font-extrabold'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Store
            className={`w-5 h-5 ${activeTab === 'marketplace' ? 'stroke-[2.5px]' : 'stroke-2'}`}
          />
          <span>Comércio</span>
        </button>

        {/* Pedidos */}
        <button
          onClick={() => {
            setActiveEnvironment('marketplace');
            setActiveTab('orders');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition text-[10px] font-medium ${
            activeTab === 'orders'
              ? 'text-emerald-600 font-extrabold'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <ClipboardList
            className={`w-5 h-5 ${activeTab === 'orders' ? 'stroke-[2.5px]' : 'stroke-2'}`}
          />
          <span>Pedidos</span>
        </button>

        {/* Chat / Mensagens */}
        <button
          onClick={onOpenChat}
          className="flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition text-[10px] font-medium text-neutral-500 hover:text-neutral-900"
        >
          <MessageSquare className="w-5 h-5 stroke-2" />
          <span>Chat</span>
        </button>

        {/* Painel do Papel Ativo ou Perfil */}
        <button
          onClick={() => {
            if (isCommercial) {
              setActiveEnvironment('dashboard');
            }
            setActiveTab(dashboardInfo.tab);
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition text-[10px] font-medium ${
            activeTab === dashboardInfo.tab
              ? 'text-emerald-600 font-extrabold'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <DashboardIcon
            className={`w-5 h-5 ${activeTab === dashboardInfo.tab ? 'stroke-[2.5px]' : 'stroke-2'}`}
          />
          <span>{dashboardInfo.label}</span>
        </button>
      </div>
    </nav>
  );
};
