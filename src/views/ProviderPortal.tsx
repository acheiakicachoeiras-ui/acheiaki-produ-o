import React, { useState, useEffect } from 'react';
import {
  Wrench,
  CheckCircle,
  Clock,
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  X,
  Phone,
  MapPin,
  Star,
  CheckCheck,
} from 'lucide-react';
import { ServiceProvider, ServiceItem, ServiceRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  fetchServiceProviders,
  fetchServices,
  fetchServiceRequests,
  saveServiceItem,
  updateServiceRequestStatus,
} from '../services/firestoreService';

export const ProviderPortal: React.FC = () => {
  const { userProfile } = useAuth();
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'requests' | 'services' | 'finances'>('requests');
  const [loading, setLoading] = useState(true);

  // New service modal
  const [modalOpen, setModalOpen] = useState(false);
  const [sName, setSName] = useState('');
  const [sCategory, setSCategory] = useState('Serviços');
  const [sPrice, setSPrice] = useState('');
  const [sPriceType, setSPriceType] = useState<'fixed' | 'from' | 'quote'>('fixed');
  const [sDuration, setSDuration] = useState('1 a 2 horas');
  const [sDesc, setSDesc] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const allProviders = await fetchServiceProviders();
      let current = allProviders.find((p) => p.ownerUid === userProfile?.uid);
      if (!current && allProviders.length > 0) {
        current = allProviders[0]; // Carlos Eletricista as default demo
      }
      setProvider(current || null);

      if (current) {
        const [srvs, reqs] = await Promise.all([
          fetchServices(current.id),
          fetchServiceRequests(current.id, 'provider'),
        ]);
        setServices(srvs);
        setRequests(reqs);
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

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;

    const newSrv: ServiceItem = {
      id: `srv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      providerId: provider.id,
      providerName: provider.name,
      name: sName,
      category: sCategory,
      estimatedPrice: parseFloat(sPrice) || 0,
      priceType: sPriceType,
      duration: sDuration,
      description: sDesc,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    await saveServiceItem(newSrv);
    setModalOpen(false);
    loadData();
  };

  const handleUpdateStatus = async (
    reqId: string,
    status: ServiceRequest['status']
  ) => {
    await updateServiceRequestStatus(reqId, status);
    loadData();
  };

  const grossEarnings = requests
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + r.agreedValue, 0);
  const platformFee = grossEarnings * 0.12; // 12% platform fee for service providers
  const netEarnings = grossEarnings - platformFee;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={provider?.avatarUrl}
            alt={provider?.name}
            className="w-14 h-14 rounded-2xl object-cover border border-neutral-200"
          />
          <div>
            <h1 className="text-base sm:text-lg font-black text-neutral-900">
              {provider?.name}
            </h1>
            <p className="text-xs text-blue-600 font-semibold">
              {provider?.specialty} • Cachoeiras de Macacu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
            Agenda Aberta em Macacu
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 text-xs font-bold gap-2">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'requests'
              ? 'border-blue-600 text-blue-700 font-extrabold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Chamados Recebidos ({requests.filter((r) => r.status !== 'completed').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'services'
              ? 'border-blue-600 text-blue-700 font-extrabold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Meus Serviços ({services.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('finances')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'finances'
              ? 'border-blue-600 text-blue-700 font-extrabold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Ganhos & Repasses</span>
        </button>
      </div>

      {/* TAB 1: REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center text-xs text-neutral-500">
              Nenhuma solicitação de serviço pendente no momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl border border-neutral-200/90 p-5 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xs font-black text-neutral-900">
                        {req.serviceTitle}
                      </h3>
                      <p className="text-[11px] text-neutral-500">
                        Cliente: <strong>{req.customerName}</strong> ({req.customerPhone})
                      </p>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 capitalize">
                      {req.status}
                    </span>
                  </div>

                  <p className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100 text-xs text-neutral-700 leading-relaxed">
                    {req.description}
                  </p>

                  <div className="space-y-1 text-xs text-neutral-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{req.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Data solicitada: {req.preferredDate || 'A combinar'}</span>
                    </div>
                    <div className="pt-1 font-bold text-neutral-900">
                      Valor combinado: R$ {req.agreedValue.toFixed(2).replace('.', ',')}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-neutral-100 flex flex-wrap gap-2 justify-end">
                    {req.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'accepted')}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                      >
                        Aceitar Chamado
                      </button>
                    )}
                    {req.status === 'accepted' && (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'scheduled')}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                      >
                        Confirmar Agendamento
                      </button>
                    )}
                    {req.status === 'scheduled' && (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'completed')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                      >
                        Marcar Concluído
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SERVICES CATALOG */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Serviços Cadastrados
            </h2>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Serviço</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="bg-white rounded-3xl border border-neutral-200/90 p-4 shadow-xs space-y-2"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-bold text-neutral-900">{srv.name}</h3>
                  <span className="text-xs font-black text-blue-700">
                    R$ {srv.estimatedPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <p className="text-xs text-neutral-500">{srv.description}</p>
                <div className="flex justify-between items-center text-[11px] text-neutral-400 pt-2 border-t border-neutral-100">
                  <span>Duração: {srv.duration || 'Variável'}</span>
                  <span className="text-emerald-600 font-semibold">Ativo no Marketplace</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FINANCES */}
      {activeTab === 'finances' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-1">
              <span className="text-xs text-neutral-500 font-medium">Serviços Concluídos</span>
              <p className="text-2xl font-black text-neutral-900">
                R$ {grossEarnings.toFixed(2).replace('.', ',')}
              </p>
              <span className="text-[11px] text-neutral-400">Faturamento total</span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-1">
              <span className="text-xs text-neutral-500 font-medium">Taxa SaaS Plataforma (12%)</span>
              <p className="text-2xl font-black text-amber-600">
                - R$ {platformFee.toFixed(2).replace('.', ',')}
              </p>
              <span className="text-[11px] text-neutral-400">Comissão de intermediação</span>
            </div>

            <div className="p-5 rounded-3xl bg-blue-50 border border-blue-200 shadow-xs space-y-1">
              <span className="text-xs text-blue-900 font-bold">Líquido do Prestador</span>
              <p className="text-2xl font-black text-blue-900">
                R$ {netEarnings.toFixed(2).replace('.', ',')}
              </p>
              <span className="text-[11px] text-blue-600 font-medium">Creditado ao profissional</span>
            </div>
          </div>
        </div>
      )}

      {/* New Service Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold text-neutral-900">Adicionar Serviço</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Nome do Serviço
                </label>
                <input
                  type="text"
                  required
                  value={sName}
                  onChange={(e) => setSName(e.target.value)}
                  placeholder="Ex: Troca de disjuntor / Limpeza de ar"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Preço Estimado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={sPrice}
                    onChange={(e) => setSPrice(e.target.value)}
                    placeholder="100.00"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Duração Estimada
                  </label>
                  <input
                    type="text"
                    value={sDuration}
                    onChange={(e) => setSDuration(e.target.value)}
                    placeholder="Ex: 1 a 2 horas"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Descrição do Serviço
                </label>
                <textarea
                  rows={3}
                  required
                  value={sDesc}
                  onChange={(e) => setSDesc(e.target.value)}
                  placeholder="O que está incluído no serviço..."
                  className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Salvar Serviço
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
