'use client';

import { useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/store/useAuth';

export default function AuthListener() {
  useEffect(() => {
    // Fetch products in the background on app load
    import('@/store/useProducts').then(m => m.useProducts.getState().fetchProducts());

    try {
      const supabase = getSupabaseClient();

      // Fetch initial session and sync with store
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const existingActivity = useAuth.getState().user?.activity || [];
          useAuth.setState({
            user: {
              id: session.user.id,
              email: session.user.email || '',
              isVerified: true,
              activity: existingActivity
            },
            isAuthenticated: true
          });
          import('@/store/useCart').then(m => m.useCart.getState().syncWithCloud());
        }
      });

      // Listen to changes in auth state (login, logout, token refresh)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const existingActivity = useAuth.getState().user?.activity || [];
          useAuth.setState({
            user: {
              id: session.user.id,
              email: session.user.email || '',
              isVerified: true,
              activity: existingActivity
            },
            isAuthenticated: true
          });
          // Sync cart with cloud on login
          import('@/store/useCart').then(m => m.useCart.getState().syncWithCloud());
        } else {
          useAuth.setState({
            user: null,
            isAuthenticated: false
          });
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.warn('[AuthListener] Supabase client initialization failed:', error);
    }
  }, []);

  return null;
}
