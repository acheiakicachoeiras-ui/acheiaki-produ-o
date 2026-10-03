export type UserRole =
  | 'super_admin'
  | 'merchant'
  | 'manager'
  | 'seller'
  | 'service_provider'
  | 'driver'
  | 'staff'
  | 'client'
  // Backwards compatibility aliases
  | 'master'
  | 'customer'
  | 'provider'
  | 'worker';

export type UserStatus = 'active' | 'suspended' | 'pending';

export interface Address {
  id: string;
  label: string; // e.g. "Casa", "Trabalho"
  street: string;
  number: string;
  complement?: string;
  neighborhood: string; // Bairro de Cachoeiras de Macacu
  city: string;
  zipCode: string;
  isDefault?: boolean;
}

export interface SupabaseProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organization_id?: string | null;
  phone?: string;
  avatar_url?: string;
  city?: string;
  state?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  uid: string;
  id?: string;
  email: string;
  displayName: string;
  full_name?: string;
  phone?: string;
  role: UserRole;
  organization_id?: string | null;
  avatarUrl?: string;
  avatar_url?: string;
  status: UserStatus;
  city: string;
  state: string;
  addresses?: Address[];
  temporaryPassword?: string;
  mustChangePassword?: boolean;
  passwordChangedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StoreReputation {
  level: 'Mercado Líder Local' | 'Excelente' | 'Em Crescimento';
  onTimeRate: number; // e.g. 99%
  completedOrdersCount: number;
  ratingAverage: number;
  fastSupport: boolean;
}

