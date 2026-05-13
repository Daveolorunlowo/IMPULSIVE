import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  signup: (email: string) => void;
  verify: (code: string) => boolean;
  signin: (email: string) => void;
  logout: () => void;
  trackActivity: (action: string) => void;
  getAllUsers: () => User[]; // For the admin dot
}

// In a real app, this would be a database. For this demo, we'll use local storage via persist.
export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      verificationCode: null,
      pendingEmail: null,

      signup: (email: string) => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`[AUTH] Verification code for ${email}: ${code}`);
        set({ verificationCode: code, pendingEmail: email });
        // In a real app, you'd call an API here
      },

      verify: (code: string) => {
        const { verificationCode, pendingEmail } = get();
        if (code === verificationCode && pendingEmail) {
          const newUser: User = {
            id: Math.random().toString(36).substring(2, 15),
            email: pendingEmail,
            isVerified: true,
            activity: [{ action: 'Account Created', timestamp: new Date().toISOString() }]
          };
          set({ 
            user: newUser, 
            isAuthenticated: true, 
            verificationCode: null, 
            pendingEmail: null 
          });
          return true;
        }
        return false;
      },

      signin: (email: string) => {
        // Simple mock signin
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`[AUTH] Login verification code for ${email}: ${code}`);
        set({ verificationCode: code, pendingEmail: email });
      },

      logout: () => set({ user: null, isAuthenticated: false }),

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
        // This is a simplified mock. In a real app, this would fetch from a DB.
        const currentUser = get().user;
        return currentUser ? [currentUser] : [];
      }
    }),
    {
      name: 'impulsive-auth-storage',
    }
  )
);
