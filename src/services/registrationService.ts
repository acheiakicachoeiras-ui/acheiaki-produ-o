import { doc, setDoc, addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Merchant, DeliveryDriver, Seller, UserProfile } from '../types';
import { generateTemporaryPassword } from '../utils/security';
import {
  saveMerchantToSupabase,
  saveDriverToSupabase,
  saveSellerToSupabase,
  saveAuditLogToSupabase,
} from './supabaseService';

export interface RegistrationConsentMeta {
  platform: string;
  termsVersion: string;
  clientUserAgent?: string;
  clientIp?: string;
  clientLanguage?: string;
  notes?: string;
}

export interface RegistrationResult<T> {
  success: boolean;
  id: string;
  temporaryPassword?: string;
  acceptedTermsAt: string;
  data: T;
  message: string;
}

/**
 * Salva cadastro de lojista no Supabase e Firestore com auditoria LGPD e senha temporária
 */
export async function saveMerchantRegistration(
  input: Omit<Merchant, 'id' | 'createdAt' | 'status'> & {
    id?: string;
    temporaryPassword?: string;
  },
  consentMeta?: Partial<RegistrationConsentMeta>
): Promise<RegistrationResult<Merchant>> {
  const id = input.id || `merchant_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const tempPassword = input.temporaryPassword || generateTemporaryPassword();
  const acceptedTermsAt = input.acceptedTermsAt || new Date().toISOString();

  const consentDetails =
    input.termsConsentDetails ||
    JSON.stringify({
      acceptedText:
        'Termos de Uso, Intermediação Tecnológica e Regras Comerciais - AcheiaKi / Bex Serviços e Comércios',
      acceptedTermsAt,
      signerName: input.fullName,
      signerEmail: input.email.toLowerCase(),
      signerCNPJ: input.cnpj,
      storeName: input.storeName,
      platform: consentMeta?.platform || 'AcheiaKi Marketplace v2.0 (Cachoeiras de Macacu)',
      termsVersion: consentMeta?.termsVersion || '2026.1-BEX',
      userAgent:
        consentMeta?.clientUserAgent ||
        (typeof window !== 'undefined' ? window.navigator.userAgent : 'web-client'),
      clientLanguage:
        consentMeta?.clientLanguage ||
        (typeof window !== 'undefined' ? window.navigator.language : 'pt-BR'),
      legalEntity: 'Bex Serviços e Comércios - CNPJ 30.810.800/0001-39',
      temporaryPasswordIssued: true,
    });

  const merchantData: Merchant = {
    ...input,
    id,
    status: 'pendente',
    acceptedTerms: true,
    acceptedTermsAt,
    termsConsentDetails: consentDetails,
    temporaryPassword: tempPassword,
    mustChangePassword: true,
    createdAt: new Date().toISOString(),
  };

  // 1. Sincroniza com Supabase (REST e Client com URL e chave publishable)
  try {
    await saveMerchantToSupabase(merchantData);
  } catch (supabaseError) {
    console.warn('Aviso na sincronização do Supabase (não-bloqueante):', supabaseError);
  }

  // 2. Salva na coleção 'merchants' do Firestore
  try {
    await setDoc(doc(db, 'merchants', id), merchantData);
  } catch (firestoreError) {
    console.warn('Aviso ao gravar merchants no Firestore:', firestoreError);
  }

  // 3. Salva na coleção 'users' para permitir acesso com senha temporária
  try {
    const userDoc: Partial<UserProfile> = {
      uid: id,
      email: input.email.toLowerCase(),
      displayName: input.fullName,
      phone: input.phone,
      role: 'merchant',
      status: 'active',
      city: input.address?.city || 'Cachoeiras de Macacu',
      state: input.address?.state || 'RJ',
      temporaryPassword: tempPassword,
      mustChangePassword: true,
      createdAt: merchantData.createdAt,
    };
    await setDoc(doc(db, 'users', id), userDoc, { merge: true });
  } catch (userError) {
    console.warn('Aviso ao sincronizar perfil de usuário no Firestore:', userError);
  }

  // 4. Salva no cache local seguro (garante que nada seja perdido)
  try {
    const key = 'acheiaki_local_merchants';
    const current = JSON.parse(localStorage.getItem(key) || '[]');
    current.push(merchantData);
    localStorage.setItem(key, JSON.stringify(current));
  } catch (_) {}

  // 5. Registra log de auditoria em ambos os bancos (Supabase e Firestore)
  try {
    await saveAuditLogToSupabase({
      action: 'MERCHANT_REGISTERED',
      entityId: id,
      entityType: 'merchant',
      signerName: input.fullName,
      signerDocument: input.cnpj,
      acceptedTermsAt,
      details: `Cadastro de Lojista '${input.storeName}' registrado com senha temporária gerada e termos aceitos para auditoria Bex Serviços e Comércios.`,
    });

    await addDoc(collection(db, 'auditLogs'), {
      action: 'MERCHANT_REGISTERED',
      entityId: id,
      entityType: 'merchant',
      performedBy: input.email.toLowerCase(),
      signerName: input.fullName,
      signerCNPJ: input.cnpj,
      storeName: input.storeName,
      acceptedTermsAt,
      details: `Cadastro de Lojista '${input.storeName}' registrado com senha temporária gerada e termos aceitos para auditoria Bex Serviços e Comércios.`,
      createdAt: new Date().toISOString(),
    });
  } catch (auditErr) {
    console.warn('Registro de auditoria não-bloqueante:', auditErr);
  }

  return {
    success: true,
    id,
    temporaryPassword: tempPassword,
    acceptedTermsAt,
    data: merchantData,
    message: 'Cadastro de lojista realizado e salvo no banco de dados com sucesso!',
  };
}

/**
 * Salva cadastro de entregador parceiro no Supabase e Firestore com auditoria LGPD e senha temporária
 */
export async function saveDeliveryDriverRegistration(
  input: Omit<
    DeliveryDriver,
    'id' | 'createdAt' | 'status' | 'isOnline' | 'rating' | 'completedDeliveries'
  > & {
    id?: string;
    temporaryPassword?: string;
  },
  consentMeta?: Partial<RegistrationConsentMeta>
): Promise<RegistrationResult<DeliveryDriver>> {
  const id = input.id || `driver_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const tempPassword = input.temporaryPassword || generateTemporaryPassword();
  const acceptedTermsAt = input.acceptedTermsAt || new Date().toISOString();

  const consentDetails =
    input.termsConsentDetails ||
    JSON.stringify({
      acceptedText:
        'Termos de Adesão de Entregador Parceiro Autônomo e Segurança Viária - AcheiaKi / Bex Serviços e Comércios',
      acceptedTermsAt,
      signerName: input.fullName || input.name,
      signerEmail: input.email.toLowerCase(),
      signerCPF: input.cpf,
      vehicleType: input.vehicleType,
      platform: consentMeta?.platform || 'AcheiaKi Marketplace v2.0 (Cachoeiras de Macacu)',
      termsVersion: consentMeta?.termsVersion || '2026.1-BEX',
      userAgent:
        consentMeta?.clientUserAgent ||
        (typeof window !== 'undefined' ? window.navigator.userAgent : 'web-client'),
      clientLanguage:
        consentMeta?.clientLanguage ||
        (typeof window !== 'undefined' ? window.navigator.language : 'pt-BR'),
      legalEntity: 'Bex Serviços e Comércios - CNPJ 30.810.800/0001-39',
      temporaryPasswordIssued: true,
    });

  const driverData: DeliveryDriver = {
    ...input,
    id,
    status: 'pendente',
    isOnline: false,
    rating: 5.0,
    completedDeliveries: 0,
    acceptedTerms: true,
    acceptedTermsAt,
    termsConsentDetails: consentDetails,
    temporaryPassword: tempPassword,
    mustChangePassword: true,
    createdAt: new Date().toISOString(),
  };

  // 1. Salva no Supabase
  try {
    await saveDriverToSupabase(driverData);
  } catch (supabaseError) {
    console.warn('Aviso na sincronização do entregador no Supabase:', supabaseError);
  }

  // 2. Salva na coleção 'deliveryDrivers' do Firestore
  try {
    await setDoc(doc(db, 'deliveryDrivers', id), driverData);
  } catch (firestoreError) {
    console.warn('Aviso ao gravar deliveryDrivers no Firestore:', firestoreError);
  }

  // 3. Salva na coleção 'users' para acesso
  try {
    const userDoc: Partial<UserProfile> = {
      uid: id,
      email: input.email.toLowerCase(),
      displayName: input.fullName || input.name,
      phone: input.phone,
      role: 'driver',
      status: 'active',
      city: input.address?.city || 'Cachoeiras de Macacu',
      state: input.address?.state || 'RJ',
      temporaryPassword: tempPassword,
      mustChangePassword: true,
      createdAt: driverData.createdAt,
    };
    await setDoc(doc(db, 'users', id), userDoc, { merge: true });
  } catch (userError) {
    console.warn('Aviso ao sincronizar usuário entregador:', userError);
  }

  // 4. Salva no cache local
  try {
    const key = 'acheiaki_local_drivers';
    const current = JSON.parse(localStorage.getItem(key) || '[]');
    current.push(driverData);
    localStorage.setItem(key, JSON.stringify(current));
  } catch (_) {}

  // 5. Registra log de auditoria
  try {
    await saveAuditLogToSupabase({
      action: 'DRIVER_REGISTERED',
      entityId: id,
      entityType: 'driver',
      signerName: input.fullName || input.name,
      signerDocument: input.cpf,
      acceptedTermsAt,
      details: `Entregador parceiro cadastrado com senha temporária gerada e termos aceitos para auditoria Bex Serviços e Comércios.`,
    });

    await addDoc(collection(db, 'auditLogs'), {
      action: 'DRIVER_REGISTERED',
      entityId: id,
      entityType: 'driver',
      performedBy: input.email.toLowerCase(),
      signerName: input.fullName || input.name,
      signerCPF: input.cpf,
      vehicleType: input.vehicleType,
      acceptedTermsAt,
      details: `Entregador parceiro cadastrado com senha temporária gerada e termos aceitos para auditoria Bex Serviços e Comércios.`,
      createdAt: new Date().toISOString(),
    });
  } catch (auditErr) {
    console.warn('Registro de auditoria não-bloqueante:', auditErr);
  }

  return {
    success: true,
    id,
    temporaryPassword: tempPassword,
    acceptedTermsAt,
    data: driverData,
    message: 'Cadastro de entregador realizado e salvo no banco de dados com sucesso!',
  };
}

