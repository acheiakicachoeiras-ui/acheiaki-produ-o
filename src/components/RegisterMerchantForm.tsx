import React, { useState } from 'react';
import {
  Store,
  Building2,
  User,
  Mail,
  Phone,
  FileText,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
  Info,
  Loader2,
  KeyRound,
  Copy,
  Check,
  Lock,
} from 'lucide-react';
import {
  maskCNPJ,
  maskPhone,
  maskCEP,
  cleanDigits,
  validateCNPJ,
  validateEmail,
  fetchAddressByCEP,
} from '../utils/masks';
import { registerMerchant } from '../services/firestoreService';
import { saveMerchantRegistration } from '../services/registrationService';
import { useAuth } from '../context/AuthContext';
import { Merchant } from '../types';
import { merchantRegistrationSchema } from '../schemas/merchantSchema';
import { generateTemporaryPassword } from '../utils/security';
import { ChangeTemporaryPasswordModal } from './ChangeTemporaryPasswordModal';

interface RegisterMerchantFormProps {
  onSuccess?: (merchantId: string) => void;
  onCancel?: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const STORE_CATEGORIES = [
  'Padarias & Confeitarias',
  'Restaurantes & Lanchonetes',
  'Supermercados & Mercearias',
  'Farmácias & Drograrias',
  'Moda & Vestuário',
  'Hortifrúti & Orgânicos',
  'Pet Shop & Agropecuária',
  'Eletrônicos & Informática',
  'Construção & Ferramentas',
  'Beleza & Cosméticos',
  'Papelaria & Presentes',
  'Outros Segmentos',
];

export const RegisterMerchantForm: React.FC<RegisterMerchantFormProps> = ({
  onSuccess,
  onCancel,
  showToast,
}) => {
  const { userProfile, firebaseUser } = useAuth();

  // Form State
  const [fullName, setFullName] = useState(userProfile?.displayName || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [corporateReason, setCorporateReason] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState(STORE_CATEGORIES[0]);

  // Address State
  const [zipCode, setZipCode] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('Cachoeiras de Macacu');
  const [state, setState] = useState('RJ');
  const [complement, setComplement] = useState('');
  const [isSearchingCEP, setIsSearchingCEP] = useState(false);

  // Legal & Consent
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Status & Submission
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<Merchant | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);

  // Handle CEP auto-fill
  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const masked = maskCEP(rawVal);
    setZipCode(masked);

    const clean = cleanDigits(rawVal);
    if (clean.length === 8) {
      setIsSearchingCEP(true);
      const res = await fetchAddressByCEP(clean);
      setIsSearchingCEP(false);
      if (res) {
        if (res.street) setStreet(res.street);
        if (res.neighborhood) setNeighborhood(res.neighborhood);
        if (res.city) setCity(res.city);
        if (res.state) setState(res.state);
        showToast('Endereço preenchido automaticamente pelo CEP!', 'success');
      }
    }
  };

  // Validations
  const isCnpjValid = cleanDigits(cnpj).length === 14 ? validateCNPJ(cnpj) : false;
  const isEmailValid = validateEmail(email);
  const isPhoneValid = cleanDigits(phone).length >= 10;
  const isZipValid = cleanDigits(zipCode).length === 8;

  const areRequiredFieldsFilled = Boolean(
    fullName.trim() &&
      isEmailValid &&
      isPhoneValid &&
      corporateReason.trim() &&
      isCnpjValid &&
      storeName.trim() &&
      category.trim() &&
      street.trim() &&
      number.trim() &&
      neighborhood.trim() &&
      city.trim() &&
      state.trim() &&
      isZipValid
  );

  // Business Rule: Submit button disabled unless all required fields filled AND terms accepted
  const isFormValid = areRequiredFieldsFilled && acceptedTerms;

