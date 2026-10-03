import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  MapPin,
  CreditCard,
  QrCode,
  Banknote,
  AlertCircle,
  ArrowRight,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Address } from '../types';

interface CartDrawerProps {
  onOrderPlaced: (orderId: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOrderPlaced }) => {
  const {
    items,
    currentStoreName,
    subtotal,
    deliveryFee,
    total,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    checkout,
  } = useCart();

  const { userProfile, updateUserAddresses } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'cash'>('pix');
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showAddressForm, setShowAddressForm] = useState<boolean>(false);

  // New address state for Cachoeiras de Macacu
  const [newStreet, setNewStreet] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newNeighborhood, setNewNeighborhood] = useState('Centro');

  const addresses = userProfile?.addresses || [
    {
      id: 'addr_default_macacu',
      label: 'Casa',
      street: 'Rua das Palmeiras',
      number: '120',
      neighborhood: 'Centro',
      city: 'Cachoeiras de Macacu',
      zipCode: '28680-000',
      isDefault: true,
    },
  ];

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet || !newNumber) return;
    const newAddr: Address = {
      id: `addr_${Date.now()}`,
      label: 'Endereço Alternativo',
      street: newStreet,
      number: newNumber,
      neighborhood: newNeighborhood,
      city: 'Cachoeiras de Macacu',
      zipCode: '28680-000',
    };
    const updated = [...addresses, newAddr];
    await updateUserAddresses(updated);
    setSelectedAddressIndex(updated.length - 1);
    setShowAddressForm(false);
    setNewStreet('');
    setNewNumber('');
  };

  const handleConfirmCheckout = async () => {
    if (items.length === 0) return;
    const activeAddress = addresses[selectedAddressIndex] || addresses[0];
    if (!activeAddress) {
      alert('Por favor, informe um endereço de entrega em Cachoeiras de Macacu.');
      return;
    }

    try {
      setIsSubmitting(true);
      const orderId = await checkout(activeAddress, paymentMethod, notes);
      onOrderPlaced(orderId);
    } catch (err) {
      console.error('Erro ao finalizar pedido:', err);
      alert('Não foi possível finalizar o pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-900">Seu Carrinho</h2>
                {currentStoreName && (
                  <p className="text-xs text-neutral-500 font-medium truncate max-w-[200px]">
                    Loja: {currentStoreName}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-800">
                    Seu carrinho está vazio
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                    Explore as melhores padarias, restaurantes, farmácias e mercados de Cachoeiras de Macacu.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                >
                  Continuar Comprando
                </button>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
                    <span>Itens Selecionados ({items.length})</span>
                    <button
                      onClick={clearCart}
                      className="text-red-500 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Limpar
                    </button>
                  </div>

                  {items.map((item) => {
                    const price = item.product.promoPrice ?? item.product.price;
                    return (
                      <div
                        key={item.product.id}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80"
                      >
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-14 h-14 rounded-xl object-cover border border-neutral-200"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-neutral-900 truncate">
                            {item.product.name}
                          </h4>
                          <div className="text-xs text-emerald-700 font-extrabold mt-0.5">
                            R$ {(price * item.quantity).toFixed(2).replace('.', ',')}
                            <span className="text-[10px] text-neutral-400 font-normal ml-1">
                              (R$ {price.toFixed(2).replace('.', ',')} un)
                            </span>
                          </div>
                          {item.selectedNotes && (
                            <p className="text-[10px] text-neutral-500 italic mt-0.5 truncate">
                              Obs: {item.selectedNotes}
                            </p>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 bg-white border border-neutral-200 rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 rounded text-neutral-500 hover:bg-neutral-100 transition"
                            title="Diminuir"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-neutral-800 w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 rounded text-neutral-500 hover:bg-neutral-100 transition"
                            title="Aumentar"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Delivery Address in Cachoeiras de Macacu */}
                <div className="space-y-2 pt-2 border-t border-neutral-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      Endereço de Entrega
                    </span>
                    <button
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="text-xs text-emerald-600 hover:underline font-semibold"
                    >
                      {showAddressForm ? 'Cancelar' : '+ Novo'}
                    </button>
                  </div>

                  {showAddressForm ? (
                    <form
                      onSubmit={handleAddNewAddress}
                      className="p-3 rounded-2xl bg-neutral-100/70 border border-neutral-200 space-y-2.5 text-xs"
                    >
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                          Rua / Avenida
                        </label>
                        <input
                          type="text"
                          required
                          value={newStreet}
                          onChange={(e) => setNewStreet(e.target.value)}
                          placeholder="Ex: Rua Getúlio Vargas"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white focus:outline-emerald-500 text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                            Número
                          </label>
                          <input
                            type="text"
                            required
                            value={newNumber}
                            onChange={(e) => setNewNumber(e.target.value)}
                            placeholder="Ex: 45"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white focus:outline-emerald-500 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                            Bairro (Cachoeiras)
                          </label>
                          <select
                            value={newNeighborhood}
                            onChange={(e) => setNewNeighborhood(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white focus:outline-emerald-500 text-xs"
                          >
                            <option value="Centro">Centro</option>
                            <option value="Papucaia">Papucaia</option>
                            <option value="Castália">Castália</option>
                            <option value="Japuíba">Japuíba</option>
                            <option value="Campo do Prado">Campo do Prado</option>
                            <option value="Funchal">Funchal</option>
                            <option value="Boca do Mato">Boca do Mato</option>
                          </select>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition text-xs"
                      >
                        Salvar e Usar Este Endereço
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-1.5">
                      {addresses.map((addr, idx) => (
                        <label
                          key={addr.id}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                            selectedAddressIndex === idx
                              ? 'bg-emerald-50/80 border-emerald-400 text-emerald-900 shadow-xs'
                              : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressIndex === idx}
                            onChange={() => setSelectedAddressIndex(idx)}
                            className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="flex-1 text-xs">
                            <div className="font-bold flex items-center justify-between">
                              <span>{addr.label}</span>
                              <span className="text-[10px] font-medium text-neutral-400">
                                {addr.neighborhood}
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-500 mt-0.5">
                              {addr.street}, {addr.number} • Cachoeiras de Macacu
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="space-y-2 pt-2 border-t border-neutral-200">
                  <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    Forma de Pagamento
                  </span>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition ${
                        paymentMethod === 'pix'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                          : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <span>PIX Instant</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('credit_card')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition ${
                        paymentMethod === 'credit_card'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                          : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span>Cartão</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition ${
                        paymentMethod === 'cash'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                          : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-amber-600" />
                      <span>Dinheiro</span>
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div className="pt-2 border-t border-neutral-200">
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Observações para o Pedido
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Deixar na portaria, ponto de referência perto do posto de gasolina..."
                    className="w-full p-2 rounded-xl border border-neutral-200 text-xs focus:outline-emerald-500 bg-neutral-50"
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer & Totals */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 bg-neutral-50 border-t border-neutral-200 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal dos itens</span>
                  <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span className="flex items-center gap-1">
                    Entrega Local (Cachoeiras de Macacu)
                  </span>
                  <span>R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-neutral-900 pt-1.5 border-t border-neutral-200">
                  <span>Total do Pedido</span>
                  <span className="text-emerald-700 text-base">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              <button
                disabled={isSubmitting}
                onClick={handleConfirmCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirmar Pedido</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-neutral-400">
                🔒 Pedido seguro salvo com persistência no Firebase Firestore
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
