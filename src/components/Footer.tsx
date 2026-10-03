import React from 'react';
import {
  MapPin,
  ShieldCheck,
  Store,
  Bike,
  Sparkles,
  Phone,
  Mail,
  ChevronRight,
  ExternalLink,
  BookOpen,
  DollarSign,
  Lock,
  FileText,
  Award,
  Layers,
  Heart,
  User,
} from 'lucide-react';
import { LegalDocType } from './LegalDocsModal';

interface FooterProps {
  onOpenDoc: (doc: LegalDocType) => void;
  onNavigateTab: (tab: string) => void;
  onOpenOnboarding: (type?: 'merchant' | 'driver') => void;
  onOpenAuth: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenDoc,
  onNavigateTab,
  onOpenOnboarding,
  onOpenAuth,
}) => {
  return (
    <footer className="bg-neutral-950 text-neutral-300 border-t border-neutral-900 pt-14 pb-24 md:pb-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Section: Brand, Mission, and Inspiration */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-neutral-800">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-emerald-900/30">
                A
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-2xl tracking-tight text-white font-['Space_Grotesk']">
                    Achei<span className="text-emerald-400">AKI</span>
                  </span>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                    Cachoeiras de Macacu
                  </span>
                </div>
                <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Cachoeiras de Macacu — RJ</span>
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
              Inspirado nas verdes matas e florestas do Parque Estadual e da serra de Cachoeiras de Macacu.
              Conectando moradores, prestadores e comércios locais com tecnologia, agilidade e pertencimento comunitário.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              <button
                onClick={() => onOpenDoc('planos-taxas')}
                className="px-4 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-neutral-950 font-black transition flex items-center gap-1.5 shadow-md"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Conhecer Nossos Planos & Taxas</span>
              </button>

              <button
                onClick={() => onOpenOnboarding('merchant')}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 font-bold transition flex items-center gap-1.5"
              >
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                <span>Quero Vender na Plataforma</span>
              </button>
            </div>
          </div>

          {/* Quick Pillars Overview */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6">
            {/* Col 1: Departamentos & Categorias */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Departamentos & Categorias
              </h4>
              <ul className="space-y-2 text-neutral-400 text-xs">
                <li>
                  <button
                    onClick={() => onNavigateTab('home')}
                    className="hover:text-white transition flex items-center gap-1"
                  >
                    <span>Lojas</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigateTab('home')}
                    className="hover:text-white transition flex items-center gap-1"
                  >
                    <span>Produtos</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigateTab('services')}
                    className="hover:text-white transition flex items-center gap-1"
                  >
                    <span>Prestadores de Serviços</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigateTab('services')}
                    className="hover:text-white transition flex items-center gap-1"
                  >
                    <span>Consultórios & Clínicas</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigateTab('home')}
                    className="hover:text-white transition flex items-center gap-1"
                  >
                    <span>Gastronomia & Delivery</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 2: Acesso & Modalidades (Formulários & Cadastros) */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Acesso & Modalidades
              </h4>
              <ul className="space-y-2 text-neutral-400 text-xs">
                <li>
                  <button
                    onClick={() => onOpenOnboarding('merchant')}
                    className="hover:text-emerald-300 font-semibold transition flex items-center gap-1"
                  >
                    <ChevronRight className="w-3 h-3 text-emerald-500" />
                    <span>Cadastre-se Gratuitamente</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onOpenOnboarding('merchant')}
                    className="hover:text-emerald-300 font-semibold transition flex items-center gap-1"
                  >
                    <ChevronRight className="w-3 h-3 text-emerald-500" />
                    <span>Quero Vender na Plataforma</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onOpenOnboarding('driver')}
                    className="hover:text-emerald-300 font-semibold transition flex items-center gap-1"
                  >
                    <ChevronRight className="w-3 h-3 text-emerald-500" />
                    <span>Quero ser Entregador Parceiro</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={onOpenAuth}
                    className="hover:text-white transition flex items-center gap-1 pt-1"
                  >
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Entrar na Minha Conta</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onOpenDoc('planos-taxas')}
                    className="hover:text-white transition flex items-center gap-1 text-[11px] text-emerald-300/80"
                  >
                    <span>Planos Grátis, Bronze, Prata, Ouro e Premium</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Normas & Transparência Legal */}
            <div className="space-y-3 col-span-2 sm:col-span-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Normas & Transparência Legal
              </h4>
              <ul className="space-y-2 text-neutral-400 text-xs">
                <li>
                  <button
                    onClick={() => onOpenDoc('manual-cliente')}
                    className="hover:text-white transition flex items-center gap-1 text-left"
                  >
                    <BookOpen className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>Manual Passo a Passo do Cliente</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onOpenDoc('manual-lojista')}
                    className="hover:text-white transition flex items-center gap-1 text-left"
                  >
                    <Store className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>Manual Passo a Passo do Lojista</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onOpenDoc('direitos')}
                    className="hover:text-white transition flex items-center gap-1 text-left"
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>Direitos Autorais (Bex Serviços)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onOpenDoc('lgpd')}
                    className="hover:text-white transition flex items-center gap-1 text-left"
                  >
                    <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>Política de Privacidade (LGPD)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onOpenDoc('termos')}
                    className="hover:text-white transition flex items-center gap-1 text-left"
                  >
                    <FileText className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>Termos de Uso & Regras Comerciais</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onOpenDoc('avaliacoes')}
                    className="hover:text-white transition flex items-center gap-1 text-left"
                  >
                    <Award className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>Política de Avaliações Mútuas</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Official Platform Manuals & Portals Links (Requested in user brief) */}
        <div className="bg-neutral-900/60 rounded-3xl p-6 border border-neutral-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                Documentação da Plataforma & Manuais Oficiais:
              </span>
              <p className="text-xs text-neutral-400 mt-0.5">
                Acesse guias passo a passo, formulários de adesão e ferramentas de operação comercial
              </p>
            </div>
            <span className="text-[11px] text-neutral-500">
              Desenvolvido para Bex Serviços e Comércios
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
            <button
              onClick={() => onOpenDoc('manual-cliente')}
              className="p-3 rounded-2xl bg-neutral-800/70 hover:bg-neutral-800 text-left border border-neutral-700/60 transition group"
            >
              <span className="text-[10px] text-emerald-400 font-bold block mb-1">Guia Oficial</span>
              <span className="text-xs font-bold text-neutral-200 group-hover:text-white block">
                Manual do Cliente
              </span>
            </button>

            <button
              onClick={() => onOpenDoc('manual-lojista')}
              className="p-3 rounded-2xl bg-neutral-800/70 hover:bg-neutral-800 text-left border border-neutral-700/60 transition group"
            >
              <span className="text-[10px] text-emerald-400 font-bold block mb-1">Guia Lojista</span>
              <span className="text-xs font-bold text-neutral-200 group-hover:text-white block">
                Manual do Lojista
              </span>
            </button>

            <button
              onClick={() => onOpenDoc('lgpd')}
              className="p-3 rounded-2xl bg-neutral-800/70 hover:bg-neutral-800 text-left border border-neutral-700/60 transition group"
            >
              <span className="text-[10px] text-emerald-400 font-bold block mb-1">Compliance</span>
              <span className="text-xs font-bold text-neutral-200 group-hover:text-white block">
                Normas & LGPD
              </span>
            </button>

            <button
              onClick={() => onOpenDoc('planos-taxas')}
              className="p-3 rounded-2xl bg-neutral-800/70 hover:bg-neutral-800 text-left border border-neutral-700/60 transition group"
            >
              <span className="text-[10px] text-emerald-400 font-bold block mb-1">Comercial</span>
              <span className="text-xs font-bold text-neutral-200 group-hover:text-white block">
                Planos & Banners
              </span>
            </button>

            <button
              onClick={() => onNavigateTab('seller')}
              className="p-3 rounded-2xl bg-neutral-800/70 hover:bg-neutral-800 text-left border border-neutral-700/60 transition group"
            >
              <span className="text-[10px] text-indigo-400 font-bold block mb-1">Vendas</span>
              <span className="text-xs font-bold text-neutral-200 group-hover:text-white block">
                Portal Vendedor
              </span>
            </button>

            <button
              onClick={() => onNavigateTab('driver')}
              className="p-3 rounded-2xl bg-neutral-800/70 hover:bg-neutral-800 text-left border border-neutral-700/60 transition group"
            >
              <span className="text-[10px] text-orange-400 font-bold block mb-1">Logística</span>
              <span className="text-xs font-bold text-neutral-200 group-hover:text-white block">
                Portal Entregador
              </span>
            </button>
          </div>
        </div>

        {/* Legal Ownership, Copyright & CNPJ Information */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col md:flex-row items-center justify-between gap-4 text-neutral-400 text-xs">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-bold text-neutral-300">
              © 2026 Achei Aqui / AcheiaKi - Cachoeiras de Macacu - RJ.
            </p>
            <p className="text-[11px] text-neutral-500">
              Autoria e Titularidade: <strong>Bex Serviços e Comércios</strong>, CNPJ <strong>30.810.800/0001-39</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-neutral-400">
            <button
              onClick={() => onOpenDoc('direitos')}
              className="hover:text-white transition hover:underline"
            >
              Direitos Autorais
            </button>
            <span>•</span>
            <button
              onClick={() => onOpenDoc('lgpd')}
              className="hover:text-white transition hover:underline"
            >
              Privacidade & LGPD
            </button>
            <span>•</span>
            <button
              onClick={() => onOpenDoc('termos')}
              className="hover:text-white transition hover:underline"
            >
              Termos de Uso
            </button>
            <span>•</span>
            <button
              onClick={() => onOpenDoc('planos-taxas')}
              className="hover:text-white transition hover:underline"
            >
              Tabela de Planos & Taxas
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
