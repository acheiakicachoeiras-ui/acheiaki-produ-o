import React, { useState } from 'react';
import {
  X,
  Bell,
  ShoppingBag,
  Truck,
  Wrench,
  Sparkles,
  CheckCircle2,
  DollarSign,
  MessageSquare,
  Shield,
  CheckCheck,
} from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('todas');

  if (!isOpen) return null;

  const defaultNotifications: NotificationItem[] = [
    {
      id: 'notif_1',
      userId: 'user',
      title: 'Pedido #4912 a caminho',
      body: 'O motoboy Marcos Vinicius coletou seu pedido na Padaria Imperial e está em rota para o Centro!',
      type: 'delivery',
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif_2',
      userId: 'user',
      title: 'Repasse Financeiro Disponível',
      body: 'O repasse líquido de R$ 342,00 foi processado para a conta cadastrada do lojista.',
      type: 'financial',
      read: false,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'notif_3',
      userId: 'user',
      title: 'Nova mensagem de Carlos Alberto (Eletricista)',
      body: 'Posso comparecer amanhã às 14h para instalar o chuveiro em Papucaia.',
      type: 'chat',
      read: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'notif_4',
      userId: 'user',
      title: 'Ofertas de Quinta da Serra!',
      body: 'Hortifruti da Serra com descontos em morangos frescos e queijo artesanal em Macacu.',
      type: 'promo',
      read: true,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'notif_5',
      userId: 'user',
      title: 'Segurança & Termos ConectAí',
      body: 'Seus dados pessoais estão protegidos conforme as diretrizes da LGPD em Cachoeiras de Macacu.',
      type: 'system',
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const items = notifications.length > 0 ? notifications : defaultNotifications;

  const categories = [
    { id: 'todas', label: 'Todas' },
    { id: 'delivery', label: 'Entregas' },
    { id: 'order', label: 'Pedidos' },
    { id: 'chat', label: 'Mensagens' },
    { id: 'promo', label: 'Promoções' },
    { id: 'financial', label: 'Financeiro' },
    { id: 'system', label: 'Sistema' },
  ];

  const filteredItems = items.filter((n) => {
    if (activeCategory === 'todas') return true;
    return n.type === activeCategory;
  });

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      case 'delivery':
        return <Truck className="w-4 h-4 text-orange-600" />;
      case 'service':
        return <Wrench className="w-4 h-4 text-blue-600" />;
      case 'promo':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'financial':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-neutral-600" />;
    }
  };

  const handleMarkAllRead = () => {
    items.forEach((item) => onMarkAsRead(item.id));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-neutral-900">Central de Notificações</h3>
              <p className="text-[11px] text-neutral-500">Alertas comerciais e operacionais</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Marcar lidas</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="px-4 py-2 border-b border-neutral-200 bg-white flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition ${
                activeCategory === c.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400 space-y-1">
              <p className="font-bold text-neutral-700">Nenhuma notificação nesta categoria</p>
              <p>Você está com todas as novidades em dia!</p>
            </div>
          ) : (
            filteredItems.map((notif) => (
              <div
                key={notif.id}
                onClick={() => onMarkAsRead(notif.id)}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border transition cursor-pointer ${
                  notif.read
                    ? 'bg-white border-neutral-200 text-neutral-600'
                    : 'bg-emerald-50/70 border-emerald-300 text-neutral-900 shadow-xs'
                }`}
              >
                <div className="p-2 rounded-xl bg-white border border-neutral-200 shadow-xs shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold truncate">{notif.title}</h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 ml-1"></span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-600 mt-1 leading-snug">{notif.body}</p>
                  <span className="text-[10px] text-neutral-400 mt-1.5 block">
                    {new Date(notif.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    • Cachoeiras de Macacu
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
