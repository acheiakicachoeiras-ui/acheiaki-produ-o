import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  ShieldCheck,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Search,
  Store,
  Wrench,
  Bike,
  Building2,
  FileText,
  Loader2,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { getRoleDashboardTab, normalizeRole } from '../services/supabaseService';
import {
  saveMerchantRegistration,
  saveDeliveryDriverRegistration,
  saveServiceProviderRegistration,
  checkRegistrationStatus,
  RegistrationStatusResult,
} from '../services/registrationService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onAuthSuccess?: (targetTab: string) => void;
}

type RegistrationFlowType = 'clients' | 'stores' | 'services' | 'drivers' | 'status_check';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onAuthSuccess,
}) => {
  const { loginWithEmail, registerClient, setActiveEnvironment } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [activeFlow, setActiveFlow] = useState<RegistrationFlowType>('clients');

  // Shared form loading and messages
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isRateLimit, setIsRateLimit] = useState(false);

  // [ENTRAR NA CONTA] State - Strict manual login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 1. [CLIENTES] State
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientTerms, setClientTerms] = useState(true);

  // 2. [LOJAS] State
  const [storeName, setStoreName] = useState('');
  const [storeCorpReason, setStoreCorpReason] = useState('');
  const [storeCnpj, setStoreCnpj] = useState('');
  const [storeCategory, setStoreCategory] = useState('Alimentação / Restaurante');
  const [storeOwnerName, setStoreOwnerName] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeStreet, setStoreStreet] = useState('');
  const [storeNumber, setStoreNumber] = useState('');
  const [storeNeighborhood, setStoreNeighborhood] = useState('Centro');
  const [storeZip, setStoreZip] = useState('28680-000');
  const [storeTerms, setStoreTerms] = useState(true);

  // 3. [PRESTADORES DE SERVIÇOS] State
  const [provName, setProvName] = useState('');
  const [provCategory, setProvCategory] = useState('Elétrica & Iluminação');
  const [provCpf, setProvCpf] = useState('');
  const [provEmail, setProvEmail] = useState('');
  const [provPhone, setProvPhone] = useState('');
  const [provDescription, setProvDescription] = useState('');
  const [provTerms, setProvTerms] = useState(true);

  // 4. [ENTREGADORES] State
  const [driverName, setDriverName] = useState('');
  const [driverCpf, setDriverCpf] = useState('');
  const [driverCnh, setDriverCnh] = useState('');
  const [driverVehicle, setDriverVehicle] = useState<'moto' | 'bike' | 'car'>('moto');
  const [driverPlate, setDriverPlate] = useState('');
  const [driverEmail, setDriverEmail] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverStreet, setDriverStreet] = useState('');
  const [driverTerms, setDriverTerms] = useState(true);

  // 5. [CONSULTAR CADASTRO] State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusResult, setStatusResult] = useState<RegistrationStatusResult | null>(null);
  const [searchingStatus, setSearchingStatus] = useState(false);

  if (!isOpen) return null;

  const handleRedirect = (role: UserRole) => {
    const norm = normalizeRole(role);
    const targetTab = getRoleDashboardTab(norm);
    if (norm === 'client') {
      setActiveEnvironment('marketplace');
    } else {
      setActiveEnvironment('dashboard');
    }
    if (onAuthSuccess) {
      onAuthSuccess(targetTab);
    }
    onClose();
  };

  // -------------------------------------------------------------
  // STRICT MANUAL LOGIN (Security: No shortcuts, no bypasses)
  // -------------------------------------------------------------
  const handleStrictLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = loginEmail.trim().toLowerCase();
    const pass = loginPassword;

    if (!email || !pass) {
      setErrorMsg('Por favor, informe seu e-mail e senha de acesso.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      setIsRateLimit(false);

      // Autenticação oficial com verificação direta no Supabase
      const profile = await loginWithEmail(email, pass);
      setSuccessMsg(`Autenticado com sucesso! Bem-vindo, ${profile.displayName || 'Usuário'}.`);
      setTimeout(() => {
        handleRedirect(profile.role);
      }, 700);
    } catch (err: any) {
      console.warn('Erro de autenticação manual:', err);
      const msg = (err?.message || '').toLowerCase();
      if (
        msg.includes('rate limit') ||
        msg.includes('limit exceeded') ||
        err?.status === 429
      ) {
        setIsRateLimit(true);
        setErrorMsg('Muitas tentativas em pouco tempo. Aguarde alguns instantes e tente novamente.');
      } else if (err?.message && !err.message.includes('object Object')) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('E-mail ou senha inválidos. Por favor, verifique seus dados digitados.');
      }
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // CADASTRO 1: CLIENTES (Consumidor Final)
  // -------------------------------------------------------------
  const handleRegisterClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return setErrorMsg('Informe seu nome completo.');
    if (!clientEmail.trim() || !clientEmail.includes('@'))
      return setErrorMsg('Informe um endereço de e-mail válido.');
    if (!clientPassword || clientPassword.length < 6)
      return setErrorMsg('A senha deve conter no mínimo 6 caracteres.');
    if (!clientTerms)
      return setErrorMsg('Você precisa aceitar os termos de uso para continuar.');

    try {
      setLoading(true);
      setErrorMsg('');
      setIsRateLimit(false);

      const profile = await registerClient({
        email: clientEmail.trim().toLowerCase(),
        password: clientPassword,
        fullName: clientName.trim(),
        phone: clientPhone,
      });

      setSuccessMsg('Cadastro de Consumidor salvo imediatamente no banco de dados! Conectando...');
      setTimeout(() => {
        handleRedirect('client');
      }, 700);
    } catch (err: any) {
      console.warn('Erro no cadastro de cliente:', err);
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('already') || msg.includes('já')) {
        setErrorMsg('Este e-mail já possui cadastro. Acesse a aba "Entrar na Conta".');
      } else if (msg.includes('rate limit')) {
        setIsRateLimit(true);
        setErrorMsg('Limite temporário de requisições. Tente novamente em instantes.');
      } else {
        setErrorMsg(err?.message || 'Erro ao registrar consumidor no banco de dados.');
      }
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // CADASTRO 2: LOJAS (Credenciamento de Lojista)
  // -------------------------------------------------------------
  const handleRegisterStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) return setErrorMsg('Informe o Nome da Loja / Fantasia.');
    if (!storeCnpj.trim()) return setErrorMsg('Informe o CNPJ da empresa.');
    if (!storeOwnerName.trim()) return setErrorMsg('Informe o Nome do Responsável.');
    if (!storeEmail.trim() || !storeEmail.includes('@'))
      return setErrorMsg('Informe um e-mail válido para a loja.');
    if (!storeTerms) return setErrorMsg('Aceite os Termos de Intermediação Tecnológica.');

    try {
      setLoading(true);
      setErrorMsg('');

      const res = await saveMerchantRegistration({
        storeName: storeName.trim(),
        corporateReason: storeCorpReason.trim() || storeName.trim(),
        cnpj: storeCnpj.trim(),
        category: storeCategory,
        fullName: storeOwnerName.trim(),
        email: storeEmail.trim().toLowerCase(),
        phone: storePhone || '(21) 99999-9999',
        address: {
          street: storeStreet || 'Rua Principal',
          number: storeNumber || 'S/N',
          neighborhood: storeNeighborhood || 'Centro',
          city: 'Cachoeiras de Macacu',
          state: 'RJ',
          zipCode: storeZip || '28680-000',
        },
        acceptedTerms: true,
        acceptedTermsAt: new Date().toISOString(),
        termsConsentDetails: {
          ipAddress: 'client-web',
          timestamp: new Date().toISOString(),
          version: '2.0-LGPD',
        },
      });

      setSuccessMsg(`Cadastro da loja "${storeName}" salvo no banco com protocolo: ${res.id}!`);
      setTimeout(() => {
        setActiveFlow('status_check');
        setSearchQuery(storeCnpj || storeEmail);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao salvar credenciamento de lojista.');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // CADASTRO 3: PRESTADORES DE SERVIÇOS
  // -------------------------------------------------------------
  const handleRegisterService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provName.trim()) return setErrorMsg('Informe seu nome ou da sua assistência.');
    if (!provEmail.trim() || !provEmail.includes('@'))
      return setErrorMsg('Informe um e-mail de contato válido.');
    if (!provTerms) return setErrorMsg('Aceite os Termos para Prestadores.');

    try {
      setLoading(true);
      setErrorMsg('');

      const res = await saveServiceProviderRegistration({
        name: provName.trim(),
        category: provCategory,
        cpf: provCpf.trim(),
        email: provEmail.trim().toLowerCase(),
        phone: provPhone || '(21) 98765-4321',
        description: provDescription || 'Serviços especializados em Cachoeiras de Macacu.',
      });

      setSuccessMsg(`Cadastro de prestador salvo com sucesso! Protocolo: ${res.id}`);
      setTimeout(() => {
        setActiveFlow('status_check');
        setSearchQuery(provCpf || provEmail);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao registrar prestador de serviços.');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // CADASTRO 4: ENTREGADORES (Delivery / Motoboy)
  // -------------------------------------------------------------
  const handleRegisterDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim()) return setErrorMsg('Informe seu nome completo.');
    if (!driverCpf.trim()) return setErrorMsg('Informe seu CPF.');
    if (!driverEmail.trim() || !driverEmail.includes('@'))
      return setErrorMsg('Informe um e-mail válido.');
    if (!driverTerms) return setErrorMsg('Aceite os Termos de Entregador Parceiro.');

    try {
      setLoading(true);
      setErrorMsg('');

      const res = await saveDeliveryDriverRegistration({
        name: driverName.trim(),
        fullName: driverName.trim(),
        cpf: driverCpf.trim(),
        cnh: driverCnh.trim() || 'Não informada',
        vehicleType: driverVehicle,
        licensePlate: driverPlate.trim() || 'N/A',
        email: driverEmail.trim().toLowerCase(),
        phone: driverPhone || '(21) 98111-2233',
        address: {
          street: driverStreet || 'Centro',
          number: '1',
          neighborhood: 'Centro',
          city: 'Cachoeiras de Macacu',
          state: 'RJ',
          zipCode: '28680-000',
        },
        acceptedTerms: true,
        acceptedTermsAt: new Date().toISOString(),
        termsConsentDetails: {
          ipAddress: 'client-web',
          timestamp: new Date().toISOString(),
          version: '2.0-LGPD',
        },
      });

      setSuccessMsg(`Cadastro de entregador parceiro salvo com sucesso! Protocolo: ${res.id}`);
      setTimeout(() => {
        setActiveFlow('status_check');
        setSearchQuery(driverCpf || driverEmail);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao registrar entregador parceiro.');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // CADASTRO 5: CONSULTAR CADASTRO (Busca de status)
  // -------------------------------------------------------------
  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setErrorMsg('Digite um CPF, CNPJ ou E-mail para consultar.');
      return;
    }

    try {
      setSearchingStatus(true);
      setErrorMsg('');
      setStatusResult(null);

      const res = await checkRegistrationStatus(searchQuery);
      setStatusResult(res);
      if (!res.found) {
        setErrorMsg(res.message || 'Cadastro não localizado.');
      }
    } catch (err: any) {
      setErrorMsg('Erro ao consultar cadastro. Tente novamente.');
    } finally {
      setSearchingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-600/20">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-neutral-900 text-base">AcheiAKI</span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Acesso Unificado
                </span>
              </div>
              <p className="text-[11px] text-neutral-500">
                Cachoeiras de Macacu • Ecossistema Digital Local
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation: [Entrar na Conta] vs [Cadastrar-se] */}
        <div className="flex border-b border-neutral-200 bg-neutral-100/60 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-white text-emerald-950 shadow-xs border border-neutral-200 font-extrabold'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <LogIn className="w-4 h-4 text-emerald-600" />
            <span>Entrar na Conta</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              mode === 'register'
                ? 'bg-white text-emerald-950 shadow-xs border border-neutral-200 font-extrabold'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>Cadastrar-se</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Notifications / Errors */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: [ENTRAR NA CONTA]                                 */}
          {/* Requisito 3: Estritamente campos Email, Senha e Entrar    */}
          {/* ======================================================== */}
          {mode === 'login' && (
            <form onSubmit={handleStrictLoginSubmit} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  E-mail cadastrado
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Senha de acesso
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Sua senha secreta"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-xs shadow-md transition active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>Entrar</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-[11px] text-neutral-500">
                Acesso seguro via credenciais criptografadas • Supabase Auth Oficial
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* TAB 2: [CADASTRAR-SE]                                    */}
          {/* Requisito 2: Ordem Exata:                                */}
          {/* 1. Clientes -> 2. Lojas -> 3. Prestadores de Serviços    */}
          {/* -> 4. Entregadores -> 5. Consultar Cadastro              */}
          {/* ======================================================== */}
          {mode === 'register' && (
            <div className="space-y-4">
              {/* Seletor de Fluxo na ordem exata solicitada */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-neutral-100 p-1.5 rounded-2xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setActiveFlow('clients');
                    setErrorMsg('');
                  }}
                  className={`py-2 px-1.5 rounded-xl transition flex flex-col items-center gap-1 ${
                    activeFlow === 'clients'
                      ? 'bg-white text-emerald-950 font-black shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>1. Clientes</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveFlow('stores');
                    setErrorMsg('');
                  }}
                  className={`py-2 px-1.5 rounded-xl transition flex flex-col items-center gap-1 ${
                    activeFlow === 'stores'
                      ? 'bg-white text-emerald-950 font-black shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  <span>2. Lojas</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveFlow('services');
                    setErrorMsg('');
                  }}
                  className={`py-2 px-1.5 rounded-xl transition flex flex-col items-center gap-1 ${
                    activeFlow === 'services'
                      ? 'bg-white text-emerald-950 font-black shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate">3. Serviços</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveFlow('drivers');
                    setErrorMsg('');
                  }}
                  className={`py-2 px-1.5 rounded-xl transition flex flex-col items-center gap-1 ${
                    activeFlow === 'drivers'
                      ? 'bg-white text-emerald-950 font-black shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate">4. Entregadores</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveFlow('status_check');
                    setErrorMsg('');
                  }}
                  className={`py-2 px-1.5 rounded-xl transition flex flex-col items-center gap-1 col-span-2 sm:col-span-1 ${
                    activeFlow === 'status_check'
                      ? 'bg-emerald-600 text-white font-black shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span className="truncate">5. Consultar</span>
                </button>
              </div>

              {/* ---------------- 1. CLIENTES FORM ---------------- */}
              {activeFlow === 'clients' && (
                <form onSubmit={handleRegisterClient} className="space-y-3 pt-1">
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Cadastro imediato para compras, pedidos e agendamentos no marketplace.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ex: Maria da Silva"
                      className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">E-mail</label>
                      <input
                        type="email"
                        required
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="cliente@email.com"
                        className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">WhatsApp / Telefone</label>
                      <input
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="(21) 99999-9999"
                        className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Senha (Mínimo 6 caracteres)</label>
                    <input
                      type="password"
                      required
                      value={clientPassword}
                      onChange={(e) => setClientPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="c-terms"
                      checked={clientTerms}
                      onChange={(e) => setClientTerms(e.target.checked)}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="c-terms" className="text-[11px] text-neutral-600 leading-tight">
                      Concordo com os Termos de Uso e Política de Privacidade de Cachoeiras de Macacu.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Concluir Cadastro de Consumidor</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ---------------- 2. LOJAS FORM ---------------- */}
              {activeFlow === 'stores' && (
                <form onSubmit={handleRegisterStore} className="space-y-3 pt-1">
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                    <Store className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Credenciamento de Estabelecimento Comercial / Lojista.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Nome Fantasia da Loja *</label>
                      <input
                        type="text"
                        required
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="Ex: Padaria Imperial"
                        className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">CNPJ da Empresa *</label>
                      <input
                        type="text"
                        required
                        value={storeCnpj}
                        onChange={(e) => setStoreCnpj(e.target.value)}
                        placeholder="00.000.000/0001-00"
                        className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Categoria Principal</label>
                      <select
                        value={storeCategory}
                        onChange={(e) => setStoreCategory(e.target.value)}
                        className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                      >
                        <option value="Alimentação / Restaurante">Alimentação / Restaurante</option>
                        <option value="Mercado & Hortifrúti">Mercado & Hortifrúti</option>
                        <option value="Farmácia & Drogaria">Farmácia & Drogaria</option>
                        <option value="Pet Shop & Veterinária">Pet Shop & Veterinária</option>
                        <option value="Moda & Vestuário">Moda & Vestuário</option>
                        <option value="Construção & Ferramentas">Construção & Ferramentas</option>
                        <option value="Variedades">Variedades</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Nome do Titular / Responsável *</label>
                      <input
                        type="text"
                        required
                        value={storeOwnerName}
                        onChange={(e) => setStoreOwnerName(e.target.value)}
                        placeholder="Nome completo do responsável"
                        className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">E-mail Comercial *</label>
                      <input
                        type="email"
                        required
                        value={storeEmail}
                        onChange={(e) => setStoreEmail(e.target.value)}
                        placeholder="loja@contato.com.br"
                        className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">WhatsApp de Pedidos</label>
                      <input
                        type="tel"
                        value={storePhone}
                        onChange={(e) => setStorePhone(e.target.value)}
                        placeholder="(21) 98888-7777"
                        className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Endereço Comercial</label>
                      <input
                        type="text"
                        value={storeStreet}
                        onChange={(e) => setStoreStreet(e.target.value)}
                        placeholder="Rua, Av..."
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Nº</label>
                      <input
                        type="text"
                        value={storeNumber}
                        onChange={(e) => setStoreNumber(e.target.value)}
                        placeholder="123"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="s-terms"
                      checked={storeTerms}
                      onChange={(e) => setStoreTerms(e.target.checked)}
                      className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <label htmlFor="s-terms" className="text-[11px] text-neutral-600 leading-tight">
                      Declaro concordância com os Termos de Intermediação Tecnológica Bex Serviços e Comércios.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Concluir Cadastro de Loja</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ---------------- 3. PRESTADORES DE SERVIÇOS FORM ---------------- */}
              {activeFlow === 'services' && (
                <form onSubmit={handleRegisterService} className="space-y-3 pt-1">
                  <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-indigo-700 shrink-0" />
                    <span>Cadastro de Prestador de Serviços e Profissionais Autônomos.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Nome Profissional *</label>
                      <input
                        type="text"
                        required
                        value={provName}
                        onChange={(e) => setProvName(e.target.value)}
                        placeholder="Ex: Carlos Alberto Eletricista"
                        className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Especialidade / Profissão</label>
                      <select
                        value={provCategory}
                        onChange={(e) => setProvCategory(e.target.value)}
                        className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                      >
                        <option value="Elétrica & Iluminação">Elétrica & Iluminação</option>
                        <option value="Encanamento & Hidráulica">Encanamento & Hidráulica</option>
                        <option value="Pintura & Acabamentos">Pintura & Acabamentos</option>
                        <option value="Ar-Condicionado & Climatização">Ar-Condicionado & Climatização</option>
                        <option value="Informática & Redes">Informática & Redes</option>
                        <option value="Diarista & Limpeza">Diarista & Limpeza</option>
                        <option value="Fretes & Mudanças">Fretes & Mudanças</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">CPF do Prestador</label>
                      <input
                        type="text"
                        value={provCpf}
                        onChange={(e) => setProvCpf(e.target.value)}
                        placeholder="000.000.000-00"
                        className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">WhatsApp para Atendimento</label>
                      <input
                        type="tel"
                        value={provPhone}
                        onChange={(e) => setProvPhone(e.target.value)}
                        placeholder="(21) 98765-4321"
                        className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">E-mail Profissional *</label>
                    <input
                      type="email"
                      required
                      value={provEmail}
                      onChange={(e) => setProvEmail(e.target.value)}
                      placeholder="prestador@email.com"
                      className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Descrição Breve dos Serviços</label>
                    <textarea
                      rows={2}
                      value={provDescription}
                      onChange={(e) => setProvDescription(e.target.value)}
                      placeholder="Descreva sua experiência e serviços prestados em Macacu..."
                      className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="p-terms"
                      checked={provTerms}
                      onChange={(e) => setProvTerms(e.target.checked)}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="p-terms" className="text-[11px] text-neutral-600 leading-tight">
                      Concordo com os Termos e Políticas para Prestadores da plataforma AcheiaKi.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Concluir Cadastro de Prestador</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ---------------- 4. ENTREGADORES FORM ---------------- */}
              {activeFlow === 'drivers' && (
                <form onSubmit={handleRegisterDriver} className="space-y-3 pt-1">
                  <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200 text-orange-950 text-xs flex items-center gap-2">
                    <Bike className="w-4 h-4 text-orange-700 shrink-0" />
                    <span>Cadastro de Entregador Parceiro (Delivery Macacu).</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Nome Completo *</label>
                      <input
                        type="text"
                        required
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        placeholder="Ex: Marcos Vinicius"
                        className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">CPF *</label>
                      <input
                        type="text"
                        required
                        value={driverCpf}
                        onChange={(e) => setDriverCpf(e.target.value)}
                        placeholder="000.000.000-00"
                        className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Veículo</label>
                      <select
                        value={driverVehicle}
                        onChange={(e) => setDriverVehicle(e.target.value as any)}
                        className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                      >
                        <option value="moto">Motocicleta (Moto)</option>
                        <option value="bike">Bicicleta</option>
                        <option value="car">Carro / Utilitário</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Placa do Veículo</label>
                      <input
                        type="text"
                        value={driverPlate}
                        onChange={(e) => setDriverPlate(e.target.value)}
                        placeholder="ABC-1234"
                        className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">CNH (se houver)</label>
                      <input
                        type="text"
                        value={driverCnh}
                        onChange={(e) => setDriverCnh(e.target.value)}
                        placeholder="Nº da CNH"
                        className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">E-mail *</label>
                      <input
                        type="email"
                        required
                        value={driverEmail}
                        onChange={(e) => setDriverEmail(e.target.value)}
                        placeholder="entregador@email.com"
                        className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">WhatsApp para Corridas</label>
                      <input
                        type="tel"
                        value={driverPhone}
                        onChange={(e) => setDriverPhone(e.target.value)}
                        placeholder="(21) 98111-2233"
                        className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="d-terms"
                      checked={driverTerms}
                      onChange={(e) => setDriverTerms(e.target.checked)}
                      className="mt-0.5 rounded text-orange-600 focus:ring-orange-500"
                    />
                    <label htmlFor="d-terms" className="text-[11px] text-neutral-600 leading-tight">
                      Concordo com os Termos de Entrega e Taxas da Central de Corridas ConectAí.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs shadow-md transition active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Concluir Cadastro de Entregador</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ---------------- 5. CONSULTAR CADASTRO ---------------- */}
              {activeFlow === 'status_check' && (
                <div className="space-y-4 pt-1">
                  <div className="p-3 rounded-2xl bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs flex items-center gap-2">
                    <Search className="w-4 h-4 text-neutral-600 shrink-0" />
                    <span>Consulte o status do seu credenciamento digitando seu CPF, CNPJ ou E-mail.</span>
                  </div>

                  <form onSubmit={handleCheckStatus} className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Digite seu CPF, CNPJ ou E-mail..."
                      className="flex-1 px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                    <button
                      type="submit"
                      disabled={searchingStatus}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                    >
                      {searchingStatus ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          <span>Consultar</span>
                        </>
                      )}
                    </button>
                  </form>

                  {statusResult && statusResult.found && (
                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                            {statusResult.typeLabel}
                          </span>
                          <h4 className="text-sm font-extrabold text-neutral-900">{statusResult.name}</h4>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase ${
                            statusResult.status === 'aprovado' || statusResult.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : statusResult.status === 'rejeitado'
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {statusResult.status}
                        </span>
                      </div>

                      <div className="text-xs text-neutral-700 space-y-1">
                        <p>{statusResult.message}</p>
                        {statusResult.protocol && (
                          <div className="text-[10px] font-mono text-neutral-500 pt-1">
                            Protocolo: {statusResult.protocol}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-50 border-t border-neutral-100 text-center flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>AcheiaKi SaaS • Governança e Autenticação Supabase</span>
        </div>
      </div>
    </div>
  );
};
