import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import {
  Store,
  Product,
  ServiceProvider,
  ServiceItem,
  ServiceRequest,
  Order,
  Delivery,
  DeliveryDriver,
  Merchant,
  Seller,
  BannerPricingSetting,
  Worker,
  Review,
  Message,
  NotificationItem,
  PlatformSettings,
  AuditLog,
  FavoriteItem,
  SupportTicket,
  UserProfile,
  UserRole,
  SaaSPlan,
} from '../types';

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  id: 'global',
  appName: 'ConectAí Cachoeiras',
  city: 'Cachoeiras de Macacu',
  state: 'RJ',
  merchantCommissionRate: 0.10, // 10%
  providerCommissionRate: 0.12, // 12%
  defaultDeliveryFee: 5.00,     // R$ 5,00 padrão configurável
  currency: 'BRL',
  supportPhone: '(21) 99876-5432',
  supportEmail: 'suporte@conectai.app.br',
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_SAAS_PLANS: SaaSPlan[] = [
  {
    id: 'plan_starter',
    name: 'Plano Inicial',
    target: 'merchant',
    monthlyPrice: 49.90,
    commissionDiscount: 0,
    marketplaceFeeRate: 0.10, // 10%
    sellerCommissionRate: 0.20, // 20% comissão para o vendedor pela adesão
    features: ['Até 50 produtos cadastrados', 'Painel de pedidos em tempo real', 'Taxa de 10% por venda', 'Suporte padrão via chat'],
    maxProducts: 50,
    bannerCredits: 0,
  },
  {
    id: 'plan_pro',
    name: 'Plano Profissional',
    target: 'merchant',
    monthlyPrice: 99.90,
    commissionDiscount: 0.02,
    marketplaceFeeRate: 0.08, // 8% taxa reduzida
    sellerCommissionRate: 0.25, // 25% para o vendedor
    recommended: true,
    features: ['Produtos ilimitados', 'Destaque prioritário na Home', 'Taxa reduzida de 8%', 'Gestão de múltiplos atendentes', '1 Banner Destaque mensal incluso'],
    maxProducts: 9999,
    bannerCredits: 1,
  },
  {
    id: 'plan_provider',
    name: 'Plano Prestador',
    target: 'provider',
    monthlyPrice: 39.90,
    commissionDiscount: 0.02,
    marketplaceFeeRate: 0.10,
    sellerCommissionRate: 0.20,
    features: ['Catálogo ilimitado de serviços', 'Agenda digital integrada', 'Recebimento de chamados diretos', 'Avaliações verificadas de clientes'],
    maxProducts: 50,
    bannerCredits: 0,
  },
  {
    id: 'plan_enterprise',
    name: 'Plano Empresarial',
    target: 'enterprise',
    monthlyPrice: 199.90,
    commissionDiscount: 0.04,
    marketplaceFeeRate: 0.06, // 6% taxa VIP
    sellerCommissionRate: 0.30, // 30% para o vendedor
    features: ['Multi-filiais em Cachoeiras e região', 'API de integração e relatórios fiscais', 'Gerente de contas exclusivo', '3 Banners Topo inclusos por mês'],
    maxProducts: 99999,
    bannerCredits: 3,
  },
];

export const DEFAULT_BANNER_SETTINGS: BannerPricingSetting[] = [
  {
    id: 'banner_home_topo',
    title: 'Banner Topo Home Principal',
    location: 'home_top',
    description: 'Espaço premium no topo da página inicial do marketplace, visível para todos os compradores de Cachoeiras de Macacu.',
    dimensions: '1200 x 360 px',
    weeklyPrice: 59.90,
    monthlyPrice: 199.90,
    sellerCommissionRate: 0.15, // 15% de comissão para o vendedor
    active: true,
    maxSlots: 5,
    activeBookingsCount: 2,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'banner_destaque_semana',
    title: 'Banner Destaque da Semana',
    location: 'home_middle',
    description: 'Chamada central no carrossel de destaques da semana com direcionamento direto para a loja.',
    dimensions: '1100 x 280 px',
    weeklyPrice: 45.00,
    monthlyPrice: 149.90,
    sellerCommissionRate: 0.15,
    active: true,
    maxSlots: 4,
    activeBookingsCount: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'banner_ofertas_relampago',
    title: 'Banner Carrossel Ofertas Relâmpago',
    location: 'home_middle',
    description: 'Card publicitário rotativo na seção de promoções rápidas da cidade.',
    dimensions: '800 x 400 px',
    weeklyPrice: 30.00,
    monthlyPrice: 99.90,
    sellerCommissionRate: 0.15,
    active: true,
    maxSlots: 8,
    activeBookingsCount: 3,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'banner_lateral_categoria',
    title: 'Banner Topo de Categorias',
    location: 'category',
    description: 'Exibição segmentada no topo de categorias específicas (Padarias, Farmácias, Mercados).',
    dimensions: '900 x 220 px',
    weeklyPrice: 25.00,
    monthlyPrice: 79.90,
    sellerCommissionRate: 0.15,
    active: true,
    maxSlots: 6,
    activeBookingsCount: 1,
    updatedAt: new Date().toISOString(),
  },
];

// ==================== PLATFORM SETTINGS ====================
export async function getPlatformSettings(): Promise<PlatformSettings> {
  const path = 'platformSettings';
  try {
    const docRef = doc(db, path, 'global');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as PlatformSettings;
    }
    // initialize if not exists
    await setDoc(docRef, DEFAULT_PLATFORM_SETTINGS);
    return DEFAULT_PLATFORM_SETTINGS;
  } catch (error) {
    console.warn('Erro ao carregar platformSettings, usando padrão:', error);
    return DEFAULT_PLATFORM_SETTINGS;
  }
}

