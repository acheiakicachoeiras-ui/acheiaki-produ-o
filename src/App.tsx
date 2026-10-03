import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { ChatModal } from './components/ChatModal';
import { NotificationModal } from './components/NotificationModal';
import { ReviewModal } from './components/ReviewModal';
import { AuthModal } from './components/AuthModal';
import { SplashScreen } from './components/SplashScreen';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Footer } from './components/Footer';
import { LegalDocsModal, LegalDocType } from './components/LegalDocsModal';
import { ProtectedRoute } from './components/ProtectedRoute';

import { MarketplaceHome } from './views/MarketplaceHome';
import { StoreDetail } from './views/StoreDetail';
import { ProductPage } from './views/ProductPage';
import { ServicesMarketplace } from './views/ServicesMarketplace';
import { OrdersView } from './views/OrdersView';
import { MerchantPortal } from './views/MerchantPortal';
import { ManagerPortal } from './views/ManagerPortal';
import { SellerPortal } from './views/SellerPortal';
import { ProviderPortal } from './views/ProviderPortal';
import { DriverPortal } from './views/DriverPortal';
import { WorkerPortal } from './views/WorkerPortal';
import { MasterDashboard } from './views/MasterDashboard';
import { CustomerProfile } from './views/CustomerProfile';
import { OnboardingRegistrationView } from './views/OnboardingRegistrationView';
import { ToastContainer, ToastMessage } from './components/Toast';

import { Store, Product, ServiceProvider, NotificationItem } from './types';
import {
  fetchStores,
  fetchProducts,
  fetchServiceProviders,
  fetchServices,
  seedInitialMarketplaceIfEmpty,
  fetchNotifications,
  markNotificationRead,
} from './services/firestoreService';

