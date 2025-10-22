import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { authHelpers, type UserRole } from '@/lib/auth';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    let isSubscribed = true;
    
    // Set up auth state listener (synchronous to prevent deadlocks)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isSubscribed) return;
        
        console.log('Auth state change:', { event, session: !!session });
        const user = session?.user ?? null;

        // Update state synchronously
        setState({
          session,
          user,
          role: null, // Will be fetched in deferred call
          loading: false,
          isAuthenticated: !!user,
        });

        // Defer role fetching to prevent deadlock
        if (user) {
          setTimeout(() => {
            if (!isSubscribed) return;
            authHelpers.getUserRole(user.id)
              .then(role => {
                if (isSubscribed) {
                  setState(prev => ({ ...prev, role }));
                  console.log('User role fetched:', role);
                }
              })
              .catch(error => {
                console.error('Error fetching user role:', error);
              });
          }, 0);
        }
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        if (!isSubscribed) return;
        
        console.log('Getting initial session...');
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user ?? null;

        // Set initial state
        setState({
          session,
          user,
          role: null,
          loading: false,
          isAuthenticated: !!user,
        });

        // Defer role fetch
        if (user && isSubscribed) {
          setTimeout(() => {
            if (!isSubscribed) return;
            authHelpers.getUserRole(user.id)
              .then(role => {
                if (isSubscribed) {
                  setState(prev => ({ ...prev, role }));
                  console.log('Initial role fetched:', role);
                }
              })
              .catch(error => {
                console.error('Error fetching initial role:', error);
              });
          }, 0);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (isSubscribed) {
          setState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    getInitialSession();
    
    // Add timeout fallback to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      if (isSubscribed) {
        console.warn('Auth initialization timeout - setting loading to false');
        setState(prev => ({ ...prev, loading: false }));
      }
    }, 5000);

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
      clearTimeout(fallbackTimeout);
    };
  }, []);

  const refreshUserRole = async () => {
    if (state.user) {
      const role = await authHelpers.getUserRole(state.user.id);
      setState(prev => ({ ...prev, role }));
    }
  };

  return {
    ...state,
    refreshUserRole,
    // Convenience role checks
    isCustomer: state.role === 'customer',
    isSupplier: state.role === 'supplier',
    isAdmin: state.role === 'admin',
  };
};