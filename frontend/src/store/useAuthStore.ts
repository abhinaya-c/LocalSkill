import { create } from 'zustand';
import { UserRole } from 'shared';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setAuth: (user: AuthUser, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitialized: false,

  setAuth: (user, accessToken) => {
    localStorage.setItem('auth_user', JSON.stringify(user));
    localStorage.setItem('auth_token', accessToken);
    set({ user, accessToken, isAuthenticated: true });
  },

  setAccessToken: (token) => {
    localStorage.setItem('auth_token', token);
    set({ accessToken: token });
  },

  logout: () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    
    // Clear cookies via backend call
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(console.error);
    
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  initialize: async () => {
    const storedUser = localStorage.getItem('auth_user');
    const storedToken = localStorage.getItem('auth_token');

    if (storedUser && storedToken) {
      try {
        set({
          user: JSON.parse(storedUser),
          accessToken: storedToken,
          isAuthenticated: true,
          isInitialized: true,
        });
        return;
      } catch {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
      }
    }

    // Try fetching /api/profiles/me to see if we have an active refresh cookie session
    if (storedToken) {
      try {
        const response = await fetch('/api/profiles/me', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (response.ok) {
          const user = await response.json();
          set({
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              avatarUrl: user.avatarUrl,
            },
            accessToken: storedToken,
            isAuthenticated: true,
          });
        } else {
          // Token might have expired, try fetching refresh
          const refreshRes = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
          });
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            // Fetch profile with new access token
            const profileRes = await fetch('/api/profiles/me', {
              headers: { Authorization: `Bearer ${data.accessToken}` },
            });
            if (profileRes.ok) {
              const user = await profileRes.json();
              const authUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
              };
              localStorage.setItem('auth_user', JSON.stringify(authUser));
              localStorage.setItem('auth_token', data.accessToken);
              set({
                user: authUser,
                accessToken: data.accessToken,
                isAuthenticated: true,
              });
            }
          }
        }
      } catch {
        // Silent catch, user is guest
      }
    }

    set({ isInitialized: true });
  },
}));
