import React, { useState, useEffect } from 'react';
import {
  Store as StoreIcon,
  Package,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Bike,
  AlertCircle,
  X,
  Star,
  Settings,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { Store, Product, Order, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  fetchStores,
  fetchProducts,
  fetchOrders,
  saveProduct,
  deleteProduct,
  saveStore,
  updateOrderStatus,
} from '../services/firestoreService';
import { MerchantAnalyticsDashboard } from '../components/MerchantAnalyticsDashboard';

export const MerchantPortal: React.FC = () => {
  const { userProfile } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'analytics' | 'finances' | 'settings'>('orders');
  const [loading, setLoading] = useState(true);

  // Product modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState('Comida');
  const [pPrice, setPPrice] = useState('');
  const [pPromoPrice, setPPromoPrice] = useState('');
  const [pStock, setPStock] = useState('50');
  const [pSku, setPSku] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pImageUrl, setPImageUrl] = useState('');
  const [paywallAlert, setPaywallAlert] = useState<string | null>(null);

  // Regra de Negócio Crítica (Paywall & Bloqueio por Atraso):
  // Tolerância: Vencimento + 1 dia de atraso -> Bloqueio imediato da loja e do painel
  const today = new Date();
  const subscriptionDueDateStr = (store as any)?.subscriptionDueDate || (store as any)?.nextBillingDate;
  const dueDate = subscriptionDueDateStr ? new Date(subscriptionDueDateStr) : null;
  const isOverdue = dueDate ? today.getTime() > dueDate.getTime() + 24 * 60 * 60 * 1000 : false;
  const maxProductsLimit = (store as any)?.maxProducts || 100;
  const isProductLimitReached = products.length >= maxProductsLimit;

  const loadData = async () => {
    setLoading(true);
    try {
      const stores = await fetchStores();
      // Find store owned by current user or fallback to Padaria Imperial for demonstration
      let currentStore = stores.find((s) => s.ownerUid === userProfile?.uid);
      if (!currentStore && stores.length > 0) {
        currentStore = stores[0];
      }
      setStore(currentStore || null);

      if (currentStore) {
        const [prods, ords] = await Promise.all([
          fetchProducts(currentStore.id),
          fetchOrders(undefined, currentStore.id),
        ]);
        setProducts(prods);
        setOrders(ords);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userProfile]);

  const handleOpenAddProduct = (prod?: Product) => {
    if (!prod && isProductLimitReached) {
      setPaywallAlert(
        `Limite de produtos do seu plano atingido (${products.length}/${maxProductsLimit} produtos cadastrados). Solicite um upgrade de plano junto ao Administrador Master para cadastrar mais itens.`
      );
      return;
    }
    setPaywallAlert(null);
    if (prod) {
      setEditingProduct(prod);
      setPName(prod.name);
      setPCategory(prod.category);
      setPPrice(prod.price.toString());
      setPPromoPrice(prod.promoPrice ? prod.promoPrice.toString() : '');
      setPStock(prod.stockQuantity.toString());
      setPSku(prod.sku || '');
      setPDesc(prod.description);
      setPImageUrl(prod.imageUrl);
    } else {
      setEditingProduct(null);
      setPName('');
      setPCategory('Comida');
      setPPrice('');
      setPPromoPrice('');
      setPStock('50');
      setPSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
      setPDesc('');
      setPImageUrl('https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80');
    }
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;

    const prodId = editingProduct?.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const parsedPrice = parseFloat(pPrice) || 0;
    const parsedPromo = pPromoPrice ? parseFloat(pPromoPrice) : undefined;
    const parsedStock = parseInt(pStock, 10) || 0;

    const newProd: Product = {
      id: prodId,
      storeId: store.id,
      storeName: store.name,
      name: pName,
      category: pCategory,
      price: parsedPrice,
      promoPrice: parsedPromo,
      inStock: parsedStock > 0,
      stockQuantity: parsedStock,
      sku: pSku,
      description: pDesc,
      imageUrl: pImageUrl || 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
      status: 'active',
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveProduct(newProd);
    setProductModalOpen(false);
    loadData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover este produto da sua loja?')) return;
    await deleteProduct(id);
    loadData();
  };

  const handleAdvanceOrderStatus = async (orderId: string, currentStatus: Order['status']) => {
    let nextStatus: Order['status'] = 'preparing';
    if (currentStatus === 'received') nextStatus = 'preparing';
    else if (currentStatus === 'preparing') nextStatus = 'ready_for_pickup';
    else if (currentStatus === 'ready_for_pickup') nextStatus = 'driver_assigned';
    else if (currentStatus === 'driver_assigned') nextStatus = 'collected';

    await updateOrderStatus(orderId, nextStatus);
    loadData();
  };

  const handleToggleOpen = async () => {
    if (!store) return;
    const updated = { ...store, isOpen: !store.isOpen };
    setStore(updated);
    await saveStore(updated);
  };

  // Financial calculations
  const totalSales = orders.reduce((sum, o) => sum + o.subtotal, 0);
  const platformFee = totalSales * 0.10; // 10% platform SaaS rate
  const netEarnings = totalSales - platformFee;

  if (!store && !loading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 space-y-4">
        <StoreIcon className="w-12 h-12 text-emerald-600 mx-auto" />
        <h2 className="text-base font-extrabold text-neutral-900">
          Você ainda não possui uma loja cadastrada.
        </h2>
        <p className="text-xs text-neutral-500">
          Cadastre seu estabelecimento comercial em Cachoeiras de Macacu para começar a vender.
        </p>
      </div>
    );
  }

  // Regra de Negócio Crítica (Paywall): Tolerância Vencimento + 1 dia de atraso -> Bloqueio Imediato do Painel e Loja Offline
  if (store && (isOverdue || store.status === 'offline')) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-neutral-900 border border-red-800 text-white rounded-3xl shadow-2xl space-y-6 text-center animate-in fade-in">
        <div className="w-16 h-16 rounded-3xl bg-red-950 border border-red-700 text-red-400 flex items-center justify-center mx-auto text-2xl shadow-inner">
          🔒
        </div>
        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-red-950 text-red-300 border border-red-800 text-xs font-mono font-bold uppercase">
            STATUS: LOJA OFFLINE NO MARKETPLACE
          </div>
          <h2 className="text-xl font-black font-['Space_Grotesk'] text-white">
            Acesso ao Painel Bloqueado por Atraso de Pagamento
          </h2>
          <p className="text-xs text-neutral-300 leading-relaxed max-w-lg mx-auto">
            A tolerância legal da plataforma de <strong>Vencimento + 1 dia de atraso</strong> expirou para o estabelecimento <strong>{store.name}</strong>.
            Conforme a política de governança SaaS, o acesso ao painel e a vitrine online de produtos foram suspensos temporariamente.
          </p>
        </div>

        <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 text-xs text-neutral-300 space-y-2 text-left max-w-md mx-auto">
          <div className="flex justify-between border-b border-neutral-800 pb-1.5">
            <span className="text-neutral-400">Data de Vencimento:</span>
            <strong className="text-white">{dueDate ? dueDate.toLocaleDateString('pt-BR') : 'Vencida'}</strong>
          </div>
          <div className="flex justify-between border-b border-neutral-800 pb-1.5">
            <span className="text-neutral-400">Regra de Tolerância:</span>
            <span className="text-amber-400 font-bold">Vencimento + 1 dia de carência (Excedido)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Chave PIX para Quitação:</span>
            <strong className="text-emerald-400 font-mono">financeiro@conectai.app.br</strong>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={`https://wa.me/5521998765432?text=${encodeURIComponent(`Olá, sou o responsável pela loja ${store.name} em Cachoeiras de Macacu e gostaria de regularizar a mensalidade SaaS para desbloqueio imediato da loja e do painel.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition shadow-lg shadow-emerald-600/20"
          >
            Enviar Comprovante ao Master via WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Paywall Bloqueio Automático por Atraso: Tolerância = Vencimento + 1 dia de atraso */}
      {isOverdue && (
        <div className="p-6 rounded-3xl bg-red-900 text-white shadow-xl border border-red-700 space-y-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-950 flex items-center justify-center shrink-0 border border-red-700">
              <span className="text-xl">⚠️</span>
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-black">
                  Acesso Bloqueado por Atraso no Pagamento da Mensalidade SaaS
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-200 text-[10px] font-mono border border-red-800">
                  STATUS: LOJA OFFLINE
                </span>
              </div>
              <p className="text-xs text-red-100 leading-relaxed">
                A tolerância de <strong>1 dia após a data de vencimento</strong> da mensalidade da sua loja expirou. Conforme a política de governança SaaS, o painel e os produtos foram temporariamente pausados para novos pedidos até a confirmação de quitação pelo Administrador Master.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                <span className="bg-red-950/80 px-3 py-1.5 rounded-xl border border-red-800">
                  Data de Vencimento:{' '}
                  <strong>{dueDate ? dueDate.toLocaleDateString('pt-BR') : 'Vencida'}</strong>
                </span>
                <span className="bg-red-950/80 px-3 py-1.5 rounded-xl border border-red-800 text-amber-300 font-bold">
                  Tolerância Excedida: Vencimento + 1 dia de carência
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {paywallAlert && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-700">⚠️ Paywall:</span>
            <span>{paywallAlert}</span>
          </div>
          <button
            onClick={() => setPaywallAlert(null)}
            className="text-amber-800 hover:text-amber-950 text-xs font-bold underline cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Top Store Header */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={store?.logoUrl}
            alt={store?.name}
            className="w-14 h-14 rounded-2xl object-cover border border-neutral-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-neutral-900">
                {store?.name}
              </h1>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  store?.isOpen
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {store?.isOpen ? 'LOJA ABERTA' : 'FECHADA'}
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              {store?.category} • {store?.neighborhood}, Cachoeiras de Macacu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleToggleOpen}
            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
              store?.isOpen
                ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            {store?.isOpen ? 'Pausar Pedidos (Fechar)' : 'Abrir Loja Agora'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 text-xs font-bold gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'orders'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Gestão de Pedidos ({orders.filter((o) => o.status !== 'delivered').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'products'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Catálogo de Produtos ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'analytics'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="flex items-center gap-1.5">
            Analytics D3
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded-full">
              Gráficos
            </span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab('finances')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'finances'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Faturamento & Repasses</span>
        </button>
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Pedidos Recebidos em Tempo Real
            </h2>
            <button
              onClick={loadData}
              className="text-xs text-emerald-600 font-bold hover:underline"
            >
              Atualizar Pedidos
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center text-xs text-neutral-500">
              Nenhum pedido ativo no momento para esta loja.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-neutral-200/90 p-5 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-black text-neutral-900 block">
                        Pedido #{order.id.slice(-6)}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        Cliente: <strong>{order.customerName}</strong> ({order.customerPhone})
                      </span>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800">
                      {order.status}
                    </span>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-1 text-xs">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          {item.quantity}x {item.productName}
                        </span>
                        <span className="font-semibold text-neutral-800">
                          R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    ))}
                    {order.notes && (
                      <p className="text-[10px] text-amber-700 italic pt-1 border-t border-neutral-200">
                        Obs: {order.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-500">
                      Entrega: {order.deliveryAddress.neighborhood}
                    </span>
                    <span className="font-extrabold text-neutral-900 text-sm">
                      Subtotal: R$ {order.subtotal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  {/* Action transitions */}
                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400">
                      {order.driverName ? `Motoboy: ${order.driverName}` : 'Aguardando coleta'}
                    </span>

                    {order.status !== 'delivered' && (
                      <button
                        onClick={() => handleAdvanceOrderStatus(order.id, order.status)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-xs transition"
                      >
                        {order.status === 'received' && 'Aceitar & Preparar'}
                        {order.status === 'preparing' && 'Marcar Pronto (Chamar Motoboy)'}
                        {order.status === 'ready_for_pickup' && 'Despachar com Entregador'}
                        {order.status === 'driver_assigned' && 'Confirmar Coleta'}
                        {order.status === 'collected' && 'Acompanhar em Rota'}
                        {order.status === 'out_for_delivery' && 'Acompanhar'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRODUCTS CATALOG CRUD */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Produtos & Cardápio da Loja
            </h2>
            <button
              onClick={() => handleOpenAddProduct()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Produto</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-neutral-200/90 p-3.5 shadow-xs flex gap-3 group relative"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-20 h-20 rounded-2xl object-cover border border-neutral-200 shrink-0"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      {product.category}
                    </span>
                    <h3 className="text-xs font-bold text-neutral-900 truncate mt-1">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Estoque: {product.stockQuantity} un
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-extrabold text-neutral-900">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenAddProduct(product)}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: D3 ANALYTICS DASHBOARD */}
      {activeTab === 'analytics' && store && (
        <MerchantAnalyticsDashboard
          orders={orders}
          products={products}
          storeName={store.name}
        />
      )}

      {/* TAB 4: FINANCES & COMMISSION */}
      {activeTab === 'finances' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-1">
              <span className="text-xs text-neutral-500 font-medium">Vendas Brutas</span>
              <p className="text-2xl font-black text-neutral-900">
                R$ {totalSales.toFixed(2).replace('.', ',')}
              </p>
              <span className="text-[11px] text-neutral-400">Total transacionado</span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-1">
              <span className="text-xs text-neutral-500 font-medium">Taxa SaaS Plataforma (10%)</span>
              <p className="text-2xl font-black text-amber-600">
                - R$ {platformFee.toFixed(2).replace('.', ',')}
              </p>
              <span className="text-[11px] text-neutral-400">Comissão fixa do ecossistema</span>
            </div>

            <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 shadow-xs space-y-1">
              <span className="text-xs text-emerald-800 font-bold">Repasse Líquido Devido</span>
              <p className="text-2xl font-black text-emerald-800">
                R$ {netEarnings.toFixed(2).replace('.', ',')}
              </p>
              <span className="text-[11px] text-emerald-600 font-medium">Valor creditado à sua loja</span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-neutral-200 space-y-3">
            <h3 className="text-sm font-bold text-neutral-800">
              Regra de Comissão Transparente
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              O ConectAí opera com uma taxa SaaS fixa de <strong>10%</strong> sobre cada venda do lojista.
              Essa taxa é descontada internamente e não é apresentada como acréscimo confuso ao consumidor no checkout.
              O repasse é feito automaticamente para a conta bancária do estabelecimento cadastrada em Cachoeiras de Macacu.
            </p>
          </div>
        </div>
      )}

      {/* Product Add/Edit Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold text-neutral-900">
                {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="Ex: Pão de Queijo Tradicional (6 unidades)"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-emerald-500 bg-white"
                  >
                    <option value="Comida">Comida</option>
                    <option value="Mercado">Mercado</option>
                    <option value="Farmácia">Farmácia</option>
                    <option value="Tecnologia">Tecnologia</option>
                    <option value="Moda">Moda</option>
                    <option value="Bebidas">Bebidas</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Código SKU
                  </label>
                  <input
                    type="text"
                    value={pSku}
                    onChange={(e) => setPSku(e.target.value)}
                    placeholder="Ex: PROD-101"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    placeholder="15.00"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Preço Promocional
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={pPromoPrice}
                    onChange={(e) => setPPromoPrice(e.target.value)}
                    placeholder="Opcional"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Estoque
                  </label>
                  <input
                    type="number"
                    required
                    value={pStock}
                    onChange={(e) => setPStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  URL da Foto do Produto
                </label>
                <input
                  type="url"
                  required
                  value={pImageUrl}
                  onChange={(e) => setPImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Descrição Completa
                </label>
                <textarea
                  rows={3}
                  required
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  placeholder="Descreva os ingredientes, peso, diferenciais..."
                  className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Salvar Produto no Firestore
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
