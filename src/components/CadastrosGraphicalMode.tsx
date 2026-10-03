import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  FileCheck2,
  Store,
  Bike,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Shield,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Merchant, DeliveryDriver } from '../types';

interface CadastrosGraphicalModeProps {
  merchants?: Merchant[];
  drivers?: DeliveryDriver[];
  onSwitchToList?: () => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class CadastrosErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CadastrosGraphicalMode Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900 border border-amber-900/60 text-center space-y-4 animate-in fade-in">
          <div className="w-12 h-12 rounded-2xl bg-amber-950/80 text-amber-400 border border-amber-800 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-white">
              Recuperação do Modo Gráfico de Cadastros
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Os dados foram preservados com segurança. Uma exceção pontual de estado foi interceptada sem travar a interface de governança.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs transition active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Tentar Recarregar Modo Gráfico</span>
            </button>
            {this.props.onReset && (
              <button
                onClick={this.props.onReset}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs border border-neutral-700 transition active:scale-95"
              >
                Alternar para Modo Lista
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const CadastrosGraphicalModeContent: React.FC<CadastrosGraphicalModeProps> = ({
  merchants = [],
  drivers = [],
  onSwitchToList,
}) => {
  // Defensive sanitization: ensure valid arrays and non-null objects
  const safeMerchants = (Array.isArray(merchants) ? merchants : []).filter(
    (m): m is Merchant => Boolean(m && typeof m === 'object')
  );
  const safeDrivers = (Array.isArray(drivers) ? drivers : []).filter(
    (d): d is DeliveryDriver => Boolean(d && typeof d === 'object')
  );

  // Safe Merchant Calculations
  const merchantsTotal = safeMerchants.length;
  const merchantsApproved = safeMerchants.filter((m) => m?.status === 'aprovado').length;
  const merchantsPending = safeMerchants.filter(
    (m) => !m?.status || m?.status === 'pendente'
  ).length;
  const merchantsRejected = safeMerchants.filter((m) => m?.status === 'rejeitado').length;

  const merchantApprovalRate =
    merchantsTotal > 0 ? Math.round((merchantsApproved / merchantsTotal) * 100) : 0;

  // Safe Driver Calculations
  const driversTotal = safeDrivers.length;
  const driversApproved = safeDrivers.filter(
    (d) => d?.status === 'aprovado' || (d as any)?.status === 'active'
  ).length;
  const driversPending = safeDrivers.filter(
    (d) => !d?.status || d?.status === 'pendente' || (d as any)?.status === 'pending'
  ).length;
  const driversRejected = safeDrivers.filter((d) => d?.status === 'rejeitado').length;

  const driverApprovalRate =
    driversTotal > 0 ? Math.round((driversApproved / driversTotal) * 100) : 0;

  // Merchant Categories breakdown (Safe)
  const categoryCount: Record<string, number> = {};
  safeMerchants.forEach((m) => {
    const cat = String(m?.category || 'Outros').trim() || 'Outros';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });
  const sortedCategories = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);

  // Driver Vehicle Types breakdown (Safe)
  const vehicleCount: Record<string, number> = {
    moto: 0,
    bike: 0,
    car: 0,
  };
  safeDrivers.forEach((d) => {
    const v = String(d?.vehicleType || 'moto').toLowerCase();
    if (v.includes('bike') || v.includes('bicicleta')) {
      vehicleCount.bike += 1;
    } else if (v.includes('car') || v.includes('carro') || v.includes('util')) {
      vehicleCount.car += 1;
    } else {
      vehicleCount.moto += 1;
    }
  });

  const totalCadastros = merchantsTotal + driversTotal;
  const totalApproved = merchantsApproved + driversApproved;
  const overallRate = totalCadastros > 0 ? Math.round((totalApproved / totalCadastros) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Total Cadastros</span>
            <FileCheck2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white font-['Space_Grotesk']">
            {totalCadastros}
          </div>
          <div className="text-[11px] text-neutral-400">
            {merchantsTotal} Lojas • {driversTotal} Entregadores
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Aprovados & Ativos</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-['Space_Grotesk']">
            {totalApproved}
          </div>
          <div className="text-[11px] text-emerald-500 font-bold">
            Taxa Geral: {overallRate}%
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Em Análise (Pendentes)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-['Space_Grotesk']">
            {merchantsPending + driversPending}
          </div>
          <div className="text-[11px] text-amber-300 font-bold">
            Aguardando validação fiscal
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Rejeitados / Ajustes</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-black text-red-400 font-['Space_Grotesk']">
            {merchantsRejected + driversRejected}
          </div>
          <div className="text-[11px] text-red-400">
            Necessitam reenvio de dados
          </div>
        </div>
      </div>

      {/* Graphical Mode: Breakdown Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Card 1: Lojistas Status & Categorias */}
        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  Distribuição de Lojistas (Merchants)
                </h3>
                <p className="text-[11px] text-neutral-400">
                  {merchantsTotal} comércios cadastrados em Cachoeiras de Macacu
                </p>
              </div>
            </div>
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
              {merchantApprovalRate}% Aprovados
            </span>
          </div>

          {/* Visual Progress Bar by Status */}
          <div className="space-y-2">
            <span className="text-xs text-neutral-400 block font-semibold">
              Status dos Credenciamentos:
            </span>
            <div className="w-full h-4 bg-neutral-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${(merchantsApproved / Math.max(1, merchantsTotal)) * 100}%` }}
                className="bg-emerald-500 h-full transition-all"
                title={`Aprovados: ${merchantsApproved}`}
              />
              <div
                style={{ width: `${(merchantsPending / Math.max(1, merchantsTotal)) * 100}%` }}
                className="bg-amber-400 h-full transition-all"
                title={`Pendentes: ${merchantsPending}`}
              />
              <div
                style={{ width: `${(merchantsRejected / Math.max(1, merchantsTotal)) * 100}%` }}
                className="bg-red-500 h-full transition-all"
                title={`Rejeitados: ${merchantsRejected}`}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                Aprovados: <strong className="text-white">{merchantsApproved}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                Pendentes: <strong className="text-white">{merchantsPending}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                Rejeitados: <strong className="text-white">{merchantsRejected}</strong>
              </span>
            </div>
          </div>

          {/* Category Frequency Bars */}
          <div className="space-y-2.5 pt-2 border-t border-neutral-800">
            <span className="text-xs text-neutral-400 block font-semibold">
              Principais Segmentos Comerciais:
            </span>
            {sortedCategories.length === 0 ? (
              <p className="text-xs text-neutral-500">Nenhuma categoria registrada.</p>
            ) : (
              sortedCategories.slice(0, 5).map(([cat, count]) => {
                const pct = Math.round((count / Math.max(1, merchantsTotal)) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-neutral-300">
                      <span>{cat}</span>
                      <span className="font-mono text-neutral-400">
                        {count} loja(s) ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chart Card 2: Entregadores Status & Veículos */}
        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Bike className="w-5 h-5 text-orange-400" />
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  Distribuição de Entregadores (Drivers)
                </h3>
                <p className="text-[11px] text-neutral-400">
                  {driversTotal} entregadores cadastrados para entrega padrão R$ 5,00
                </p>
              </div>
            </div>
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-orange-950 text-orange-300 border border-orange-800">
              {driverApprovalRate}% Aprovados
            </span>
          </div>

          {/* Visual Progress Bar by Status */}
          <div className="space-y-2">
            <span className="text-xs text-neutral-400 block font-semibold">
              Status das Habilitações:
            </span>
            <div className="w-full h-4 bg-neutral-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${(driversApproved / Math.max(1, driversTotal)) * 100}%` }}
                className="bg-emerald-500 h-full transition-all"
                title={`Aprovados: ${driversApproved}`}
              />
              <div
                style={{ width: `${(driversPending / Math.max(1, driversTotal)) * 100}%` }}
                className="bg-orange-400 h-full transition-all"
                title={`Pendentes: ${driversPending}`}
              />
              <div
                style={{ width: `${(driversRejected / Math.max(1, driversTotal)) * 100}%` }}
                className="bg-red-500 h-full transition-all"
                title={`Rejeitados: ${driversRejected}`}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                Aprovados: <strong className="text-white">{driversApproved}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block"></span>
                Pendentes: <strong className="text-white">{driversPending}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                Rejeitados: <strong className="text-white">{driversRejected}</strong>
              </span>
            </div>
          </div>

          {/* Vehicle Type Bars */}
          <div className="space-y-2.5 pt-2 border-t border-neutral-800">
            <span className="text-xs text-neutral-400 block font-semibold">
              Frota de Veículos dos Entregadores:
            </span>
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 text-center space-y-1">
                <span className="text-lg">🏍️</span>
                <div className="text-xs font-bold text-white">Motos</div>
                <div className="text-base font-black text-orange-400 font-mono">
                  {vehicleCount.moto}
                </div>
              </div>

              <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 text-center space-y-1">
                <span className="text-lg">🚲</span>
                <div className="text-xs font-bold text-white">Bikes</div>
                <div className="text-base font-black text-emerald-400 font-mono">
                  {vehicleCount.bike}
                </div>
              </div>

              <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 text-center space-y-1">
                <span className="text-lg">🚗</span>
                <div className="text-xs font-bold text-white">Carros</div>
                <div className="text-base font-black text-blue-400 font-mono">
                  {vehicleCount.car}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Governance Banner */}
      <div className="p-4 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-3 text-xs text-neutral-400">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            O modo gráfico processa e consolida os dados de cadastro em tempo real, auditados e
            em conformidade com a LGPD em Cachoeiras de Macacu.
          </span>
        </div>
        {onSwitchToList && (
          <button
            onClick={onSwitchToList}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-[11px] shrink-0 border border-neutral-700 transition"
          >
            Ver Tabela Detalhada
          </button>
        )}
      </div>
    </div>
  );
};

export const CadastrosGraphicalMode: React.FC<CadastrosGraphicalModeProps> = (props) => {
  return (
    <CadastrosErrorBoundary onReset={props.onSwitchToList}>
      <CadastrosGraphicalModeContent {...props} />
    </CadastrosErrorBoundary>
  );
};
