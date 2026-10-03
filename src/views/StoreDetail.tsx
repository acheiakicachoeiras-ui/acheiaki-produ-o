import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Star,
  ShoppingBag,
  Plus,
  Share2,
  Heart,
  Search,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';
import { Store, Product, Review } from '../types';
import { useCart } from '../context/CartContext';

interface StoreDetailProps {
  store: Store;
  products: Product[];
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenChatWithStore: (store: Store) => void;
  onOpenReviewModal: () => void;
}

export const StoreDetail: React.FC<StoreDetailProps> = ({
  store,
  products,
  onBack,
  onSelectProduct,
  onOpenChatWithStore,
  onOpenReviewModal,
}) => {
  const { addItem } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const storeProducts = products.filter((p) => p.storeId === store.id);
  const categories = ['Todos', ...Array.from(new Set(storeProducts.map((p) => p.category)))];

  const filteredProducts = storeProducts.filter((p) => {
    const matchesCat = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar ao Marketplace</span>
      </button>

      {/* Store Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-white border border-neutral-200/90 shadow-sm">
        <div className="h-44 sm:h-56 bg-neutral-200 overflow-hidden relative">
          <img
            src={store.bannerUrl}
            alt={store.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        </div>

        <div className="p-4 sm:p-6 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
            <div className="flex items-end gap-3.5">
              <img
                src={store.logoUrl}
                alt={store.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white shadow-lg bg-white shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-1">
                  Loja Oficial • {store.category}
                </span>
                <h1 className="text-lg sm:text-2xl font-black text-neutral-900 truncate">
                  {store.name}
                </h1>
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{store.address}, {store.neighborhood} — Cachoeiras de Macacu</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => onOpenChatWithStore(store)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-xs transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Conversar com a Loja</span>
              </button>

              <button
                onClick={onOpenReviewModal}
                className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold transition"
                title="Avaliar esta loja"
              >
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Avaliar</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-neutral-600 mt-4 leading-relaxed max-w-3xl">
            {store.description}
          </p>

          {/* Reputation Thermometer Bar for Store */}
          <div className="mt-4 p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black">
                MERCADO LÍDER
              </span>
              <span className="font-bold text-neutral-800">
                100% de entregas no prazo em Cachoeiras
              </span>
            </div>

            <div className="flex items-center gap-4 text-neutral-500 text-[11px]">
              <span className="flex items-center gap-1 font-bold text-neutral-800">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{store.rating} ({store.reviewsCount} avaliações)</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>{store.openingHours}</span>
              </span>
              <span className="font-bold text-emerald-700">
                Entrega Padrão R$ 5,00
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Store Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Buscar em ${store.name.split(' ')[0]}...`}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs focus:outline-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold text-neutral-900 tracking-tight">
          Catálogo da Loja ({filteredProducts.length})
        </h2>

        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500 bg-white rounded-3xl border border-neutral-200">
            Nenhum produto encontrado nesta busca interna da loja.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-neutral-200/90 p-3.5 shadow-xs hover:shadow-md transition flex gap-3.5 group cursor-pointer"
                onClick={() => onSelectProduct(product)}
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-neutral-200 shrink-0 group-hover:scale-102 transition"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-emerald-700 transition line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-neutral-500 line-clamp-2 mt-1 leading-snug">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      {product.promoPrice ? (
                        <div className="flex flex-col">
                          <span className="text-[10px] text-neutral-400 line-through">
                            R$ {product.price.toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-sm font-black text-emerald-700">
                            R$ {product.promoPrice.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-black text-neutral-900">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem(product, 1);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-xs transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
