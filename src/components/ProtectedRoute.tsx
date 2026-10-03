import React from 'react';
import { ShieldAlert, Lock, ArrowRight, Home, LogIn } from 'lucide-react';
import { UserRole } from '../types';
import { getRoleMeta, getRoleDashboardTab, normalizeRole } from '../services/supabaseService';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  currentRole: UserRole;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  children: React.ReactNode;
  onNavigateTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  currentRole,
  isAuthenticated,
  isSuperAdmin,
  children,
  onNavigateTab,
  onOpenAuth,
}) => {
  // Super Admin tem passe livre absoluto para inspecionar qualquer painel do SaaS
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // Se o usuário não está autenticado e tenta acessar um painel restrito
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-neutral-200/80 shadow-xl p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-900">
              Autenticação Necessária
            </span>
            <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
              Acesso Restrito ao Sistema
            </h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Você precisa entrar com sua conta autenticada do AcheiaKi para acessar esta área protegida.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigateTab('home')}
              className="flex-1 py-3 px-4 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Home className="w-4 h-4" />
              <span>Marketplace</span>
            </button>
            <button
              onClick={onOpenAuth}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar / Cadastrar</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Verifica se o papel atual está na lista de papéis permitidos
  const normalizedCurrent = normalizeRole(currentRole);
  const normalizedAllowed = allowedRoles.map((r) => normalizeRole(r));
  const hasAccess = normalizedAllowed.includes(normalizedCurrent);

  if (!hasAccess) {
    const currentMeta = getRoleMeta(normalizedCurrent);
    const myAuthorizedTab = getRoleDashboardTab(normalizedCurrent);

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-red-200 shadow-2xl p-8 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-[11px] font-black tracking-wide">
              <span>ERRO 403</span>
              <span>•</span>
              <span>ACESSO NÃO AUTORIZADO</span>
            </div>
            <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
              Permissão Insuficiente
            </h2>
            <p className="text-xs text-neutral-600 leading-relaxed max-w-sm mx-auto">
              Seu perfil atual de <strong>{currentMeta.label}</strong> não possui privilégios de acesso a este módulo restrito.
            </p>
          </div>

          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
              <span className="text-neutral-500 font-semibold">Sua Função Atual:</span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${currentMeta.color}`}>
                {currentMeta.shortLabel}
              </span>
            </div>
            <div className="text-neutral-500">
              <span className="font-semibold block mb-1">Níveis permitidos para este painel:</span>
              <div className="flex flex-wrap gap-1.5">
                {allowedRoles.map((r) => {
                  const m = getRoleMeta(r);
                  return (
                    <span
                      key={r}
                      className="px-2 py-0.5 rounded-md bg-neutral-200/80 text-neutral-800 text-[10px] font-bold"
                    >
                      {m.shortLabel}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigateTab('home')}
              className="flex-1 py-3 px-4 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Home className="w-4 h-4" />
              <span>Ir p/ Início</span>
            </button>
            <button
              onClick={() => onNavigateTab(myAuthorizedTab)}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
            >
              <span>Meu Painel Autorizado</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Acesso permitido
  return <>{children}</>;
};
