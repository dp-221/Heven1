import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface WishlistItem {
  id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    price: number;
    original_price: number | null;
    image_url: string;
    sku: string;
    rating: number;
    review_count: number;
    is_active: boolean;
  };
  created_at: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchWishlistItems();
    } else {
      setItems([]);
    }
  }, [user]);

  const fetchWishlistItems = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          id,
          product_id,
          created_at,
          products!inner (
            id,
            name,
            price,
            original_price,
            sku,
            rating,
            review_count,
            is_active,
            product_images!inner (
              image_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching wishlist items:', error);
        return;
      }

      const formattedItems: WishlistItem[] = data.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        created_at: item.created_at,
        product: {
          id: item.products.id,
          name: item.products.name,
          price: item.products.price,
          original_price: item.products.original_price,
          image_url: item.products.product_images[0]?.image_url || '',
          sku: item.products.sku,
          rating: item.products.rating,
          review_count: item.products.review_count,
          is_active: item.products.is_active,
        },
      }));

      setItems(formattedItems);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!user) {
      alert('Please sign in to add items to wishlist');
      return;
    }

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          product_id: productId,
        });

      if (error) {
        if (error.code === '23505') {
          // Item already in wishlist
          return;
        }
        console.error('Error adding to wishlist:', error);
        return;
      }

      await fetchWishlistItems();
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) {
        console.error('Error removing from wishlist:', error);
        return;
      }

      setItems(prev => prev.filter(item => item.product_id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item.product_id === productId);
  };

  const clearWishlist = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing wishlist:', error);
        return;
      }

      setItems([]);
    } catch (error) {
      console.error('Error clearing wishlist:', error);
    }
  };

  const refreshWishlist = async () => {
    await fetchWishlistItems();
  };

  return (
    <WishlistContext.Provider value={{
      items,
      loading,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist,
      refreshWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};