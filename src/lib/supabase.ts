import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string | null;
          avatar_url: string | null;
          is_blocked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone?: string | null;
          avatar_url?: string | null;
          is_blocked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          is_blocked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          category_id: string | null;
          price: number;
          original_price: number | null;
          sku: string;
          stock_quantity: number;
          is_active: boolean;
          is_featured: boolean;
          is_trending: boolean;
          rating: number;
          review_count: number;
          created_at: string;
          updated_at: string;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          alt_text: string | null;
          is_primary: boolean;
          sort_order: number;
          created_at: string;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          size: string;
          color: string;
          stock_quantity: number;
          price_adjustment: number;
          sku: string | null;
          created_at: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          variant_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
      };
      wishlist_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          street: string;
          city: string;
          state: string;
          zip_code: string;
          country: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          order_number: string;
          status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
          subtotal: number;
          tax_amount: number;
          shipping_amount: number;
          discount_amount: number;
          total_amount: number;
          payment_method: string | null;
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
          shipping_address_id: string | null;
          coupon_id: string | null;
          tracking_number: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          type: 'percentage' | 'fixed';
          value: number;
          min_order_value: number;
          max_discount: number | null;
          usage_limit: number | null;
          used_count: number;
          is_active: boolean;
          expires_at: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}