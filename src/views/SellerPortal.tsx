import React, { useState, useEffect } from 'react';
import {
  Award,
  DollarSign,
  Target,
  ShoppingBag,
  TrendingUp,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Store,
  Layers,
  Image,
  ArrowRight,
  ShieldCheck,
  Building2,
  UserCheck,
  ChevronRight,
  Percent,
} from 'lucide-react';
import { Product, Order, Store as StoreType, SaaSPlan, BannerPricingSetting, Seller } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  fetchProducts,
  fetchOrders,
  fetchStores,
  fetchSaaSPlans,
  fetchBannerPricingSettings,
  fetchSellers,
} from '../services/firestoreService';

export const SellerPortal: React.FC = () => {
  const { userProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stores, setStores] = useState<StoreType[]>([]);
  const [plans, setPlans] = useState<SaaSPlan[]>([]);
  const [banners, setBanners] = useState<BannerPricingSetting[]>([]);
  const [sellerData, setSellerData] = useState<Seller | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'banners' | 'stores'>('overview');
  const [loading, setLoading] = useState(true);

  // Simulated seller dynamic stats
  const [extraCommissions, setExtraCommissions] = useState(0);
  const [soldItemsNotification, setSoldItemsNotification] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [p, o, s, pl, b, sellersList] = await Promise.all([
          fetchProducts(),
          fetchOrders(),
          fetchStores(),
          fetchSaaSPlans(),
          fetchBannerPricingSettings(),
          fetchSellers(),
        ]);
        setProducts(p);
        setOrders(o);
        setStores(s);
        setPlans(pl);
        setBanners(b);

        // Find or match seller
        const found = sellersList.find((sl) => sl.email === userProfile?.email) || sellersList[0] || null;
        setSellerData(found);
      } catch (err) {
        console.error('Erro ao carregar dados do Vendedor:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userProfile?.email]);

  // Seller metrics
  const monthlyGoal = sellerData?.monthlyGoal || 15000.0;
  const currentSales = (sellerData?.totalSalesAccumulated || 8450.0);
  const baseSalesCommissionRate = sellerData?.commissionSalesRate || 0.04; // 4%
  const salesCommission = currentSales * baseSalesCommissionRate;
  const totalCommission = salesCommission + (sellerData?.totalCommissionsPaid || 320.0) + extraCommissions;
  const goalProgress = Math.min(100, Math.round((currentSales / monthlyGoal) * 100));

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSimulateSellPlan = (plan: SaaSPlan) => {
    const earned = plan.monthlyPrice * plan.sellerCommissionRate;
    setExtraCommissions((prev) => prev + earned);
    setSoldItemsNotification(
      `Venda do ${plan.name} registrada com sucesso! Comissão creditada: +R$ ${earned.toFixed(2).replace('.', ',')}`
    );
    setTimeout(() => setSoldItemsNotification(null), 5000);
  };

  const handleSimulateSellBanner = (banner: BannerPricingSetting, type: 'weekly' | 'monthly') => {
    const price = type === 'weekly' ? banner.weeklyPrice : banner.monthlyPrice;
    const earned = price * banner.sellerCommissionRate;
    setExtraCommissions((prev) => prev + earned);
    setSoldItemsNotification(
      `Espaço de ${banner.title} (${type === 'weekly' ? 'Semanal' : 'Mensal'}) comercializado! Comissão: +R$ ${earned.toFixed(2).replace('.', ',')}`
    );
    setTimeout(() => setSoldItemsNotification(null), 5000);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {soldItemsNotification && (
        <div className="p-4 rounded-2xl bg-emerald-950 text-emerald-200 border border-emerald-500 shadow-xl flex items-center justify-between text-xs font-bold animate-in slide-in-from-top-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{soldItemsNotification}</span>
          </div>
          <button
            onClick={() => setSoldItemsNotification(null)}
            className="text-white/60 hover:text-white text-xs"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-neutral-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-bold text-2xl shadow-inner shrink-0">
            <Award className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white font-['Space_Grotesk'] tracking-tight">
                Painel do Vendedor & Consultoria
              </h1>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-indigo-500 text-white uppercase tracking-wider">
                Área Privilegiada
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-1">
              Consultor Credenciado: <strong>{sellerData?.name || userProfile?.displayName}</strong> • Matrícula ConectAí RJ
            </p>
            <div className="flex items-center gap-4 mt-2 text-[11px] text-indigo-300 font-semibold">
              <span>Taxa Vendas: {(baseSalesCommissionRate * 100).toFixed(0)}%</span>
              <span>•</span>
              <span>Comissão SaaS: 20% a 30%</span>
              <span>•</span>
              <span>Comissão Banners: 15%</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-right">
          <span className="text-xs text-indigo-200 block">Comissão Total Acumulada</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-['Space_Grotesk']">
            R$ {totalCommission.toFixed(2).replace('.', ',')}
          </span>
          <span className="text-[10px] text-indigo-300 block">Previsão de pagamento em 5 dias</span>
        </div>
      </div>

      {/* Goal & Monthly Progress */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-black text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-600" />
              Meta de Faturamento Comercial (Mês Corrente)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-neutral-900 font-['Space_Grotesk']">
                R$ {currentSales.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-xs text-neutral-500 font-medium">
                da meta de R$ {monthlyGoal.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-neutral-500 block">
              Comissão Direta de Vendas
            </span>
            <span className="text-lg font-black text-emerald-600">
              R$ {salesCommission.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="w-full h-3.5 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-neutral-500 font-semibold pt-1">
            <span>Progresso: {goalProgress}% atingido</span>
            <span>Faltam R$ {Math.max(0, monthlyGoal - currentSales).toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'overview', label: 'Catálogo Autorizado', icon: ShoppingBag },
          { id: 'plans', label: `Planos SaaS (${plans.length})`, icon: Layers },
          { id: 'banners', label: `Banners Publicitários (${banners.length})`, icon: Image },
          { id: 'stores', label: `Minha Carteira de Lojas (${stores.length})`, icon: Store },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition active:scale-95 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PRODUCT CATALOG FOR SALES */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Catálogo Autorizado para Atendimento Direto
              </h2>
              <p className="text-xs text-neutral-500">
                Itens comissionados das lojas parceiras de Cachoeiras de Macacu.
              </p>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar produto por nome..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-neutral-300 text-xs bg-white focus:outline-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.slice(0, 9).map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-neutral-200/90 p-4 shadow-xs flex items-center gap-3.5 hover:shadow-md transition"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-neutral-200 shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full">
                      {product.category}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      +{(baseSalesCommissionRate * 100).toFixed(0)}% comissão
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900 truncate">
                    {product.name}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-neutral-900">
                      R$ {(product.promoPrice ?? product.price).toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      Estoque: {product.stockQuantity} un
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: VENDER PLANOS SAAS PARA LOJISTAS */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-black text-neutral-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Planos de Vendas para Lojistas (Comissão de 20% a 30%)
            </h2>
            <p className="text-xs text-neutral-500">
              Apresente as opções de planos de assinatura do ConectAí para estabelecimentos de Cachoeiras de Macacu e receba comissão direta.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => {
              const sellerEarn = plan.monthlyPrice * plan.sellerCommissionRate;
              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-3xl p-5 border flex flex-col justify-between shadow-xs transition hover:shadow-lg ${
                    plan.recommended
                      ? 'border-indigo-400 ring-2 ring-indigo-400/20'
                      : 'border-neutral-200'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-indigo-900">
                        {plan.name}
                      </span>
                      {plan.recommended && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black">
                          Campeão de Vendas
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-2xl font-black text-neutral-900 font-['Space_Grotesk']">
                        R$ {plan.monthlyPrice.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-xs text-neutral-400 block">/mês para o lojista</span>
                    </div>

                    {/* Privileged Seller Commission Highlight */}
                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        Sua Comissão de Venda
                      </span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-black text-emerald-700">
                          R$ {sellerEarn.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800">
                          {(plan.sellerCommissionRate * 100).toFixed(0)}% da adesão
                        </span>
                      </div>
                    </div>

                    <ul className="text-xs text-neutral-600 space-y-1.5 pt-2">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Taxa: {(plan.marketplaceFeeRate * 100).toFixed(0)}% por venda</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Limite: {plan.maxProducts} produtos</span>
                      </li>
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 mt-4">
                    <button
                      onClick={() => handleSimulateSellPlan(plan)}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Vender este Plano</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: VENDER BANNERS PUBLICITÁRIOS */}
      {activeTab === 'banners' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-black text-neutral-900 flex items-center gap-2">
              <Image className="w-4 h-4 text-indigo-600" />
              Tabela de Banners Publicitários da Plataforma
            </h2>
            <p className="text-xs text-neutral-500">
              Venda visibilidade premium para os lojistas no marketplace e receba 15% de comissão direta.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((banner) => {
              const weekComm = banner.weeklyPrice * banner.sellerCommissionRate;
              const monthComm = banner.monthlyPrice * banner.sellerCommissionRate;
              return (
                <div
                  key={banner.id}
                  className="bg-white rounded-3xl p-5 border border-neutral-200/90 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <div>
                      <h3 className="font-extrabold text-sm text-neutral-900">
                        {banner.title}
                      </h3>
                      <span className="text-[11px] text-neutral-400">
                        {banner.dimensions} • {banner.activeBookingsCount ?? 0}/{banner.maxSlots} posições ocupadas
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase">
                      {(banner.sellerCommissionRate * 100).toFixed(0)}% Comissão
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {banner.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
                      <span className="text-neutral-400 block font-medium">Cota Semanal:</span>
                      <div className="font-black text-sm text-neutral-900">
                        R$ {banner.weeklyPrice.toFixed(2).replace('.', ',')}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                        Sua comissão: +R$ {weekComm.toFixed(2).replace('.', ',')}
                      </span>
                      <button
                        onClick={() => handleSimulateSellBanner(banner, 'weekly')}
                        className="mt-2 w-full py-1.5 rounded-lg bg-neutral-900 text-white font-bold text-[11px] hover:bg-neutral-800 transition active:scale-95"
                      >
                        Vender Semanal
                      </button>
                    </div>

                    <div className="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-200">
                      <span className="text-indigo-900 block font-medium">Cota Mensal (30 dias):</span>
                      <div className="font-black text-sm text-indigo-950">
                        R$ {banner.monthlyPrice.toFixed(2).replace('.', ',')}
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                        Sua comissão: +R$ {monthComm.toFixed(2).replace('.', ',')}
                      </span>
                      <button
                        onClick={() => handleSimulateSellBanner(banner, 'monthly')}
                        className="mt-2 w-full py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-[11px] hover:bg-indigo-700 transition active:scale-95"
                      >
                        Vender Mensal
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: CARTEIRA DE LOJAS CREDENCIADAS */}
      {activeTab === 'stores' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-neutral-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-indigo-600" />
                Lojas da Sua Carteira de Atendimento
              </h2>
              <p className="text-xs text-neutral-500">
                Você recebe comissão sobre todas as vendas geradas pelas lojas autorizadas abaixo.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black">
              {stores.length} Estabelecimentos Credenciados
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-3xl p-4 border border-neutral-200/90 shadow-xs flex items-center gap-3.5"
              >
                <img
                  src={s.logoUrl}
                  alt={s.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-neutral-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-neutral-100 text-neutral-700 font-bold px-1.5 py-0.5 rounded">
                      {s.category}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      Ativa
                    </span>
                  </div>
                  <h4 className="text-xs font-extrabold text-neutral-900 truncate mt-1">
                    {s.name}
                  </h4>
                  <div className="text-[11px] text-neutral-400 truncate">
                    {s.neighborhood} • {s.phone}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
