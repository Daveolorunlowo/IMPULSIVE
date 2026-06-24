import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSupabaseClient } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  isVerified: boolean;
  activity: { action: string; timestamp: string }[];
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  verificationCode: string | null;
  pendingEmail: string | null;
  
  // Actions
  signup: (email: string) => Promise<void>;
  verify: (code: string) => Promise<boolean>;
  signin: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  trackActivity: (action: string) => void;
  getAllUsers: () => User[]; // For the admin dot
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      verificationCode: null,
      pendingEmail: null,

      signup: async (email: string) => {
        // Pre-validate email with our backend endpoint
        try {
          const res = await fetch('/api/auth/send-code', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, code: 'VALIDATE_ONLY' }),
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to validate email');
          }
        } catch (error) {
          console.error('[AUTH] Pre-validation failed:', error);
          throw error;
        }

        // Trigger Supabase client-side OTP
        const supabase = getSupabaseClient();
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: true,
          },
        });

        if (error) {
          console.error('[AUTH] Supabase signInWithOtp failed:', error.message);
          throw error;
        }

        set({ pendingEmail: email });
      },

      verify: async (code: string) => {
        const { pendingEmail } = get();
        if (!pendingEmail) return false;

        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.verifyOtp({
          email: pendingEmail,
          token: code,
          type: 'email',
        });

        if (error || !data.user) {
          console.error('[AUTH] Supabase verifyOtp failed:', error?.message);
          return false;
        }

        const newUser: User = {
          id: data.user.id,
          email: data.user.email || pendingEmail,
          isVerified: true,
          activity: [{ action: 'Account Verified/Logged In', timestamp: new Date().toISOString() }],
        };

        set({
          user: newUser,
          isAuthenticated: true,
          verificationCode: null,
          pendingEmail: null,
        });

        return true;
      },

      signin: async (email: string) => {
        // Trigger pre-validation
        try {
          const res = await fetch('/api/auth/send-code', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, code: 'VALIDATE_ONLY' }),
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to validate email');
          }
        } catch (error) {
          console.error('[AUTH] Pre-validation failed:', error);
          throw error;
        }

        // Trigger Supabase client-side OTP (same as signup for passwordless)
        const supabase = getSupabaseClient();
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: true,
          },
        });

        if (error) {
          console.error('[AUTH] Supabase signInWithOtp failed:', error.message);
          throw error;
        }

        set({ pendingEmail: email });
      },

      logout: async () => {
        const supabase = getSupabaseClient();
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false, pendingEmail: null, verificationCode: null });
      },

      trackActivity: (action: string) => {
        const { user } = get();
        if (user) {
          const updatedUser = {
            ...user,
            activity: [...user.activity, { action, timestamp: new Date().toISOString() }]
          };
          set({ user: updatedUser });
        }
      },

      getAllUsers: () => {
        const currentUser = get().user;
        return currentUser ? [currentUser] : [];
      }
    }),
    {
      name: 'impulsive-auth-storage',
    }
  )
);
