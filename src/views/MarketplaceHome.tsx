import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Star,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck,
  Clock,
  Heart,
  Store as StoreIcon,
  Wrench,
  Utensils,
  Pill,
  Apple,
  Cpu,
  Scissors,
  Hammer,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle,
} from 'lucide-react';
import { Store, Product, ServiceProvider, BannerPricingSetting } from '../types';
import { useCart } from '../context/CartContext';
import { fetchBannerPricingSettings } from '../services/firestoreService';

interface MarketplaceHomeProps {
  stores: Store[];
  products: Product[];
  providers: ServiceProvider[];
  onSelectStore: (store: Store) => void;
  onSelectProduct: (product: Product) => void;
  onSelectProvider: (provider: ServiceProvider) => void;
  onOpenSearch: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const MarketplaceHome: React.FC<MarketplaceHomeProps> = ({
  stores,
  products,
  providers,
  onSelectStore,
  onSelectProduct,
  onSelectProvider,
  onOpenSearch,
  onNavigateToTab,
}) => {
  const { addItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('Tudo');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [customBanners, setCustomBanners] = useState<BannerPricingSetting[]>([]);

  // Carrega banners configurados pelo Master e aplica regras estritas de expiração
  useEffect(() => {
    fetchBannerPricingSettings()
      .then((bns) => {
        if (Array.isArray(bns)) {
          const now = Date.now();
          // Regra de Expiração Estrita: Não exibe banners inativos ou com data de expiração ultrapassada
          const valid = bns.filter((b) => {
            if (b.active === false) return false;
            if (b.endDate) {
              const exp = new Date(b.endDate).getTime();
              if (!isNaN(exp) && exp < now) return false;
            }
            return true;
          });
          setCustomBanners(valid);
        }
      })
      .catch(() => {});
  }, []);

  // Banners base rotativos de Cachoeiras de Macacu
  const defaultBanners = [
    {
      badge: '🌲 Parque Estadual dos Três Picos & Serra',
      title: 'AcheiAKI — Cachoeiras de Macacu',
      subtitle:
        'Inspirado nas verdes matas e florestas do Parque Estadual e da serra de Cachoeiras de Macacu. Conectando moradores, prestadores e comércios locais.',
      cta: 'Explorar Comércio Local',
      action: () => setSelectedCategory('Tudo'),
      bg: 'from-emerald-950 via-emerald-900 to-teal-950',
      accent: 'text-emerald-400',
    },
    {
      badge: '🥖 Tradição & Sabor no Centro',
      title: 'Padaria Imperial: Pães e Bolos Quentinhos',
      subtitle: 'Croissants franceses folhados e café da serra entregues em minutos na sua porta.',
      cta: 'Pedir na Padaria Imperial',
      action: () => {
        const padaria = stores.find((s) => s.id === 'store_padaria_macacu');
        if (padaria) onSelectStore(padaria);
      },
      bg: 'from-amber-950 via-orange-950 to-neutral-950',
      accent: 'text-amber-400',
    },
    {
      badge: '⚡ Profissionais Locais Verificados',
      title: 'Precisa de Eletricista ou Ar-Condicionado?',
      subtitle: 'Contrate especialistas recomendados de Cachoeiras, Papucaia e Japuíba sem complicação.',
      cta: 'Ver Prestadores',
      action: () => onNavigateToTab('services'),
      bg: 'from-blue-950 via-indigo-950 to-slate-950',
      accent: 'text-blue-400',
    },
  ];

  // Mescla banners promocionais editados pelo Master com os banners padrão
  const masterPromotionalBanners = customBanners
    .filter((cb) => cb.promoText || cb.description)
    .map((cb) => ({
      badge: cb.isExemptFee
        ? '🎉 Isenção de Taxa / Promoção Master'
        : cb.discountPercent
        ? `🔥 ${cb.discountPercent}% OFF Especial Macacu`
        : '📢 Anúncio Oficial ConectAí',
      title: cb.title,
      subtitle: cb.promoText || cb.description,
      cta: cb.ctaText || 'Ver Ofertas da Cidade',
      action: () => {
        if (cb.ctaLink) {
          const matchedStore = stores.find((s) => s.id === cb.ctaLink || s.slug === cb.ctaLink);
          if (matchedStore) {
            onSelectStore(matchedStore);
            return;
          }
        }
        setSelectedCategory('Tudo');
      },
      bg: cb.discountPercent
        ? 'from-red-950 via-rose-950 to-neutral-950'
        : 'from-purple-950 via-indigo-950 to-neutral-950',
      accent: cb.discountPercent ? 'text-rose-400' : 'text-purple-300',
    }));

  const allBanners = masterPromotionalBanners.length > 0
    ? [...masterPromotionalBanners, ...defaultBanners]
    : defaultBanners;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % allBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [allBanners.length]);

  const categories = [
    { label: 'Tudo', icon: Sparkles },
    { label: 'Comida', icon: Utensils },
    { label: 'Mercado', icon: Apple },
    { label: 'Farmácia', icon: Pill },
    { label: 'Serviços', icon: Wrench },
    { label: 'Tecnologia', icon: Cpu },
    { label: 'Beleza', icon: Scissors },
    { label: 'Construção', icon: Hammer },
  ];

  // Regra Paywall: Lojas bloqueadas (status offline ou suspended) não aparecem na vitrine de vendas
  const filteredStores = stores.filter((s) => {
    if (s.status === 'offline' || s.status === 'suspended') return false;
    if (selectedCategory === 'Tudo') return true;
    return s.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Produtos de lojas offline também não são promovidos
  const filteredProducts = products.filter((p) => {
    const store = stores.find((s) => s.id === p.storeId);
    if (store && (store.status === 'offline' || store.status === 'suspended')) return false;
    return true;
  });

  const featuredProducts = filteredProducts.filter((p) => p.featured || p.promoPrice);
  const currentBanner = allBanners[currentBannerIndex % allBanners.length] || allBanners[0];

  return (
    <div className="space-y-8 pb-16">
      {/* Dynamic Rotative Hero Banner (Mercado Livre Carousel Style) */}
      <section className="relative overflow-hidden rounded-3xl bg-neutral-900 shadow-xl border border-neutral-800 transition-all duration-700">
        <div
          className={`p-6 sm:p-10 text-white bg-gradient-to-r ${currentBanner.bg} transition-all duration-700 relative`}
        >
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold backdrop-blur-xs">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentBanner.badge}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-['Space_Grotesk'] leading-tight">
              {currentBanner.title}
            </h1>

            <p className="text-neutral-200 text-xs sm:text-sm font-normal leading-relaxed">
              {currentBanner.subtitle}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-lg">
              <button
                onClick={currentBanner.action}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs shadow-lg transition active:scale-95 text-center"
              >
                {currentBanner.cta}
              </button>

              <div
                onClick={onOpenSearch}
                className="flex-1 flex items-center gap-2.5 px-4 py-3 bg-white/95 text-neutral-600 rounded-2xl cursor-pointer hover:bg-white text-xs font-medium transition shadow-md"
              >
                <Search className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-neutral-400 truncate">Buscar produtos, lojas ou serviços...</span>
              </div>
            </div>

            {/* Fast Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-neutral-300">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                Entrega Local R$ 5,00
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Lojas Oficiais da Cidade
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Chega Hoje
              </span>
            </div>
          </div>

          {/* Carousel Dot Indicators */}
          <div className="absolute bottom-4 right-6 flex items-center gap-1.5 z-20">
            {allBanners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBannerIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentBannerIndex === i ? 'w-6 bg-emerald-400' : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Category Pills Bar */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
            <span>Departamentos & Categorias</span>
          </h2>
          <span className="text-xs text-neutral-400">Cachoeiras de Macacu</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                    : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200/80 shadow-xs'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* OFERTAS DO DIA (MERCADO LIVRE STYLE) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-red-100 text-red-600">
              <Flame className="w-4 h-4 fill-red-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-neutral-900">
                  Ofertas do Dia
                </h2>
                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black animate-pulse">
                  TERMINA EM 04:22:15
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Descontos exclusivos no comércio local de Cachoeiras
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('marketplace')}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
          >
            <span>Ver todas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {featuredProducts.slice(0, 4).map((product) => {
            const price = product.promoPrice ?? product.price;
            const installment = (price / 3).toFixed(2).replace('.', ',');

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-neutral-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
                onClick={() => onSelectProduct(product)}
              >
                {/* Image & Badges */}
                <div className="relative h-40 bg-neutral-100 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  {product.promoPrice && (
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-red-600 text-white text-[10px] font-black shadow-xs">
                      {Math.round(((product.price - product.promoPrice) / product.price) * 100)}% OFF
                    </span>
                  )}
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-emerald-600/90 backdrop-blur-xs text-white text-[9px] font-bold">
                    Chega hoje
                  </span>
                </div>

                {/* Content */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold truncate block">
                      {product.storeName}
                    </span>
                    <h3 className="text-xs font-bold text-neutral-900 group-hover:text-emerald-700 transition line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                  </div>

                  {/* Pricing Box */}
                  <div className="pt-1">
                    {product.promoPrice ? (
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-neutral-400 line-through block">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                        <div className="text-base font-black text-neutral-900 font-['Space_Grotesk']">
                          R$ {product.promoPrice.toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                    ) : (
                      <div className="text-base font-black text-neutral-900 font-['Space_Grotesk']">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </div>
                    )}
                    <span className="text-[10px] text-neutral-500 block">
                      em 3x R$ {installment} sem juros
                    </span>
                  </div>

                  {/* Footer button */}
                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-700">
                      Frete R$ 5,00
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem(product, 1);
                      }}
                      className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-xs transition"
                      title="Adicionar ao Carrinho"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* LOJAS EM DESTAQUE (LOJAS OFICIAIS COM REPUTAÇÃO) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
              <StoreIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-neutral-900">
                Lojas Oficiais da Cidade
              </h2>
              <p className="text-[11px] text-neutral-400">
                Comércio verificado com reputação destacada em Cachoeiras de Macacu
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('marketplace')}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
          >
            <span>Ver todas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStores.slice(0, 6).map((store) => (
            <div
              key={store.id}
              onClick={() => onSelectStore(store)}
              className="bg-white rounded-3xl border border-neutral-200/90 overflow-hidden shadow-xs hover:shadow-lg transition duration-200 cursor-pointer flex flex-col group"
            >
              {/* Cover Banner */}
              <div className="relative h-28 bg-neutral-200 overflow-hidden">
                <img
                  src={store.bannerUrl}
                  alt={store.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-white/95 text-[10px] font-black text-neutral-800">
                  {store.category}
                </span>
                <span className="absolute bottom-2 left-20 text-[11px] text-white font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  {store.neighborhood}, Macacu
                </span>
              </div>

              {/* Body */}
              <div className="p-4 pt-0 relative flex-1 flex flex-col justify-between">
                <div className="flex items-start gap-3 -mt-7">
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md bg-white shrink-0"
                  />
                  <div className="pt-7 min-w-0 flex-1">
                    <h3 className="text-xs sm:text-sm font-extrabold text-neutral-900 group-hover:text-emerald-700 transition truncate">
                      {store.name}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-neutral-500 line-clamp-2 mt-2 leading-relaxed">
                  {store.description}
                </p>

                {/* Reputation pill */}
                <div className="my-2.5 flex items-center justify-between text-[11px] bg-emerald-50/70 p-2 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-1 text-emerald-800 font-bold">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mercado Líder Local</span>
                  </div>
                  <span className="text-neutral-500">100% Pontual</span>
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-800">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{store.rating}</span>
                    <span className="text-[11px] text-neutral-400 font-normal">
                      ({store.reviewsCount} opiniões)
                    </span>
                  </div>

                  <span className="text-[11px] text-emerald-700 font-bold">
                    Entrega R$ 5,00
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GUIA DE SERVIÇOS & PROFISSIONAIS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-blue-100 text-blue-700">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-neutral-900">
                Profissionais & Serviços Locais
              </h2>
              <p className="text-[11px] text-neutral-400">
                Eletricistas, refrigeração, encanadores e estética na sua residência
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('services')}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
          >
            <span>Ver profissionais</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {providers.map((prov) => (
            <div
              key={prov.id}
              onClick={() => onSelectProvider(prov)}
              className="bg-white rounded-3xl border border-neutral-200/90 p-4 shadow-xs hover:shadow-lg transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="flex items-start gap-3">
                <img
                  src={prov.avatarUrl}
                  alt={prov.name}
                  className="w-12 h-12 rounded-full object-cover border border-neutral-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-neutral-900 group-hover:text-blue-700 transition truncate">
                    {prov.name}
                  </h3>
                  <p className="text-[11px] text-blue-600 font-semibold truncate">
                    {prov.specialty}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-neutral-400 mt-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-neutral-700">{prov.rating}</span>
                    <span>({prov.reviewsCount} avaliações)</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-neutral-500 line-clamp-2 my-2.5 leading-relaxed">
                {prov.bio}
              </p>

              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-neutral-400 truncate max-w-[150px]">
                  📍 {prov.coverageArea}
                </span>
                <span className="text-blue-600 font-bold group-hover:underline text-xs flex items-center gap-1">
                  Solicitar <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ADVERTISING BANNER: Venda no AcheiaKi */}
      <section className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-neutral-800">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Cresça seu negócio em Cachoeiras de Macacu
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold font-['Space_Grotesk']">
            Venda produtos ou preste serviços no AcheiaKi
          </h3>
          <p className="text-neutral-300 text-xs sm:text-sm max-w-xl">
            Tenha sua vitrine digital, cadastre seu catálogo com fotos e preços, receba pedidos em tempo real e utilize nossa rede de motoboys parceiros.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => onNavigateToTab('onboarding')}
            className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold text-xs shadow-md transition text-center active:scale-95"
          >
            Cadastrar Loja (Lojista)
          </button>
          <button
            onClick={() => onNavigateToTab('onboarding')}
            className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-neutral-950 font-extrabold text-xs shadow-md transition text-center active:scale-95"
          >
            Seja Entregador Parceiro
          </button>
        </div>
      </section>
    </div>
  );
};
