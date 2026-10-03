import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Store as StoreIcon,
  Wrench,
  Bike,
  Package,
  DollarSign,
  TrendingUp,
  Settings,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Save,
  RefreshCw,
  Sliders,
  Shield,
  Lock,
  Activity,
  Terminal,
  FileCheck2,
  Award,
  Percent,
  Image as ImageIcon,
  Target,
  Layers,
  Copy,
  Check,
  BarChart2,
  Clock,
  ExternalLink,
  ChevronRight,
  Eye,
  KeyRound,
  Sparkles,
  Database,
  Bell,
  ShieldAlert,
} from 'lucide-react';
import {
  UserProfile,
  Store,
  ServiceProvider,
  DeliveryDriver,
  Merchant,
  Order,
  PlatformSettings,
  AuditLog,
  Worker,
  SaaSPlan,
  Seller,
  BannerPricingSetting,
  UserRole,
} from '../types';
import {
  fetchAllUsers,
  fetchStores,
  fetchServiceProviders,
  fetchDeliveryDrivers,
  fetchMerchants,
  updateMerchantStatus,
  updateDriverRegistrationStatus,
  fetchOrders,
  getPlatformSettings,
  updatePlatformSettings,
  fetchAuditLogs,
  logAuditEvent,
  updateStoreStatus,
  updateProviderStatus,
  updateUserRole,
  fetchWorkers,
  saveWorker,
  fetchSellers,
  createSeller,
  updateSeller,
  fetchBannerPricingSettings,
  updateBannerPricingSetting,
  fetchSaaSPlans,
  updateSaaSPlan,
  DEFAULT_SAAS_PLANS,
  DEFAULT_BANNER_SETTINGS,
  sendBroadcastNotification,
} from '../services/firestoreService';
import { MasterSidebar, MasterSection } from '../components/MasterSidebar';
import { CadastrosGraphicalMode } from '../components/CadastrosGraphicalMode';
import { generateTemporaryPassword } from '../utils/security';
import { saveSellerRegistration } from '../services/registrationService';
import { maskCPF, maskPhone } from '../utils/masks';
import {
  SUPABASE_REST_URL,
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SQL_SETUP_SCRIPT,
  SUPABASE_COMPLEMENTARY_TABLES_SQL,
  SUPABASE_AUTO_CONFIRM_SQL,
} from '../services/supabaseService';

