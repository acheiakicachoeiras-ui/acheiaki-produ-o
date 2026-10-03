import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Store, ShieldCheck, Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onNavigateToStore?: (storeId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onNavigateToStore,
}) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  if (!product) return null;

  const price = product.promoPrice ?? product.price;

  const handleAddToCart = () => {
    addItem(product, quantity, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        {/* Product Image Header */}
        <div className="relative h-60 sm:h-72 bg-neutral-100">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-xs text-neutral-600 hover:text-neutral-900 shadow-md"
          >
            <X className="w-5 h-5" />
          </button>
          {product.promoPrice && (
            <span className="absolute top-4 left-4 px-2.5 py-1 rounded-xl bg-red-600 text-white text-xs font-black shadow-md">
              OFERTA ESPECIAL
            </span>
          )}
        </div>

        {/* Details Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                {product.category}
              </span>
              {product.sku && <span>SKU: {product.sku}</span>}
            </div>

            <h2 className="text-lg sm:text-xl font-black text-neutral-900 leading-snug">
              {product.name}
            </h2>

            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-1">
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span>Vendido por: <strong>{product.storeName}</strong></span>
            </div>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed">
            {product.description}
          </p>

          <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-neutral-400 block font-medium">Preço</span>
              {product.promoPrice ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-neutral-400 line-through">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-xl font-black text-emerald-700">
                    R$ {product.promoPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ) : (
                <span className="text-xl font-black text-neutral-900">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>

            {/* Quantity Controller */}
            <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center font-bold text-sm text-neutral-800">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Observations */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Alguma observação para o produto?
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Pão bem quentinho, sem açúcar, embalar para presente..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-emerald-500 bg-neutral-50"
            />
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Adicionar ao Carrinho</span>
            </div>
            <span>R$ {(price * quantity).toFixed(2).replace('.', ',')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
