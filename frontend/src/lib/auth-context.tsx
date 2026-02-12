import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '@/lib/types';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getMe,
} from '@/lib/api/auth';
import {
  setTokens,
  clearTokens,
  getAccessToken,
} from '@/lib/api/client';

// ──────────────────────────────────────────────
// Context value type
// ──────────────────────────────────────────────

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // On mount, check for existing tokens and fetch user profile
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    getMe()
      .then((fetchedUser) => {
        console.log('[AUTH] User loaded:', fetchedUser.email, 'Role:', fetchedUser.role);
        setUser(fetchedUser);
      })
      .catch(() => {
        // Token is invalid or expired (and refresh also failed) -- clear everything
        clearTokens();
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiLogin({ email, password });
      setTokens(response.accessToken, response.refreshToken);
      setUser(response.user as User);
    },
    [],
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const response = await apiRegister({ email, password, name });
      setTokens(response.accessToken, response.refreshToken);
      setUser(response.user as User);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Even if the server call fails, clear local state
    }
    clearTokens();
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
