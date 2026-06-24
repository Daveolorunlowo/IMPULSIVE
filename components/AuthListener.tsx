'use client';

import { useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/store/useAuth';

export default function AuthListener() {
  useEffect(() => {
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
  }, []);

  return null;
}
