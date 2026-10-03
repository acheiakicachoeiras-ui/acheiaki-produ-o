import React, { useState } from 'react';
import {
  ShoppingBag,
  MapPin,
  Search,
  Bell,
  MessageSquare,
  ShieldCheck,
  Store,
  Wrench,
  Bike,
  User,
  Users,
  ChevronDown,
  Briefcase,
  Award,
  ArrowRightLeft,
  Sparkles,
  LogOut,
  LogIn,
  LayoutDashboard,
  ShieldAlert,
  Menu,
  X,
  UserPlus,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { useAuth, DEMO_PROFILES } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { UserRole } from '../types';
import { getRoleMeta, getRoleDashboardTab, normalizeRole } from '../services/supabaseService';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenChat: () => void;
  onOpenAuth: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenNotifications,
  onOpenChat,
  onOpenAuth,
  activeTab,
  setActiveTab,
}) => {
  const {
    userProfile,
    activeRole,
    switchDemoRole,
    activeEnvironment,
    setActiveEnvironment,
    signOut,
    isAuthenticated,
    isSuperAdmin,
    getRedirectTabForRole,
  } = useAuth();

  const { items, setIsCartOpen } = useCart();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartTotalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const roleMeta = getRoleMeta(activeRole);
  const userAuthorizedTab = getRedirectTabForRole(activeRole);
  const isCommercialUser = activeRole !== 'client';

  const toggleEnvironment = () => {
    if (activeEnvironment === 'marketplace') {
      setActiveEnvironment('dashboard');
      setActiveTab(userAuthorizedTab);
    } else {
      setActiveEnvironment('marketplace');
      setActiveTab('home');
    }
  };

  const handleGoToMyPanel = () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    if (activeRole !== 'client') {
      setActiveEnvironment('dashboard');
    } else {
      setActiveEnvironment('marketplace');
    }
    setActiveTab(userAuthorizedTab);
  };

  const handleAdminSwitchRole = (role: UserRole) => {
    switchDemoRole(role);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    const target = getRoleDashboardTab(role);
    if (role === 'client') {
      setActiveEnvironment('marketplace');
    } else {
      setActiveEnvironment('dashboard');
    }
    setActiveTab(target);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 transition-all">
      {/* Top Banner Notice for Cachoeiras de Macacu */}
      <div className="bg-emerald-950 text-emerald-100 px-4 py-1 text-xs font-medium flex items-center justify-between">
        <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>
            Ecossistema Digital Oficial — <strong>Cachoeiras de Macacu / RJ</strong>
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-emerald-200 text-xs">
          <span>Entrega Padrão R$ 5,00</span>
          <span>•</span>
          <span>Supabase RBAC & Governança</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Logo & City */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setActiveEnvironment('marketplace');
                setActiveTab('home');
              }}
              className="text-left flex items-center gap-2 group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                A
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-neutral-900 font-['Space_Grotesk']">
                    Achei<span className="text-emerald-600">AKI</span>
                  </span>
                  <span className="text-[10px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 hidden xs:inline-block">
                    SaaS
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-medium">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>Cachoeiras de Macacu</span>
                </div>
              </div>
            </button>
          </div>

          {/* Quick Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center gap-2.5 px-4 py-2 bg-neutral-100 hover:bg-neutral-200/80 text-neutral-500 rounded-full border border-neutral-200 transition-colors text-xs text-left shadow-inner"
            >
              <Search className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">Buscar em Cachoeiras: padarias, serviços, motoboy...</span>
            </button>
          </div>

          {/* Right Navigation & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Search Trigger for Mobile */}
            <button
              onClick={onOpenSearch}
              className="md:hidden p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 active:scale-95 transition"
              title="Pesquisar"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Requisito 2: Botão Unificado "Cadastre-se" que abre a modal com [Entrar] e [Cadastrar-se] */}
            {!isAuthenticated && (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 active:scale-95 transition cursor-pointer"
                title="Cadastre-se ou Acesse sua Conta"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Cadastre-se</span>
              </button>
            )}

            {/* Alternar entre Loja e Marketplace (Apenas se logado como comercial) */}
            {isAuthenticated && isCommercialUser && (
              <button
                onClick={toggleEnvironment}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 font-bold text-xs transition active:scale-95 shadow-xs"
                title="Alternar entre modo comprador e modo de gestão"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {activeEnvironment === 'marketplace'
                    ? 'Ir p/ Meu Negócio'
                    : 'Ir p/ Marketplace'}
                </span>
              </button>
            )}

            {/* Usuário Logado: Menu Dropdown com foto, nome, Função, Meu Painel e Logout */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl border border-neutral-200 hover:border-emerald-300 bg-white hover:bg-neutral-50 transition shadow-xs active:scale-95"
                >
                  <img
                    src={
                      userProfile?.avatarUrl ||
                      userProfile?.avatar_url ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
                    }
                    alt={userProfile?.displayName || 'Perfil'}
                    className="w-8 h-8 rounded-xl object-cover border border-neutral-200"
                  />
                  <div className="text-left hidden sm:block max-w-[130px]">
                    <div className="text-xs font-extrabold text-neutral-900 truncate">
                      {userProfile?.displayName?.split(' ')[0] || userProfile?.full_name?.split(' ')[0] || 'Usuário'}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-bold truncate">
                      {roleMeta.shortLabel}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 ml-0.5" />
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-72 rounded-3xl bg-white shadow-2xl border border-neutral-200 p-2.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                      {/* Dropdown Header Info */}
                      <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center gap-3">
                        <img
                          src={
                            userProfile?.avatarUrl ||
                            userProfile?.avatar_url ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
                          }
                          alt={userProfile?.displayName || 'Avatar'}
                          className="w-10 h-10 rounded-xl object-cover border border-neutral-200"
                        />
                        <div className="overflow-hidden flex-1">
                          <h4 className="font-extrabold text-neutral-900 text-xs truncate">
                            {userProfile?.displayName || userProfile?.full_name}
                          </h4>
                          <span className="text-[10px] text-neutral-400 truncate block">
                            {userProfile?.email}
                          </span>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${roleMeta.badgeColor}`}
                          >
                            {roleMeta.label}
                          </span>
                        </div>
                      </div>

                      {/* Dropdown Actions */}
                      <div className="py-2 space-y-1">
                        <button
                          onClick={handleGoToMyPanel}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-bold text-xs transition"
                        >
                          <div className="flex items-center gap-2">
                            <LayoutDashboard className="w-4 h-4 text-emerald-700" />
                            <span>Meu Painel ({roleMeta.shortLabel})</span>
                          </div>
                          <span className="text-[10px] font-black text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                            Acessar
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setActiveEnvironment('marketplace');
                            setActiveTab('profile');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-neutral-100 text-neutral-700 font-semibold text-xs transition"
                        >
                          <User className="w-4 h-4 text-neutral-500" />
                          <span>Meus Dados & Endereços</span>
                        </button>
                      </div>

                      {/* Footer Logout */}
                      <div className="mt-2 pt-2 border-t border-neutral-100 px-2 flex items-center justify-between">
                        <span className="text-[10px] text-neutral-400">
                          {userProfile?.city} / {userProfile?.state}
                        </span>
                        <button
                          onClick={async () => {
                            setUserDropdownOpen(false);
                            await signOut();
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-red-600 hover:bg-red-50 font-bold text-xs transition"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sair</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Chat Trigger (Desktop) */}
            <button
              onClick={onOpenChat}
              className="hidden sm:flex relative p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 active:scale-95 transition"
              title="Mensagens Privadas"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 active:scale-95 transition"
              title="Notificações & Pushes"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-1 p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs transition active:scale-95 shadow-xs"
              title="Ver Carrinho de Compras"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Carrinho</span>
              {cartTotalCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                  {cartTotalCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Menu Toggle (Requisito 4: Menu Limpo sem 'Baixar App') */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-neutral-700 hover:bg-neutral-100 active:scale-95 transition"
              aria-label="Abrir Menu de Navegação"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Menu Hambúrguer elegante para telas menores) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white/98 backdrop-blur-md px-4 py-4 space-y-3 animate-in slide-in-from-top-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSearch();
              }}
              className="flex-1 flex items-center gap-2 px-3.5 py-2 bg-neutral-100 text-neutral-600 rounded-xl text-xs"
            >
              <Search className="w-4 h-4 text-emerald-600" />
              <span>Buscar lojas ou serviços...</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenChat();
              }}
              className="p-2 bg-neutral-100 rounded-xl text-neutral-700"
              title="Mensagens"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setActiveEnvironment('marketplace');
                setActiveTab('marketplace');
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-xs font-bold border border-neutral-200"
            >
              <Store className="w-4 h-4 text-emerald-600" />
              <span>Lojas & Comércios</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setActiveEnvironment('marketplace');
                setActiveTab('services');
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-xs font-bold border border-neutral-200"
            >
              <Wrench className="w-4 h-4 text-emerald-600" />
              <span>Prestadores Macacu</span>
            </button>
          </div>

          {isAuthenticated && (
            <div className="pt-2 border-t border-neutral-200 space-y-2">
              <button
                onClick={handleGoToMyPanel}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 text-emerald-950 font-bold text-xs border border-emerald-200"
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-emerald-700" />
                  <span>Meu Painel ({roleMeta.shortLabel})</span>
                </div>
                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-black">
                  Acessar
                </span>
              </button>
            </div>
          )}

          {!isAuthenticated && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Acessar ou Criar Conta</span>
            </button>
          )}

          <div className="pt-2 text-center text-[10px] text-neutral-400">
            AcheiaKi Macacu • Intermediação Tecnológica Local
          </div>
        </div>
      )}
    </header>
  );
};
