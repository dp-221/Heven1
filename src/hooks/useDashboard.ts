import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  usersGrowth: number;
  topProducts: Array<{
    product: {
      id: string;
      name: string;
      image_url: string;
      price: number;
    };
    sales: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    order_number: string;
    status: string;
    total_amount: number;
    created_at: string;
    customer_name: string;
  }>;
  salesData: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get total revenue and orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, created_at, status');

      if (ordersError) throw ordersError;

      const totalRevenue = ordersData?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;
      const totalOrders = ordersData?.length || 0;

      // Get total users
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Get total products
      const { count: totalProducts, error: productsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (productsError) throw productsError;

      // Calculate growth rates (comparing last 30 days vs previous 30 days)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const recentOrders = ordersData?.filter(order => new Date(order.created_at) >= thirtyDaysAgo) || [];
      const previousOrders = ordersData?.filter(order => {
        const date = new Date(order.created_at);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
      }) || [];

      const recentRevenue = recentOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
      const previousRevenue = previousOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

      const revenueGrowth = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      const ordersGrowth = previousOrders.length > 0 ? ((recentOrders.length - previousOrders.length) / previousOrders.length) * 100 : 0;

      // Get user growth
      const { count: recentUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      const { count: previousUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString());

      const usersGrowth = (previousUsersCount || 0) > 0 ? (((recentUsersCount || 0) - (previousUsersCount || 0)) / (previousUsersCount || 1)) * 100 : 0;

      // Get top products
      const { data: topProductsData, error: topProductsError } = await supabase
        .from('order_items')
        .select(`
          product_id,
          quantity,
          total_price,
          products (
            id,
            name,
            price,
            product_images!inner (
              image_url
            )
          )
        `);

      if (topProductsError) throw topProductsError;

      const productStats = (topProductsData || []).reduce((acc: any, item: any) => {
        const productId = item.product_id;
        if (!acc[productId]) {
          acc[productId] = {
            product: {
              id: item.products.id,
              name: item.products.name,
              price: item.products.price,
              image_url: item.products.product_images[0]?.image_url || '',
            },
            sales: 0,
            revenue: 0,
          };
        }
        acc[productId].sales += item.quantity;
        acc[productId].revenue += parseFloat(item.total_price);
        return acc;
      }, {});

      const topProducts = Object.values(productStats)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 5);

      // Get recent orders with customer info
      const { data: recentOrdersData, error: recentOrdersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total_amount,
          created_at,
          addresses!shipping_address_id (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentOrdersError) throw recentOrdersError;

      const recentOrdersFormatted = (recentOrdersData || []).map((order: any) => ({
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        total_amount: parseFloat(order.total_amount),
        created_at: order.created_at,
        customer_name: order.addresses?.name || 'Unknown',
      }));

      // Generate sales data for last 7 days
      const salesData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayOrders = ordersData?.filter(order => 
          order.created_at.startsWith(dateStr)
        ) || [];
        
        const dayRevenue = dayOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
        
        salesData.push({
          date: dateStr,
          revenue: dayRevenue,
          orders: dayOrders.length,
        });
      }

      setStats({
        totalRevenue,
        totalOrders,
        totalUsers: totalUsers || 0,
        totalProducts: totalProducts || 0,
        revenueGrowth,
        ordersGrowth,
        usersGrowth,
        topProducts: topProducts as any,
        recentOrders: recentOrdersFormatted,
        salesData,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refetch: fetchDashboardStats };
};