export interface Store {
  id: string;
  ownerUid: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  logoUrl: string;
  bannerUrl: string;
  phone: string;
  whatsapp: string;
  address: string;
  neighborhood: string;
  city: string;
  openingHours: string;
  isOpen: boolean;
  rating: number;
  reviewsCount: number;
  status: 'active' | 'pending' | 'suspended' | 'offline';
  planId?: string;
  subscriptionDueDate?: string;
  subscriptionStatus?: 'paid' | 'pending' | 'overdue' | 'blocked';
  lastPaymentDate?: string;
  maxProductsLimit?: number;
  reputation?: StoreReputation;
  createdAt: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  storeId: string;
  storeName: string;
  name: string;
  description: string;
  category: string;
  price: number;
  promoPrice?: number;
  inStock: boolean;
  stockQuantity: number;
  sku?: string;
  imageUrl: string;
  galleryImages?: string[];
  featured?: boolean;
  installments?: string; // e.g. "3x de R$ 18,33 sem juros"
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

export interface ServiceProvider {
  id: string;
  ownerUid: string;
  name: string;
  specialty: string;
  category: string;
  bio: string;
  avatarUrl: string;
  coverUrl?: string;
  phone: string;
  whatsapp?: string;
  city: string;
  coverageArea: string;
  availability: string;
  rating: number;
  reviewsCount: number;
  completedJobsCount?: number;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
  updatedAt?: string;
}

export interface ServiceItem {
  id: string;
  providerId: string;
  providerName: string;
  name: string;
  description: string;
  category: string;
  estimatedPrice: number;
  priceType: 'fixed' | 'from' | 'quote';
  duration?: string;
  imageUrl?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export type ServiceRequestStatus =
  | 'pending'
  | 'accepted'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface ServiceRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  providerId: string;
  providerName: string;
  serviceId: string;
  serviceTitle: string;
  description: string;
  preferredDate?: string;
  address: string;
  agreedValue: number;
  platformFee: number;
  netValue: number;
  status: ServiceRequestStatus;
  createdAt: string;
  updatedAt?: string;
}

export type OrderStatus =
  | 'pending_payment'
  | 'payment_confirmed'
  | 'received'
  | 'preparing'
  | 'ready_for_pickup'
  | 'driver_assigned'
  | 'collected'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedNotes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  category?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  storeId: string;
  storeName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  platformCommission: number;
  merchantPayout: number;
  sellerCommission?: number; // for sellers
  status: OrderStatus;
  deliveryAddress: Address;
  paymentMethod: 'pix' | 'credit_card' | 'cash';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  deliveryId?: string;
  driverId?: string;
  driverName?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type DeliveryStatus =
  | 'requested'
  | 'accepted'
  | 'arrived_pickup'
  | 'collected'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export interface Delivery {
  id: string;
  orderId: string;
  storeId: string;
  storeName: string;
  customerId: string;
  customerName: string;
  driverId?: string;
  driverName?: string;
  pickupAddress: string;
  deliveryAddress: string;
  fee: number;
  driverEarnings: number;
  status: DeliveryStatus;
  pickupTime?: string;
  deliveredTime?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StructuredAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  complement?: string;
}

export interface Merchant {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  corporateReason: string;
  cnpj: string;
  storeName: string;
  address: StructuredAddress;
  category: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  acceptedTerms: boolean;
  acceptedTermsAt: string;
  termsConsentDetails: string | Record<string, any>;
  ownerUid?: string;
  temporaryPassword?: string;
  mustChangePassword?: boolean;
  passwordChangedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DeliveryDriver {
  id: string;
  ownerUid?: string;
  fullName: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  vehicleType: 'Moto' | 'Carro' | 'Bicicleta' | 'moto' | 'bike' | 'car';
  licensePlate?: string;
  cnh?: string;
  address: StructuredAddress;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'active' | 'pending' | 'suspended';
  acceptedTerms: boolean;
  acceptedTermsAt: string;
  termsConsentDetails: string | Record<string, any>;
  isOnline: boolean;
  rating: number;
  completedDeliveries: number;
  temporaryPassword?: string;
  mustChangePassword?: boolean;
  passwordChangedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type WorkerDepartment =
  | 'atendimento'
  | 'financeiro'
  | 'operacoes'
  | 'moderador'
  | 'suporte'
  | 'custom';

export interface Worker {
  id: string;
  uid: string;
  name: string;
  email: string;
  department: WorkerDepartment;
  permissions: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Review {
  id: string;
  authorId: string;
  authorName: string;
  targetType: 'store' | 'product' | 'service' | 'driver';
  targetId: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  text: string;
  read: boolean;
  isEncrypted?: boolean;
  isPrivate?: boolean;
  isPush?: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'order' | 'service' | 'delivery' | 'promo' | 'system' | 'chat' | 'financial';
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface PlatformSettings {
  id: string;
  appName: string;
  city: string;
  state: string;
  merchantCommissionRate: number; // e.g. 0.10 for 10%
  providerCommissionRate: number; // e.g. 0.12 for 12%
  defaultDeliveryFee: number; // e.g. 5.00
  currency: string;
  supportPhone: string;
  supportEmail: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  operatorUid: string;
  operatorEmail: string;
  action: string;
  targetEntity: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  itemType: 'store' | 'product' | 'service';
  itemId: string;
  title: string;
  imageUrl?: string;
  subtitle?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  category: 'pedido' | 'pagamento' | 'entrega' | 'loja' | 'servico' | 'cadastro' | 'seguranca' | 'outros';
  subject: string;
  message: string;
  status: 'aberto' | 'em_analise' | 'respondido' | 'resolvido';
  response?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SaaSPlan {
  id: string;
  name: string;
  target: 'merchant' | 'provider' | 'enterprise';
  monthlyPrice: number;
  commissionDiscount: number;
  marketplaceFeeRate: number; // e.g. 0.08 for 8%
  sellerCommissionRate: number; // e.g. 0.20 (vendedor ganha 20% do plano)
  features: string[];
  maxProducts: number;
  bannerCredits: number;
  recommended?: boolean;
  description?: string;
  freeTrialDays?: number;
  discountPercent?: number;
  isPromotional?: boolean;
}

export interface Seller {
  id: string;
  uid?: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  temporaryPassword: string; // 6 chars: uppercase, lowercase, numbers, specials
  mustChangePassword: boolean;
  commissionSalesRate: number; // e.g. 0.04 (4% das vendas)
  commissionPlansRate: number; // e.g. 0.20 (20% das vendas de planos SaaS)
  commissionBannersRate: number; // e.g. 0.15 (15% das vendas de banners)
  assignedStoreIds: string[];
  status: 'active' | 'inactive' | 'pending';
  monthlyGoal: number; // e.g. 15000.00
  totalSalesAccumulated: number;
  totalCommissionsPaid: number;
  createdAt: string;
  updatedAt?: string;
}

export interface BannerPricingSetting {
  id: string;
  title: string;
  location: 'home_top' | 'home_middle' | 'sidebar' | 'category';
  description: string;
  dimensions: string;
  weeklyPrice: number;
  monthlyPrice: number;
  sellerCommissionRate: number; // e.g. 0.15 (15% para o vendedor)
  active: boolean;
  maxSlots: number;
  activeBookingsCount: number;
  promoText?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
  discountPercent?: number;
  isExemptFee?: boolean;
  isFreeAccess?: boolean;
  freeAccessDays?: number;
  startDate?: string;
  endDate?: string;
  updatedAt: string;
}
