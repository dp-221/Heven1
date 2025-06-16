import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
  createdAt: Date;
  lastLogin: Date;
}

interface AdminContextType {
  admin: Admin | null;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        setIsLoading(false);
        return false;
      }

      // Check if user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select(`
          id,
          role,
          permissions,
          is_active,
          created_at,
          profiles!inner (
            name
          )
        `)
        .eq('user_id', authData.user.id)
        .eq('is_active', true)
        .single();

      if (adminError || !adminData) {
        // Sign out if not an admin
        await supabase.auth.signOut();
        setIsLoading(false);
        return false;
      }

      // Set admin data
      setAdmin({
        id: adminData.id,
        name: adminData.profiles.name,
        email: authData.user.email || '',
        role: adminData.role,
        permissions: adminData.permissions || [],
        createdAt: new Date(adminData.created_at),
        lastLogin: new Date(),
      });

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Admin login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const adminLogout = async () => {
    await supabase.auth.signOut();
    setAdmin(null);
  };

  return (
    <AdminContext.Provider value={{
      admin,
      adminLogin,
      adminLogout,
      isLoading,
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};