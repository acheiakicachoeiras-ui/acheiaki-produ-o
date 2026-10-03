import React, { useState } from 'react';
import {
  Wrench,
  Star,
  MapPin,
  Calendar,
  CheckCircle,
  Phone,
  MessageCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  X,
  Sparkles,
} from 'lucide-react';
import { ServiceProvider, ServiceItem, ServiceRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { createServiceRequest } from '../services/firestoreService';

interface ServicesMarketplaceProps {
  providers: ServiceProvider[];
  services: ServiceItem[];
  onOpenChatWithProvider: (provider: ServiceProvider) => void;
  onOpenReviewModal: (provider: ServiceProvider) => void;
}

export const ServicesMarketplace: React.FC<ServicesMarketplaceProps> = ({
  providers,
  services,
  onOpenChatWithProvider,
  onOpenReviewModal,
}) => {
  const { userProfile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [activeRequestProvider, setActiveRequestProvider] = useState<ServiceProvider | null>(null);
  const [activeServiceItem, setActiveServiceItem] = useState<ServiceItem | null>(null);

  // Request form state
  const [description, setDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [address, setAddress] = useState(
    userProfile?.addresses?.[0]
      ? `${userProfile.addresses[0].street}, ${userProfile.addresses[0].number} - ${userProfile.addresses[0].neighborhood}`
      : 'Centro, Cachoeiras de Macacu'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const categories = ['Todos', 'Serviços', 'Beleza', 'Tecnologia', 'Construção'];

  const filteredProviders = providers.filter((p) => {
    if (selectedCategory === 'Todos') return true;
    return p.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const handleOpenRequestModal = (provider: ServiceProvider, item?: ServiceItem) => {
    setActiveRequestProvider(provider);
    setActiveServiceItem(item || null);
    setDescription('');
    setPreferredDate('');
  };

  const handleConfirmRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequestProvider || !userProfile) return;

    try {
      setIsSubmitting(true);
      const estPrice = activeServiceItem ? activeServiceItem.estimatedPrice : 100.0;
      const platformFee = estPrice * 0.12; // 12% platform SaaS rate for service providers
      const netValue = estPrice - platformFee;

      const newRequest: ServiceRequest = {
        id: `sr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        customerId: userProfile.uid,
        customerName: userProfile.displayName,
        customerPhone: userProfile.phone || '(21) 99888-7766',
        providerId: activeRequestProvider.id,
        providerName: activeRequestProvider.name,
        serviceId: activeServiceItem?.id || 'srv_custom',
        serviceTitle: activeServiceItem?.name || 'Solicitação de Visita Técnica',
        description,
        preferredDate,
        address,
        agreedValue: estPrice,
        platformFee,
        netValue,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      await createServiceRequest(newRequest);
      setActiveRequestProvider(null);
      setSuccessModalOpen(true);
    } catch (err) {
      console.error('Erro ao enviar solicitação de serviço:', err);
      alert('Não foi possível enviar a solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-blue-800">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
            <Wrench className="w-3.5 h-3.5" />
            <span>Guia de Serviços em Cachoeiras de Macacu</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold font-['Space_Grotesk']">
            Contrate profissionais locais de confiança
          </h1>
          <p className="text-blue-100/90 text-xs sm:text-sm">
            Eletricistas certificados, técnicos de refrigeração, encanadores e serviços estéticos com histórico comprovado e avaliações reais.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200/80 shadow-xs'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProviders.map((provider) => {
          const providerServices = services.filter((s) => s.providerId === provider.id);

          return (
            <div
              key={provider.id}
              className="bg-white rounded-3xl border border-neutral-200/90 overflow-hidden shadow-xs hover:shadow-lg transition duration-200 flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-5 border-b border-neutral-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={provider.avatarUrl}
                      alt={provider.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-neutral-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-extrabold text-neutral-900">
                          {provider.name}
                        </h3>
                        <span title="Verificado">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-blue-600">{provider.specialty}</p>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                        <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {provider.rating} ({provider.reviewsCount})
                        </span>
                        <span>•</span>
                        <span>{provider.city}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenChatWithProvider(provider)}
                      className="p-2 rounded-xl bg-neutral-100 hover:bg-emerald-50 hover:text-emerald-700 text-neutral-600 transition"
                      title="Conversar no Chat"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 mt-3 leading-relaxed">
                  {provider.bio}
                </p>

                <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-neutral-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    {provider.coverageArea}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    {provider.availability}
                  </span>
                </div>
              </div>

              {/* Service Catalog for this Provider */}
              <div className="p-4 bg-neutral-50/70 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Serviços Oferecidos
                </span>
                {providerServices.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-2.5 rounded-xl bg-white border border-neutral-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-neutral-900 truncate">{srv.name}</h4>
                      <p className="text-[11px] text-neutral-400 truncate">{srv.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-blue-700 block">
                        R$ {srv.estimatedPrice.toFixed(2).replace('.', ',')}
                      </span>
                      <button
                        onClick={() => handleOpenRequestModal(provider, srv)}
                        className="text-[11px] text-blue-600 font-bold hover:underline"
                      >
                        Contratar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer action */}
              <div className="p-4 border-t border-neutral-100 flex items-center justify-between">
                <button
                  onClick={() => onOpenReviewModal(provider)}
                  className="text-xs text-neutral-500 hover:text-neutral-800 font-medium flex items-center gap-1"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  <span>Avaliar profissional</span>
                </button>

                <button
                  onClick={() => handleOpenRequestModal(provider)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-1.5"
                >
                  <span>Solicitar Orçamento</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking / Service Request Modal */}
      {activeRequestProvider && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-neutral-900">
                  Solicitar Serviço
                </h3>
                <p className="text-xs text-neutral-500">
                  Profissional: <strong>{activeRequestProvider.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setActiveRequestProvider(null)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRequest} className="space-y-3.5 text-xs">
              {activeServiceItem && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="text-[11px] font-bold text-blue-900 block">
                    Serviço Selecionado:
                  </span>
                  <p className="font-semibold text-neutral-800 mt-0.5">
                    {activeServiceItem.name} — R$ {activeServiceItem.estimatedPrice.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              )}

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Descreva o que você precisa:
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Preciso trocar fiação de um chuveiro de 7500W no bairro Centro e verificar um disjuntor que desarmou..."
                  className="w-full p-2.5 rounded-xl border border-neutral-200 focus:outline-blue-500 bg-neutral-50 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Data / Período Preferencial:
                  </label>
                  <input
                    type="text"
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    placeholder="Ex: Amanhã às 14h, ou no sábado"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-blue-500 bg-neutral-50 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Local do Atendimento:
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, número e bairro em Macacu"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-blue-500 bg-neutral-50 text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-600 text-[11px] space-y-1">
                <p className="font-semibold text-neutral-800">Como funciona?</p>
                <p>1. O profissional recebe a solicitação no painel ConectAí;</p>
                <p>2. Vocês combinam detalhes e confirmam o agendamento;</p>
                <p>3. O pagamento é realizado com segurança e a plataforma deduz a taxa de intermediação justa.</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Registrando...' : 'Confirmar e Enviar Solicitação'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Notification Modal */}
      {successModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-neutral-200 p-6 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-neutral-900">
                Solicitação Enviada!
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                O profissional já foi notificado e responderá em instantes. Você pode acompanhar na aba de mensagens e pedidos.
              </p>
            </div>
            <button
              onClick={() => setSuccessModalOpen(false)}
              className="w-full py-2.5 bg-neutral-900 text-white rounded-xl font-bold text-xs hover:bg-neutral-800 transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