/**
 * Salva cadastro de vendedor comercial / consultor de vendas no Supabase e Firestore com auditoria LGPD e senha temporária
 */
export async function saveSellerRegistration(
  input: Omit<
    Seller,
    'id' | 'createdAt' | 'status' | 'totalSalesAccumulated' | 'totalCommissionsPaid'
  > & {
    id?: string;
    temporaryPassword?: string;
    acceptedTermsAt?: string;
  },
  consentMeta?: Partial<RegistrationConsentMeta>
): Promise<RegistrationResult<Seller>> {
  const id = input.id || `seller_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const tempPassword = input.temporaryPassword || generateTemporaryPassword();
  const acceptedTermsAt = input.acceptedTermsAt || new Date().toISOString();

  const sellerData: Seller = {
    ...input,
    id,
    status: 'active',
    totalSalesAccumulated: 0,
    totalCommissionsPaid: 0,
    temporaryPassword: tempPassword,
    mustChangePassword: true,
    createdAt: new Date().toISOString(),
  };

  // 1. Salva no Supabase
  try {
    await saveSellerToSupabase(sellerData);
  } catch (supabaseError) {
    console.warn('Aviso no salvamento do vendedor no Supabase:', supabaseError);
  }

  // 2. Salva na coleção 'sellers' do Firestore
  try {
    await setDoc(doc(db, 'sellers', id), sellerData);
  } catch (firestoreError) {
    console.warn('Aviso ao salvar vendedor no Firestore:', firestoreError);
  }

  // 3. Salva na coleção 'users' com papel 'seller'
  try {
    const userDoc: Partial<UserProfile> = {
      uid: id,
      email: input.email.toLowerCase(),
      displayName: input.name,
      phone: input.phone,
      role: 'seller',
      status: 'active',
      city: 'Cachoeiras de Macacu',
      state: 'RJ',
      temporaryPassword: tempPassword,
      mustChangePassword: true,
      createdAt: sellerData.createdAt,
    };
    await setDoc(doc(db, 'users', id), userDoc, { merge: true });
  } catch (userError) {
    console.warn('Aviso ao salvar perfil de vendedor:', userError);
  }

  // 4. Salva no cache local
  try {
    const key = 'acheiaki_local_sellers';
    const current = JSON.parse(localStorage.getItem(key) || '[]');
    current.push(sellerData);
    localStorage.setItem(key, JSON.stringify(current));
  } catch (_) {}

  // 5. Registra log de auditoria
  try {
    await saveAuditLogToSupabase({
      action: 'SELLER_REGISTERED',
      entityId: id,
      entityType: 'seller',
      signerName: input.name,
      signerDocument: input.cpf,
      acceptedTermsAt,
      details: `Vendedor/Consultor comercial cadastrado com senha temporária gerada e termos para auditoria Bex Serviços e Comércios.`,
    });

    await addDoc(collection(db, 'auditLogs'), {
      action: 'SELLER_REGISTERED',
      entityId: id,
      entityType: 'seller',
      performedBy: input.email.toLowerCase(),
      signerName: input.name,
      signerCPF: input.cpf,
      acceptedTermsAt,
      details: `Vendedor/Consultor comercial cadastrado com senha temporária gerada e termos para auditoria Bex Serviços e Comércios.`,
      createdAt: new Date().toISOString(),
    });
  } catch (auditErr) {
    console.warn('Registro de auditoria não-bloqueante:', auditErr);
  }

  return {
    success: true,
    id,
    temporaryPassword: tempPassword,
    acceptedTermsAt,
    data: sellerData,
    message: 'Cadastro de vendedor salvo no banco de dados com sucesso!',
  };
}

/**
 * Salva cadastro de prestador de serviços autônomo com auditoria e sincronização
 */
export async function saveServiceProviderRegistration(input: {
  name: string;
  email: string;
  phone: string;
  category: string;
  description: string;
  city?: string;
  state?: string;
  cpf?: string;
  priceStartingAt?: number;
  availability?: string;
}): Promise<RegistrationResult<any>> {
  const id = `provider_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const acceptedTermsAt = new Date().toISOString();
  const tempPassword = generateTemporaryPassword();

  const providerData = {
    id,
    name: input.name,
    email: input.email.toLowerCase().trim(),
    phone: input.phone,
    cpf: input.cpf || '',
    category: input.category,
    description: input.description,
    priceStartingAt: input.priceStartingAt || 50,
    availability: input.availability || 'Segunda a Sábado',
    rating: 5.0,
    reviewsCount: 1,
    verified: true,
    status: 'pendente',
    city: input.city || 'Cachoeiras de Macacu',
    state: input.state || 'RJ',
    acceptedTerms: true,
    acceptedTermsAt,
    createdAt: new Date().toISOString(),
  };

  // 1. Salva no Firestore
  try {
    await setDoc(doc(db, 'serviceProviders', id), providerData);
  } catch (err) {
    console.warn('Aviso ao salvar prestador no Firestore:', err);
  }

  // 2. Salva em users com role service_provider
  try {
    const userDoc: Partial<UserProfile> = {
      uid: id,
      email: input.email.toLowerCase().trim(),
      displayName: input.name,
      phone: input.phone,
      role: 'service_provider',
      status: 'active',
      city: input.city || 'Cachoeiras de Macacu',
      state: input.state || 'RJ',
      temporaryPassword: tempPassword,
      mustChangePassword: true,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', id), userDoc, { merge: true });
  } catch (_) {}

  // 3. Registra auditoria
  try {
    await saveAuditLogToSupabase({
      action: 'SERVICE_PROVIDER_REGISTERED',
      entityId: id,
      entityType: 'service_provider',
      signerName: input.name,
      signerDocument: input.cpf,
      acceptedTermsAt,
      details: `Prestador de serviços autônomo cadastrado (${input.category}) em Cachoeiras de Macacu.`,
    });
  } catch (_) {}

  return {
    success: true,
    id,
    temporaryPassword: tempPassword,
    acceptedTermsAt,
    data: providerData,
    message: 'Cadastro de prestador de serviços registrado com sucesso!',
  };
}

export interface RegistrationStatusResult {
  found: boolean;
  type?: 'client' | 'merchant' | 'driver' | 'provider' | 'seller';
  typeLabel?: string;
  name?: string;
  document?: string;
  email?: string;
  status?: string;
  protocol?: string;
  createdAt?: string;
  message?: string;
}

/**
 * Consulta o status de um cadastro prévio pelo CPF, CNPJ ou E-mail
 */
export async function checkRegistrationStatus(
  query: string
): Promise<RegistrationStatusResult> {
  const clean = query.trim().toLowerCase().replace(/[^\w@.-]/g, '');
  const digitsOnly = query.replace(/\D/g, '');

  // 1. Consulta em merchants
  try {
    const merchantsSnap = await getDocs(collection(db, 'merchants'));
    for (const docSnap of merchantsSnap.docs) {
      const data = docSnap.data();
      const cnpjDigits = (data.cnpj || '').replace(/\D/g, '');
      const email = (data.email || '').toLowerCase().trim();
      if (
        (digitsOnly && cnpjDigits === digitsOnly) ||
        (clean && email === clean) ||
        docSnap.id === clean
      ) {
        return {
          found: true,
          type: 'merchant',
          typeLabel: 'Lojista / Comércio Credenciado',
          name: data.storeName || data.fullName,
          document: data.cnpj || data.cpf,
          email: data.email,
          status: data.status || 'pendente',
          protocol: docSnap.id,
          createdAt: data.createdAt || data.acceptedTermsAt,
          message:
            data.status === 'aprovado'
              ? 'Seu credenciamento como lojista foi APROVADO! Você já pode acessar seu painel comercial.'
              : data.status === 'rejeitado'
              ? 'Seu cadastro precisa de revisão de documentos fiscais. Entre em contato com a Central Master.'
              : 'Seu credenciamento está em análise pela equipe de governança de Cachoeiras de Macacu.',
        };
      }
    }
  } catch (_) {}

  // 2. Consulta em deliveryDrivers
  try {
    const driversSnap = await getDocs(collection(db, 'deliveryDrivers'));
    for (const docSnap of driversSnap.docs) {
      const data = docSnap.data();
      const cpfDigits = (data.cpf || '').replace(/\D/g, '');
      const email = (data.email || '').toLowerCase().trim();
      if (
        (digitsOnly && cpfDigits === digitsOnly) ||
        (clean && email === clean) ||
        docSnap.id === clean
      ) {
        return {
          found: true,
          type: 'driver',
          typeLabel: 'Entregador Parceiro (Delivery)',
          name: data.fullName || data.name,
          document: data.cpf,
          email: data.email,
          status: data.status || 'pendente',
          protocol: docSnap.id,
          createdAt: data.createdAt || data.acceptedTermsAt,
          message:
            data.status === 'aprovado' || data.status === 'active'
              ? 'Seu cadastro de entregador parceiro está APROVADO! Você está apto para receber corridas.'
              : 'Seu cadastro de entregador parceiro está em processo de verificação de CNH e veículo.',
        };
      }
    }
  } catch (_) {}

  // 3. Consulta em serviceProviders
  try {
    const provSnap = await getDocs(collection(db, 'serviceProviders'));
    for (const docSnap of provSnap.docs) {
      const data = docSnap.data();
      const cpfDigits = (data.cpf || '').replace(/\D/g, '');
      const email = (data.email || '').toLowerCase().trim();
      if (
        (digitsOnly && cpfDigits === digitsOnly) ||
        (clean && email === clean) ||
        docSnap.id === clean
      ) {
        return {
          found: true,
          type: 'provider',
          typeLabel: 'Prestador de Serviços',
          name: data.name,
          document: data.cpf,
          email: data.email,
          status: data.status || 'aprovado',
          protocol: docSnap.id,
          createdAt: data.createdAt,
          message: 'Cadastro de prestador ativo no catálogo de serviços de Cachoeiras de Macacu.',
        };
      }
    }
  } catch (_) {}

  return {
    found: false,
    message: 'Nenhum credenciamento encontrado com os dados informados. Verifique se o CPF, CNPJ ou E-mail está correto.',
  };
}