function MainApp() {
  const {
    userProfile,
    activeRole,
    activeEnvironment,
    setActiveEnvironment,
    isAuthenticated,
    isSuperAdmin,
  } = useAuth();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<string>('home');
  const [onboardingType, setOnboardingType] = useState<'merchant' | 'driver'>('merchant');

  // Toasts state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Data state
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Selected items
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [currentLegalDoc, setCurrentLegalDoc] = useState<LegalDocType>('manual-cliente');

  const handleOpenLegalDoc = (docType: LegalDocType) => {
    setCurrentLegalDoc(docType);
    setIsLegalModalOpen(true);
  };

  // Review modal state
  const [reviewModalState, setReviewModalState] = useState<{
    isOpen: boolean;
    targetType: 'store' | 'product' | 'service' | 'driver';
    targetId: string;
    targetName: string;
  }>({
    isOpen: false,
    targetType: 'store',
    targetId: '',
    targetName: '',
  });

  // Targeted contact for chat modal
  const [chatTargetContact, setChatTargetContact] = useState<{
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
  } | undefined>(undefined);

  // Load initial data and seed if needed
  const loadMarketplaceData = async () => {
    try {
      setLoading(true);
      await seedInitialMarketplaceIfEmpty();

      const [sList, pList, provList, srvList] = await Promise.all([
        fetchStores(),
        fetchProducts(),
        fetchServiceProviders(),
        fetchServices(),
      ]);

      setStores(sList);
      setProducts(pList);
      setProviders(provList);
      setServices(srvList);

      if (userProfile?.uid) {
        try {
          const notifs = await fetchNotifications(userProfile.uid);
          if (notifs) setNotifications(notifs);
        } catch (_) {
          setNotifications([]);
        }
      }
    } catch (err) {
      console.warn('Aviso não-bloqueante ao carregar catálogo do AcheiaKi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplaceData();
  }, [userProfile?.uid]);

  // Handlers
  const handleSelectStore = (store: Store) => {
    setSelectedStore(store);
    setActiveTab('store');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setActiveTab('product_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProvider = (prov: ServiceProvider) => {
    setActiveTab('services');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenChatWithContact = (contact: {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
  }) => {
    setChatTargetContact(contact);
    setIsChatOpen(true);
  };

  const handleOpenReview = (
    targetType: 'store' | 'product' | 'service' | 'driver',
    targetId: string,
    targetName: string
  ) => {
    setReviewModalState({
      isOpen: true,
      targetType,
      targetId,
      targetName,
    });
  };

  const handleOrderPlaced = (orderId: string) => {
    setActiveTab('orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMarkNotifRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col text-neutral-900 selection:bg-emerald-500 selection:text-white">
      {/* App Splash Screen on boot */}
      <SplashScreen />

      {/* Network Offline Indicator */}
      <OfflineIndicator />

      {/* Top Navbar with PWA button & Environment switcher */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotifications={() => setIsNotifOpen(true)}
        onOpenChat={() => {
          setChatTargetContact(undefined);
          setIsChatOpen(true);
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-neutral-600">
              Conectando ao ecossistema de Cachoeiras de Macacu...
            </p>
          </div>
        ) : (
          <>
            {/* View 1: Home (Marketplace Vitrine) */}
            {activeTab === 'home' && (
              <MarketplaceHome
                stores={stores}
                products={products}
                providers={providers}
                onSelectStore={handleSelectStore}
                onSelectProduct={handleSelectProduct}
                onSelectProvider={handleSelectProvider}
                onOpenSearch={() => setIsSearchOpen(true)}
                onNavigateToTab={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {/* View 2: Stores & Products Directory (Marketplace) */}
            {activeTab === 'marketplace' && (
              <div className="space-y-6 pb-20">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                      Comércio Local em Cachoeiras de Macacu
                    </h1>
                    <p className="text-xs text-neutral-500">
                      Padarias, farmácias, mercados, restaurantes e lojas da cidade
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {stores.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleSelectStore(s)}
                      className="bg-white rounded-3xl border border-neutral-200/90 overflow-hidden shadow-xs hover:shadow-lg transition cursor-pointer flex flex-col group"
                    >
                      <div className="h-32 bg-neutral-200 overflow-hidden relative">
                        <img
                          src={s.bannerUrl}
                          alt={s.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-bold text-neutral-800">
                          {s.category}
                        </span>
                      </div>
                      <div className="p-4 flex items-center gap-3">
                        <img
                          src={s.logoUrl}
                          alt={s.name}
                          className="w-12 h-12 rounded-xl object-cover border border-neutral-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-emerald-700 truncate">
                            {s.name}
                          </h3>
                          <p className="text-[11px] text-neutral-400 truncate">
                            {s.neighborhood} • Entrega R$ 5,00
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View 3: Store Detail Page */}
            {activeTab === 'store' && selectedStore && (
              <StoreDetail
                store={selectedStore}
                products={products}
                onBack={() => setActiveTab('home')}
                onSelectProduct={handleSelectProduct}
                onOpenChatWithStore={(st) =>
                  handleOpenChatWithContact({
                    id: st.ownerUid,
                    name: st.name,
                    role: 'lojista',
                    avatarUrl: st.logoUrl,
                  })
                }
                onOpenReviewModal={() =>
                  handleOpenReview('store', selectedStore.id, selectedStore.name)
                }
              />
            )}

            {/* View 4: Full Mercado Livre-Style Product Page */}
            {activeTab === 'product_detail' && selectedProduct && (
              <ProductPage
                product={selectedProduct}
                store={stores.find((s) => s.id === selectedProduct.storeId)}
                relatedProducts={products.filter((p) => p.id !== selectedProduct.id)}
                onBack={() => setActiveTab('home')}
                onSelectProduct={handleSelectProduct}
                onSelectStore={handleSelectStore}
              />
            )}

            {/* View 5: Services Directory */}
            {activeTab === 'services' && (
              <ServicesMarketplace
                providers={providers}
                services={services}
                onOpenChatWithProvider={(prov) =>
                  handleOpenChatWithContact({
                    id: prov.ownerUid,
                    name: prov.name,
                    role: 'prestador',
                    avatarUrl: prov.avatarUrl,
                  })
                }
                onOpenReviewModal={(prov) =>
                  handleOpenReview('service', prov.id, prov.name)
                }
              />
            )}

            {/* View 6: Customer Orders & Tracking */}
            {activeTab === 'orders' && (
              <ProtectedRoute
                allowedRoles={[
                  'super_admin',
                  'client',
                  'merchant',
                  'manager',
                  'seller',
                  'service_provider',
                  'driver',
                  'staff',
                ]}
                currentRole={activeRole}
                isAuthenticated={isAuthenticated}
                isSuperAdmin={isSuperAdmin}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAuth={() => setIsAuthOpen(true)}
              >
                <OrdersView
                  onOpenChatWithStore={(stId, stName) =>
                    handleOpenChatWithContact({
                      id: stId,
                      name: stName,
                      role: 'lojista',
                    })
                  }
                  onOpenReviewModal={(type, id, name) =>
                    handleOpenReview(type, id, name)
                  }
                />
              </ProtectedRoute>
            )}

            {/* View 7: Merchant Portal (Minha Loja - Dono da Loja) */}
            {activeTab === 'merchant' && (
              <ProtectedRoute
                allowedRoles={['super_admin', 'merchant']}
                currentRole={activeRole}
                isAuthenticated={isAuthenticated}
                isSuperAdmin={isSuperAdmin}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAuth={() => setIsAuthOpen(true)}
              >
                <MerchantPortal />
              </ProtectedRoute>
            )}

            {/* View 8: Manager Portal (Painel Gerencial) */}
            {activeTab === 'manager' && (
              <ProtectedRoute
                allowedRoles={['super_admin', 'merchant', 'manager']}
                currentRole={activeRole}
                isAuthenticated={isAuthenticated}
                isSuperAdmin={isSuperAdmin}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAuth={() => setIsAuthOpen(true)}
              >
                <ManagerPortal />
              </ProtectedRoute>
            )}

            {/* View 9: Seller Portal (Painel de Vendas) */}
            {activeTab === 'seller' && (
              <ProtectedRoute
                allowedRoles={['super_admin', 'seller']}
                currentRole={activeRole}
                isAuthenticated={isAuthenticated}
                isSuperAdmin={isSuperAdmin}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAuth={() => setIsAuthOpen(true)}
              >
                <SellerPortal />
              </ProtectedRoute>
            )}

            {/* View 10: Service Provider Portal (Meus Serviços) */}
            {activeTab === 'provider' && (
              <ProtectedRoute
                allowedRoles={['super_admin', 'service_provider']}
                currentRole={activeRole}
                isAuthenticated={isAuthenticated}
                isSuperAdmin={isSuperAdmin}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAuth={() => setIsAuthOpen(true)}
              >
                <ProviderPortal />
              </ProtectedRoute>
            )}

            {/* View 11: Delivery Driver Portal (Central de Entregas) */}
            {activeTab === 'driver' && (
              <ProtectedRoute
                allowedRoles={['super_admin', 'driver']}
                currentRole={activeRole}
                isAuthenticated={isAuthenticated}
                isSuperAdmin={isSuperAdmin}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAuth={() => setIsAuthOpen(true)}
              >
                <DriverPortal />
              </ProtectedRoute>
            )}

            {/* View 12: Internal Worker Portal (Painel de Trabalho / Atendimento) */}
            {activeTab === 'worker' && (
              <ProtectedRoute
                allowedRoles={['super_admin', 'staff']}
                currentRole={activeRole}
                isAuthenticated={isAuthenticated}
                isSuperAdmin={isSuperAdmin}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAuth={() => setIsAuthOpen(true)}
              >
                <WorkerPortal />
              </ProtectedRoute>
            )}

            {/* View 13: Central Master (Governança & Comando Dark - Super Admin) */}
            {activeTab === 'master' && (
              <ProtectedRoute
                allowedRoles={['super_admin']}
                currentRole={activeRole}
                isAuthenticated={isAuthenticated}
                isSuperAdmin={isSuperAdmin}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAuth={() => setIsAuthOpen(true)}
              >
                <MasterDashboard />
              </ProtectedRoute>
            )}

            {/* View 14: Customer Profile (Minha Conta & Endereços) */}
            {activeTab === 'profile' && (
              <ProtectedRoute
                allowedRoles={[
                  'super_admin',
                  'client',
                  'merchant',
                  'manager',
                  'seller',
                  'service_provider',
                  'driver',
                  'staff',
                ]}
                currentRole={activeRole}
                isAuthenticated={isAuthenticated}
                isSuperAdmin={isSuperAdmin}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAuth={() => setIsAuthOpen(true)}
              >
                <CustomerProfile />
              </ProtectedRoute>
            )}

            {/* View 15: Onboarding & Legal Registrations (Lojistas & Entregadores) */}
            {activeTab === 'onboarding' && (
              <OnboardingRegistrationView
                initialType={onboardingType}
                onNavigateHome={() => {
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                showToast={showToast}
              />
            )}
          </>
        )}
      </main>

      {/* Official Institutional Footer (Bex Serviços e Comércios & AcheiAKI) */}
      <Footer
        onOpenDoc={handleOpenLegalDoc}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenOnboarding={(type) => {
          setOnboardingType(type || 'merchant');
          setActiveTab('onboarding');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Real-time Global Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Cart Drawer */}
      <CartDrawer onOrderPlaced={handleOrderPlaced} />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        stores={stores}
        providers={providers}
        onSelectStore={handleSelectStore}
        onSelectProduct={handleSelectProduct}
        onSelectProvider={handleSelectProvider}
      />

      {/* Chat Modal */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        targetContact={chatTargetContact}
      />

      {/* Segmented Notifications Modal */}
      <NotificationModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotifRead}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalState.isOpen}
        onClose={() =>
          setReviewModalState((prev) => ({ ...prev, isOpen: false }))
        }
        targetType={reviewModalState.targetType}
        targetId={reviewModalState.targetId}
        targetName={reviewModalState.targetName}
      />

      {/* Auth Modal with Automatic Role-Based Dashboard Redirection */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(targetTab) => {
          setActiveTab(targetTab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Official Legal & Manuals Modal */}
      <LegalDocsModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialDoc={currentLegalDoc}
        onNavigateToTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenOnboarding={(type) => {
          setOnboardingType(type || 'merchant');
          setActiveTab('onboarding');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Bottom Nav for Mobile */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenChat={() => {
          setChatTargetContact(undefined);
          setIsChatOpen(true);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
