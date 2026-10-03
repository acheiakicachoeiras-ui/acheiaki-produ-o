import React, { useState } from 'react';
import {
  ArrowLeft,
  Star,
  MapPin,
  Truck,
  ShieldCheck,
  Check,
  CreditCard,
  ShoppingBag,
  Store,
  Share2,
  Heart,
  ChevronRight,
  Sparkles,
  Clock,
  Plus,
  Minus,
} from 'lucide-react';
import { Product, Store as StoreType } from '../types';
import { useCart } from '../context/CartContext';

interface ProductPageProps {
  product: Product;
  store?: StoreType;
  relatedProducts: Product[];
  onBack: () => void;
  onSelectProduct: (p: Product) => void;
  onSelectStore: (s: StoreType) => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({
  product,
  store,
  relatedProducts,
  onBack,
  onSelectProduct,
  onSelectStore,
}) => {
  const { addItem, setIsCartOpen } = useCart();
  const [selectedImage, setSelectedImage] = useState<string>(product.imageUrl);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('Centro');
  const [notes, setNotes] = useState('');

  const price = product.promoPrice ?? product.price;
  const installmentVal = (price / 3).toFixed(2).replace('.', ',');

  // Fake gallery images if only 1 exists
  const gallery = [
    product.imageUrl,
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
  ];

  const handleBuyNow = () => {
    addItem(product, quantity, notes);
    setIsCartOpen(true);
  };

  const handleAddToCart = () => {
    addItem(product, quantity, notes);
  };

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-800 font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <div className="hidden sm:flex items-center gap-1 text-[11px]">
          <span>Marketplace</span>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          <span>{product.category}</span>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          <span className="font-semibold text-neutral-900 truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      {/* Main Product Showcase Box (Mercado Livre Style) */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-4 sm:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Gallery (5 cols) */}
        <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-3">
          {/* Thumbnails */}
          <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto shrink-0">
            {gallery.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 transition shrink-0 ${
                  selectedImage === img
                    ? 'border-emerald-600 shadow-xs'
                    : 'border-neutral-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Miniatura" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main Large Image */}
          <div className="flex-1 h-72 sm:h-96 bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200 flex items-center justify-center relative">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover transition duration-300"
            />
            {product.promoPrice && (
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-red-600 text-white text-xs font-black shadow-md">
                OFERTA DO DIA
              </span>
            )}
          </div>
        </div>

        {/* Right Col: Details, Pricing & Buy Box (6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Novo • {product.category}
              </span>
              <span>SKU: {product.sku || 'N/A'}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="font-extrabold text-neutral-800">4.9</span>
              <span>(48 opiniões de moradores de Macacu)</span>
            </div>

            {/* Price Box */}
            <div className="pt-2 border-t border-neutral-100">
              {product.promoPrice ? (
                <div className="space-y-0.5">
                  <span className="text-xs text-neutral-400 line-through">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-700 font-['Space_Grotesk']">
                      R$ {product.promoPrice.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {Math.round(((product.price - product.promoPrice) / product.price) * 100)}% OFF
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-3xl font-black text-neutral-900 font-['Space_Grotesk']">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </div>
              )}
              <p className="text-xs text-neutral-500 mt-1">
                em até <strong className="text-neutral-800">3x de R$ {installmentVal}</strong> sem juros no cartão
              </p>
            </div>

            {/* Local Shipping Estimator (Cachoeiras de Macacu) */}
            <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
              <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Chega hoje em Cachoeiras de Macacu</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <span>Bairro de entrega:</span>
                <select
                  value={selectedNeighborhood}
                  onChange={(e) => setSelectedNeighborhood(e.target.value)}
                  className="px-2 py-1 bg-white border border-neutral-300 rounded-lg text-xs font-semibold focus:outline-emerald-500"
                >
                  <option value="Centro">Centro</option>
                  <option value="Papucaia">Papucaia</option>
                  <option value="Castália">Castália</option>
                  <option value="Japuíba">Japuíba</option>
                  <option value="Campo do Prado">Campo do Prado</option>
                  <option value="Funchal">Funchal</option>
                </select>
                <span className="font-extrabold text-neutral-900 ml-auto">Frete R$ 5,00</span>
              </div>
            </div>

            {/* Seller Reputation Box (Mercado Livre Style) */}
            <div className="p-3.5 bg-white rounded-2xl border border-neutral-200/90 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                    Vendido e entregue por
                  </span>
                  <h4
                    onClick={() => store && onSelectStore(store)}
                    className="text-xs font-black text-neutral-900 hover:text-emerald-700 cursor-pointer"
                  >
                    {product.storeName}
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                  MERCADO LÍDER LOCAL
                </span>
              </div>

              {/* Reputation Thermometer Bar */}
              <div className="space-y-1">
                <div className="grid grid-cols-5 gap-1 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-red-400 rounded-l" />
                  <div className="bg-orange-400" />
                  <div className="bg-yellow-400" />
                  <div className="bg-emerald-400" />
                  <div className="bg-emerald-600 rounded-r" />
                </div>
                <div className="grid grid-cols-3 text-center text-[10px] text-neutral-500 pt-1">
                  <div>
                    <strong className="block text-neutral-800">100%</strong> Entregas no prazo
                  </div>
                  <div>
                    <strong className="block text-neutral-800">148+</strong> Vendas concluídas
                  </div>
                  <div>
                    <strong className="block text-neutral-800">Ótimo</strong> Atendimento
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity Controller & Notes */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs text-neutral-500 font-medium">Quantidade:</span>
              <div className="flex items-center gap-1.5 bg-neutral-100 rounded-xl p-1 border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 rounded-lg text-neutral-600 hover:bg-white"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-xs font-bold text-neutral-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 rounded-lg text-neutral-600 hover:bg-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[11px] text-neutral-400">
                ({product.stockQuantity} unidades disponíveis em estoque)
              </span>
            </div>
          </div>

          {/* Action Buttons: Comprar Agora + Adicionar ao Carrinho */}
          <div className="space-y-2 pt-3 border-t border-neutral-100">
            <button
              onClick={handleBuyNow}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
            >
              <span>Comprar Agora</span>
              <span>— R$ {(price * quantity).toFixed(2).replace('.', ',')}</span>
            </button>

            <button
              onClick={handleAddToCart}
              className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 active:scale-98"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Adicionar ao Carrinho</span>
            </button>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 shadow-xs space-y-3">
        <h3 className="text-base font-extrabold text-neutral-900">Descrição do Produto</h3>
        <p className="text-xs text-neutral-600 leading-relaxed max-w-4xl whitespace-pre-line">
          {product.description}
        </p>
      </div>

      {/* Related Products from other stores in Cachoeiras */}
      {relatedProducts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-neutral-900">
            Quem comprou este produto também comprou em Cachoeiras
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.slice(0, 4).map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className="bg-white rounded-2xl border border-neutral-200 p-3 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
              >
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full h-28 object-cover rounded-xl border border-neutral-200 group-hover:scale-103 transition"
                />
                <div className="mt-2">
                  <h4 className="text-xs font-bold text-neutral-900 truncate group-hover:text-emerald-700">
                    {p.name}
                  </h4>
                  <span className="text-xs font-black text-neutral-900 mt-1 block">
                    R$ {(p.promoPrice ?? p.price).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
