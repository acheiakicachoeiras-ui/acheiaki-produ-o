import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  BarChart3,
  DollarSign,
  Shield,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { Order, Product, Store } from '../types';
import { useAuth } from '../context/AuthContext';
import { fetchStores, fetchProducts, fetchOrders } from '../services/firestoreService';

export const ManagerPortal: React.FC = () => {
  const { userProfile } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock team members of this specific store
  const teamMembers = [
    { name: 'Lucas Almeida', role: 'Vendedor & Balcão', salesToday: 14, status: 'Ativo' },
    { name: 'Mariana Souza', role: 'Atendente de Pedidos', salesToday: 18, status: 'Ativo' },
    { name: 'Gabriel Ferreira', role: 'Caixa & Embalagem', salesToday: 22, status: 'Ativo' },
  ];

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const stores = await fetchStores();
        // Linked store for manager
        const linked = stores[0];
        setStore(linked);
        if (linked) {
          const [p, o] = await Promise.all([
            fetchProducts(linked.id),
            fetchOrders(undefined, linked.id),
          ]);
          setProducts(p);
          setOrders(o);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalSales = orders.reduce((sum, o) => sum + o.subtotal, 0);
  const lowStockProducts = products.filter((p) => p.stockQuantity < 20);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xl">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-neutral-900">
                Painel Gerencial — {store?.name || 'Padaria Imperial'}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                GERÊNCIA OPERACIONAL
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Gerente: <strong>{userProfile?.displayName}</strong> • Cachoeiras de Macacu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-neutral-100 text-neutral-700 font-semibold border border-neutral-200">
            Acesso Restrito à Unidade
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-1">
          <span className="text-xs text-neutral-400 font-medium">Vendas da Loja</span>
          <p className="text-xl sm:text-2xl font-black text-neutral-900">
            R$ {totalSales.toFixed(2).replace('.', ',')}
          </p>
          <span className="text-[10px] text-emerald-600 font-bold">Faturamento bruto</span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-1">
          <span className="text-xs text-neutral-400 font-medium">Pedidos Processados</span>
          <p className="text-xl sm:text-2xl font-black text-neutral-900">
            {orders.length}
          </p>
          <span className="text-[10px] text-teal-600 font-bold">Volume da loja</span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-1">
          <span className="text-xs text-neutral-400 font-medium">Itens em Alerta de Estoque</span>
          <p className="text-xl sm:text-2xl font-black text-amber-600">
            {lowStockProducts.length}
          </p>
          <span className="text-[10px] text-amber-600 font-bold">Estoque &lt; 20 un</span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-1">
          <span className="text-xs text-neutral-400 font-medium">Vendedores Ativos</span>
          <p className="text-xl sm:text-2xl font-black text-neutral-900">
            {teamMembers.length}
          </p>
          <span className="text-[10px] text-purple-600 font-bold">Em atendimento</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-neutral-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <span>Equipe de Vendas & Atendimento</span>
            </h3>
            <span className="text-xs text-neutral-400">Turno Atual</span>
          </div>

          <div className="divide-y divide-neutral-100 text-xs">
            {teamMembers.map((member, i) => (
              <div key={i} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-neutral-900">{member.name}</h4>
                  <p className="text-[11px] text-neutral-400">{member.role}</p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-neutral-800">
                    {member.salesToday} pedidos atendidos
                  </span>
                  <span className="text-[10px] text-emerald-600 block font-semibold">
                    ● {member.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-neutral-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Atenção ao Estoque (Cachoeiras)</span>
            </h3>
            <span className="text-xs text-neutral-400">Reposição Imediata</span>
          </div>

          <div className="space-y-2 text-xs">
            {lowStockProducts.length === 0 ? (
              <p className="text-neutral-500 py-6 text-center">
                Todos os produtos estão com níveis de estoque saudáveis!
              </p>
            ) : (
              lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-neutral-900">{p.name}</h4>
                    <span className="text-[11px] text-neutral-500">SKU: {p.sku || 'N/A'}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-amber-200/80 text-amber-900 font-black text-xs">
                    {p.stockQuantity} un restantes
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
