'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type CartItem = {
  id_producto: string;
  sku: string;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  stock_actual: number;
  imagen_principal: string | null;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id_producto: string) => void;
  updateQuantity: (id_producto: string, cantidad: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Cargar desde localStorage inicial
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('koregt_cart');
    if (saved) {
      try { setCart(JSON.parse(saved)); } catch(e) {}
    }
  }, []);

  // Guardar en localStorage con cada cambio
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('koregt_cart', JSON.stringify(cart));
    }
  }, [cart, mounted]);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id_producto === item.id_producto);
      if (existing) {
        // Asegurar que no exceda el stock
        const newQty = Math.min(existing.cantidad + item.cantidad, existing.stock_actual);
        return prev.map(i => i.id_producto === item.id_producto ? { ...i, cantidad: newQty } : i);
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id_producto: string) => {
    setCart(prev => prev.filter(i => i.id_producto !== id_producto));
  };

  const updateQuantity = (id_producto: string, cantidad: number) => {
    setCart(prev => prev.map(i => {
      if (i.id_producto === id_producto) {
        // Restringir entre 1 y el stock máximo
        const val = Math.max(1, Math.min(cantidad, i.stock_actual));
        return { ...i, cantidad: val };
      }
      return i;
    }));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.precio_unitario * item.cantidad), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error('useCart debe ser usado dentro de CartProvider');
  return context;
};
