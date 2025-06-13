import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    sku: string;
  };
  variant: {
    id: string;
    size: string;
    color: string;
    stock_quantity: number;
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemCount: () => number;
  getTotal: () => number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      setItems([]);
    }
  }, [user]);

  const fetchCartItems = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          variant_id,
          quantity,
          products!inner (
            id,
            name,
            price,
            sku,
            product_images!inner (
              image_url
            )
          ),
          product_variants!inner (
            id,
            size,
            color,
            stock_quantity
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching cart items:', error);
        return;
      }

      const formattedItems: CartItem[] = data.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        product: {
          id: item.products.id,
          name: item.products.name,
          price: item.products.price,
          image_url: item.products.product_images[0]?.image_url || '',
          sku: item.products.sku,
        },
        variant: {
          id: item.product_variants.id,
          size: item.product_variants.size,
          color: item.product_variants.color,
          stock_quantity: item.product_variants.stock_quantity,
        },
      }));

      setItems(formattedItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, variantId: string, quantity = 1) => {
    if (!user) {
      alert('Please sign in to add items to cart');
      return;
    }

    try {
      // Check if item already exists in cart
      const existingItem = items.find(
        item => item.product_id === productId && item.variant_id === variantId
      );

      if (existingItem) {
        // Update quantity
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        // Add new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            variant_id: variantId,
            quantity,
          });

        if (error) {
          console.error('Error adding to cart:', error);
          return;
        }

        await fetchCartItems();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) {
        console.error('Error updating quantity:', error);
        return;
      }

      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Error removing from cart:', error);
        return;
      }

      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing cart:', error);
        return;
      }

      setItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const refreshCart = async () => {
    await fetchCartItems();
  };

  return (
    <CartContext.Provider value={{
      items,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getItemCount,
      getTotal,
      refreshCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};