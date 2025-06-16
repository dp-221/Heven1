import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Coupon {
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
}

export const useCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        return;
      }

      setCoupons(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createCoupon = async (couponData: Omit<Coupon, 'id' | 'created_at' | 'updated_at' | 'used_count'>) => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .insert({
          ...couponData,
          used_count: 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating coupon:', error);
        return;
      }

      setCoupons(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error creating coupon:', error);
    }
  };

  const updateCoupon = async (couponId: string, updates: Partial<Coupon>) => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', couponId)
        .select()
        .single();

      if (error) {
        console.error('Error updating coupon:', error);
        return;
      }

      setCoupons(prev => prev.map(coupon => 
        coupon.id === couponId ? data : coupon
      ));
    } catch (error) {
      console.error('Error updating coupon:', error);
    }
  };

  const deleteCoupon = async (couponId: string) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', couponId);

      if (error) {
        console.error('Error deleting coupon:', error);
        return;
      }

      setCoupons(prev => prev.filter(coupon => coupon.id !== couponId));
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
  };

  return { coupons, loading, error, refetch: fetchCoupons, createCoupon, updateCoupon, deleteCoupon };
};