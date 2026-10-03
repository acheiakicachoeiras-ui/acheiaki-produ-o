import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, Address, PlatformSettings } from '../types';
import { useAuth } from './AuthContext';
import { createOrder, getPlatformSettings } from '../services/firestoreService';
import confetti from 'canvas-confetti';

interface CartContextType {
  items: CartItem[];
  currentStoreId: string | null;
  currentStoreName: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  addItem: (product: Product, quantity?: number, notes?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  checkout: (
    deliveryAddress: Address,
    paymentMethod: 'pix' | 'credit_card' | 'cash',
    notes?: string
  ) => Promise<string>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('conectai_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [deliveryFee, setDeliveryFee] = useState<number>(5.0);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Load platform delivery fee
  useEffect(() => {
    getPlatformSettings().then((settings) => {
      if (settings?.defaultDeliveryFee) {
        setDeliveryFee(settings.defaultDeliveryFee);
      }
    });
  }, []);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('conectai_cart_items', JSON.stringify(items));
    } catch (e) {
      console.warn('Erro ao salvar carrinho no cache local:', e);
    }
  }, [items]);

  const currentStoreId = items.length > 0 ? items[0].product.storeId : null;
  const currentStoreName = items.length > 0 ? items[0].product.storeName : null;

  const addItem = (product: Product, quantity = 1, notes = '') => {
    setItems((prev) => {
      // Check if product belongs to another store
      if (prev.length > 0 && prev[0].product.storeId !== product.storeId) {
        if (
          !window.confirm(
            `Seu carrinho já contém itens da loja "${prev[0].product.storeName}". Deseja limpar o carrinho para adicionar produtos de "${product.storeName}"?`
          )
        ) {
          return prev;
        }
        return [{ product, quantity, selectedNotes: notes }];
      }

      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        if (notes) next[existingIndex].selectedNotes = notes;
        return next;
      }
      return [...prev, { product, quantity, selectedNotes: notes }];
    });
    setIsCartOpen(true);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((sum, item) => {
    const unitPrice = item.product.promoPrice ?? item.product.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  const total = subtotal > 0 ? subtotal + deliveryFee : 0;

  const checkout = async (
    deliveryAddress: Address,
    paymentMethod: 'pix' | 'credit_card' | 'cash',
    notes = ''
  ): Promise<string> => {
    if (items.length === 0 || !currentStoreId || !userProfile) {
      throw new Error('Carrinho vazio ou usuário não autenticado.');
    }

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const platformCommission = subtotal * 0.10; // 10% platform SaaS commission
    const merchantPayout = subtotal - platformCommission;

    const newOrder: Order = {
      id: orderId,
      customerId: userProfile.uid,
      customerName: userProfile.displayName,
      customerPhone: userProfile.phone || '(21) 99999-0000',
      storeId: currentStoreId,
      storeName: currentStoreName || 'Loja Parceira',
      items: items.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        price: i.product.promoPrice ?? i.product.price,
        quantity: i.quantity,
        imageUrl: i.product.imageUrl,
      })),
      subtotal,
      deliveryFee,
      discount: 0,
      total,
      platformCommission,
      merchantPayout,
      status: 'received',
      deliveryAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
      notes,
      createdAt: new Date().toISOString(),
    };

    await createOrder(newOrder);

    // Confetti celebration for placing real order
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    clearCart();
    setIsCartOpen(false);
    return orderId;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        currentStoreId,
        currentStoreName,
        subtotal,
        deliveryFee,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser utilizado dentro de CartProvider');
  }
  return context;
};
