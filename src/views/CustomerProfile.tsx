import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Heart,
  Headphones,
  Plus,
  Trash2,
  CheckCircle,
  Shield,
  FileText,
  Send,
  LogOut,
  Mail,
  Phone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Address, SupportTicket, FavoriteItem } from '../types';
import {
  fetchFavorites,
  fetchSupportTickets,
  createSupportTicket,
} from '../services/firestoreService';

export const CustomerProfile: React.FC = () => {
  const { userProfile, updateUserAddresses, updateProfileDetails, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'tickets'>('profile');

  // Edit profile state
  const [name, setName] = useState(userProfile?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [saving, setSaving] = useState(false);

  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>(userProfile?.addresses || []);
  const [newLabel, setNewLabel] = useState('Casa');
  const [newStreet, setNewStreet] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newNeighborhood, setNewNeighborhood] = useState('Centro');

  // Support ticket form
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<SupportTicket['category']>('pedido');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.displayName);
      setPhone(userProfile.phone || '');
      setAddresses(userProfile.addresses || []);
      fetchSupportTickets(userProfile.uid).then(setTickets).catch(() => {});
    }
  }, [userProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfileDetails({ displayName: name, phone });
    setSaving(false);
    alert('Dados salvos com sucesso!');
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet || !newNumber) return;
    const newAddr: Address = {
      id: `addr_${Date.now()}`,
      label: newLabel,
      street: newStreet,
      number: newNumber,
      neighborhood: newNeighborhood,
      city: 'Cachoeiras de Macacu',
      zipCode: '28680-000',
    };
    const updated = [...addresses, newAddr];
    setAddresses(updated);
    await updateUserAddresses(updated);
    setNewStreet('');
    setNewNumber('');
    alert('Novo endereço salvo!');
  };

  const handleRemoveAddress = async (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    await updateUserAddresses(updated);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setSubmittingTicket(true);
    const newT: SupportTicket = {
      id: `tick_${Date.now()}`,
      authorId: userProfile.uid,
      authorName: userProfile.displayName,
      authorEmail: userProfile.email,
      category: ticketCategory,
      subject: ticketSubject,
      message: ticketMessage,
      status: 'aberto',
      createdAt: new Date().toISOString(),
    };
    await createSupportTicket(newT);
    setTickets((prev) => [newT, ...prev]);
    setTicketSubject('');
    setTicketMessage('');
    setSubmittingTicket(false);
    alert('Chamado de suporte enviado com sucesso!');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* User Header */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <img
            src={userProfile?.avatarUrl}
            alt={userProfile?.displayName}
            className="w-14 h-14 rounded-2xl object-cover border border-neutral-200"
          />
          <div>
            <h1 className="text-base sm:text-lg font-black text-neutral-900">
              {userProfile?.displayName}
            </h1>
            <p className="text-xs text-neutral-500">
              {userProfile?.email} • Cachoeiras de Macacu
            </p>
          </div>
        </div>

        <button
          onClick={signOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-red-50 text-red-600 text-xs font-semibold transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sair</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 text-xs font-bold gap-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'profile'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Meus Dados</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'addresses'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Endereços em Macacu ({addresses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'tickets'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>Suporte & Ajuda</span>
        </button>
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-neutral-200 p-6 space-y-4 max-w-lg shadow-xs">
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Nome Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-emerald-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">WhatsApp / Telefone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(21) 99888-7766"
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-emerald-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Cidade Principal</label>
              <input
                type="text"
                disabled
                value="Cachoeiras de Macacu — RJ"
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-500 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      )}

      {/* TAB 2: ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="space-y-6 max-w-2xl">
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900">{addr.label}</h4>
                    <p className="text-neutral-600 mt-0.5">
                      {addr.street}, {addr.number} • {addr.neighborhood}
                    </p>
                    <span className="text-[11px] text-neutral-400">
                      Cachoeiras de Macacu — RJ
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveAddress(addr.id)}
                  className="p-2 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition"
                  title="Remover"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add form */}
          <form
            onSubmit={handleAddAddress}
            className="p-5 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-3 text-xs"
          >
            <h3 className="font-extrabold text-neutral-900 text-xs sm:text-sm">
              Adicionar Novo Endereço
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Rótulo</label>
                <input
                  type="text"
                  required
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Ex: Trabalho, Casa da mãe"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Bairro em Macacu</label>
                <select
                  value={newNeighborhood}
                  onChange={(e) => setNewNeighborhood(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-emerald-500 bg-white"
                >
                  <option value="Centro">Centro</option>
                  <option value="Papucaia">Papucaia</option>
                  <option value="Castália">Castália</option>
                  <option value="Japuíba">Japuíba</option>
                  <option value="Campo do Prado">Campo do Prado</option>
                  <option value="Funchal">Funchal</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block font-bold text-neutral-700 mb-1">Rua / Logradouro</label>
                <input
                  type="text"
                  required
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  placeholder="Ex: Rua São Sebastião"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Número</label>
                <input
                  type="text"
                  required
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  placeholder="120"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Salvar Endereço
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: TICKETS */}
      {activeTab === 'tickets' && (
        <div className="space-y-6 max-w-2xl">
          <form
            onSubmit={handleCreateTicket}
            className="p-5 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-3 text-xs"
          >
            <h3 className="font-extrabold text-neutral-900 text-xs sm:text-sm">
              Abrir Chamado de Suporte
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Categoria</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-emerald-500 bg-white"
                >
                  <option value="pedido">Dúvida sobre Pedido</option>
                  <option value="pagamento">Pagamento / PIX</option>
                  <option value="entrega">Entrega / Motoboy</option>
                  <option value="loja">Problema com Loja</option>
                  <option value="servico">Serviço Prestado</option>
                  <option value="outros">Outros Assuntos</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Assunto Breve</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Ex: Pedido atrasou / Troco errado"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Mensagem Detalhada</label>
              <textarea
                rows={3}
                required
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                placeholder="Explique o que aconteceu..."
                className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-emerald-500 bg-neutral-50"
              />
            </div>

            <button
              type="submit"
              disabled={submittingTicket}
              className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              {submittingTicket ? 'Enviando...' : 'Enviar Chamado à Equipe'}
            </button>
          </form>

          {/* Tickets List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Meus Chamados Recentes
            </h4>
            {tickets.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-2 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {t.category.toUpperCase()}
                    </span>
                    <h5 className="font-extrabold text-neutral-900 mt-1">{t.subject}</h5>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700">
                    {t.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-neutral-600">{t.message}</p>
                {t.response && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 mt-2">
                    <span className="font-bold block text-[11px]">Resposta da equipe:</span>
                    <p>{t.response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
