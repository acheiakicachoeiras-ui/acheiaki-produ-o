import React, { useState } from 'react';
import {
  Bike,
  User,
  Mail,
  Phone,
  CreditCard,
  Car,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Info,
  Loader2,
  KeyRound,
  Copy,
  Check,
  Lock,
} from 'lucide-react';
import {
  maskCPF,
  maskPhone,
  maskCEP,
  maskLicensePlate,
  cleanDigits,
  validateCPF,
  validateEmail,
  fetchAddressByCEP,
} from '../utils/masks';
import { registerDeliveryDriver } from '../services/firestoreService';
import { saveDeliveryDriverRegistration } from '../services/registrationService';
import { useAuth } from '../context/AuthContext';
import { DeliveryDriver } from '../types';
import { generateTemporaryPassword } from '../utils/security';
import { ChangeTemporaryPasswordModal } from './ChangeTemporaryPasswordModal';

interface RegisterDriverFormProps {
  onSuccess?: (driverId: string) => void;
  onCancel?: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const RegisterDriverForm: React.FC<RegisterDriverFormProps> = ({
  onSuccess,
  onCancel,
  showToast,
}) => {
  const { userProfile, firebaseUser } = useAuth();

  // Personal Info
  const [fullName, setFullName] = useState(userProfile?.displayName || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [cpf, setCpf] = useState('');

  // Vehicle Info
  const [vehicleType, setVehicleType] = useState<'Moto' | 'Carro' | 'Bicicleta'>('Moto');
  const [licensePlate, setLicensePlate] = useState('');
  const [cnh, setCnh] = useState('');

  // Address
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

  // Status & Submission
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<DeliveryDriver | null>(null);
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
  const isCpfValid = cleanDigits(cpf).length === 11 ? validateCPF(cpf) : false;
  const isEmailValid = validateEmail(email);
  const isPhoneValid = cleanDigits(phone).length >= 10;
  const isZipValid = cleanDigits(zipCode).length === 8;

  // Motorized vehicles require License Plate and CNH
  const isMotorized = vehicleType === 'Moto' || vehicleType === 'Carro';
  const isVehicleValid = isMotorized
    ? Boolean(licensePlate.trim().length >= 7 && cnh.trim().length >= 9)
    : true; // Bicicleta does not require license plate or CNH

  const areRequiredFieldsFilled = Boolean(
    fullName.trim() &&
      isEmailValid &&
      isPhoneValid &&
      isCpfValid &&
      isVehicleValid &&
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

    // Business Rule Check: If user attempts to submit without checking the legal terms box
    if (!acceptedTerms) {
      setTermsError('Você precisa aceitar os termos de intermediação para prosseguir.');
      showToast('Você precisa aceitar os termos de intermediação para prosseguir.', 'error');
      return;
    }

    if (!areRequiredFieldsFilled) {
      showToast('Por favor, preencha todos os campos obrigatórios corretamente.', 'error');
      return;
    }

    try {
      setSubmitting(true);

      // Generate unpredictable 6-character temporary password
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
        consentType: 'TERMS_OF_SERVICE_AND_LIABILITY_DISCLAIMER_DELIVERY_DRIVER',
        signerName: fullName.trim(),
        signerEmail: email.trim().toLowerCase(),
        signerCPF: cpf.trim(),
        signerVehicle: vehicleType,
        temporaryPasswordIssued: true,
        clientLanguage: typeof window !== 'undefined' ? window.navigator.language : 'pt-BR',
      });

      const driverPayload: Omit<
        DeliveryDriver,
        'id' | 'createdAt' | 'status' | 'isOnline' | 'rating' | 'completedDeliveries'
      > = {
        fullName: fullName.trim(),
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        cpf: cpf.trim(),
        vehicleType,
        licensePlate: isMotorized ? licensePlate.trim() : undefined,
        cnh: isMotorized ? cnh.trim() : undefined,
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

      const regResult = await saveDeliveryDriverRegistration(driverPayload, {
        platform: 'AcheiaKi Marketplace - Cachoeiras de Macacu',
        termsVersion: '2026.1-BEX',
      });
      const newId = regResult.id;

      const createdDriver: DeliveryDriver = regResult.data;

      setSubmittedData(createdDriver);

      // Business Rule: Display success toast with exact text
      showToast(
        'Cadastro realizado com sucesso! Aguarde a aprovação do seu perfil.',
        'success'
      );

      if (onSuccess) {
        onSuccess(newId);
      }
    } catch (err: any) {
      console.error('Erro ao cadastrar entregador:', err);
      showToast(
        err.message || 'Falha ao processar o cadastro do entregador. Tente novamente.',
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
        <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-black uppercase tracking-wider">
            Status: Em Análise (Pendente)
          </span>
          <h2 className="text-2xl font-black text-neutral-900">
            Cadastro de Entregador Enviado!
          </h2>
          <p className="text-sm text-neutral-600 max-w-md mx-auto">
            Recebemos o credenciamento de <strong>{submittedData.fullName}</strong> ({submittedData.vehicleType}).
            Nossa equipe de logística em Cachoeiras de Macacu analisará sua documentação para liberação de corridas.
          </p>
        </div>

        {/* Temporary Password Card (Requirement) */}
        {submittedData.temporaryPassword && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-orange-300 text-left space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-orange-950 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-orange-700" />
                Sua Senha Provisória de Acesso (6 caracteres)
              </span>
              <span className="text-[10px] font-bold bg-orange-200 text-orange-900 px-2 py-0.5 rounded-full">
                Troca Obrigatória no 1º Login
              </span>
            </div>

            <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-orange-200 shadow-inner">
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
              Esta senha provisória de 6 caracteres gerada pelo sistema é necessária para o seu primeiro acesso ao painel de entregas. <strong>Ela deverá ser alterada obrigatoriamente logo após o login.</strong>
            </p>

            <button
              type="button"
              onClick={() => setIsChangePassModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs transition active:scale-95 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Simular Primeiro Acesso & Redefinir Senha Provisória</span>
            </button>
          </div>
        )}

        {/* Audit summary card */}
        <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 text-left text-xs space-y-2">
          <div className="font-bold text-neutral-800 flex items-center gap-1.5 border-b border-neutral-200 pb-2">
            <ShieldCheck className="w-4 h-4 text-orange-600" />
            Comprovante de Aceite Legal & Auditoria
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-600">
            <div>
              <span className="font-medium text-neutral-400">ID de Cadastro:</span>{' '}
              <code className="text-neutral-900 font-mono">{submittedData.id}</code>
            </div>
            <div>
              <span className="font-medium text-neutral-400">CPF:</span>{' '}
              <span className="text-neutral-900 font-semibold">{submittedData.cpf}</span>
            </div>
            <div>
              <span className="font-medium text-neutral-400">Modalidade:</span>{' '}
              <span className="text-neutral-900 font-bold">{submittedData.vehicleType}</span>
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
              setCpf('');
              setLicensePlate('');
              setCnh('');
              setStreet('');
              setNumber('');
              setNeighborhood('');
              setZipCode('');
              setAcceptedTerms(false);
            }}
            className="px-6 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-bold text-xs hover:bg-neutral-100 transition active:scale-95"
          >
            Cadastrar Outro Entregador
          </button>
        </div>

        {/* Change Password Modal */}
        <ChangeTemporaryPasswordModal
          isOpen={isChangePassModalOpen}
          onClose={() => setIsChangePassModalOpen(false)}
          tempPasswordPreFill={submittedData?.temporaryPassword || ''}
          userEmail={submittedData?.email}
          userRole="entregador"
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
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
                Credenciamento de Entregador (Delivery Driver)
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 text-[10px] font-bold">
                Logística Local
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Faça entregas para lojistas e estabelecimentos em Cachoeiras de Macacu com autonomia e ganhos rápidos.
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Dados Pessoais & Documento */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-900">
          <User className="w-4 h-4 text-orange-600" />
          <span>1. Dados Pessoais & Identificação</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Nome Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Marcos Vinicius de Souza"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xs text-neutral-900 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              E-mail <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="marcos@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border ${
                email && !isEmailValid ? 'border-red-400 bg-red-50/30' : 'border-neutral-300'
              } focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xs text-neutral-900 outline-none transition`}
            />
            {email && !isEmailValid && (
              <span className="text-[11px] text-red-500 mt-1 block">E-mail inválido</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Telefone / WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="(21) 98888-8888"
              value={phone}
              onChange={(e) => setPhone(maskPhone(e.target.value))}
              maxLength={15}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xs text-neutral-900 outline-none transition"
            />
            <span className="text-[11px] text-neutral-400 mt-0.5 block">
              Para despachos em tempo real e avisos da central.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              CPF do Entregador <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
              maxLength={14}
              className={`w-full px-3.5 py-2.5 rounded-xl border ${
                cpf && cleanDigits(cpf).length === 11 && !isCpfValid
                  ? 'border-red-400 bg-red-50/30'
                  : 'border-neutral-300'
              } focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xs text-neutral-900 outline-none transition font-mono`}
            />
            {cpf && cleanDigits(cpf).length === 11 && !isCpfValid && (
              <span className="text-[11px] text-red-500 mt-1 block">
                CPF inválido (dígitos verificadores incorretos)
              </span>
            )}
            {cleanDigits(cpf).length === 11 && isCpfValid && (
              <span className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> CPF válido
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Veículo & Documentação */}
      <div className="space-y-4 pt-2 border-t border-neutral-100">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-900">
          <Car className="w-4 h-4 text-orange-600" />
          <span>2. Veículo & Documentação Operacional</span>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-2">
            Tipo de Veículo para Entregas <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['Moto', 'Carro', 'Bicicleta'] as const).map((type) => {
              const isSelected = vehicleType === type;
              return (
                <button
                  type="button"
                  key={type}
                  onClick={() => setVehicleType(type)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition active:scale-95 ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50 text-orange-900 ring-2 ring-orange-400/20'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                  }`}
                >
                  {type === 'Moto' && <Bike className="w-5 h-5 mb-1 text-orange-600" />}
                  {type === 'Carro' && <Car className="w-5 h-5 mb-1 text-orange-600" />}
                  {type === 'Bicicleta' && <Bike className="w-5 h-5 mb-1 text-emerald-600" />}
                  <span>{type}</span>
                </button>
              );
            })}
          </div>
        </div>

        {isMotorized ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 animate-in fade-in">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Placa do Veículo ({vehicleType}) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="ABC-1234 ou ABC1D23"
                value={licensePlate}
                onChange={(e) => setLicensePlate(maskLicensePlate(e.target.value))}
                maxLength={8}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xs text-neutral-900 outline-none transition uppercase font-mono"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block">
                Obrigatório para veículos motorizados.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Número da CNH (Habilitação) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: 01234567890"
                value={cnh}
                onChange={(e) => setCnh(cleanDigits(e.target.value).slice(0, 11))}
                maxLength={11}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xs text-neutral-900 outline-none transition font-mono"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block">
                Exigido para condução regular em vias públicas.
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>
              Entregas por <strong>Bicicleta</strong> não exigem CNH ou Placa. Você pode realizar entregas no raio central de Cachoeiras de Macacu.
            </span>
          </div>
        )}
      </div>

      {/* Section 3: Endereço do Entregador */}
      <div className="space-y-4 pt-2 border-t border-neutral-100">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-900">
          <MapPin className="w-4 h-4 text-orange-600" />
          <span>3. Endereço Residencial do Entregador</span>
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xs text-neutral-900 outline-none transition font-mono"
              />
              {isSearchingCEP && (
                <div className="absolute right-3 top-2.5 text-neutral-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              )}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Rua / Logradouro <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Rua Manoel Novaes"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xs text-neutral-900 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Número <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="120"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xs text-neutral-900 outline-none transition"
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xs text-neutral-900 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Complemento (Opcional)
            </label>
            <input
              type="text"
              placeholder="Apto 102, Casa fundos"
              value={complement}
              onChange={(e) => setComplement(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xs text-neutral-900 outline-none transition"
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xs text-neutral-900 outline-none transition bg-neutral-50"
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xs text-neutral-900 outline-none transition uppercase bg-neutral-50"
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
            htmlFor="terms-driver"
            className="flex items-start gap-3 cursor-pointer select-none group"
          >
            <input
              type="checkbox"
              id="terms-driver"
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                if (e.target.checked) setTermsError(null);
              }}
              className="w-5 h-5 rounded border-amber-400 text-orange-600 focus:ring-orange-500 mt-0.5 shrink-0 cursor-pointer"
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
              <CheckCircle2 className="w-3.5 h-3.5" /> Tudo pronto para envio do cadastro de entregador!
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
                ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20 cursor-pointer'
                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed shadow-none'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enviando Cadastro...</span>
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
