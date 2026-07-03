// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  reviewerName: string;
  reviewerRole: string;
  reviewerEmail: string;
  token: string | null;
  aiThreshold: number;
  setReviewerName: (name: string) => void;
  setReviewerRole: (role: string) => void;
  setAiThreshold: (threshold: number) => void;
  login: (name: string, role: string, email: string, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  getAvatarInitials: () => string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      reviewerName: '',
      reviewerRole: '',
      reviewerEmail: '',
      token: null,
      aiThreshold: 80,

      setReviewerName: (name) => set({ reviewerName: name }),
      setReviewerRole: (role) => set({ reviewerRole: role }),
      setAiThreshold: (threshold) => set({ aiThreshold: threshold }),

      login: (name, role, email, token) => set({
        reviewerName: name,
        reviewerRole: role,
        reviewerEmail: email,
        token: token
      }),
      logout: () => set({
        reviewerName: '',
        reviewerRole: '',
        reviewerEmail: '',
        token: null
      }),
      isAuthenticated: () => !!get().token,

      getAvatarInitials: () => {
        const name = get().reviewerName || 'Anonymous User';
        return name
          .split(' ')
          .filter(Boolean)
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();
      },
    }),
    { name: 'blueocean-auth' }
  )
);