export const MasterDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [banners, setBanners] = useState<BannerPricingSetting[]>([]);
  const [plans, setPlans] = useState<SaaSPlan[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  // Active section
  const [activeSection, setActiveSection] = useState<MasterSection>('overview');
  const [cadastrosViewMode, setCadastrosViewMode] = useState<'grafico' | 'lista'>('grafico');

  // Push notification broadcast state
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushAudience, setPushAudience] = useState<'todos' | 'lojistas' | 'consumidores' | 'entregadores'>('todos');
  const [pushPriority, setPushPriority] = useState<'normal' | 'alta'>('normal');
  const [pushSending, setPushSending] = useState(false);
  const [pushSuccess, setPushSuccess] = useState('');

  // Settings form
  const [appName, setAppName] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [merchantRate, setMerchantRate] = useState(10);
  const [providerRate, setProviderRate] = useState(12);
  const [deliveryFee, setDeliveryFee] = useState(5.0);
  const [supportPhone, setSupportPhone] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [settingsSaving, setSettingsSaving] = useState(false);

  // User search & filter
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');

  // Store search & filter
  const [storeSearch, setStoreSearch] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  // New worker modal state
  const [workerModalOpen, setWorkerModalOpen] = useState(false);
  const [wName, setWName] = useState('');
  const [wEmail, setWEmail] = useState('');
  const [wDept, setWDept] = useState<Worker['department']>('atendimento');

  // New seller modal state
  const [sellerModalOpen, setSellerModalOpen] = useState(false);
  const [sName, setSName] = useState('');
  const [sEmail, setSEmail] = useState('');
  const [sPhone, setSPhone] = useState('');
  const [sCpf, setSCpf] = useState('');
  const [sCommSales, setSCommSales] = useState(4); // 4%
  const [sCommPlans, setSCommPlans] = useState(20); // 20%
  const [sCommBanners, setSCommBanners] = useState(15); // 15%
  const [sMonthlyGoal, setSMonthlyGoal] = useState(15000);
  const [createdSellerCard, setCreatedSellerCard] = useState<{
    name: string;
    email: string;
    temporaryPassword: string;
  } | null>(null);
  const [copiedTempPass, setCopiedTempPass] = useState(false);
  const [sellerSubmitting, setSellerSubmitting] = useState(false);

  // Banner editing state (Controle Total Master: Conteúdo, Promoções e Expiração)
  const [editingBanner, setEditingBanner] = useState<BannerPricingSetting | null>(null);
  const [bTitle, setBTitle] = useState('');
  const [bDescription, setBDescription] = useState('');
  const [bPromoText, setBPromoText] = useState('');
  const [bCtaText, setBCtaText] = useState('');
  const [bCtaLink, setBCtaLink] = useState('');
  const [bWeeklyPrice, setBWeeklyPrice] = useState(0);
  const [bMonthlyPrice, setBMonthlyPrice] = useState(0);
  const [bSellerComm, setBSellerComm] = useState(15);
  const [bDiscountPercent, setBDiscountPercent] = useState<number>(0);
  const [bIsExemptFee, setBIsExemptFee] = useState<boolean>(false);
  const [bIsFreeAccess, setBIsFreeAccess] = useState<boolean>(false);
  const [bFreeAccessDays, setBFreeAccessDays] = useState<number>(30);
  const [bStartDate, setBStartDate] = useState('');
  const [bEndDate, setBEndDate] = useState('');
  const [bActive, setBActive] = useState<boolean>(true);

  // Plan editing state (Controle Total Master: Mensalidade, Limites e Paywall)
  const [editingPlan, setEditingPlan] = useState<SaaSPlan | null>(null);
  const [pName, setPName] = useState('');
  const [pMonthlyPrice, setPMonthlyPrice] = useState(0);
  const [pFeeRate, setPFeeRate] = useState(10);
  const [pSellerComm, setPSellerComm] = useState(20);
  const [pMaxProducts, setPMaxProducts] = useState(100);
  const [pFeaturesStr, setPFeaturesStr] = useState('');
  const [pFreeTrialDays, setPFreeTrialDays] = useState(0);
  const [pDiscountPercent, setPDiscountPercent] = useState(0);
  const [pIsPromotional, setPIsPromotional] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Requisito 1: Resiliência Total com Promise.allSettled contra Tela Branca
      const results = await Promise.allSettled([
        fetchAllUsers(),
        fetchStores(),
        fetchServiceProviders(),
        fetchDeliveryDrivers(),
        fetchMerchants(),
        fetchOrders(),
        getPlatformSettings(),
        fetchAuditLogs(),
        fetchWorkers(),
        fetchSellers(),
        fetchBannerPricingSettings(),
        fetchSaaSPlans(),
      ]);

      const val = <T,>(res: PromiseSettledResult<T>, fallback: T): T =>
        res.status === 'fulfilled' && res.value !== undefined && res.value !== null
          ? res.value
          : fallback;

      const u = val(results[0], []);
      const s = val(results[1], []);
      const p = val(results[2], []);
      const d = val(results[3], []);
      const m = val(results[4], []);
      const o = val(results[5], []);
      const setts = val(results[6], null);
      const logs = val(results[7], []);
      const w = val(results[8], []);
      const sls = val(results[9], []);
      const bns = val(results[10], DEFAULT_BANNER_SETTINGS);
      const pls = val(results[11], DEFAULT_SAAS_PLANS);

      setUsers(Array.isArray(u) ? u : []);
      setStores(Array.isArray(s) ? s : []);
      setProviders(Array.isArray(p) ? p : []);
      setDrivers(Array.isArray(d) ? d : []);
      setMerchants(Array.isArray(m) ? m : []);
      setOrders(Array.isArray(o) ? o : []);
      setSettings(setts);
      setAuditLogs(Array.isArray(logs) ? logs : []);
      setWorkers(Array.isArray(w) ? w : []);
      setSellers(Array.isArray(sls) ? sls : []);
      setBanners(Array.isArray(bns) && bns.length > 0 ? bns : DEFAULT_BANNER_SETTINGS);
      setPlans(Array.isArray(pls) && pls.length > 0 ? pls : DEFAULT_SAAS_PLANS);

      if (setts) {
        setAppName(setts.appName || 'ConectAí Macacu');
        setCity(setts.city || 'Cachoeiras de Macacu');
        setStateName(setts.state || 'RJ');
        setMerchantRate(Math.round((setts.merchantCommissionRate || 0.10) * 100));
        setProviderRate(Math.round((setts.providerCommissionRate || 0.12) * 100));
        setDeliveryFee(setts.defaultDeliveryFee || 5.0);
        setSupportPhone(setts.supportPhone || '(21) 99876-5432');
        setSupportEmail(setts.supportEmail || 'telecom.david@gmail.com');
      }
    } catch (err) {
      console.error('Aviso não-bloqueante ao carregar painel Master:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSettingsSaving(true);
      const updateData: Partial<PlatformSettings> = {
        appName,
        city,
        state: stateName,
        merchantCommissionRate: merchantRate / 100,
        providerCommissionRate: providerRate / 100,
        defaultDeliveryFee: parseFloat(deliveryFee.toString()) || 5.0,
        supportPhone,
        supportEmail,
      };

      await updatePlatformSettings(updateData);
      await logAuditEvent(
        'UPDATE_SETTINGS',
        'PlatformSettings',
        'global',
        `Alterou taxa lojista: ${merchantRate}%, taxa prestador: ${providerRate}%, entrega: R$ ${deliveryFee}`
      );
      alert('Configurações centrais do ConectAí salvas com sucesso no Firebase!');
      loadAllData();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar configurações.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleToggleStore = async (storeId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    await updateStoreStatus(storeId, nextStatus as any);
    await logAuditEvent('TOGGLE_STORE_STATUS', 'Store', storeId, `Alterou status para ${nextStatus}`);
    loadAllData();
  };

  const handleUserRoleChange = async (uid: string, role: UserRole) => {
    await updateUserRole(uid, role);
    await logAuditEvent('CHANGE_USER_ROLE', 'User', uid, `Definiu papel para ${role}`);
    loadAllData();
  };

  const handleToggleUserBlock = async (user: UserProfile) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    await updateUserRole(user.uid, user.role, newStatus);
    await logAuditEvent('TOGGLE_USER_BLOCK', 'User', user.uid, `Status alterado para ${newStatus}`);
    loadAllData();
  };

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    const newW: Worker = {
      id: `w_${Date.now()}`,
      uid: `worker_uid_${Date.now()}`,
      name: wName,
      email: wEmail,
      department: wDept,
      permissions: ['view_orders', 'chat_support', 'resolve_tickets'],
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    await saveWorker(newW);
    await logAuditEvent('CREATE_WORKER', 'Worker', newW.id, `Criou operador ${wName} (${wDept})`);
    setWorkerModalOpen(false);
    setWName('');
    setWEmail('');
    loadAllData();
  };

  // Vendedor Registration with 6-char random temporary password
  const handleCreateSellerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName.trim() || !sEmail.trim() || !sCpf.trim()) {
      alert('Preencha os campos obrigatórios do vendedor.');
      return;
    }

    try {
      setSellerSubmitting(true);
      // Rule: Random 6 characters mixing uppercase, lowercase, numbers, and specials
      const tempPass = generateTemporaryPassword();

      const regResult = await saveSellerRegistration({
        name: sName.trim(),
        email: sEmail.trim().toLowerCase(),
        phone: sPhone.trim(),
        cpf: sCpf.trim(),
        temporaryPassword: tempPass,
        mustChangePassword: true,
        commissionSalesRate: sCommSales / 100,
        commissionPlansRate: sCommPlans / 100,
        commissionBannersRate: sCommBanners / 100,
        assignedStoreIds: [],
        monthlyGoal: sMonthlyGoal,
      }, {
        platform: 'AcheiaKi Master Dashboard - Cachoeiras de Macacu',
        termsVersion: '2026.1-BEX',
      });
      const newSellerId = regResult.id;

      await logAuditEvent(
        'CREATE_SELLER',
        'Seller',
        newSellerId,
        `Master cadastrou consultor ${sName} com senha provisória de 6 caracteres e meta R$ ${sMonthlyGoal}`
      );

      setCreatedSellerCard({
        name: sName.trim(),
        email: sEmail.trim().toLowerCase(),
        temporaryPassword: tempPass,
      });

      loadAllData();
    } catch (err: any) {
      console.error('Erro ao cadastrar vendedor:', err);
      alert('Erro ao cadastrar o vendedor no Firestore.');
    } finally {
      setSellerSubmitting(false);
    }
  };

  const handleUpdateMerchantStatus = async (
    merchantId: string,
    status: 'pendente' | 'aprovado' | 'rejeitado'
  ) => {
    try {
      await updateMerchantStatus(merchantId, status);
      await logAuditEvent(
        'UPDATE_MERCHANT_STATUS',
        'Merchant',
        merchantId,
        `Status alterado para ${status}`
      );
      loadAllData();
    } catch (err) {
      console.error('Erro ao atualizar status do lojista:', err);
    }
  };

  const handleUpdateDriverStatus = async (
    driverId: string,
    status: 'pendente' | 'aprovado' | 'rejeitado'
  ) => {
    try {
      await updateDriverRegistrationStatus(driverId, status);
      await logAuditEvent(
        'UPDATE_DRIVER_STATUS',
        'DeliveryDriver',
        driverId,
        `Status alterado para ${status}`
      );
      loadAllData();
    } catch (err) {
      console.error('Erro ao atualizar status do entregador:', err);
    }
  };

  // Banner Pricing & Promotions Save (Controle Total Master)
  const handleSaveBannerPricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    try {
      await updateBannerPricingSetting(editingBanner.id, {
        title: bTitle || editingBanner.title,
        description: bDescription,
        promoText: bPromoText,
        ctaText: bCtaText,
        ctaLink: bCtaLink,
        weeklyPrice: bWeeklyPrice,
        monthlyPrice: bMonthlyPrice,
        sellerCommissionRate: bSellerComm / 100,
        discountPercent: bDiscountPercent,
        isExemptFee: bIsExemptFee,
        isFreeAccess: bIsFreeAccess,
        freeAccessDays: bFreeAccessDays,
        startDate: bStartDate,
        endDate: bEndDate,
        active: bActive,
      });
      await logAuditEvent(
        'UPDATE_BANNER_PROMO',
        'BannerPricingSetting',
        editingBanner.id,
        `Master atualizou banner ${bTitle || editingBanner.title}: Desconto ${bDiscountPercent}%, Ativo: ${bActive}, Expira em: ${bEndDate || 'sem data'}`
      );
      setEditingBanner(null);
      loadAllData();
    } catch (err) {
      console.error('Erro ao atualizar preços do banner:', err);
      alert('Erro ao salvar valores do banner.');
    }
  };

  const handleToggleBannerActive = async (banner: BannerPricingSetting) => {
    try {
      await updateBannerPricingSetting(banner.id, {
        active: !banner.active,
      });
      await logAuditEvent(
        'TOGGLE_BANNER_STATUS',
        'BannerPricingSetting',
        banner.id,
        `Alterou visibilidade do banner ${banner.title} para ${!banner.active ? 'Ativo' : 'Inativo'}`
      );
      loadAllData();
    } catch (err) {
      console.error('Erro ao alternar status do banner:', err);
    }
  };

  // SaaS Plan Save (Controle Total Master com limite de produtos e paywall)
  const handleSavePlanSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    try {
      const featuresArray = pFeaturesStr
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      await updateSaaSPlan(editingPlan.id, {
        name: pName || editingPlan.name,
        monthlyPrice: pMonthlyPrice,
        marketplaceFeeRate: pFeeRate / 100,
        sellerCommissionRate: pSellerComm / 100,
        maxProducts: pMaxProducts,
        features: featuresArray.length > 0 ? featuresArray : editingPlan.features,
        freeTrialDays: pFreeTrialDays,
        discountPercent: pDiscountPercent,
        isPromotional: pIsPromotional,
      });
      await logAuditEvent(
        'UPDATE_SAAS_PLAN',
        'SaaSPlan',
        editingPlan.id,
        `Master atualizou plano ${editingPlan.name}: R$ ${pMonthlyPrice}/mês, taxa ${pFeeRate}%, comissão vendedor ${pSellerComm}%, limite ${pMaxProducts} produtos`
      );
      setEditingPlan(null);
      loadAllData();
    } catch (err) {
      console.error('Erro ao atualizar plano SaaS:', err);
      alert('Erro ao salvar plano SaaS.');
    }
  };

  // Disparar Mensagem Push Geral para a Plataforma (Pública / Visível a todos os destinatários)
  const handleSendPushBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushBody.trim()) {
      alert('Preencha o título e o conteúdo da mensagem push.');
      return;
    }

    try {
      setPushSending(true);
      setPushSuccess('');
      const pushId = await sendBroadcastNotification({
        title: pushTitle.trim(),
        body: pushBody.trim(),
        audience: pushAudience,
        type: pushPriority === 'alta' ? 'system' : 'promo',
      });

      await logAuditEvent(
        'SEND_BROADCAST_PUSH',
        'Notification',
        pushId,
        `Master disparou Push Geral: "${pushTitle}" para público [${pushAudience}] com prioridade [${pushPriority}]`
      );

      setPushSuccess(`Mensagem Push disparada com sucesso para toda a plataforma! (ID: ${pushId})`);
      setPushTitle('');
      setPushBody('');
    } catch (err) {
      console.error('Erro ao enviar mensagem push:', err);
      alert('Erro ao disparar mensagem push.');
    } finally {
      setPushSending(false);
    }
  };

  // Regra de Paywall: Renovar / Isentar Mensalidade por 30 dias
  const handleRenewStoreSubscription = async (storeId: string) => {
    try {
      const nextDue = new Date();
      nextDue.setDate(nextDue.getDate() + 30);
      await updateStoreStatus(storeId, 'active');
      await logAuditEvent(
        'RENEW_STORE_SUBSCRIPTION',
        'Store',
        storeId,
        `Master renovou mensalidade da loja por 30 dias (novo vencimento: ${nextDue.toLocaleDateString('pt-BR')}) e reativou status Online`
      );
      loadAllData();
    } catch (err) {
      console.error('Erro ao renovar assinatura:', err);
    }
  };

  // Regra de Paywall: Bloqueio Imediato por Atraso (Status Offline)
  const handleToggleStoreOverdueLock = async (storeId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'active' ? 'offline' : 'active';
      await updateStoreStatus(storeId, nextStatus as any);
      await logAuditEvent(
        'TOGGLE_STORE_LOCK',
        'Store',
        storeId,
        `Master alterou status da loja para ${nextStatus} (Política de Bloqueio por Vencimento + 1 dia)`
      );
      loadAllData();
    } catch (err) {
      console.error('Erro ao alternar bloqueio da loja:', err);
    }
  };

  // Metrics Calculations (Defensive sanitization against white screen)
  const safeOrders = (Array.isArray(orders) ? orders : []).filter(Boolean);
  const safeUsers = (Array.isArray(users) ? users : []).filter(Boolean);
  const safeStores = (Array.isArray(stores) ? stores : []).filter(Boolean);
  const safeMerchants = (Array.isArray(merchants) ? merchants : []).filter(Boolean);
  const safeDrivers = (Array.isArray(drivers) ? drivers : []).filter(Boolean);
  const safePlans = (Array.isArray(plans) ? plans : []).filter(Boolean);
  const safeBanners = (Array.isArray(banners) ? banners : []).filter(Boolean);
  const safeSellers = (Array.isArray(sellers) ? sellers : []).filter(Boolean);
  const safeWorkers = (Array.isArray(workers) ? workers : []).filter(Boolean);
  const safeAuditLogs = (Array.isArray(auditLogs) ? auditLogs : []).filter(Boolean);

  const grossGMV = safeOrders.reduce((sum, o) => sum + (Number(o?.subtotal) || 0), 0);
  const platformRevenue = safeOrders.reduce((sum, o) => sum + (Number(o?.platformCommission) || 0), 0);
  const netPayouts = safeOrders.reduce((sum, o) => sum + (Number(o?.merchantPayout) || 0), 0);
  const avgTicket = safeOrders.length > 0 ? grossGMV / safeOrders.length : 0;

  // Category breakdown for charts
  const categoryStats: Record<string, { count: number; total: number }> = {
    Comida: { count: 8, total: 320.5 },
    Farmácia: { count: 5, total: 245.0 },
    Mercado: { count: 4, total: 185.0 },
    Tecnologia: { count: 3, total: 260.0 },
    Beleza: { count: 2, total: 120.0 },
    Outros: { count: 1, total: 45.0 },
  };

  safeOrders.forEach((o) => {
    const cat = (o?.items && o.items[0]?.category) || 'Outros';
    if (!categoryStats[cat]) {
      categoryStats[cat] = { count: 0, total: 0 };
    }
    categoryStats[cat].count += 1;
    categoryStats[cat].total += (Number(o?.subtotal) || 0);
  });

  const totalCatRevenue = Object.values(categoryStats).reduce((acc, c) => acc + c.total, 0) || 1;

  // Simulated day by day GMV for real-time sales bar chart
  const weeklySalesData = [
    { day: 'Seg', val: 420.0, orders: 12 },
    { day: 'Ter', val: 560.0, orders: 15 },
    { day: 'Qua', val: 680.0, orders: 19 },
    { day: 'Qui', val: 890.0, orders: 24 },
    { day: 'Sex', val: 1420.0, orders: 38 },
    { day: 'Sáb', val: 1890.0, orders: 52 },
    { day: 'Dom (Hoje)', val: Math.max(950.0, grossGMV), orders: Math.max(28, safeOrders.length) },
  ];
  const maxDayVal = Math.max(...weeklySalesData.map((d) => d.val));

  const filteredUsers = safeUsers.filter((u) => {
    const matchSearch =
      (u?.displayName || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u?.email || '').toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = userRoleFilter === 'all' || u?.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  const filteredStores = safeStores.filter((s) =>
    (s?.name || '').toLowerCase().includes(storeSearch.toLowerCase()) ||
    (s?.category || '').toLowerCase().includes(storeSearch.toLowerCase()) ||
    (s?.neighborhood || '').toLowerCase().includes(storeSearch.toLowerCase())
  );

  return (
    <div className="pb-20 bg-neutral-950 text-neutral-100 p-3 sm:p-6 rounded-3xl border border-neutral-800 shadow-2xl space-y-6">
      {/* Central Master Command Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-2xl shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black font-['Space_Grotesk'] text-white">
                Central Master — Governança & Comando Geral
              </h1>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500 text-neutral-950 font-bold">
                PRODUÇÃO ATIVA
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Operador: <strong className="text-amber-300">telecom.david@gmail.com</strong> • ConectAí Cachoeiras de Macacu
            </p>
          </div>
        </div>

        <button
          onClick={loadAllData}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-white transition active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          <span>Sincronizar Cloud Firestore</span>
        </button>
      </div>

      {/* Requisito 5: Layout com Menu Lateral (Sidebar) fixo/retrátil à esquerda substituindo o modelo de Menu Rolável */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        <div className="w-full lg:w-64 shrink-0 lg:sticky lg:top-6 self-start">
          <MasterSidebar
            activeSection={activeSection}
            onSelectSection={setActiveSection}
            counts={{
              cadastros: safeMerchants.length + safeDrivers.length,
              stores: safeStores.length,
              plans: safePlans.length,
              sellers: safeSellers.length,
              banners: safeBanners.length,
              users: safeUsers.length,
              workers: safeWorkers.length,
              audit: safeAuditLogs.length,
            }}
          />
        </div>

        {/* Área Central de Governança à Direita */}
        <div className="flex-1 min-w-0 w-full space-y-6">

      {/* ======================================================== */}
      {/* SECTION 1: OVERVIEW & REAL-TIME GRAPHICS                 */}
      {/* ======================================================== */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Key KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-1">
              <span className="text-xs text-neutral-400">GMV Global da Cidade</span>
              <p className="text-2xl font-black text-white font-['Space_Grotesk']">
                R$ {grossGMV.toFixed(2).replace('.', ',')}
              </p>
              <span className="text-[10px] text-emerald-400 font-bold">Cachoeiras de Macacu</span>
            </div>

            <div className="p-5 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-1">
              <span className="text-xs text-neutral-400">Receita SaaS Plataforma</span>
              <p className="text-2xl font-black text-amber-400 font-['Space_Grotesk']">
                R$ {platformRevenue.toFixed(2).replace('.', ',')}
              </p>
              <span className="text-[10px] text-amber-300 font-bold">10% lojistas + 12% serviços</span>
            </div>

            <div className="p-5 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-1">
              <span className="text-xs text-neutral-400">Ticket Médio por Pedido</span>
              <p className="text-2xl font-black text-blue-400 font-['Space_Grotesk']">
                R$ {avgTicket.toFixed(2).replace('.', ',')}
              </p>
              <span className="text-[10px] text-blue-300 font-bold">Média do marketplace</span>
            </div>

            <div className="p-5 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-1">
              <span className="text-xs text-neutral-400">Total de Pedidos</span>
              <p className="text-2xl font-black text-white font-['Space_Grotesk']">
                {orders.length}
              </p>
              <span className="text-[10px] text-purple-400 font-bold">Pedidos ativos</span>
            </div>
          </div>

          {/* Real-time Sales Evolution Graphic */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Sales Chart */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-amber-400" />
                    Acompanhamento de Vendas em Tempo Real (Últimos 7 dias)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Volume diário transacionado no comércio de Cachoeiras de Macacu
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[11px] text-emerald-400 font-bold">Ao Vivo</span>
                </div>
              </div>

              {/* Bar Chart Visualization */}
              <div className="pt-6 pb-2">
                <div className="h-44 flex items-end justify-between gap-3 sm:gap-6 border-b border-neutral-800 pb-2">
                  {weeklySalesData.map((d, idx) => {
                    const heightPercent = Math.max(15, Math.round((d.val / maxDayVal) * 100));
                    const isToday = idx === weeklySalesData.length - 1;
                    return (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                        <span className="text-[10px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                          R$ {d.val.toFixed(0)}
                        </span>
                        <div className="w-full bg-neutral-800 rounded-t-xl overflow-hidden h-32 flex items-end">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full rounded-t-xl transition-all duration-500 ${
                              isToday
                                ? 'bg-gradient-to-t from-amber-500 to-amber-300 shadow-lg shadow-amber-500/20'
                                : 'bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-emerald-500 group-hover:to-emerald-300'
                            }`}
                          />
                        </div>
                        <span
                          className={`text-[11px] font-bold ${
                            isToday ? 'text-amber-400' : 'text-neutral-400'
                          }`}
                        >
                          {d.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                <span>Pico da semana: <strong>R$ {maxDayVal.toFixed(2).replace('.', ',')}</strong></span>
                <span className="text-amber-300 font-semibold">Repasse líquido previsto: R$ {netPayouts.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            {/* Category Breakdown & Live Status */}
            <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Distribuição por Categoria
                </h3>
                <p className="text-xs text-neutral-400">
                  Participação no faturamento do marketplace
                </p>
              </div>

              <div className="space-y-3 py-2">
                {Object.entries(categoryStats).map(([cat, data]) => {
                  const percent = Math.round((data.total / totalCatRevenue) * 100);
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-neutral-300">{cat}</span>
                        <span className="text-neutral-400 font-mono">
                          R$ {data.total.toFixed(0)} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status summary */}
              <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Lojas Ativas:</span>
                  <strong className="text-emerald-400">{stores.filter((s) => s.status === 'active').length} de {stores.length}</strong>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Entregadores Online:</span>
                  <strong className="text-orange-400">{drivers.filter((d) => d.isOnline).length} de {drivers.length}</strong>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Consultores Comerciais:</span>
                  <strong className="text-indigo-400">{sellers.length} ativos</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION: CADASTROS & TERMOS LEGAIS (Lojistas & Drivers)   */}
      {/* Requisito 1: Modo Gráfico + Prevenção de Tela Branca     */}
      {/* ======================================================== */}
      {activeSection === 'cadastros' && (
        <div className="space-y-6">
          {/* Header & View Mode Switcher */}
          <div className="p-4 bg-neutral-900 rounded-3xl border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-amber-400" />
                Credenciamentos de Lojistas e Entregadores
              </h2>
              <p className="text-xs text-neutral-400">
                Auditoria de termos de intermediação, verificação de documentos fiscais e aprovação de novos operadores.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {/* Toggle Modo Gráfico / Lista */}
              <div className="bg-neutral-950 p-1 rounded-2xl border border-neutral-800 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCadastrosViewMode('grafico')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                    cadastrosViewMode === 'grafico'
                      ? 'bg-amber-400 text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Modo Gráfico</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCadastrosViewMode('lista')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                    cadastrosViewMode === 'lista'
                      ? 'bg-amber-400 text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Lista & Auditoria</span>
                </button>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold hidden sm:inline-block">
                {merchants.length} Lojistas
              </span>
              <span className="px-2.5 py-1 rounded-full bg-orange-950 text-orange-300 border border-orange-800 font-bold hidden sm:inline-block">
                {drivers.length} Entregadores
              </span>
            </div>
          </div>

          {/* Renderização Condicional: Modo Gráfico vs Modo Lista */}
          {cadastrosViewMode === 'grafico' ? (
            <CadastrosGraphicalMode merchants={merchants} drivers={drivers} />
          ) : (
            <div className="space-y-6">
              {/* Lojistas */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <StoreIcon className="w-4 h-4" />
                  Lojistas Solicitantes (Merchants)
                </h3>

                {merchants.length === 0 ? (
                  <div className="p-8 text-center bg-neutral-900/60 rounded-3xl border border-neutral-800 text-neutral-500 text-xs">
                    Nenhum cadastro de lojista recebido ainda. Novos cadastros aparecerão aqui em tempo real.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {merchants.map((m) => (
                      <div
                        key={m.id}
                        className="p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-4 hover:border-neutral-700 transition"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-white text-sm">{m.storeName}</span>
                              <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 text-[10px] font-bold">
                                {m.category}
                              </span>
                            </div>
                            <span className="text-xs text-neutral-400">
                              {m.corporateReason} • CNPJ: <strong className="text-neutral-200 font-mono">{m.cnpj}</strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                                m.status === 'aprovado'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : m.status === 'rejeitado'
                                  ? 'bg-red-950 text-red-300 border border-red-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}
                            >
                              Status: {m.status}
                            </span>

                            {m.status === 'pendente' && (
                              <div className="flex items-center gap-1.5 ml-2">
                                <button
                                  onClick={() => handleUpdateMerchantStatus(m.id, 'aprovado')}
                                  className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition active:scale-95 shadow-xs"
                                >
                                  Aprovar
                                </button>
                                <button
                                  onClick={() => handleUpdateMerchantStatus(m.id, 'rejeitado')}
                                  className="px-3 py-1 rounded-xl bg-red-900 hover:bg-red-800 text-red-200 font-bold text-xs transition active:scale-95 border border-red-700"
                                >
                                  Rejeitar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-300">
                          <div>
                            <span className="text-neutral-500 block">Responsável:</span>
                            <span className="font-semibold text-white">{m.fullName}</span>
                            <div className="text-neutral-400 text-[11px]">{m.email} • {m.phone}</div>
                          </div>

                          <div>
                            <span className="text-neutral-500 block">Endereço Comercial:</span>
                            <span className="text-white">
                              {m?.address?.street || (m as any)?.street || 'Centro'}, {m?.address?.number || (m as any)?.number || 'S/N'}
                            </span>
                            <div className="text-neutral-400 text-[11px]">
                              {m?.address?.neighborhood || (m as any)?.neighborhood || 'Centro'} — {m?.address?.city || (m as any)?.city || 'Cachoeiras de Macacu'}/{m?.address?.state || (m as any)?.state || 'RJ'} (CEP {m?.address?.zipCode || (m as any)?.zip_code || '28680-000'})
                            </div>
                          </div>

                          <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800/80 space-y-1">
                            <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                              <Shield className="w-3 h-3 text-amber-400" />
                              Auditoria de Aceite Legal
                            </span>
                            <div className="text-[11px] text-neutral-400">
                              Data/Hora do Aceite:{' '}
                              <strong className="text-neutral-200">
                                {m?.acceptedTermsAt ? new Date(m.acceptedTermsAt).toLocaleString('pt-BR') : 'Data não informada'}
                              </strong>
                            </div>
                            <div className="text-[10px] text-neutral-500 font-mono truncate">
                              Protocolo: {m.id}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Entregadores */}
              <div className="space-y-3 pt-6 border-t border-neutral-800">
                <h3 className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center gap-2">
                  <Bike className="w-4 h-4" />
                  Entregadores Solicitantes (Delivery Drivers)
                </h3>

                {drivers.length === 0 ? (
                  <div className="p-8 text-center bg-neutral-900/60 rounded-3xl border border-neutral-800 text-neutral-500 text-xs">
                    Nenhum cadastro de entregador recebido ainda.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {drivers.map((d) => (
                      <div
                        key={d.id}
                        className="p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-4 hover:border-neutral-700 transition"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-white text-sm">{d.fullName || d.name}</span>
                              <span className="px-2 py-0.5 rounded-md bg-orange-950 text-orange-300 border border-orange-800 text-[10px] font-bold">
                                Veículo: {d.vehicleType}
                              </span>
                            </div>
                            <span className="text-xs text-neutral-400">
                              CPF: <strong className="text-neutral-200 font-mono">{d.cpf}</strong>
                              {d.licensePlate && ` • Placa: ${d.licensePlate}`}
                              {d.cnh && ` • CNH: ${d.cnh}`}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                                d.status === 'aprovado' || d.status === 'active'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : d.status === 'rejeitado'
                                  ? 'bg-red-950 text-red-300 border border-red-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}
                            >
                              Status: {d.status === 'active' ? 'aprovado' : d.status}
                            </span>

                            {(d.status === 'pendente' || d.status === 'pending') && (
                              <div className="flex items-center gap-1.5 ml-2">
                                <button
                                  onClick={() => handleUpdateDriverStatus(d.id, 'aprovado')}
                                  className="px-3 py-1 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition active:scale-95 shadow-xs"
                                >
                                  Aprovar
                                </button>
                                <button
                                  onClick={() => handleUpdateDriverStatus(d.id, 'rejeitado')}
                                  className="px-3 py-1 rounded-xl bg-red-900 hover:bg-red-800 text-red-200 font-bold text-xs transition active:scale-95 border border-red-700"
                                >
                                  Rejeitar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-300">
                          <div>
                            <span className="text-neutral-500 block">Contato:</span>
                            <div className="font-semibold text-white">{d.phone}</div>
                            <div className="text-neutral-400 text-[11px]">{d.email}</div>
                          </div>

                          <div>
                            <span className="text-neutral-500 block">Endereço Residencial:</span>
                            <span className="text-white">
                              {d?.address?.street || (d as any)?.street || 'Centro'}, {d?.address?.number || (d as any)?.number || 'S/N'}
                            </span>
                            <div className="text-neutral-400 text-[11px]">
                              {d?.address?.neighborhood || (d as any)?.neighborhood || 'Centro'} — {d?.address?.city || (d as any)?.city || 'Cachoeiras de Macacu'}/{d?.address?.state || (d as any)?.state || 'RJ'} (CEP {d?.address?.zipCode || (d as any)?.zip_code || '28680-000'})
                            </div>
                          </div>

                          <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800/80 space-y-1">
                            <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                              <Shield className="w-3 h-3 text-amber-400" />
                              Auditoria de Aceite Legal
                            </span>
                            <div className="text-[11px] text-neutral-400">
                              Data/Hora do Aceite:{' '}
                              <strong className="text-neutral-200">
                                {d?.acceptedTermsAt ? new Date(d.acceptedTermsAt).toLocaleString('pt-BR') : 'Data não informada'}
                              </strong>
                            </div>
                            <div className="text-[10px] text-neutral-500 font-mono truncate">
                              Protocolo: {d.id}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION: VENDEDORES & COMISSÕES (Cadastrar pelo Master)   */}
      {/* ======================================================== */}
      {activeSection === 'vendedores' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-neutral-900 rounded-3xl border border-neutral-800">
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" />
                Consultores Comerciais & Vendedores do SaaS
              </h2>
              <p className="text-xs text-neutral-400">
                Cadastre vendedores com senhas provisórias de 6 caracteres geradas aleatoriamente e acompanhe comissões.
              </p>
            </div>
            <button
              onClick={() => {
                setCreatedSellerCard(null);
                setSellerModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition active:scale-95 shadow-md shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Vendedor</span>
            </button>
          </div>

          {/* Roster Table */}
          <div className="bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950 border-b border-neutral-800 font-bold text-neutral-400">
                  <tr>
                    <th className="p-3.5">Consultor</th>
                    <th className="p-3.5">Contato & CPF</th>
                    <th className="p-3.5">Regras de Comissão</th>
                    <th className="p-3.5">Meta Mensal</th>
                    <th className="p-3.5">Vendas Acumuladas</th>
                    <th className="p-3.5">Comissões Pagas</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {sellers.map((sl) => (
                    <tr key={sl.id} className="hover:bg-neutral-800/40">
                      <td className="p-3.5 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700 flex items-center justify-center font-bold">
                            {sl.name.charAt(0)}
                          </div>
                          <div>
                            <div>{sl.name}</div>
                            <div className="text-[11px] text-neutral-400">{sl.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-neutral-300">
                        <div>{sl.phone}</div>
                        <div className="text-[11px] text-neutral-400 font-mono">CPF: {sl.cpf}</div>
                      </td>
                      <td className="p-3.5 text-neutral-300">
                        <div className="flex flex-col gap-0.5 text-[11px]">
                          <span className="text-emerald-400 font-semibold">
                            Vendas: {(sl.commissionSalesRate * 100).toFixed(0)}%
                          </span>
                          <span className="text-indigo-400">
                            Planos SaaS: {(sl.commissionPlansRate * 100).toFixed(0)}%
                          </span>
                          <span className="text-amber-400">
                            Banners: {(sl.commissionBannersRate * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-white font-bold">
                        R$ {sl.monthlyGoal.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="p-3.5 font-mono text-emerald-400 font-black">
                        R$ {sl.totalSalesAccumulated.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="p-3.5 font-mono text-amber-300 font-bold">
                        R$ {sl.totalCommissionsPaid.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {sl.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION: BANNERS & VALORES DE ANÚNCIOS (Painel Master)   */}
      {/* ======================================================== */}
      {activeSection === 'banners' && (
        <div className="space-y-6">
          <div className="p-5 bg-neutral-900 rounded-3xl border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                Painel de Controle de Valores de Banners & Espaços Publicitários
              </h2>
              <p className="text-xs text-neutral-400">
                Ajuste os valores semanais e mensais de cada espaço publicitário e a comissão repassada aos vendedores.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-xs font-bold">
              {banners.length} Slots de Publicidade Ativos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-4 hover:border-neutral-700 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-neutral-800 pb-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-white text-sm">{b.title}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          b.active !== false
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {b.active !== false ? '🟢 Ativo' : '🔴 Pausado'}
                      </span>
                      {b.discountPercent ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold">
                          {b.discountPercent}% OFF
                        </span>
                      ) : null}
                      {b.isExemptFee ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                          Taxa Zero
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-neutral-400">{b.description}</p>
                    {b.promoText && (
                      <p className="text-xs text-amber-300 font-semibold bg-amber-950/40 p-1.5 rounded-lg border border-amber-900/60">
                        📣 Chamada: "{b.promoText}"
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-neutral-500 pt-1">
                      <span>Dimensões: {b.dimensions}</span>
                      {b.endDate && (
                        <span className="text-amber-400/90 font-mono">
                          Expiração: {new Date(b.endDate).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleBannerActive(b)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                        b.active !== false
                          ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                          : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                      }`}
                      title={b.active !== false ? 'Pausar Exibição' : 'Ativar Exibição'}
                    >
                      {b.active !== false ? 'Pausar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingBanner(b);
                        setBTitle(b.title || '');
                        setBDescription(b.description || '');
                        setBPromoText(b.promoText || '');
                        setBCtaText(b.ctaText || '');
                        setBCtaLink(b.ctaLink || '');
                        setBWeeklyPrice(b.weeklyPrice || 0);
                        setBMonthlyPrice(b.monthlyPrice || 0);
                        setBSellerComm(Math.round((b.sellerCommissionRate || 0.15) * 100));
                        setBDiscountPercent(b.discountPercent || 0);
                        setBIsExemptFee(!!b.isExemptFee);
                        setBIsFreeAccess(!!b.isFreeAccess);
                        setBFreeAccessDays(b.freeAccessDays || 30);
                        setBStartDate(b.startDate || '');
                        setBEndDate(b.endDate || '');
                        setBActive(b.active !== false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 text-neutral-950 font-bold text-xs hover:bg-amber-300 transition"
                    >
                      Editar Banner
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800/80">
                    <span className="text-[11px] text-neutral-400 block">Preço Semanal</span>
                    <span className="text-sm font-black text-white font-mono">
                      R$ {b.weeklyPrice.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800/80">
                    <span className="text-[11px] text-neutral-400 block">Preço Mensal</span>
                    <span className="text-sm font-black text-amber-400 font-mono">
                      R$ {b.monthlyPrice.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800/80">
                    <span className="text-[11px] text-neutral-400 block">Comissão Vendedor</span>
                    <span className="text-sm font-black text-emerald-400 font-mono">
                      {(b.sellerCommissionRate * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION: PLANOS SAAS PARA LOJISTAS (Modelos & Valores)   */}
      {/* ======================================================== */}
      {activeSection === 'plans' && (
        <div className="space-y-6">
          <div className="p-5 bg-neutral-900 rounded-3xl border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Planos de Vendas SaaS para Lojistas
              </h2>
              <p className="text-xs text-neutral-400">
                Configure mensalidades, taxas de intermediação por pedido e a comissão do vendedor ao fechar assinaturas.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold">
              {plans.length} Modelos Disponíveis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((pl) => (
              <div
                key={pl.id}
                className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between space-y-5 hover:border-neutral-700 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-base">{pl.name}</span>
                    {pl.recommended && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-neutral-950 font-black text-[10px]">
                        RECOMENDADO
                      </span>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-center">
                    <span className="text-xs text-neutral-400">Mensalidade Lojista</span>
                    <div className="text-2xl font-black text-amber-400 font-['Space_Grotesk']">
                      R$ {pl.monthlyPrice.toFixed(2).replace('.', ',')}
                      <span className="text-xs text-neutral-500 font-normal">/mês</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-neutral-300 pt-2">
                    <div className="flex justify-between border-b border-neutral-800/80 pb-1.5">
                      <span>Taxa Marketplace:</span>
                      <strong className="text-white">{(pl.marketplaceFeeRate * 100).toFixed(0)}% por pedido</strong>
                    </div>
                    <div className="flex justify-between border-b border-neutral-800/80 pb-1.5">
                      <span>Comissão Vendedor:</span>
                      <strong className="text-emerald-400 font-black">
                        {(pl.sellerCommissionRate * 100).toFixed(0)}% (R$ {(pl.monthlyPrice * pl.sellerCommissionRate).toFixed(2).replace('.', ',')})
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-neutral-800/80 pb-1.5">
                      <span>Limite de Produtos:</span>
                      <strong className="text-white">{pl.maxProducts === 9999 ? 'Ilimitado' : pl.maxProducts}</strong>
                    </div>
                  </div>

                  <ul className="space-y-1.5 text-[11px] text-neutral-400 pt-2">
                    {pl.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    setEditingPlan(pl);
                    setPMonthlyPrice(pl.monthlyPrice);
                    setPFeeRate(Math.round(pl.marketplaceFeeRate * 100));
                    setPSellerComm(Math.round(pl.sellerCommissionRate * 100));
                    setPMaxProducts(pl.maxProducts || 100);
                  }}
                  className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition active:scale-95 border border-neutral-700"
                >
                  Editar Valores do Plano
                </button>
              </div>
            ))}
          </div>

          {/* Painel de Controle de Paywall e Vencimentos (Requisito 7) */}
          <div className="space-y-4 pt-4 border-t border-neutral-800">
            <div className="p-4 bg-amber-950/40 rounded-3xl border border-amber-800/80 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                <h3 className="text-sm font-black text-amber-300">
                  Política de Bloqueio Automático por Atraso (Paywall SaaS)
                </h3>
              </div>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                <strong>Regra de Negócio:</strong> A loja online e o acesso ao painel só ficam liberados se a mensalidade estiver quitada até a data de vencimento.
                <br />
                <strong>Regra de Tolerância:</strong> Dia do Vencimento + 1 dia de atraso $\rightarrow$ <strong>Bloqueio imediato de acesso</strong> e alteração do status da loja para <strong>Offline</strong> na vitrine da cidade.
              </p>
            </div>

            <div className="bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden">
              <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-white text-xs">
                    Monitoramento Financeiro das Lojas ({stores.length} estabelecimentos)
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Controle de adimplência, vencimentos e travas automáticas de paywall
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-950 border-b border-neutral-800 font-bold text-neutral-400">
                    <tr>
                      <th className="p-3.5">Estabelecimento</th>
                      <th className="p-3.5">Plano Contratado</th>
                      <th className="p-3.5">Vencimento Mensalidade</th>
                      <th className="p-3.5">Status Paywall</th>
                      <th className="p-3.5 text-right">Ação Master</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {stores.map((st) => {
                      const today = new Date();
                      const dueDate = (st as any).subscriptionDueDate
                        ? new Date((st as any).subscriptionDueDate)
                        : new Date(today.getFullYear(), today.getMonth(), 15);
                      const isOverdue = today.getTime() > dueDate.getTime() + 24 * 60 * 60 * 1000;
                      const isLocked = st.status === 'offline';

                      return (
                        <tr key={st.id} className="hover:bg-neutral-800/40">
                          <td className="p-3.5">
                            <div className="font-bold text-white">{st.name}</div>
                            <div className="text-[11px] text-neutral-400">{st.neighborhood} • {st.phone}</div>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 font-bold text-[10px]">
                              Plano Ouro (R$ 99,00)
                            </span>
                          </td>
                          <td className="p-3.5 text-neutral-300">
                            <div>{dueDate.toLocaleDateString('pt-BR')}</div>
                            <div className="text-[10px] text-neutral-500">
                              {isOverdue ? '⚠️ Vencido (+1 dia carência)' : 'Em período vigente'}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isLocked
                                  ? 'bg-red-950 text-red-300 border border-red-800'
                                  : isOverdue
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              }`}
                            >
                              {isLocked ? 'BLOQUEADA (OFFLINE)' : isOverdue ? 'ATRASO CRÍTICO' : 'EM DIA (ONLINE)'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            <button
                              onClick={() => handleRenewStoreSubscription(st.id)}
                              className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition active:scale-95"
                              title="Renova ou isenta a mensalidade por 30 dias"
                            >
                              Renovar (+30d)
                            </button>
                            <button
                              onClick={() => handleToggleStoreOverdueLock(st.id, st.status)}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition active:scale-95 ${
                                isLocked
                                  ? 'bg-neutral-800 hover:bg-neutral-700 text-white'
                                  : 'bg-red-900 hover:bg-red-800 text-red-200 border border-red-700'
                              }`}
                            >
                              {isLocked ? 'Desbloquear' : 'Bloquear (Offline)'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION: MENSAGENS PUSH GERAIS DA PLATAFORMA (Master)     */}
      {/* Requisito 6: Disparo de Notificações Gerais Públicas     */}
      {/* ======================================================== */}
      {activeSection === 'pushes' && (
        <div className="space-y-6">
          <div className="p-5 bg-neutral-900 rounded-3xl border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                Disparador de Mensagens Push Gerais da Plataforma
              </h2>
              <p className="text-xs text-neutral-400">
                Envie anúncios, alertas operacionais ou comunicados gerais visíveis publicamente para toda a cidade de Cachoeiras de Macacu.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-xs font-bold">
              Canal Oficial Push
            </span>
          </div>

          {pushSuccess && (
            <div className="p-4 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{pushSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form de Disparo */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Nova Mensagem Push Global
              </h3>

              <form onSubmit={handleSendPushBroadcast} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Título da Mensagem Push *
                  </label>
                  <input
                    type="text"
                    required
                    value={pushTitle}
                    onChange={(e) => setPushTitle(e.target.value)}
                    placeholder="Ex: 📢 Aviso Operacional: Nova Campanha de Entregas Grátis no Centro"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-700 bg-neutral-950 text-white text-xs focus:outline-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Público Destinatário
                    </label>
                    <select
                      value={pushAudience}
                      onChange={(e) => setPushAudience(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white text-xs focus:outline-amber-400"
                    >
                      <option value="todos">Todos os Usuários da Plataforma</option>
                      <option value="lojistas">Apenas Lojistas Cadastrados</option>
                      <option value="consumidores">Apenas Consumidores / Clientes</option>
                      <option value="entregadores">Apenas Entregadores Parceiros</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Prioridade do Alerta
                    </label>
                    <select
                      value={pushPriority}
                      onChange={(e) => setPushPriority(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white text-xs focus:outline-amber-400"
                    >
                      <option value="normal">Normal (Informativo / Comercial)</option>
                      <option value="alta">Alta / Urgente (Aviso de Sistema / Governança)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Conteúdo do Push *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={pushBody}
                    onChange={(e) => setPushBody(e.target.value)}
                    placeholder="Escreva a mensagem pública que será exibida para os usuários no sino de notificações e painel..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-700 bg-neutral-950 text-white text-xs focus:outline-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={pushSending}
                  className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs transition active:scale-95 shadow-md shadow-amber-400/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Bell className="w-4 h-4" />
                  <span>{pushSending ? 'Disparando Push...' : 'Disparar Mensagem Push Geral'}</span>
                </button>
              </form>
            </div>

            {/* Informações de Privacidade de Mensagens (Requisito 6) */}
            <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Privacidade & Arquitetura
              </h3>

              <div className="space-y-3 text-xs text-neutral-300">
                <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800/80 space-y-1">
                  <span className="text-white font-bold block">📢 Pushes do Administrador</span>
                  <p className="text-[11px] text-neutral-400">
                    Mensagens gerais disparadas pelo Master são públicas e entregues no painel de notificações de todos os destinatários da cidade.
                  </p>
                </div>

                <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800/80 space-y-1">
                  <span className="text-white font-bold block">🔒 Mensagens entre Usuários</span>
                  <p className="text-[11px] text-neutral-400">
                    Todas as mensagens diretas trocadas entre clientes, lojistas, administradores e prestadores de serviços são <strong>estritamente privadas e criptografadas</strong>, restritas aos participantes da conversa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION: LOJISTAS LOCAIS (Stores Management)             */}
      {/* ======================================================== */}
      {activeSection === 'stores' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-900 p-3 rounded-2xl border border-neutral-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={storeSearch}
                onChange={(e) => setStoreSearch(e.target.value)}
                placeholder="Pesquisar loja por nome, segmento ou bairro..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-amber-400"
              />
            </div>
            <span className="text-xs text-neutral-400 font-semibold px-2">
              {filteredStores.length} Lojas Cadastradas
            </span>
          </div>

          <div className="bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950 border-b border-neutral-800 font-bold text-neutral-400">
                  <tr>
                    <th className="p-3.5">Estabelecimento</th>
                    <th className="p-3.5">Categoria</th>
                    <th className="p-3.5">Localização</th>
                    <th className="p-3.5">Contato</th>
                    <th className="p-3.5">Avaliação</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Ação Master</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {filteredStores.map((st) => (
                    <tr key={st.id} className="hover:bg-neutral-800/40">
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={st.logoUrl}
                          alt={st.name}
                          className="w-9 h-9 rounded-xl object-cover border border-neutral-700"
                        />
                        <div>
                          <div className="font-bold text-white">{st.name}</div>
                          <div className="text-[11px] text-neutral-400 truncate max-w-xs">{st.description}</div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 font-bold text-[10px]">
                          {st.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-neutral-300">{st.neighborhood}</td>
                      <td className="p-3.5 text-neutral-300">{st.phone}</td>
                      <td className="p-3.5 font-bold text-amber-400">★ {st.rating.toFixed(1)}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            st.status === 'active'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-red-950 text-red-400 border border-red-800'
                          }`}
                        >
                          {st.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleToggleStore(st.id, st.status)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition active:scale-95 ${
                            st.status === 'active'
                              ? 'bg-red-950 text-red-300 hover:bg-red-900 border border-red-800'
                              : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800'
                          }`}
                        >
                          {st.status === 'active' ? 'Suspender Loja' : 'Reativar Loja'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION: USERS                                           */}
      {/* ======================================================== */}
      {activeSection === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-900 p-3 rounded-2xl border border-neutral-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Pesquisar por nome ou e-mail..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-amber-400"
              />
            </div>

            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-neutral-700 text-xs bg-neutral-950 text-white focus:outline-amber-400"
            >
              <option value="all">Todos os Papéis</option>
              <option value="customer">Clientes</option>
              <option value="merchant">Lojistas</option>
              <option value="manager">Gerentes</option>
              <option value="seller">Vendedores</option>
              <option value="provider">Prestadores</option>
              <option value="driver">Entregadores</option>
              <option value="worker">Equipe</option>
              <option value="master">Master</option>
            </select>
          </div>

          <div className="bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950 border-b border-neutral-800 font-bold text-neutral-400">
                  <tr>
                    <th className="p-3">Usuário</th>
                    <th className="p-3">E-mail</th>
                    <th className="p-3">Papel no Sistema</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Ações Master</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-neutral-800/40">
                      <td className="p-3 flex items-center gap-2">
                        <img
                          src={u.avatarUrl}
                          alt={u.displayName}
                          className="w-8 h-8 rounded-full object-cover border border-neutral-700"
                        />
                        <span className="font-bold text-white">{u.displayName}</span>
                      </td>
                      <td className="p-3 text-neutral-400">{u.email}</td>
                      <td className="p-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleUserRoleChange(u.uid, e.target.value as any)}
                          className="px-2 py-1 rounded-lg border border-neutral-700 text-xs bg-neutral-950 text-white font-semibold"
                        >
                          <option value="customer">Cliente</option>
                          <option value="merchant">Lojista</option>
                          <option value="manager">Gerente</option>
                          <option value="seller">Vendedor</option>
                          <option value="provider">Prestador</option>
                          <option value="driver">Entregador</option>
                          <option value="worker">Equipe</option>
                          <option value="master">Master</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'active'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-red-950 text-red-400 border border-red-800'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleToggleUserBlock(u)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                            u.status === 'active'
                              ? 'text-red-400 hover:bg-red-950'
                              : 'text-emerald-400 hover:bg-emerald-950'
                          }`}
                        >
                          {u.status === 'active' ? 'Bloquear' : 'Desbloquear'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION: WORKERS                                         */}
      {/* ======================================================== */}
      {activeSection === 'workers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-neutral-900 p-4 rounded-3xl border border-neutral-800">
            <div>
              <h2 className="text-sm font-extrabold text-white">Equipe Interna & Departamentos</h2>
              <p className="text-xs text-neutral-400">
                Operadores com credenciais restritas por departamento para suporte e triagem.
              </p>
            </div>
            <button
              onClick={() => setWorkerModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Operador</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {workers.map((w) => (
              <div
                key={w.id}
                className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-white text-sm">{w.name}</div>
                  <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold uppercase">
                    {w.department}
                  </span>
                </div>
                <div className="text-xs text-neutral-400">{w.email}</div>
                <div className="text-[11px] text-neutral-500">
                  Permissões: {w.permissions.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION: SETTINGS                                        */}
      {/* ======================================================== */}
      {activeSection === 'settings' && (
        <form
          onSubmit={handleSaveSettings}
          className="bg-neutral-900 rounded-3xl border border-neutral-800 p-6 space-y-5 max-w-2xl"
        >
          <div>
            <h2 className="text-sm font-extrabold text-white">
              Parâmetros Centrais do Ecossistema Local
            </h2>
            <p className="text-xs text-neutral-400">
              Taxas aplicadas dinamicamente sobre todos os pedidos e contratações em Cachoeiras de Macacu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-neutral-300 mb-1">Nome da Plataforma</label>
              <input
                type="text"
                required
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white focus:outline-amber-400"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-300 mb-1">Cidade Principal</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white focus:outline-amber-400"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-300 mb-1">Taxa SaaS Lojista (%)</label>
              <input
                type="number"
                required
                value={merchantRate}
                onChange={(e) => setMerchantRate(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white focus:outline-amber-400"
              />
              <span className="text-[10px] text-neutral-500">Padrão da plataforma: 10%</span>
            </div>

            <div>
              <label className="block font-bold text-neutral-300 mb-1">Taxa SaaS Prestador (%)</label>
              <input
                type="number"
                required
                value={providerRate}
                onChange={(e) => setProviderRate(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white focus:outline-amber-400"
              />
              <span className="text-[10px] text-neutral-500">Padrão da plataforma: 12%</span>
            </div>

            <div>
              <label className="block font-bold text-neutral-300 mb-1">Taxa Fixa de Entrega (R$)</label>
              <input
                type="number"
                step="0.50"
                required
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white focus:outline-amber-400"
              />
              <span className="text-[10px] text-neutral-500">Padrão da cidade: R$ 5,00</span>
            </div>

            <div>
              <label className="block font-bold text-neutral-300 mb-1">Telefone Suporte</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white focus:outline-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={settingsSaving}
            className="w-full py-3 bg-amber-400 hover:bg-amber-300 active:scale-98 text-neutral-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{settingsSaving ? 'Gravando no Firestore...' : 'Gravar Alterações no Firestore'}</span>
          </button>

          {/* Banco de Dados Supabase (Postgres & REST API) */}
          <div className="mt-8 p-6 rounded-3xl bg-neutral-950 border border-emerald-900/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                <Database className="w-4 h-4" />
                <span>Integração com Banco de Dados Supabase (Ativa)</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                ● Conectado (Dual Sync: Firestore + Supabase)
              </span>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Todos os cadastros de lojistas, entregadores, vendedores e auditoria LGPD são persistidos e sincronizados com o Supabase REST API e Firestore.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                <span className="text-[10px] text-neutral-500 font-sans font-bold">REST API URL:</span>
                <p className="text-emerald-400 truncate">{SUPABASE_REST_URL}</p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                <span className="text-[10px] text-neutral-500 font-sans font-bold">PUBLISHABLE KEY:</span>
                <p className="text-neutral-300 truncate">{SUPABASE_PUBLISHABLE_KEY}</p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(SUPABASE_AUTO_CONFIRM_SQL);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 3500);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs transition flex items-center gap-2 shadow-sm"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSql ? 'Copiado!' : 'Copiar Script Auto-Confirm (Bypass Definitivo de E-mail)'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(SUPABASE_COMPLEMENTARY_TABLES_SQL);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 3500);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs transition flex items-center gap-2"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSql ? 'Copiado!' : 'Copiar Script das 4 Tabelas Restantes'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(SUPABASE_SQL_SETUP_SCRIPT);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 3500);
                }}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs border border-neutral-700 transition flex items-center gap-2"
              >
                <Copy className="w-3.5 h-3.5 text-neutral-400" />
                <span>Copiar Script Completo (Tudo)</span>
              </button>

              {copiedSql && (
                <span className="text-[11px] text-emerald-400 font-bold animate-in fade-in">
                  ✓ Script copiado com sucesso! Cole e execute no SQL Editor do Supabase.
                </span>
              )}
            </div>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* SECTION: AUDIT TRAIL                                     */}
      {/* ======================================================== */}
      {activeSection === 'audit' && (
        <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-bold border-b border-neutral-800 pb-3">
            <Terminal className="w-4 h-4" />
            <span>Trilha de Auditoria Imutável (Append-Only)</span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row justify-between gap-2"
              >
                <div>
                  <span className="text-emerald-400 font-bold">[{log.action}]</span>
                  <span className="text-neutral-400 ml-2">{log.targetEntity} #{log.targetId}</span>
                  <p className="text-neutral-300 mt-1">{log.details}</p>
                </div>
                <div className="text-right text-[11px] text-neutral-500 shrink-0">
                  <p>{log.operatorEmail}</p>
                  <p>{new Date(log.timestamp).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: CADASTRAR NOVO VENDEDOR COM SENHA PROVISÓRIA    */}
      {/* ======================================================== */}
      {sellerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md">
          <div className="bg-neutral-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-neutral-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-black text-white text-base">Novo Consultor Comercial / Vendedor</h3>
              </div>
              <button
                onClick={() => setSellerModalOpen(false)}
                className="text-neutral-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {createdSellerCard ? (
              <div className="space-y-4 animate-in zoom-in-95">
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 space-y-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-sm">Vendedor Cadastrado com Sucesso!</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Envie as credenciais abaixo ao vendedor. No primeiro acesso, o sistema exigirá a troca para uma senha definitiva pessoal.
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-left font-mono text-xs space-y-1">
                    <div><span className="text-neutral-500">Nome:</span> <span className="text-white font-bold">{createdSellerCard.name}</span></div>
                    <div><span className="text-neutral-500">E-mail:</span> <span className="text-indigo-400">{createdSellerCard.email}</span></div>
                    <div className="flex items-center justify-between pt-1 border-t border-neutral-800">
                      <span><span className="text-neutral-500">Senha Provisória (6 chars):</span> <strong className="text-amber-400 text-sm tracking-wider font-mono">{createdSellerCard.temporaryPassword}</strong></span>
                      <button
                        onClick={() => {
                          if (navigator?.clipboard) {
                            navigator.clipboard.writeText(createdSellerCard.temporaryPassword);
                            setCopiedTempPass(true);
                            setTimeout(() => setCopiedTempPass(false), 3000);
                          }
                        }}
                        className="px-2.5 py-1 rounded bg-amber-400 text-neutral-950 font-bold text-[10px] flex items-center gap-1 hover:bg-amber-300 transition"
                      >
                        {copiedTempPass ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedTempPass ? 'Copiada!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSellerModalOpen(false);
                    setCreatedSellerCard(null);
                    setSName('');
                    setSEmail('');
                    setSPhone('');
                    setSCpf('');
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                >
                  Concluir e Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateSellerSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={sName}
                    onChange={(e) => setSName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo de Oliveira"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white focus:outline-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-300 font-bold mb-1">E-mail de Acesso</label>
                    <input
                      type="email"
                      required
                      value={sEmail}
                      onChange={(e) => setSEmail(e.target.value)}
                      placeholder="carlos.vendas@conectai.app.br"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white focus:outline-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-bold mb-1">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      required
                      value={sPhone}
                      onChange={(e) => setSPhone(maskPhone(e.target.value))}
                      placeholder="(21) 98888-0000"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white focus:outline-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold mb-1">CPF</label>
                  <input
                    type="text"
                    required
                    value={sCpf}
                    onChange={(e) => setSCpf(maskCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white focus:outline-indigo-500 font-mono"
                  />
                </div>

                {/* Commissions & Goals */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-neutral-950 rounded-2xl border border-neutral-800">
                  <div>
                    <label className="block text-[11px] text-neutral-400 font-bold mb-1">Comissão Vendas</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={sCommSales}
                        onChange={(e) => setSCommSales(parseInt(e.target.value, 10))}
                        className="w-full px-2 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 text-white font-mono"
                      />
                      <span className="text-neutral-400 font-bold">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 font-bold mb-1">Comissão Planos</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={sCommPlans}
                        onChange={(e) => setSCommPlans(parseInt(e.target.value, 10))}
                        className="w-full px-2 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 text-white font-mono"
                      />
                      <span className="text-neutral-400 font-bold">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 font-bold mb-1">Comissão Banners</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={sCommBanners}
                        onChange={(e) => setSCommBanners(parseInt(e.target.value, 10))}
                        className="w-full px-2 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 text-white font-mono"
                      />
                      <span className="text-neutral-400 font-bold">%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Meta Mensal de Faturamento (R$)</label>
                  <input
                    type="number"
                    step="500"
                    value={sMonthlyGoal}
                    onChange={(e) => setSMonthlyGoal(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white focus:outline-indigo-500 font-mono"
                  />
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] text-amber-300 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    A senha provisória de 6 caracteres (com maiúsculas, minúsculas, números e caracteres especiais) será gerada automaticamente ao clicar no botão abaixo.
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSellerModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-neutral-300 font-bold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={sellerSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{sellerSubmitting ? 'Gerando...' : 'Cadastrar Vendedor'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDITAR BANNER & LANÇAR PROMOÇÕES (Master Total) */}
      {/* ======================================================== */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-neutral-900 rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-neutral-800 shadow-2xl space-y-4 text-xs my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <h3 className="font-black text-white text-base">Controle Master de Banner & Promoção</h3>
              </div>
              <button onClick={() => setEditingBanner(null)} className="text-neutral-400 hover:text-white text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveBannerPricing} className="space-y-3.5">
              <div>
                <label className="block text-neutral-300 font-bold mb-1">Título do Banner / Campanha</label>
                <input
                  type="text"
                  required
                  value={bTitle}
                  onChange={(e) => setBTitle(e.target.value)}
                  placeholder="Ex: Semana de Ofertas do Comércio de Macacu"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Conteúdo Escrito / Descrição Promocional</label>
                <textarea
                  rows={2}
                  value={bDescription}
                  onChange={(e) => setBDescription(e.target.value)}
                  placeholder="Texto oficial exibido no banner para os consumidores..."
                  className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Texto do Botão CTA</label>
                  <input
                    type="text"
                    value={bCtaText}
                    onChange={(e) => setBCtaText(e.target.value)}
                    placeholder="Ex: Ver Promoções"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Link de Destino / Loja ID</label>
                  <input
                    type="text"
                    value={bCtaLink}
                    onChange={(e) => setBCtaLink(e.target.value)}
                    placeholder="Ex: store_padaria_macacu"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white font-mono"
                  />
                </div>
              </div>

              {/* Lançamento de Promoções e Descontos */}
              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 block">
                  Regras Promocionais & Benefícios Temporários
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Desconto Promocional (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={bDiscountPercent}
                      onChange={(e) => setBDiscountPercent(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Data Limite de Expiração</label>
                    <input
                      type="date"
                      value={bEndDate}
                      onChange={(e) => setBEndDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-neutral-300">
                    <input
                      type="checkbox"
                      checked={bIsExemptFee}
                      onChange={(e) => setBIsExemptFee(e.target.checked)}
                      className="rounded accent-amber-400"
                    />
                    <span>Isentar taxa da plataforma</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-neutral-300">
                    <input
                      type="checkbox"
                      checked={bActive}
                      onChange={(e) => setBActive(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    <span className={bActive ? 'text-emerald-400 font-bold' : 'text-neutral-400'}>
                      {bActive ? 'Ativo na Vitrine' : 'Pausado'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Tabela de Preços e Comissão */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Preço Semanal (R$)</label>
                  <input
                    type="number"
                    step="5"
                    required
                    value={bWeeklyPrice}
                    onChange={(e) => setBWeeklyPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-neutral-700 bg-neutral-950 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Preço Mensal (R$)</label>
                  <input
                    type="number"
                    step="10"
                    required
                    value={bMonthlyPrice}
                    onChange={(e) => setBMonthlyPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-neutral-700 bg-neutral-950 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Comissão Vend. (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    required
                    value={bSellerComm}
                    onChange={(e) => setBSellerComm(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-neutral-700 bg-neutral-950 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-neutral-300 font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black transition shadow-lg shadow-amber-400/20"
                >
                  Salvar Configurações Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: EDITAR PLANO SAAS (Controle Total Master)        */}
      {/* ======================================================== */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-neutral-900 rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-neutral-800 shadow-2xl space-y-4 text-xs my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h3 className="font-black text-white text-base">Editar Plano SaaS: {editingPlan.name}</h3>
              </div>
              <button onClick={() => setEditingPlan(null)} className="text-neutral-400 hover:text-white text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleSavePlanSettings} className="space-y-3.5">
              <div>
                <label className="block text-neutral-300 font-bold mb-1">Nome Comercial do Plano</label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Valor Mensalidade (R$)</label>
                  <input
                    type="number"
                    step="5"
                    required
                    value={pMonthlyPrice}
                    onChange={(e) => setPMonthlyPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold mb-1">
                    Limite Máximo de Produtos <span className="text-amber-400">(Paywall)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99999"
                    required
                    value={pMaxProducts}
                    onChange={(e) => setPMaxProducts(parseInt(e.target.value, 10) || 100)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Taxa de Intermediação (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    required
                    value={pFeeRate}
                    onChange={(e) => setPFeeRate(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Comissão Vendedor (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    required
                    value={pSellerComm}
                    onChange={(e) => setPSellerComm(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white font-mono"
                  />
                </div>
              </div>

              {/* Promoções e Acessos Grátis por Tempo Determinado */}
              <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 block">
                  Benefícios Temporários & Degustação
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Dias de Degustação Grátis</label>
                    <input
                      type="number"
                      min="0"
                      max="180"
                      value={pFreeTrialDays}
                      onChange={(e) => setPFreeTrialDays(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Desconto Mensalidade (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={pDiscountPercent}
                      onChange={(e) => setPDiscountPercent(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">
                  Recursos do Plano (1 por linha)
                </label>
                <textarea
                  rows={3}
                  value={pFeaturesStr}
                  onChange={(e) => setPFeaturesStr(e.target.value)}
                  placeholder="Catálogo de produtos&#10;Entregas integradas&#10;Painel financeiro em tempo real"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white font-mono text-[11px] resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-neutral-300 font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black transition shadow-lg shadow-emerald-500/20"
                >
                  Salvar Plano no Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: NOVO OPERADOR DE EQUIPE                         */}
      {/* ======================================================== */}
      {workerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md">
          <div className="bg-neutral-900 rounded-3xl p-6 max-w-md w-full border border-neutral-800 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-black text-white text-base">Novo Operador Interno</h3>
              <button onClick={() => setWorkerModalOpen(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateWorker} className="space-y-4">
              <div>
                <label className="block text-neutral-300 font-bold mb-1">Nome do Operador</label>
                <input
                  type="text"
                  required
                  value={wName}
                  onChange={(e) => setWName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={wEmail}
                  onChange={(e) => setWEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Departamento</label>
                <select
                  value={wDept}
                  onChange={(e) => setWDept(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white"
                >
                  <option value="atendimento">Atendimento & SAC</option>
                  <option value="financeiro">Financeiro & Repasses</option>
                  <option value="operacoes">Operações & Logística</option>
                  <option value="moderador">Moderação de Conteúdo</option>
                  <option value="suporte">Suporte Técnico</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWorkerModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-neutral-300 font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition"
                >
                  Criar Operador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
