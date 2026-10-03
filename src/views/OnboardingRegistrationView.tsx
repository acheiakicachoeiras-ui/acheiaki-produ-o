import React, { useState } from 'react';
import {
  Store,
  Bike,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Search,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Sparkles,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { RegisterMerchantForm } from '../components/RegisterMerchantForm';
import { RegisterDriverForm } from '../components/RegisterDriverForm';
import { fetchMerchants, fetchDeliveryDrivers } from '../services/firestoreService';
import { Merchant, DeliveryDriver } from '../types';
import { cleanDigits, maskCNPJ, maskCPF } from '../utils/masks';

interface OnboardingRegistrationViewProps {
  initialType?: 'merchant' | 'driver';
  onNavigateHome: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const OnboardingRegistrationView: React.FC<OnboardingRegistrationViewProps> = ({
  initialType = 'merchant',
  onNavigateHome,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'merchant' | 'driver' | 'status'>(initialType);

  // Status Search State
  const [searchDoc, setSearchDoc] = useState('');
  const [isSearchingStatus, setIsSearchingStatus] = useState(false);
  const [statusResult, setStatusResult] = useState<{
    type: 'merchant' | 'driver';
    data: Merchant | DeliveryDriver;
  } | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearchStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = cleanDigits(searchDoc);
    if (!clean) {
      showToast('Digite um CNPJ ou CPF para consultar o status.', 'warning');
      return;
    }

    setIsSearchingStatus(true);
    setHasSearched(true);
    setStatusResult(null);

    try {
      if (clean.length === 14) {
        // Query merchants by CNPJ
        const merchants = await fetchMerchants();
        const found = merchants.find((m) => cleanDigits(m.cnpj) === clean);
        if (found) {
          setStatusResult({ type: 'merchant', data: found });
          showToast('Cadastro de lojista localizado!', 'success');
        } else {
          showToast('Nenhum cadastro de lojista encontrado para este CNPJ.', 'info');
        }
      } else {
        // Query drivers by CPF
        const drivers = await fetchDeliveryDrivers();
        const found = drivers.find((d) => cleanDigits(d.cpf) === clean);
        if (found) {
          setStatusResult({ type: 'driver', data: found });
          showToast('Cadastro de entregador localizado!', 'success');
        } else {
          showToast('Nenhum cadastro de entregador encontrado para este CPF.', 'info');
        }
      }
    } catch (err) {
      console.error('Erro ao consultar status:', err);
      showToast('Erro ao consultar o banco de dados. Tente novamente.', 'error');
    } finally {
      setIsSearchingStatus(false);
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-emerald-950 p-6 sm:p-10 text-white overflow-hidden shadow-xl border border-neutral-800">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ecossistema Multi-Lojista & Logística Local</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Faça Parte do AcheiaKi em Cachoeiras de Macacu
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Seja você um comércio que quer vender mais pela internet com controle total de seus produtos, valores e vitrine, ou um entregador em busca de renda com autonomia e segurança jurídica.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-neutral-300 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Termos de Intermediação 100% Transparentes
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Foco em Cachoeiras de Macacu e Região
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-neutral-200/70 rounded-2xl max-w-xl mx-auto backdrop-blur-xs">
        <button
          onClick={() => {
            setActiveTab('merchant');
            setStatusResult(null);
            setHasSearched(false);
          }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition active:scale-95 ${
            activeTab === 'merchant'
              ? 'bg-white text-emerald-900 shadow-md ring-1 ring-neutral-200'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/50'
          }`}
        >
          <Store className="w-4 h-4 text-emerald-600" />
          <span>Cadastrar Loja (Lojista)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('driver');
            setStatusResult(null);
            setHasSearched(false);
          }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition active:scale-95 ${
            activeTab === 'driver'
              ? 'bg-white text-orange-900 shadow-md ring-1 ring-neutral-200'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/50'
          }`}
        >
          <Bike className="w-4 h-4 text-orange-600" />
          <span>Cadastrar Entregador</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('status');
          }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition active:scale-95 ${
            activeTab === 'status'
              ? 'bg-white text-blue-900 shadow-md ring-1 ring-neutral-200'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/50'
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-blue-600" />
          <span>Consultar Cadastro</span>
        </button>
      </div>

      {/* Tab 1: Merchant Form */}
      {activeTab === 'merchant' && (
        <div className="space-y-6">
          {/* Quick value cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-neutral-900">Vitrine Digital Própria</div>
                <div className="text-neutral-500">Seu catálogo visível para a cidade toda</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Bike className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-neutral-900">Entregadores Vinculados</div>
                <div className="text-neutral-500">Despacho sem precisar contratar frota</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-neutral-900">Taxa Justa & Transparente</div>
                <div className="text-neutral-500">Sem surpresas ou mensalidades abusivas</div>
              </div>
            </div>
          </div>

          <RegisterMerchantForm
            showToast={showToast}
            onCancel={onNavigateHome}
            onSuccess={() => {
              // Stay or switch to status
            }}
          />
        </div>
      )}

      {/* Tab 2: Driver Form */}
      {activeTab === 'driver' && (
        <div className="space-y-6">
          {/* Quick value cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <Bike className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-neutral-900">Moto, Carro ou Bike</div>
                <div className="text-neutral-500">Você escolhe como quer entregar</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-neutral-900">Autonomia Total</div>
                <div className="text-neutral-500">Fique online quando quiser rodar</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-neutral-900">Ganhos por Corrida</div>
                <div className="text-neutral-500">Taxa base garantida e repasses rápidos</div>
              </div>
            </div>
          </div>

          <RegisterDriverForm
            showToast={showToast}
            onCancel={onNavigateHome}
            onSuccess={() => {
              // Stay or switch to status
            }}
          />
        </div>
      )}

      {/* Tab 3: Consult Status */}
      {activeTab === 'status' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-lg space-y-6">
          <div className="border-b border-neutral-100 pb-4 text-center sm:text-left">
            <h2 className="text-xl font-black text-neutral-900">
              Consultar Andamento do Cadastro
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Informe seu CNPJ (se for lojista) ou CPF (se for entregador) para verificar o status de aprovação.
            </p>
          </div>

          <form onSubmit={handleSearchStatus} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                CNPJ da Loja ou CPF do Entregador
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="00.000.000/0000-00 ou 000.000.000-00"
                  value={searchDoc}
                  onChange={(e) => setSearchDoc(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs font-mono text-neutral-900 outline-none transition"
                />
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSearchingStatus}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-black text-xs transition active:scale-95 shadow-md flex items-center justify-center gap-2"
            >
              {isSearchingStatus ? (
                <span>Consultando Base...</span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Verificar Status</span>
                </>
              )}
            </button>
          </form>

          {/* Result Card */}
          {statusResult && (
            <div className="pt-4 border-t border-neutral-100 animate-in fade-in">
              <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {statusResult.type === 'merchant' ? (
                      <Store className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Bike className="w-5 h-5 text-orange-600" />
                    )}
                    <span className="font-black text-sm text-neutral-900">
                      {statusResult.type === 'merchant'
                        ? (statusResult.data as Merchant).storeName
                        : (statusResult.data as DeliveryDriver).fullName}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      statusResult.data.status === 'aprovado' ||
                      statusResult.data.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : statusResult.data.status === 'rejeitado'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Status:{' '}
                    {statusResult.data.status === 'active'
                      ? 'Aprovado'
                      : statusResult.data.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-600">
                  <div>
                    <span className="text-neutral-400 block font-medium">Protocolo do Registro:</span>
                    <code className="text-neutral-900 font-mono">{statusResult.data.id}</code>
                  </div>
                  <div>
                    <span className="text-neutral-400 block font-medium">Data da Solicitação:</span>
                    <span className="text-neutral-900">
                      {new Date(statusResult.data.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block font-medium">Aceite Legal Registrado:</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {new Date(statusResult.data.acceptedTermsAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block font-medium">Cidade de Operação:</span>
                    <span className="text-neutral-900">
                      {statusResult.data.address.city} / {statusResult.data.address.state}
                    </span>
                  </div>
                </div>

                {statusResult.data.status === 'pendente' && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Seu cadastro está na fila de moderação. A aprovação ocorre em até 24 horas úteis.
                    </span>
                  </div>
                )}

                {(statusResult.data.status === 'aprovado' ||
                  statusResult.data.status === 'active') && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Parabéns! Seu perfil está aprovado para operar na rede ConectAí de Cachoeiras de Macacu.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {hasSearched && !statusResult && !isSearchingStatus && (
            <div className="text-center py-6 text-neutral-400 text-xs space-y-1">
              <p>Nenhum registro encontrado com o documento fornecido.</p>
              <p className="text-neutral-500">
                Certifique-se de digitar os números corretos ou realize um novo cadastro acima.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
