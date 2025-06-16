import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string | null;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  shipping_address: {
    id: string;
    name: string;
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  } | null;
  coupon: {
    id: string;
    code: string;
    type: string;
    value: number;
  } | null;
  order_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product: {
      id: string;
      name: string;
      sku: string;
      image_url: string;
    };
    variant: {
      id: string;
      size: string;
      color: string;
    } | null;
  }>;
}

export const useOrders = (adminView = false) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, [user, adminView]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          subtotal,
          tax_amount,
          shipping_amount,
          discount_amount,
          total_amount,
          payment_method,
          payment_status,
          tracking_number,
          notes,
          created_at,
          updated_at,
          addresses!shipping_address_id (
            id,
            name,
            street,
            city,
            state,
            zip_code,
            country
          ),
          coupons (
            id,
            code,
            type,
            value
          ),
          order_items (
            id,
            quantity,
            unit_price,
            total_price,
            products (
              id,
              name,
              sku,
              product_images!inner (
                image_url
              )
            ),
            product_variants (
              id,
              size,
              color
            )
          )
        `)
        .order('created_at', { ascending: false });

      // If not admin view, filter by user
      if (!adminView && user) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        setError(error.message);
        return;
      }

      const formattedOrders: Order[] = (data || []).map((order: any) => ({
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        subtotal: order.subtotal,
        tax_amount: order.tax_amount,
        shipping_amount: order.shipping_amount,
        discount_amount: order.discount_amount,
        total_amount: order.total_amount,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        tracking_number: order.tracking_number,
        notes: order.notes,
        created_at: order.created_at,
        updated_at: order.updated_at,
        shipping_address: order.addresses,
        coupon: order.coupons,
        order_items: order.order_items.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          product: {
            id: item.products.id,
            name: item.products.name,
            sku: item.products.sku,
            image_url: item.products.product_images[0]?.image_url || '',
          },
          variant: item.product_variants,
        })),
      }));

      setOrders(formattedOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        return;
      }

      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status, updated_at: new Date().toISOString() }
          : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  return { orders, loading, error, refetch: fetchOrders, updateOrderStatus };
};