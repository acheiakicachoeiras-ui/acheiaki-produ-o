import React, { useState, useMemo } from 'react';
import { Search, X, Store, Wrench, Package, Star, MapPin, ArrowRight } from 'lucide-react';
import { Product, Store as StoreType, ServiceProvider } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  stores: StoreType[];
  providers: ServiceProvider[];
  onSelectStore: (store: StoreType) => void;
  onSelectProduct: (product: Product) => void;
  onSelectProvider: (provider: ServiceProvider) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  stores,
  providers,
  onSelectStore,
  onSelectProduct,
  onSelectProvider,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'products' | 'stores' | 'services'>('all');

  const filteredResults = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return { products: [], stores: [], providers: [] };

    const matchedProducts = products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.storeName.toLowerCase().includes(term)
    );

    const matchedStores = stores.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.category.toLowerCase().includes(term) ||
        s.neighborhood.toLowerCase().includes(term)
    );

    const matchedProviders = providers.filter(
      (prov) =>
        prov.name.toLowerCase().includes(term) ||
        prov.specialty.toLowerCase().includes(term) ||
        prov.category.toLowerCase().includes(term)
    );

    return {
      products: matchedProducts,
      stores: matchedStores,
      providers: matchedProviders,
    };
  }, [searchTerm, products, stores, providers]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs p-4 sm:p-6 flex items-start justify-center pt-16">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-neutral-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-emerald-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="O que procura em Cachoeiras? Ex: croissant, eletricista, remédio..."
            className="w-full text-sm font-medium text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-semibold"
          >
            Fechar
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 bg-neutral-50/80 border-b border-neutral-200 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-full font-semibold transition ${
              activeFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Tudo
          </button>
          <button
            onClick={() => setActiveFilter('products')}
            className={`px-3 py-1 rounded-full font-semibold transition ${
              activeFilter === 'products'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Produtos ({filteredResults.products.length})
          </button>
          <button
            onClick={() => setActiveFilter('stores')}
            className={`px-3 py-1 rounded-full font-semibold transition ${
              activeFilter === 'stores'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Lojas ({filteredResults.stores.length})
          </button>
          <button
            onClick={() => setActiveFilter('services')}
            className={`px-3 py-1 rounded-full font-semibold transition ${
              activeFilter === 'services'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Serviços & Autônomos ({filteredResults.providers.length})
          </button>
        </div>

        {/* Search Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
          {!searchTerm ? (
            <div className="py-8 text-center text-xs text-neutral-500 space-y-2">
              <p className="font-semibold text-neutral-700">Sugestões de busca rápida em Cachoeiras:</p>
              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                {['Padaria Imperial', 'Eletricista', 'Marmitex', 'Drogaria', 'Hortifruti', 'Ar-Condicionado', 'Bolo'].map(
                  (sug) => (
                    <button
                      key={sug}
                      onClick={() => setSearchTerm(sug)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-emerald-50 hover:text-emerald-700 text-neutral-600 transition"
                    >
                      {sug}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Products */}
              {(activeFilter === 'all' || activeFilter === 'products') &&
                filteredResults.products.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-emerald-600" />
                      Produtos Encontrados
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filteredResults.products.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            onSelectProduct(p);
                            onClose();
                          }}
                          className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-50 hover:bg-emerald-50/70 border border-neutral-200/80 cursor-pointer transition group"
                        >
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-12 h-12 rounded-lg object-cover border border-neutral-200"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-neutral-900 truncate group-hover:text-emerald-800">
                              {p.name}
                            </h4>
                            <p className="text-[10px] text-neutral-400 truncate">{p.storeName}</p>
                            <span className="text-xs font-extrabold text-emerald-700">
                              R$ {(p.promoPrice ?? p.price).toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Stores */}
              {(activeFilter === 'all' || activeFilter === 'stores') &&
                filteredResults.stores.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-emerald-600" />
                      Lojas Locais
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filteredResults.stores.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => {
                            onSelectStore(s);
                            onClose();
                          }}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50 hover:bg-emerald-50/70 border border-neutral-200/80 cursor-pointer transition group"
                        >
                          <img
                            src={s.logoUrl}
                            alt={s.name}
                            className="w-12 h-12 rounded-xl object-cover border border-neutral-200"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-neutral-900 truncate group-hover:text-emerald-800">
                              {s.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                              <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                {s.rating}
                              </span>
                              <span>•</span>
                              <span>{s.neighborhood}</span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-emerald-600" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Providers */}
              {(activeFilter === 'all' || activeFilter === 'services') &&
                filteredResults.providers.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-blue-600" />
                      Profissionais & Prestadores
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filteredResults.providers.map((prov) => (
                        <div
                          key={prov.id}
                          onClick={() => {
                            onSelectProvider(prov);
                            onClose();
                          }}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50 hover:bg-blue-50/70 border border-neutral-200/80 cursor-pointer transition group"
                        >
                          <img
                            src={prov.avatarUrl}
                            alt={prov.name}
                            className="w-12 h-12 rounded-full object-cover border border-neutral-200"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-neutral-900 truncate group-hover:text-blue-800">
                              {prov.name}
                            </h4>
                            <p className="text-[11px] text-blue-600 font-medium truncate">
                              {prov.specialty}
                            </p>
                            <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" /> Cachoeiras de Macacu
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-blue-600" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {filteredResults.products.length === 0 &&
                filteredResults.stores.length === 0 &&
                filteredResults.providers.length === 0 && (
                  <div className="py-12 text-center text-xs text-neutral-500">
                    <p className="font-bold text-neutral-700">Nenhum resultado para "{searchTerm}"</p>
                    <p className="mt-1">Tente pesquisar por categorias como "Comida", "Farmácia", "Serviços" ou "Mercado".</p>
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
