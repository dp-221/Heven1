import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  is_blocked: boolean;
  created_at: string;
  last_login: string | null;
  total_orders: number;
  total_spent: number;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get users with their profiles and order statistics
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          name,
          phone,
          is_blocked,
          created_at
        `);

      if (profilesError) {
        setError(profilesError.message);
        return;
      }

      // Get auth users for email and last login
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

      if (authError) {
        console.error('Error fetching auth users:', authError);
      }

      // Get order statistics for each user
      const { data: orderStats, error: orderError } = await supabase
        .from('orders')
        .select('user_id, total_amount')
        .eq('status', 'delivered');

      if (orderError) {
        console.error('Error fetching order stats:', orderError);
      }

      // Combine data
      const formattedUsers: User[] = (profilesData || []).map((profile: any) => {
        const authUser = authData?.users.find(u => u.id === profile.user_id);
        const userOrders = orderStats?.filter(order => order.user_id === profile.user_id) || [];
        const totalSpent = userOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

        return {
          id: profile.user_id,
          name: profile.name,
          email: authUser?.email || '',
          phone: profile.phone,
          is_blocked: profile.is_blocked,
          created_at: profile.created_at,
          last_login: authUser?.last_sign_in_at || null,
          total_orders: userOrders.length,
          total_spent: totalSpent,
        };
      });

      setUsers(formattedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserBlock = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: !user.is_blocked })
        .eq('user_id', userId);

      if (error) {
        console.error('Error toggling user block:', error);
        return;
      }

      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, is_blocked: !u.is_blocked }
          : u
      ));
    } catch (error) {
      console.error('Error toggling user block:', error);
    }
  };

  return { users, loading, error, refetch: fetchUsers, toggleUserBlock };
};