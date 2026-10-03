import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldAlert,
  Headphones,
  CheckCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  MessageSquare,
  Search,
} from 'lucide-react';
import { Worker, SupportTicket, Order } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  fetchSupportTickets,
  respondSupportTicket,
  fetchOrders,
} from '../services/firestoreService';

export const WorkerPortal: React.FC = () => {
  const { userProfile } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [replyText, setReplyText] = useState<{ [id: string]: string }>({});
  const [activeTab, setActiveTab] = useState<'support' | 'orders' | 'moderation'>('support');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allTickets, allOrders] = await Promise.all([
        fetchSupportTickets(),
        fetchOrders(),
      ]);
      setTickets(allTickets);
      setOrders(allOrders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRespond = async (ticketId: string) => {
    const resp = replyText[ticketId];
    if (!resp) return;

    await respondSupportTicket(ticketId, resp, 'respondido');
    alert('Chamado respondido com sucesso!');
    setReplyText((prev) => ({ ...prev, [ticketId]: '' }));
    loadData();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xl">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-neutral-900">
                Portal da Equipe Interna
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                ATENDIMENTO & SUPORTE
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Operador: {userProfile?.displayName} • Cachoeiras de Macacu
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 text-xs font-bold gap-2">
        <button
          onClick={() => setActiveTab('support')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'support'
              ? 'border-purple-600 text-purple-700 font-extrabold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>Chamados de Suporte ({tickets.filter((t) => t.status === 'aberto').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'orders'
              ? 'border-purple-600 text-purple-700 font-extrabold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Monitor de Operações ({orders.length})</span>
        </button>
      </div>

      {/* TAB 1: SUPPORT TICKETS */}
      {activeTab === 'support' && (
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center text-xs text-neutral-500">
              Nenhum chamado de suporte aberto no momento. Todos os clientes e parceiros foram atendidos!
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-3xl border border-neutral-200/90 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md inline-block mb-1">
                        Categoria: {t.category}
                      </span>
                      <h3 className="text-sm font-black text-neutral-900">{t.subject}</h3>
                      <p className="text-xs text-neutral-400">
                        De: {t.authorName} ({t.authorEmail}) • {new Date(t.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        t.status === 'resolvido'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.status === 'respondido'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100 text-xs text-neutral-700 leading-relaxed">
                    "{t.message}"
                  </p>

                  {t.response ? (
                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                      <span className="font-bold text-[11px] block">Resposta enviada pela equipe:</span>
                      <p>{t.response}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-2 border-t border-neutral-100">
                      <textarea
                        rows={2}
                        value={replyText[t.id] || ''}
                        onChange={(e) =>
                          setReplyText((prev) => ({ ...prev, [t.id]: e.target.value }))
                        }
                        placeholder="Escreva a resposta de suporte para este cliente..."
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-purple-500 bg-neutral-50"
                      />
                      <button
                        onClick={() => handleRespond(t.id)}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition"
                      >
                        Enviar Resposta ao Usuário
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ORDERS OPERATION MONITOR */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-neutral-200 font-bold text-xs text-neutral-700">
              Pedidos em Andamento no Município
            </div>
            <div className="divide-y divide-neutral-100">
              {orders.map((o) => (
                <div key={o.id} className="p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-extrabold text-neutral-900">#{o.id.slice(-6)}</span>
                    <span className="text-neutral-400 ml-2">Loja: {o.storeName}</span>
                    <span className="text-neutral-400 ml-2">Cliente: {o.customerName}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-neutral-800">
                      R$ {o.total.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-neutral-100 font-semibold text-[11px]">
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
