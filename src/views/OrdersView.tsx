import React, { useState, useEffect } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  Bike,
  Store,
  MapPin,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  Star,
  MessageSquare,
  Wrench,
} from 'lucide-react';
import { Order, ServiceRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { fetchOrders, fetchServiceRequests } from '../services/firestoreService';

interface OrdersViewProps {
  onOpenChatWithStore?: (storeId: string, storeName: string) => void;
  onOpenReviewModal?: (targetType: 'store' | 'driver', id: string, name: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  onOpenChatWithStore,
  onOpenReviewModal,
}) => {
  const { userProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'services'>('orders');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const [orderList, srvList] = await Promise.all([
        fetchOrders(userProfile.uid),
        fetchServiceRequests(userProfile.uid, 'customer'),
      ]);
      setOrders(orderList);
      setServiceRequests(srvList);
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Periodic refresh
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [userProfile]);

  const getStatusStep = (status: Order['status']) => {
    switch (status) {
      case 'received':
        return 1;
      case 'preparing':
        return 2;
      case 'ready_for_pickup':
        return 3;
      case 'driver_assigned':
      case 'collected':
        return 4;
      case 'out_for_delivery':
        return 5;
      case 'delivered':
        return 6;
      case 'cancelled':
        return -1;
      default:
        return 1;
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'received':
        return { label: 'Recebido pela Loja', color: 'bg-amber-100 text-amber-800' };
      case 'preparing':
        return { label: 'Em Preparação', color: 'bg-blue-100 text-blue-800' };
      case 'ready_for_pickup':
        return { label: 'Pronto p/ Entrega', color: 'bg-indigo-100 text-indigo-800' };
      case 'driver_assigned':
        return { label: 'Entregador a Caminho da Coleta', color: 'bg-purple-100 text-purple-800' };
      case 'collected':
        return { label: 'Pedido Coletado', color: 'bg-purple-100 text-purple-800' };
      case 'out_for_delivery':
        return { label: 'Em Rota de Entrega', color: 'bg-orange-100 text-orange-800' };
      case 'delivered':
        return { label: 'Entregue com Sucesso', color: 'bg-emerald-100 text-emerald-800' };
      case 'cancelled':
        return { label: 'Cancelado', color: 'bg-red-100 text-red-800' };
      default:
        return { label: status, color: 'bg-neutral-100 text-neutral-800' };
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            Meus Pedidos & Chamados
          </h1>
          <p className="text-xs text-neutral-500">
            Acompanhe entregas e serviços em tempo real em Cachoeiras de Macacu
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold text-neutral-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-neutral-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'orders'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Pedidos do Comércio ({orders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'services'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Serviços Solicitados ({serviceRequests.length})</span>
        </button>
      </div>

      {/* ORDERS LIST */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-neutral-800">
                Você ainda não realizou nenhum pedido.
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Explore os produtos das padarias, restaurantes e drogarias locais de Cachoeiras e faça seu primeiro pedido!
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const step = getStatusStep(order.status);
              const statusInfo = getStatusLabel(order.status);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-neutral-200/90 shadow-xs hover:shadow-md transition overflow-hidden"
                >
                  {/* Order Top Bar */}
                  <div className="p-4 sm:p-5 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3 bg-neutral-50/50">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-neutral-900">
                          {order.storeName}
                        </h3>
                        <span className="text-[11px] text-neutral-400">
                          Pedido #{order.id.slice(-6)} • {new Date(order.createdAt).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Visual Timeline Progress */}
                  <div className="px-4 py-4 sm:px-6 bg-white border-b border-neutral-100">
                    <div className="flex items-center justify-between relative">
                      {/* Line background */}
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-neutral-100 -z-0" />
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 transition-all duration-500 -z-0"
                        style={{ width: `${Math.min(100, Math.max(0, ((step - 1) / 5) * 100))}%` }}
                      />

                      {/* Step 1: Recebido */}
                      <div className="flex flex-col items-center z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            step >= 1 ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-500'
                          }`}
                        >
                          1
                        </div>
                        <span className="text-[10px] text-neutral-500 mt-1 hidden sm:block">
                          Recebido
                        </span>
                      </div>

                      {/* Step 2: Preparando */}
                      <div className="flex flex-col items-center z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            step >= 2 ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-500'
                          }`}
                        >
                          2
                        </div>
                        <span className="text-[10px] text-neutral-500 mt-1 hidden sm:block">
                          Preparando
                        </span>
                      </div>

                      {/* Step 3: Pronto */}
                      <div className="flex flex-col items-center z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            step >= 3 ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-500'
                          }`}
                        >
                          3
                        </div>
                        <span className="text-[10px] text-neutral-500 mt-1 hidden sm:block">
                          Pronto
                        </span>
                      </div>

                      {/* Step 4: Coleta */}
                      <div className="flex flex-col items-center z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            step >= 4 ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-500'
                          }`}
                        >
                          4
                        </div>
                        <span className="text-[10px] text-neutral-500 mt-1 hidden sm:block">
                          Coletado
                        </span>
                      </div>

                      {/* Step 5: Em Rota */}
                      <div className="flex flex-col items-center z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            step >= 5 ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-500'
                          }`}
                        >
                          <Bike className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] text-neutral-500 mt-1 hidden sm:block">
                          Em Trânsito
                        </span>
                      </div>

                      {/* Step 6: Entregue */}
                      <div className="flex flex-col items-center z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            step >= 6 ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-500'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] text-neutral-500 mt-1 hidden sm:block">
                          Entregue
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items and Details */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="space-y-1.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-neutral-700">
                            <strong>{item.quantity}x</strong> {item.productName}
                          </span>
                          <span className="text-neutral-900 font-semibold">
                            R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center justify-between text-xs text-neutral-500 gap-2">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          Entrega: {order.deliveryAddress.street}, {order.deliveryAddress.number} ({order.deliveryAddress.neighborhood})
                        </span>
                      </div>

                      {order.driverName && (
                        <div className="flex items-center gap-1.5 text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-md">
                          <Bike className="w-3.5 h-3.5" />
                          <span>Entregador: {order.driverName}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs">
                        <span className="text-neutral-400">Total pago: </span>
                        <span className="text-base font-black text-emerald-700">
                          R$ {order.total.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-[11px] text-neutral-400 ml-1">
                          (inclui R$ {order.deliveryFee.toFixed(2).replace('.', ',')} entrega)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {onOpenReviewModal && (
                          <button
                            onClick={() => onOpenReviewModal('store', order.storeId, order.storeName)}
                            className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold text-neutral-700 flex items-center gap-1 transition"
                          >
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>Avaliar Loja</span>
                          </button>
                        )}
                        {order.driverId && onOpenReviewModal && (
                          <button
                            onClick={() => onOpenReviewModal('driver', order.driverId!, order.driverName || 'Entregador')}
                            className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold text-purple-700 flex items-center gap-1 transition"
                          >
                            <Star className="w-3.5 h-3.5 text-purple-500" />
                            <span>Avaliar Motoboy</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* SERVICES LIST */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          {serviceRequests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
                <Wrench className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-neutral-800">
                Nenhum chamado de serviço ativo
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Precisa de eletricista, encanador ou ar-condicionado? Visite a aba de Serviços Locais.
              </p>
            </div>
          ) : (
            serviceRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-3xl border border-neutral-200/90 p-5 shadow-xs hover:shadow-md transition space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-1">
                      Serviço Profissional
                    </span>
                    <h3 className="text-sm font-black text-neutral-900">{req.serviceTitle}</h3>
                    <p className="text-xs text-neutral-500 font-medium">
                      Profissional: <strong>{req.providerName}</strong>
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                      req.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'accepted' || req.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {req.status === 'pending'
                      ? 'Aguardando Profissional'
                      : req.status === 'accepted'
                      ? 'Aceito pelo Profissional'
                      : req.status === 'scheduled'
                      ? 'Agendado'
                      : req.status === 'completed'
                      ? 'Concluído'
                      : req.status}
                  </span>
                </div>

                <p className="text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                  {req.description}
                </p>

                <div className="flex flex-wrap items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-100">
                  <span>📍 {req.address}</span>
                  <span>📅 Preferência: {req.preferredDate || 'A combinar'}</span>
                  <span className="font-extrabold text-neutral-800">
                    Valor estimado: R$ {req.agreedValue.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
