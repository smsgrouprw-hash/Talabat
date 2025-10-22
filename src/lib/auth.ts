import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type UserRole = 'admin' | 'customer' | 'supplier';

// Auth utility functions for Talabat Rwanda
export const authHelpers = {
  // Get current authenticated user
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Get current session
  getCurrentSession: async (): Promise<Session | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  },

  // Get user role from database
  getUserRole: async (userId?: string): Promise<UserRole | null> => {
    try {
      const targetUserId = userId || (await authHelpers.getCurrentUser())?.id;
      if (!targetUserId) return null;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      return data?.role as UserRole || null;
    } catch (error) {
      console.error('Error in getUserRole:', error);
      return null;
    }
  },

  // Check if user is a customer
  isCustomer: async (userId?: string): Promise<boolean> => {
    const role = await authHelpers.getUserRole(userId);
    return role === 'customer';
  },

  // Check if user is a supplier
  isSupplier: async (userId?: string): Promise<boolean> => {
    const role = await authHelpers.getUserRole(userId);
    return role === 'supplier';
  },

  // Check if user is an admin
  isAdmin: async (userId?: string): Promise<boolean> => {
    const role = await authHelpers.getUserRole(userId);
    return role === 'admin';
  },

  // Sign up with role metadata
  signUp: async (email: string, password: string, metadata?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    role?: UserRole;
  }) => {
    try {
      console.log('🔵 AUTH: Starting signUp process');
      console.log('🔵 AUTH: Email:', email);
      console.log('🔵 AUTH: Metadata:', JSON.stringify(metadata, null, 2));
      
      const redirectUrl = `${window.location.origin}/`;
      console.log('🔵 AUTH: Redirect URL:', redirectUrl);
      
      console.log('🔵 AUTH: Calling supabase.auth.signUp...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata
        }
      });

      if (error) {
        console.error('❌ AUTH: SignUp error:', error);
        console.error('❌ AUTH: Error details:', JSON.stringify(error, null, 2));
        return { data, error };
      }

      console.log('✅ AUTH: SignUp successful');
      console.log('✅ AUTH: User ID:', data.user?.id);
      console.log('✅ AUTH: User email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
      console.log('✅ AUTH: Session:', data.session ? 'Created' : 'Not created');

      return { data, error };
    } catch (error) {
      console.error('💥 AUTH: Unexpected error in signUp:', error);
      console.error('💥 AUTH: Error stack:', (error as Error).stack);
      return { data: null, error };
    }
  },

  // Sign in
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return { data, error };
    } catch (error) {
      console.error('Error in signIn:', error);
      return { data: null, error };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      console.log('🔴 AUTH: Starting signOut process');
      
      // First, sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ AUTH: SignOut error:', error);
      } else {
        console.log('✅ AUTH: SignOut successful');
      }
      
      // Clear local storage to ensure no session remnants
      localStorage.clear();
      
      // Force reload to clear all state and redirect to login
      window.location.replace('/auth');
      
      return { error: null };
    } catch (error) {
      console.error('💥 AUTH: Unexpected error in signOut:', error);
      
      // Even on error, clear storage and redirect
      localStorage.clear();
      window.location.replace('/auth');
      
      return { error: error as Error };
    }
  },

  // Reset password
  resetPassword: async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      return { data, error };
    } catch (error) {
      console.error('Error in resetPassword:', error);
      return { data: null, error };
    }
  },

  // Update password
  updatePassword: async (newPassword: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      return { data, error };
    } catch (error) {
      console.error('Error in updatePassword:', error);
      return { data: null, error };
    }
  },

  // Assign role to user (admin only)
  assignRole: async (userId: string, role: UserRole) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role })
        .select();

      return { data, error };
    } catch (error) {
      console.error('Error in assignRole:', error);
      return { data: null, error };
    }
  }
};

// Named exports for convenience
export const {
  getCurrentUser,
  getUserRole,
  isCustomer,
  isSupplier,
  isAdmin,
  signUp,
  signIn,
  signOut,
  resetPassword,
  updatePassword,
  assignRole
} = authHelpers;