  const handleCopyTempPassword = (pass: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(pass);
      setCopiedPass(true);
      showToast('Senha provisória copiada para a área de transferência!', 'success');
      setTimeout(() => setCopiedPass(false), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTermsError(null);
    setFieldErrors({});

    // Zod Schema Validation
    const zodValidation = merchantRegistrationSchema.safeParse({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      corporateReason: corporateReason.trim(),
      cnpj: cnpj.trim(),
      storeName: storeName.trim(),
      category: category.trim(),
      address: {
        street: street.trim(),
        number: number.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
        complement: complement.trim() || undefined,
      },
      acceptedTerms,
    });

    if (!zodValidation.success) {
      const errMap: Record<string, string> = {};
      zodValidation.error.issues.forEach((err: any) => {
        const path = err.path.join('.');
        errMap[path] = err.message;
      });
      setFieldErrors(errMap);

      if (!acceptedTerms) {
        setTermsError('Você precisa aceitar os termos de intermediação para prosseguir.');
        showToast('Você precisa aceitar os termos de intermediação para prosseguir.', 'error');
      } else {
        const firstMsg = zodValidation.error.issues[0]?.message;
        showToast(firstMsg || 'Por favor, preencha todos os campos obrigatórios corretamente.', 'error');
      }
      return;
    }

    try {
      setSubmitting(true);

      // Generate unpredictable 6-character temporary password (uppercase, lowercase, numbers, specials)
      const temporaryPassword = generateTemporaryPassword();

      // Capture exact timestamp of user consent
      const consentTimestamp = new Date().toISOString();

      // Collect consent details & telemetry for legal audit
      const consentAuditString = JSON.stringify({
        acceptedText:
          'Declaração expressa de ciência dos Termos de Uso e intermediação tecnológica da plataforma ConectAí.',
        acceptedAt: consentTimestamp,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'web-client',
        platform: 'ConectAí SaaS Marketplace v1.0',
        consentType: 'TERMS_OF_SERVICE_AND_LIABILITY_DISCLAIMER_MERCHANT',
        signerName: fullName.trim(),
        signerEmail: email.trim().toLowerCase(),
        signerCNPJ: cnpj.trim(),
        temporaryPasswordIssued: true,
        clientLanguage: typeof window !== 'undefined' ? window.navigator.language : 'pt-BR',
      });

      const merchantPayload: Omit<Merchant, 'id' | 'createdAt' | 'status'> = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        corporateReason: corporateReason.trim(),
        cnpj: cnpj.trim(),
        storeName: storeName.trim(),
        category,
        address: {
          street: street.trim(),
          number: number.trim(),
          neighborhood: neighborhood.trim(),
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
          complement: complement.trim() || undefined,
        },
        acceptedTerms: true,
        acceptedTermsAt: consentTimestamp,
        termsConsentDetails: consentAuditString,
        ownerUid: firebaseUser?.uid || userProfile?.uid,
        temporaryPassword,
        mustChangePassword: true,
      };

      const regResult = await saveMerchantRegistration(merchantPayload, {
        platform: 'AcheiaKi Marketplace - Cachoeiras de Macacu',
        termsVersion: '2026.1-BEX',
      });
      const newId = regResult.id;

      const createdMerchant: Merchant = regResult.data;

      setSubmittedData(createdMerchant);

      // Business Rule: Display success toast with exact text
      showToast(
        'Cadastro realizado com sucesso! Aguarde a aprovação do seu perfil.',
        'success'
      );

      if (onSuccess) {
        onSuccess(newId);
      }
    } catch (err: any) {
      console.error('Erro ao cadastrar lojista:', err);
      showToast(
        err.message || 'Falha ao processar o cadastro do lojista. Tente novamente.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // If successfully submitted, show the pending approval confirmation card
  if (submittedData) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-xl max-w-2xl mx-auto text-center space-y-6 animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-black uppercase tracking-wider">
            Status: Em Análise (Pendente)
          </span>
          <h2 className="text-2xl font-black text-neutral-900">
            Cadastro de Lojista Enviado!
          </h2>
          <p className="text-sm text-neutral-600 max-w-md mx-auto">
            Recebemos a solicitação da sua loja{' '}
            <strong>{submittedData.storeName}</strong>. Nossa equipe de moderação
            em Cachoeiras de Macacu analisará seus dados em breve.
          </p>
        </div>

        {/* Temporary Password Card (Requirement) */}
        {submittedData.temporaryPassword && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-300 text-left space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-amber-950 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-700" />
                Sua Senha Provisória de Acesso (6 caracteres)
              </span>
              <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                Troca Obrigatória no 1º Login
              </span>
            </div>

            <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-amber-200 shadow-inner">
              <code className="text-2xl font-black font-mono tracking-widest text-neutral-950 select-all">
                {submittedData.temporaryPassword}
              </code>
              <button
                type="button"
                onClick={() => handleCopyTempPassword(submittedData.temporaryPassword!)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800 transition active:scale-95 cursor-pointer"
              >
                {copiedPass ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Senha</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-neutral-600 leading-relaxed">
              Esta senha provisória gerada de 6 caracteres (composta por maiúsculas, minúsculas, números e caracteres especiais) é para seu acesso inicial. <strong>Por segurança, a troca é mandatória no primeiro acesso.</strong>
            </p>

            <button
              type="button"
              onClick={() => setIsChangePassModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition active:scale-95 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Simular Primeiro Acesso & Redefinir Senha Provisória</span>
            </button>
          </div>
        )}

        {/* Audit summary card */}
        <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 text-left text-xs space-y-2">
          <div className="font-bold text-neutral-800 flex items-center gap-1.5 border-b border-neutral-200 pb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Comprovante de Aceite Legal & Auditoria
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-600">
            <div>
              <span className="font-medium text-neutral-400">Protocolo:</span>{' '}
              <code className="text-neutral-900 font-mono">{submittedData.id}</code>
            </div>
            <div>
              <span className="font-medium text-neutral-400">CNPJ:</span>{' '}
              <span className="text-neutral-900 font-semibold">{submittedData.cnpj}</span>
            </div>
            <div>
              <span className="font-medium text-neutral-400">Responsável:</span>{' '}
              <span className="text-neutral-900">{submittedData.fullName}</span>
            </div>
            <div>
              <span className="font-medium text-neutral-400">Aceite registrado em:</span>{' '}
              <span className="text-neutral-900">
                {new Date(submittedData.acceptedTermsAt).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-2.5 rounded-xl bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800 transition active:scale-95 shadow-md"
            >
              Voltar ao Marketplace
            </button>
          )}
          <button
            onClick={() => {
              setSubmittedData(null);
              setFullName('');
              setEmail('');
              setPhone('');
              setCorporateReason('');
              setCnpj('');
              setStoreName('');
              setStreet('');
              setNumber('');
              setNeighborhood('');
              setZipCode('');
              setAcceptedTerms(false);
            }}
            className="px-6 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-bold text-xs hover:bg-neutral-100 transition active:scale-95"
          >
            Cadastrar Outra Loja
          </button>
        </div>

        {/* Change Password Modal */}
        <ChangeTemporaryPasswordModal
          isOpen={isChangePassModalOpen}
          onClose={() => setIsChangePassModalOpen(false)}
          tempPasswordPreFill={submittedData?.temporaryPassword || ''}
          userEmail={submittedData?.email}
          userRole="lojista"
          showToast={showToast}
        />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl p-5 sm:p-8 border border-neutral-200/90 shadow-lg space-y-6 max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="border-b border-neutral-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
                Credenciamento de Lojista (Merchant)
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                Multi-Lojas
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Venda seus produtos para toda Cachoeiras de Macacu com entrega integrada e gestão simples.
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Dados do Responsável */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800">
          <User className="w-4 h-4 text-emerald-600" />
          <span>1. Dados do Responsável Legal</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Nome Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: João da Silva Santos"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs text-neutral-900 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              E-mail Comercial <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="contato@sualoja.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border ${
                email && !isEmailValid ? 'border-red-400 bg-red-50/30' : 'border-neutral-300'
              } focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs text-neutral-900 outline-none transition`}
            />
            {email && !isEmailValid && (
              <span className="text-[11px] text-red-500 mt-1 block">E-mail inválido</span>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Telefone / WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="(21) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(maskPhone(e.target.value))}
              maxLength={15}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs text-neutral-900 outline-none transition"
            />
            <span className="text-[11px] text-neutral-400 mt-0.5 block">
              Usado para notificações de novos pedidos e suporte emergencial.
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: Dados da Empresa & Loja */}
      <div className="space-y-4 pt-2 border-t border-neutral-100">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800">
          <Store className="w-4 h-4 text-emerald-600" />
          <span>2. Dados da Loja & Cadastro Fiscal</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Nome da Loja (Nome Fantasia) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Padaria Imperial Macacu"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs text-neutral-900 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Categoria Principal da Loja <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs text-neutral-900 outline-none transition bg-white"
            >
              {STORE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Razão Social <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Padaria e Confeitaria Imperial Ltda"
              value={corporateReason}
              onChange={(e) => setCorporateReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs text-neutral-900 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              CNPJ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={(e) => setCnpj(maskCNPJ(e.target.value))}
              maxLength={18}
              className={`w-full px-3.5 py-2.5 rounded-xl border ${
                cnpj && cleanDigits(cnpj).length === 14 && !isCnpjValid
                  ? 'border-red-400 bg-red-50/30'
                  : 'border-neutral-300'
              } focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs text-neutral-900 outline-none transition font-mono`}
            />
            {cnpj && cleanDigits(cnpj).length === 14 && !isCnpjValid && (
              <span className="text-[11px] text-red-500 mt-1 block">
                CNPJ inválido (dígitos verificadores incorretos)
              </span>
            )}
            {cleanDigits(cnpj).length === 14 && isCnpjValid && (
              <span className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> CNPJ válido
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Endereço Completo */}
      <div className="space-y-4 pt-2 border-t border-neutral-100">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>3. Endereço Completo do Estabelecimento</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              CEP <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="28680-000"
                value={zipCode}
                onChange={handleCEPChange}
                maxLength={9}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs text-neutral-900 outline-none transition font-mono"
              />
              {isSearchingCEP && (
                <div className="absolute right-3 top-2.5 text-neutral-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              )}
            </div>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">
              Busca automática de endereço
            </span>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Rua / Logradouro <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Av. Governador Roberto Silveira"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs text-neutral-900 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Número <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="123"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs text-neutral-900 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Bairro <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Centro, Papucaia, Japuíba"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs text-neutral-900 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Complemento (Opcional)
            </label>
            <input
              type="text"
              placeholder="Loja B, Galpão 2"
              value={complement}
              onChange={(e) => setComplement(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs text-neutral-900 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Cidade <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs text-neutral-900 outline-none transition bg-neutral-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Estado <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
              maxLength={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs text-neutral-900 outline-none transition uppercase bg-neutral-50"
            />
          </div>
        </div>
      </div>

      {/* Section 4: CRITICAL LEGAL TERMS & DISCLAIMER */}
      <div className="pt-4 border-t border-neutral-200 space-y-3">
        <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200 text-amber-950 space-y-2">
          <div className="flex items-center gap-2 font-black text-xs text-amber-900 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Validação Legal & Termos de Intermediação Tecnológica</span>
          </div>

          <label
            htmlFor="terms-merchant"
            className="flex items-start gap-3 cursor-pointer select-none group"
          >
            <input
              type="checkbox"
              id="terms-merchant"
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                if (e.target.checked) setTermsError(null);
              }}
              className="w-5 h-5 rounded border-amber-400 text-emerald-600 focus:ring-emerald-500 mt-0.5 shrink-0 cursor-pointer"
            />
            <span className="text-xs text-amber-900 leading-relaxed group-hover:text-amber-950 font-normal">
              Ao me cadastrar, declaro que li e concordo com os Termos de Uso. Estou ciente de que
              a plataforma atua exclusivamente como uma ferramenta de intermediação tecnológica entre
              lojistas, entregadores e compradores. A plataforma NÃO possui qualquer responsabilidade
              direta ou indireta pelas compras, pela qualidade dos produtos vendidos pelos lojistas, pelas
              condições, atrasos ou integridade das entregas realizadas por terceiros.
            </span>
          </label>
        </div>

        {/* Visual Alert if attempted to submit without checking the box */}
        {termsError && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{termsError}</span>
          </div>
        )}
      </div>

      {/* Submit & Business Rules */}
      <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-[11px] text-neutral-400">
          {!areRequiredFieldsFilled ? (
            <span className="text-amber-600 font-medium flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Preencha todos os campos obrigatórios (*) com dados válidos
            </span>
          ) : !acceptedTerms ? (
            <span className="text-amber-600 font-medium flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Marque a caixa dos termos legais para habilitar o envio
            </span>
          ) : (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Tudo pronto para envio do credenciamento!
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-bold text-xs hover:bg-neutral-50 transition active:scale-95"
            >
              Cancelar
            </button>
          )}

          {/* Business Rule: Finalizar Cadastro remains disabled until all required fields filled AND terms accepted */}
          <button
            type="submit"
            disabled={!isFormValid || submitting}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs transition shadow-md active:scale-95 ${
              isFormValid && !submitting
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 cursor-pointer'
                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed shadow-none'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enviando Dados...</span>
              </>
            ) : (
              <>
                <span>Finalizar Cadastro</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