export async function updatePlatformSettings(data: Partial<PlatformSettings>): Promise<void> {
  const path = 'platformSettings';
  try {
    const docRef = doc(db, path, 'global');
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/global`);
  }
}

// ==================== USERS & PROFILES ====================
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Busca expressa no banco de dados das informações do Master (David / telecom.david@gmail.com)
 */
export async function getMasterProfileFromDB(): Promise<UserProfile> {
  const path = 'users/master_david_macacu';
  try {
    const masterDoc = await getDoc(doc(db, 'users', 'master_david_macacu'));
    if (masterDoc.exists()) {
      const data = masterDoc.data() as UserProfile;
      return {
        ...data,
        uid: 'master_david_macacu',
        id: 'master_david_macacu',
        email: 'telecom.david@gmail.com',
        displayName: data.displayName || 'David (Master ConectAí)',
        role: 'super_admin',
        status: 'active',
      };
    }
  } catch (err) {
    console.warn('Aviso ao consultar master_david_macacu no Firestore:', err);
  }

  // Fallback e auto-reparo no Firestore
  const masterData: UserProfile = {
    uid: 'master_david_macacu',
    id: 'master_david_macacu',
    email: 'telecom.david@gmail.com',
    displayName: 'David (Master ConectAí)',
    full_name: 'David (Master ConectAí)',
    role: 'super_admin',
    status: 'active',
    phone: '(21) 99876-5432',
    city: 'Cachoeiras de Macacu',
    state: 'RJ',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'users', 'master_david_macacu'), masterData, { merge: true });
    await setDoc(doc(db, 'admins', 'master_david_macacu'), {
      uid: 'master_david_macacu',
      email: 'telecom.david@gmail.com',
      role: 'super_admin',
      displayName: 'David (Master ConectAí)',
      status: 'active',
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (e) {
    console.warn('Aviso ao sincronizar master no Firestore:', e);
  }

  return masterData;
}

/**
 * Busca perfil de usuário no Firestore por e-mail
 */
export async function getUserProfileByEmail(email: string): Promise<UserProfile | null> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Verificação prioritária do Master
  if (cleanEmail === 'telecom.david@gmail.com') {
    return await getMasterProfileFromDB();
  }

  // 2. Query geral por email na coleção users do Firestore
  try {
    const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const data = snap.docs[0].data() as UserProfile;
      return {
        ...data,
        role: data.role === ('master' as any) ? 'super_admin' : data.role,
      };
    }
  } catch (error) {
    console.warn('Erro ao buscar usuário por email no Firestore:', error);
  }

  return null;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, 'users', profile.uid), {
      ...profile,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchAllUsers(): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map((d) => d.data() as UserProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateUserRole(uid: string, role: UserRole, status?: 'active' | 'suspended' | 'pending'): Promise<void> {
  const path = `users/${uid}`;
  try {
    const updatePayload: Record<string, any> = {
      role,
      updatedAt: new Date().toISOString(),
    };
    if (status) updatePayload.status = status;
    await updateDoc(doc(db, 'users', uid), updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ==================== STORES ====================
export async function fetchStores(): Promise<Store[]> {
  const path = 'stores';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map((d) => d.data() as Store);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getStoreById(storeId: string): Promise<Store | null> {
  const path = `stores/${storeId}`;
  try {
    const snap = await getDoc(doc(db, 'stores', storeId));
    if (snap.exists()) {
      return snap.data() as Store;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveStore(store: Store): Promise<void> {
  const path = `stores/${store.id}`;
  try {
    await setDoc(doc(db, 'stores', store.id), {
      ...store,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateStoreStatus(
  storeId: string,
  status: 'active' | 'pending' | 'suspended' | 'offline',
  extraFields?: {
    subscriptionDueDate?: string;
    subscriptionStatus?: 'paid' | 'pending' | 'overdue' | 'blocked';
    lastPaymentDate?: string;
    planId?: string;
  }
): Promise<void> {
  const path = `stores/${storeId}`;
  try {
    const updatePayload: Record<string, any> = {
      status,
      updatedAt: new Date().toISOString(),
      ...(extraFields || {}),
    };
    await updateDoc(doc(db, 'stores', storeId), updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ==================== PRODUCTS ====================
export async function fetchProducts(storeId?: string): Promise<Product[]> {
  const path = 'products';
  try {
    let q = query(collection(db, path));
    if (storeId) {
      q = query(collection(db, path), where('storeId', '==', storeId));
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Product);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveProduct(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, 'products', product.id), {
      ...product,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==================== SERVICE PROVIDERS & SERVICES ====================
export async function fetchServiceProviders(): Promise<ServiceProvider[]> {
  const path = 'serviceProviders';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map((d) => d.data() as ServiceProvider);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveServiceProvider(provider: ServiceProvider): Promise<void> {
  const path = `serviceProviders/${provider.id}`;
  try {
    await setDoc(doc(db, 'serviceProviders', provider.id), {
      ...provider,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateProviderStatus(providerId: string, status: 'active' | 'pending' | 'suspended'): Promise<void> {
  const path = `serviceProviders/${providerId}`;
  try {
    await updateDoc(doc(db, 'serviceProviders', providerId), {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function fetchServices(providerId?: string): Promise<ServiceItem[]> {
  const path = 'services';
  try {
    let q = query(collection(db, path));
    if (providerId) {
      q = query(collection(db, path), where('providerId', '==', providerId));
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as ServiceItem);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveServiceItem(service: ServiceItem): Promise<void> {
  const path = `services/${service.id}`;
  try {
    await setDoc(doc(db, 'services', service.id), service, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ==================== SERVICE REQUESTS ====================
export async function createServiceRequest(request: ServiceRequest): Promise<void> {
  const path = `serviceRequests/${request.id}`;
  try {
    await setDoc(doc(db, 'serviceRequests', request.id), {
      ...request,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchServiceRequests(userId?: string, role?: string): Promise<ServiceRequest[]> {
  const path = 'serviceRequests';
  try {
    let q = query(collection(db, path));
    if (userId && role === 'customer') {
      q = query(collection(db, path), where('customerId', '==', userId));
    } else if (userId && role === 'provider') {
      q = query(collection(db, path), where('providerId', '==', userId));
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as ServiceRequest);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateServiceRequestStatus(
  requestId: string,
  status: ServiceRequest['status'],
  agreedValue?: number
): Promise<void> {
  const path = `serviceRequests/${requestId}`;
  try {
    const payload: Record<string, any> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (agreedValue !== undefined) {
      payload.agreedValue = agreedValue;
      payload.platformFee = agreedValue * 0.12;
      payload.netValue = agreedValue * 0.88;
    }
    await updateDoc(doc(db, 'serviceRequests', requestId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ==================== ORDERS & CHECKOUT ====================
export async function createOrder(order: Order): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    await setDoc(doc(db, 'orders', order.id), {
      ...order,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Also create matching Delivery record automatically
    const deliveryRecord: Delivery = {
      id: `del_${order.id}`,
      orderId: order.id,
      storeId: order.storeId,
      storeName: order.storeName,
      customerId: order.customerId,
      customerName: order.customerName,
      pickupAddress: `${order.storeName} - Centro, Cachoeiras de Macacu`,
      deliveryAddress: `${order.deliveryAddress.street}, ${order.deliveryAddress.number} - ${order.deliveryAddress.neighborhood}, ${order.deliveryAddress.city}`,
      fee: order.deliveryFee,
      driverEarnings: Math.max(0, order.deliveryFee * 0.90), // Motoboy receives 90% of delivery fee
      status: 'requested',
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'deliveries', deliveryRecord.id), deliveryRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchOrders(customerId?: string, storeId?: string): Promise<Order[]> {
  const path = 'orders';
  try {
    let q = query(collection(db, path));
    if (customerId) {
      q = query(collection(db, path), where('customerId', '==', customerId));
    } else if (storeId) {
      q = query(collection(db, path), where('storeId', '==', storeId));
    }
    const snap = await getDocs(q);
    const orders = snap.docs.map((d) => d.data() as Order);
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  driverInfo?: { driverId: string; driverName: string }
): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const updateData: Record<string, any> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (driverInfo) {
      updateData.driverId = driverInfo.driverId;
      updateData.driverName = driverInfo.driverName;
    }
    await updateDoc(doc(db, 'orders', orderId), updateData);

    // Sync delivery status if linked
    const delDoc = doc(db, 'deliveries', `del_${orderId}`);
    const delSnap = await getDoc(delDoc);
    if (delSnap.exists()) {
      let delStatus: Delivery['status'] = 'requested';
      if (status === 'driver_assigned') delStatus = 'accepted';
      else if (status === 'collected') delStatus = 'collected';
      else if (status === 'out_for_delivery') delStatus = 'in_transit';
      else if (status === 'delivered') delStatus = 'delivered';
      else if (status === 'cancelled') delStatus = 'cancelled';

      const delUpdate: Record<string, any> = {
        status: delStatus,
        updatedAt: new Date().toISOString(),
      };
      if (driverInfo) {
        delUpdate.driverId = driverInfo.driverId;
        delUpdate.driverName = driverInfo.driverName;
      }
      if (delStatus === 'delivered') {
        delUpdate.deliveredTime = new Date().toISOString();
      }
      await updateDoc(delDoc, delUpdate);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ==================== DELIVERIES & DRIVERS ====================
export async function fetchDeliveries(driverId?: string): Promise<Delivery[]> {
  const path = 'deliveries';
  try {
    let q = query(collection(db, path));
    if (driverId) {
      q = query(collection(db, path), where('driverId', '==', driverId));
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Delivery);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchDeliveryDrivers(): Promise<DeliveryDriver[]> {
  const path = 'deliveryDrivers';
  try {
    const snap = await getDocs(collection(db, path));
    const items = snap.docs.map((d) => d.data() as DeliveryDriver);
    try {
      const local = JSON.parse(localStorage.getItem('acheiaki_local_drivers') || '[]');
      local.forEach((locD: DeliveryDriver) => {
        if (!items.some((it) => it.id === locD.id || (locD.cpf && it.cpf === locD.cpf))) {
          items.push(locD);
        }
      });
    } catch (_) {}
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    try {
      return JSON.parse(localStorage.getItem('acheiaki_local_drivers') || '[]');
    } catch (_) {
      return [];
    }
  }
}

export async function registerDeliveryDriver(
  driverData: Omit<DeliveryDriver, 'id' | 'createdAt' | 'status' | 'isOnline' | 'rating' | 'completedDeliveries'> & { id?: string }
): Promise<string> {
  const path = 'deliveryDrivers';
  try {
    const id = driverData.id || `driver_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newDriver: DeliveryDriver = {
      ...driverData,
      id,
      name: driverData.name || driverData.fullName,
      status: 'pendente',
      isOnline: false,
      rating: 5.0,
      completedDeliveries: 0,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'deliveryDrivers', id), newDriver);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function updateDriverRegistrationStatus(
  driverId: string,
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'active' | 'pending' | 'suspended'
): Promise<void> {
  const path = `deliveryDrivers/${driverId}`;
  try {
    await updateDoc(doc(db, 'deliveryDrivers', driverId), {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

// ==================== MERCHANTS (CADASTRO E APROVAÇÃO) ====================
export async function registerMerchant(
  data: Omit<Merchant, 'id' | 'createdAt' | 'status'> & { id?: string }
): Promise<string> {
  const path = 'merchants';
  try {
    const id = data.id || `merchant_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newMerchant: Merchant = {
      ...data,
      id,
      status: 'pendente',
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'merchants', id), newMerchant);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function fetchMerchants(): Promise<Merchant[]> {
  const path = 'merchants';
  try {
    const snap = await getDocs(collection(db, path));
    const items = snap.docs.map((d) => d.data() as Merchant);
    try {
      const local = JSON.parse(localStorage.getItem('acheiaki_local_merchants') || '[]');
      local.forEach((locM: Merchant) => {
        if (!items.some((it) => it.id === locM.id || (locM.cnpj && it.cnpj === locM.cnpj))) {
          items.push(locM);
        }
      });
    } catch (_) {}
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    try {
      return JSON.parse(localStorage.getItem('acheiaki_local_merchants') || '[]');
    } catch (_) {
      return [];
    }
  }
}

export async function updateMerchantStatus(
  merchantId: string,
  status: 'pendente' | 'aprovado' | 'rejeitado'
): Promise<void> {
  const path = `merchants/${merchantId}`;
  try {
    await updateDoc(doc(db, 'merchants', merchantId), {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

// ==================== SELLERS (VENDEDORES & METAS) ====================
export async function fetchSellers(): Promise<Seller[]> {
  const path = 'sellers';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      // Seed default seller if empty
      const defaultSeller: Seller = {
        id: 'seller_lucas_vendas',
        uid: 'seller_lucas_vendas',
        name: 'Lucas Almeida (Consultor Comercial)',
        email: 'lucas.vendas@conectai.app.br',
        phone: '(21) 98711-4455',
        cpf: '345.678.901-22',
        temporaryPassword: 'L9#k2@',
        mustChangePassword: false,
        commissionSalesRate: 0.04, // 4% sobre vendas
        commissionPlansRate: 0.20, // 20% sobre planos SaaS
        commissionBannersRate: 0.15, // 15% sobre banners vendidos
        assignedStoreIds: ['store_padaria_imperial', 'store_hortifruti_serra'],
        status: 'active',
        monthlyGoal: 15000.0,
        totalSalesAccumulated: 8450.0,
        totalCommissionsPaid: 580.0,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, path, defaultSeller.id), defaultSeller);
      return [defaultSeller];
    }
    return snap.docs.map((d) => d.data() as Seller);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function createSeller(
  sellerData: Omit<Seller, 'id' | 'createdAt' | 'status' | 'totalSalesAccumulated' | 'totalCommissionsPaid'> & { id?: string }
): Promise<string> {
  const path = 'sellers';
  try {
    const id = sellerData.id || `seller_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newSeller: Seller = {
      ...sellerData,
      id,
      status: 'active',
      totalSalesAccumulated: 0,
      totalCommissionsPaid: 0,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, path, id), newSeller);

    // Also register in users collection so they can authenticate
    await setDoc(
      doc(db, 'users', id),
      {
        uid: id,
        email: sellerData.email,
        displayName: sellerData.name,
        phone: sellerData.phone,
        role: 'seller',
        status: 'active',
        city: 'Cachoeiras de Macacu',
        state: 'RJ',
        temporaryPassword: sellerData.temporaryPassword,
        mustChangePassword: true,
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function updateSeller(
  sellerId: string,
  data: Partial<Seller>
): Promise<void> {
  const path = `sellers/${sellerId}`;
  try {
    await updateDoc(doc(db, 'sellers', sellerId), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

// ==================== BANNERS PRICING (MASTER & VENDEDORES) ====================
export async function fetchBannerPricingSettings(): Promise<BannerPricingSetting[]> {
  const path = 'bannerSettings';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      // Seed default banner configs
      for (const banner of DEFAULT_BANNER_SETTINGS) {
        await setDoc(doc(db, path, banner.id), banner);
      }
      return DEFAULT_BANNER_SETTINGS;
    }
    return snap.docs.map((d) => d.data() as BannerPricingSetting);
  } catch (error) {
    console.warn('Erro ao carregar bannerSettings, usando padrões:', error);
    return DEFAULT_BANNER_SETTINGS;
  }
}

export async function updateBannerPricingSetting(
  id: string,
  data: Partial<BannerPricingSetting>
): Promise<void> {
  const path = `bannerSettings/${id}`;
  try {
    await updateDoc(doc(db, 'bannerSettings', id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

export async function saveBannerPricingSetting(
  banner: BannerPricingSetting
): Promise<void> {
  const path = `bannerSettings/${banner.id}`;
  try {
    await setDoc(
      doc(db, 'bannerSettings', banner.id),
      {
        ...banner,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteBannerPricingSetting(id: string): Promise<void> {
  const path = `bannerSettings/${id}`;
  try {
    await deleteDoc(doc(db, 'bannerSettings', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==================== SAAS PLANS (MASTER & LOJISTAS) ====================
export async function fetchSaaSPlans(): Promise<SaaSPlan[]> {
  const path = 'saasPlans';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      // Seed default SaaS plans
      for (const plan of DEFAULT_SAAS_PLANS) {
        await setDoc(doc(db, path, plan.id), plan);
      }
      return DEFAULT_SAAS_PLANS;
    }
    return snap.docs.map((d) => d.data() as SaaSPlan);
  } catch (error) {
    console.warn('Erro ao carregar saasPlans, usando padrões:', error);
    return DEFAULT_SAAS_PLANS;
  }
}

export async function updateSaaSPlan(
  id: string,
  data: Partial<SaaSPlan>
): Promise<void> {
  const path = `saasPlans/${id}`;
  try {
    await updateDoc(doc(db, 'saasPlans', id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

// ==================== PERMANENT PASSWORD UPDATE ====================
export async function updateUserPermanentPassword(
  userId: string,
  _newPasswordHash: string
): Promise<void> {
  try {
    // Update users doc if exists
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        mustChangePassword: false,
        passwordChangedAt: new Date().toISOString(),
      });
    } catch (_) {}

    // Check merchants
    try {
      const merchantRef = doc(db, 'merchants', userId);
      await updateDoc(merchantRef, {
        mustChangePassword: false,
        passwordChangedAt: new Date().toISOString(),
      });
    } catch (_) {}

    // Check deliveryDrivers
    try {
      const driverRef = doc(db, 'deliveryDrivers', userId);
      await updateDoc(driverRef, {
        mustChangePassword: false,
        passwordChangedAt: new Date().toISOString(),
      });
    } catch (_) {}

    // Check sellers
    try {
      const sellerRef = doc(db, 'sellers', userId);
      await updateDoc(sellerRef, {
        mustChangePassword: false,
        updatedAt: new Date().toISOString(),
      });
    } catch (_) {}
  } catch (error) {
    console.error('Erro ao atualizar senha definitiva do usuário:', error);
  }
}

export async function saveDeliveryDriver(driver: DeliveryDriver): Promise<void> {
  const path = `deliveryDrivers/${driver.id}`;
  try {
    await setDoc(doc(db, 'deliveryDrivers', driver.id), driver, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function acceptDelivery(deliveryId: string, driver: DeliveryDriver): Promise<void> {
  const path = `deliveries/${deliveryId}`;
  try {
    await updateDoc(doc(db, 'deliveries', deliveryId), {
      driverId: driver.id,
      driverName: driver.name,
      status: 'accepted',
      updatedAt: new Date().toISOString(),
    });

    const delSnap = await getDoc(doc(db, 'deliveries', deliveryId));
    if (delSnap.exists()) {
      const delData = delSnap.data() as Delivery;
      await updateDoc(doc(db, 'orders', delData.orderId), {
        status: 'driver_assigned',
        driverId: driver.id,
        driverName: driver.name,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateDeliveryStep(
  deliveryId: string,
  newStatus: Delivery['status']
): Promise<void> {
  const path = `deliveries/${deliveryId}`;
  try {
    const updateData: Record<string, any> = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    if (newStatus === 'delivered') {
      updateData.deliveredTime = new Date().toISOString();
    }
    await updateDoc(doc(db, 'deliveries', deliveryId), updateData);

    const delSnap = await getDoc(doc(db, 'deliveries', deliveryId));
    if (delSnap.exists()) {
      const delData = delSnap.data() as Delivery;
      let orderStatus: Order['status'] = 'ready_for_pickup';
      if (newStatus === 'collected') orderStatus = 'collected';
      if (newStatus === 'in_transit') orderStatus = 'out_for_delivery';
      if (newStatus === 'delivered') orderStatus = 'delivered';
      await updateDoc(doc(db, 'orders', delData.orderId), {
        status: orderStatus,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ==================== WORKERS ====================
export async function fetchWorkers(): Promise<Worker[]> {
  const path = 'workers';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map((d) => d.data() as Worker);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveWorker(worker: Worker): Promise<void> {
  const path = `workers/${worker.id}`;
  try {
    await setDoc(doc(db, 'workers', worker.id), worker, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ==================== REVIEWS ====================
export async function fetchReviews(targetType?: string, targetId?: string): Promise<Review[]> {
  const path = 'reviews';
  try {
    let q = query(collection(db, path));
    if (targetType && targetId) {
      q = query(
        collection(db, path),
        where('targetType', '==', targetType),
        where('targetId', '==', targetId)
      );
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Review);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function addReview(review: Review): Promise<void> {
  const path = `reviews/${review.id}`;
  try {
    await setDoc(doc(db, 'reviews', review.id), review);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// ==================== MESSAGES ====================
export async function fetchMessages(userId: string): Promise<Message[]> {
  const path = 'messages';
  try {
    const snap = await getDocs(collection(db, path));
    const all = snap.docs.map((d) => d.data() as Message);
    return all.filter((m) => m.senderId === userId || m.recipientId === userId);
  } catch (error) {
    console.warn('Aviso não-bloqueante ao buscar mensagens:', error);
    return [];
  }
}

export async function sendMessage(message: Message): Promise<void> {
  const path = `messages/${message.id}`;
  try {
    await setDoc(doc(db, 'messages', message.id), message);
  } catch (error) {
    console.warn('Aviso não-bloqueante ao enviar mensagem:', error);
  }
}

// ==================== NOTIFICATIONS ====================
export async function fetchNotifications(userId: string): Promise<NotificationItem[]> {
  const path = 'notifications';
  try {
    const snap = await getDocs(collection(db, path));
    const all = snap.docs.map((d) => d.data() as NotificationItem);
    return all.filter(
      (n) => n.userId === userId || n.userId === 'all' || n.userId === 'todos' || !n.userId
    );
  } catch (error) {
    console.warn('Aviso não-bloqueante ao buscar notificações:', error);
    return [];
  }
}

export async function sendBroadcastNotification(data: {
  title: string;
  body: string;
  audience?: 'todos' | 'lojistas' | 'consumidores' | 'entregadores';
  type?: 'system' | 'promo' | 'delivery' | 'financial' | 'chat';
}): Promise<string> {
  const id = `push_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const item: NotificationItem = {
    id,
    userId: 'all',
    title: data.title,
    body: data.body,
    type: data.type || 'system',
    read: false,
    createdAt: new Date().toISOString(),
  };
  try {
    await setDoc(doc(db, 'notifications', id), item);
  } catch (_) {}
  return id;
}

export async function markNotificationRead(id: string): Promise<void> {
  const path = `notifications/${id}`;
  try {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ==================== FAVORITES ====================
export async function fetchFavorites(userId: string): Promise<FavoriteItem[]> {
  const path = 'favorites';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as FavoriteItem);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function toggleFavorite(fav: FavoriteItem): Promise<boolean> {
  const path = 'favorites';
  try {
    const favId = `${fav.userId}_${fav.itemId}`;
    const favRef = doc(db, path, favId);
    const snap = await getDoc(favRef);
    if (snap.exists()) {
      await deleteDoc(favRef);
      return false; // removed
    } else {
      await setDoc(favRef, { ...fav, id: favId, createdAt: new Date().toISOString() });
      return true; // added
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ==================== AUDIT LOGS ====================
export async function logAuditEvent(
  action: string,
  targetEntity: string,
  targetId: string,
  details: string
): Promise<void> {
  const path = 'auditLogs';
  try {
    const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const logItem: AuditLog = {
      id,
      operatorUid: auth.currentUser?.uid || 'system_or_master',
      operatorEmail: auth.currentUser?.email || 'admin@conectai.app.br',
      action,
      targetEntity,
      targetId,
      details,
      timestamp: new Date().toISOString(),
    };
    await setDoc(doc(db, path, id), logItem);
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const path = 'auditLogs';
  try {
    const snap = await getDocs(collection(db, path));
    const logs = snap.docs.map((d) => d.data() as AuditLog);
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// ==================== SUPPORT TICKETS ====================
export async function fetchSupportTickets(userId?: string): Promise<SupportTicket[]> {
  const path = 'supportTickets';
  try {
    let q = query(collection(db, path));
    if (userId) {
      q = query(collection(db, path), where('authorId', '==', userId));
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as SupportTicket);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function createSupportTicket(ticket: SupportTicket): Promise<void> {
  const path = `supportTickets/${ticket.id}`;
  try {
    await setDoc(doc(db, 'supportTickets', ticket.id), {
      ...ticket,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function respondSupportTicket(ticketId: string, response: string, newStatus: SupportTicket['status']): Promise<void> {
  const path = `supportTickets/${ticketId}`;
  try {
    await updateDoc(doc(db, 'supportTickets', ticketId), {
      response,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ==================== SEED INITIAL CACHOEIRAS DE MACACU DATA ====================
export async function seedInitialMarketplaceIfEmpty(): Promise<boolean> {
  try {
    const existingStores = await getDocs(collection(db, 'stores'));
    if (!existingStores.empty) {
      return false; // already populated
    }

    console.info('🚀 Semeando ecossistema digital de Cachoeiras de Macacu no Firestore...');

    // 1. Initial Stores
    const storesData: Store[] = [
      {
        id: 'store_padaria_macacu',
        ownerUid: 'merchant_padaria_macacu',
        name: 'Padaria & Confeitaria Imperial',
        slug: 'padaria-imperial-macacu',
        description: 'Pães quentinhos artesanais, croissants folhados, bolos caseiros, café gourmet e lanches rápidos. Tradição no coração de Cachoeiras de Macacu.',
        category: 'Comida',
        logoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
        phone: '(21) 2649-1122',
        whatsapp: '21988881122',
        address: 'Rua Dr. Manoel de Macedo, 142',
        neighborhood: 'Centro',
        city: 'Cachoeiras de Macacu',
        openingHours: '06:00 - 21:00 (Seg a Dom)',
        isOpen: true,
        rating: 4.9,
        reviewsCount: 148,
        status: 'active',
        planId: 'plan_pro',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'store_drogaria_macacu',
        ownerUid: 'merchant_drogaria_macacu',
        name: 'Drogaria & Farmácia Central',
        slug: 'drogaria-central-macacu',
        description: 'Medicamentos com desconto, perfumaria completa, suplementos vitamínicos, cuidados infantis e entrega expressa em toda a cidade.',
        category: 'Farmácia',
        logoUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1200&auto=format&fit=crop&q=80',
        phone: '(21) 2649-3344',
        whatsapp: '21977773344',
        address: 'Av. Governador Roberto Silveira, 510',
        neighborhood: 'Papucaia',
        city: 'Cachoeiras de Macacu',
        openingHours: '07:30 - 22:30 (Todos os dias)',
        isOpen: true,
        rating: 4.8,
        reviewsCount: 96,
        status: 'active',
        planId: 'plan_pro',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'store_hortifruti_serra',
        ownerUid: 'merchant_hortifruti_serra',
        name: 'Hortifruti & Empório da Serra',
        slug: 'hortifruti-emporio-serra',
        description: 'Frutas selecionadas, verduras frescas colhidas diretamente nos sítios de Cachoeiras, queijos artesanais da serra e temperos frescos.',
        category: 'Mercado',
        logoUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80',
        phone: '(21) 2649-5566',
        whatsapp: '21999995566',
        address: 'Rua Castália Verde, 88',
        neighborhood: 'Castália',
        city: 'Cachoeiras de Macacu',
        openingHours: '07:00 - 19:30 (Seg a Sáb)',
        isOpen: true,
        rating: 4.9,
        reviewsCount: 112,
        status: 'active',
        planId: 'plan_starter',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'store_tech_macacu',
        ownerUid: 'merchant_tech_macacu',
        name: 'TechMacacu Informática & Celulares',
        slug: 'techmacacu-informatica',
        description: 'Venda de cabos, carregadores Turbo, fones Bluetooth, caixas de som JBL, suportes automotivos e manutenção rápida de computadores e smartphones.',
        category: 'Tecnologia',
        logoUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
        phone: '(21) 2649-7788',
        whatsapp: '21988887788',
        address: 'Praça Bernardino da Silva, 25',
        neighborhood: 'Centro',
        city: 'Cachoeiras de Macacu',
        openingHours: '08:30 - 18:00 (Seg a Sex)',
        isOpen: true,
        rating: 4.7,
        reviewsCount: 64,
        status: 'active',
        planId: 'plan_pro',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'store_fogao_macacu',
        ownerUid: 'merchant_fogao_macacu',
        name: 'Restaurante Fogão a Lenha Macacuense',
        slug: 'restaurante-fogao-macacu',
        description: 'A autêntica comida caseira da serra! Marmitex executivo bem servido, feijoada completa, costela no bafo e guarnições deliciosas.',
        category: 'Comida',
        logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
        phone: '(21) 2649-9900',
        whatsapp: '21999889900',
        address: 'Rua São Sebastião, 340',
        neighborhood: 'Campo do Prado',
        city: 'Cachoeiras de Macacu',
        openingHours: '11:00 - 15:30 (Seg a Dom)',
        isOpen: true,
        rating: 5.0,
        reviewsCount: 204,
        status: 'active',
        planId: 'plan_pro',
        createdAt: new Date().toISOString(),
      },
    ];

    for (const store of storesData) {
      await setDoc(doc(db, 'stores', store.id), store);
    }

    // 2. Initial Products
    const productsData: Product[] = [
      {
        id: 'prod_croissant_imperial',
        storeId: 'store_padaria_macacu',
        storeName: 'Padaria & Confeitaria Imperial',
        name: 'Croissant Folhado com Queijo e Presunto',
        description: 'Massa folhada artesanal na manteiga especial, recheio generoso de presunto nobre e queijo prato derretido.',
        category: 'Comida',
        price: 14.90,
        promoPrice: 12.90,
        inStock: true,
        stockQuantity: 45,
        sku: 'CROISS-01',
        imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
        featured: true,
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'prod_pao_queijo_porcao',
        storeId: 'store_padaria_macacu',
        storeName: 'Padaria & Confeitaria Imperial',
        name: 'Porção Pães de Queijo da Serra (6 un)',
        description: 'Feitos com polvilho artesanal e queijo curado de Macacu. Crocantes por fora e macios por dentro.',
        category: 'Comida',
        price: 16.00,
        inStock: true,
        stockQuantity: 30,
        sku: 'PDQ-06',
        imageUrl: 'https://images.unsplash.com/photo-1598142981034-7a32d1633519?w=600&auto=format&fit=crop&q=80',
        featured: true,
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'prod_bolo_cenoura_chocolate',
        storeId: 'store_padaria_macacu',
        storeName: 'Padaria & Confeitaria Imperial',
        name: 'Fatia Bolo Vulcão de Cenoura com Brigadeiro',
        description: 'Bolo fofinho de cenoura com calda cremosa de brigadeiro gourmet feita no tacho.',
        category: 'Comida',
        price: 13.50,
        inStock: true,
        stockQuantity: 20,
        sku: 'BOLO-VULC-01',
        imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
        featured: false,
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'prod_dipirona_1g',
        storeId: 'store_drogaria_macacu',
        storeName: 'Drogaria & Farmácia Central',
        name: 'Dipirona Monoidratada 1g (10 comprimidos)',
        description: 'Analgésico e antipirético de ação rápida para dores de cabeça e febre.',
        category: 'Farmácia',
        price: 8.90,
        promoPrice: 6.99,
        inStock: true,
        stockQuantity: 150,
        sku: 'MED-DIP-1G',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
        featured: false,
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'prod_protetor_solar_fps50',
        storeId: 'store_drogaria_macacu',
        storeName: 'Drogaria & Farmácia Central',
        name: 'Protetor Solar Facial Toque Seco FPS 50 (50g)',
        description: 'Proteção UVA/UVB avançada com controle de oleosidade e rápida absorção, ideal para o clima de Cachoeiras.',
        category: 'Farmácia',
        price: 49.90,
        promoPrice: 42.00,
        inStock: true,
        stockQuantity: 35,
        sku: 'DERMO-FPS50',
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
        featured: true,
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'prod_cesta_organica_serra',
        storeId: 'store_hortifruti_serra',
        storeName: 'Hortifruti & Empório da Serra',
        name: 'Cesta Hortifruti Especial da Semana',
        description: 'Contém 1kg de banana prata, 1kg de maçã gala, 500g de morangos, 1 maço de alface crespa, rúcula, cenoura e tomate italiano fresco.',
        category: 'Mercado',
        price: 38.50,
        promoPrice: 34.90,
        inStock: true,
        stockQuantity: 25,
        sku: 'CEST-HORTI-01',
        imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80',
        featured: true,
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'prod_queijo_minas_artesanal',
        storeId: 'store_hortifruti_serra',
        storeName: 'Hortifruti & Empório da Serra',
        name: 'Queijo Minas Padrão Meia Cura (500g)',
        description: 'Produzido com leite pasteurizado em fazenda local de Cachoeiras de Macacu. Sabor autêntico e textura cremosa.',
        category: 'Mercado',
        price: 26.90,
        inStock: true,
        stockQuantity: 40,
        sku: 'QUEIJO-MC-500',
        imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&auto=format&fit=crop&q=80',
        featured: false,
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'prod_carregador_turbo_type_c',
        storeId: 'store_tech_macacu',
        storeName: 'TechMacacu Informática & Celulares',
        name: 'Carregador Turbo 30W USB-C PD com Cabo Blindado',
        description: 'Carregamento ultra rápido compatível com iPhone, Samsung, Motorola e Xiaomi. Homologado Anatel com proteção contra sobretensão.',
        category: 'Tecnologia',
        price: 65.00,
        promoPrice: 55.00,
        inStock: true,
        stockQuantity: 60,
        sku: 'ACC-CARG-30W',
        imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
        featured: true,
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'prod_fone_bluetooth_anc',
        storeId: 'store_tech_macacu',
        storeName: 'TechMacacu Informática & Celulares',
        name: 'Fone de Ouvido Bluetooth TWS com Cancelamento de Ruído',
        description: 'Graves potentes, microfone para chamadas nítidas e bateria para até 28 horas com o estojo de carga.',
        category: 'Tecnologia',
        price: 119.00,
        promoPrice: 99.00,
        inStock: true,
        stockQuantity: 28,
        sku: 'FONE-TWS-BASS',
        imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
        featured: true,
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'prod_marmitex_fogao_lenha',
        storeId: 'store_fogao_macacu',
        storeName: 'Restaurante Fogão a Lenha Macacuense',
        name: 'Marmitex Executivo Caipira (Serve 1 pessoa bem)',
        description: 'Arroz branco, feijão temperado no alho, frango caipira ensopado com quiabo, farofa de milho crocante e couve refogada.',
        category: 'Comida',
        price: 24.90,
        inStock: true,
        stockQuantity: 80,
        sku: 'MARM-CAIPIRA',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        featured: true,
        status: 'active',
        createdAt: new Date().toISOString(),
      },
    ];

    for (const prod of productsData) {
      await setDoc(doc(db, 'products', prod.id), prod);
    }

    // 3. Initial Service Providers in Cachoeiras de Macacu
    const providersData: ServiceProvider[] = [
      {
        id: 'prov_eletricista_carlos',
        ownerUid: 'provider_carlos_macacu',
        name: 'Carlos Alberto - Eletricista Profissional',
        specialty: 'Eletricista Residencial & Comercial',
        category: 'Serviços',
        bio: 'Mais de 14 anos de experiência em instalações elétricas seguras em Cachoeiras de Macacu, Japuíba e Papucaia. Padrão Light, iluminação LED, quadros de distribuição e laudos técnicos.',
        avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&auto=format&fit=crop&q=80',
        phone: '(21) 98765-4321',
        whatsapp: '21987654321',
        city: 'Cachoeiras de Macacu',
        coverageArea: 'Todos os bairros (Centro, Japuíba, Papucaia, Castália, Funchal)',
        availability: 'Seg a Sáb: 07:30 às 18:00 (Plantão emergencial)',
        rating: 5.0,
        reviewsCount: 84,
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'prov_refrigeracao_roberto',
        ownerUid: 'provider_roberto_macacu',
        name: 'Roberto Ar & Refrigeração',
        specialty: 'Técnico de Ar-Condicionado & Split',
        category: 'Serviços',
        bio: 'Instalação com tubulação de cobre e vácuo técnico, higienização profunda antibacteriana de ar-condicionado e conserto de geladeiras e freezers.',
        avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80',
        phone: '(21) 97654-3210',
        whatsapp: '21976543210',
        city: 'Cachoeiras de Macacu',
        coverageArea: 'Cachoeiras de Macacu e Guapimirim',
        availability: 'Seg a Sex: 08:00 às 17:30',
        rating: 4.9,
        reviewsCount: 52,
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'prov_estetica_ana',
        ownerUid: 'provider_ana_macacu',
        name: 'Ana Paula Studio & Nails Delivery',
        specialty: 'Manicure, Pedicure & Alongamento em Gel',
        category: 'Beleza',
        bio: 'Atendimento com horário marcado no conforto da sua residência em Cachoeiras de Macacu. Materiais esterilizados em autoclave hospitalar.',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&auto=format&fit=crop&q=80',
        phone: '(21) 99123-4567',
        whatsapp: '21991234567',
        city: 'Cachoeiras de Macacu',
        coverageArea: 'Centro, Castália, Papucaia e proximidades',
        availability: 'Terça a Sábado: 09:00 às 19:00',
        rating: 4.9,
        reviewsCount: 68,
        status: 'active',
        createdAt: new Date().toISOString(),
      },
    ];

    for (const prov of providersData) {
      await setDoc(doc(db, 'serviceProviders', prov.id), prov);
    }

    // 4. Initial Services
    const servicesData: ServiceItem[] = [
      {
        id: 'srv_instalacao_chuveiro',
        providerId: 'prov_eletricista_carlos',
        providerName: 'Carlos Alberto - Eletricista',
        name: 'Instalação / Substituição de Chuveiro Elétrico',
        description: 'Instalação segura com fiação dimensionada, conector cerâmico de porcelana e aterramento para evitar choques.',
        category: 'Serviços',
        estimatedPrice: 70.00,
        priceType: 'fixed',
        duration: '1 hora',
        imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'srv_revisao_eletrica_quadro',
        providerId: 'prov_eletricista_carlos',
        providerName: 'Carlos Alberto - Eletricista',
        name: 'Revisão Geral e Balanceamento de Quadro de Disjuntores',
        description: 'Aperto dos barramentos, medição de carga, eliminação de sobrecargas e troca de disjuntores antigos.',
        category: 'Serviços',
        estimatedPrice: 150.00,
        priceType: 'from',
        duration: '2 a 3 horas',
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'srv_limpeza_split',
        providerId: 'prov_refrigeracao_roberto',
        providerName: 'Roberto Ar & Refrigeração',
        name: 'Higienização Completa de Ar Split (até 12.000 BTUs)',
        description: 'Limpeza das turbinas, serpentina, bandeja de dreno e aplicação de bactericida hospitalar com aroma suave.',
        category: 'Serviços',
        estimatedPrice: 140.00,
        priceType: 'fixed',
        duration: '1h30',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'srv_manicure_pedicure_gel',
        providerId: 'prov_estetica_ana',
        providerName: 'Ana Paula Studio & Nails',
        name: 'Combo Manicure + Pedicure com Esmaltação em Gel',
        description: 'Cutilagem perfeita, hidratação profunda, esmaltação em gel de alta durabilidade (até 20 dias intactas).',
        category: 'Beleza',
        estimatedPrice: 85.00,
        priceType: 'fixed',
        duration: '1h45',
        imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&auto=format&fit=crop&q=80',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
    ];

    for (const srv of servicesData) {
      await setDoc(doc(db, 'services', srv.id), srv);
    }

    // 5. Initial Delivery Driver
    const initialDriver: DeliveryDriver = {
      id: 'driver_marcos_moto',
      ownerUid: 'driver_marcos_moto',
      fullName: 'Marcos Vinicius de Souza',
      name: 'Marcos Vinicius (Motoboy Macacu)',
      email: 'marcos.entregas@macacu.com.br',
      phone: '(21) 98111-2233',
      cpf: '123.456.789-00',
      vehicleType: 'Moto',
      licensePlate: 'RJ-MAC1988',
      cnh: '01234567890',
      address: {
        street: 'Rua Manoel Novaes',
        number: '120',
        neighborhood: 'Centro',
        city: 'Cachoeiras de Macacu',
        state: 'RJ',
        zipCode: '28680-000',
      },
      acceptedTerms: true,
      acceptedTermsAt: new Date().toISOString(),
      termsConsentDetails: 'Aceite registrado no credenciamento inicial da plataforma v1.0',
      isOnline: true,
      rating: 4.95,
      completedDeliveries: 312,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'deliveryDrivers', initialDriver.id), initialDriver);

    // 6. Initial Workers
    const initialWorker: Worker = {
      id: 'worker_atendimento_juliana',
      uid: 'worker_juliana_uid',
      name: 'Juliana Costa',
      email: 'juliana.atendimento@conectai.app.br',
      department: 'atendimento',
      permissions: ['view_customers', 'chat_support', 'view_orders', 'resolve_tickets'],
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'workers', initialWorker.id), initialWorker);

    // 7. Initial Platform Settings
    await setDoc(doc(db, 'platformSettings', 'global'), DEFAULT_PLATFORM_SETTINGS);

    console.info('✅ Dados de Cachoeiras de Macacu semeados com sucesso no Firebase!');
    return true;
  } catch (error) {
    console.warn('Aviso não-bloqueante na semeação inicial no Firestore:', error);
    return false;
  }
}
