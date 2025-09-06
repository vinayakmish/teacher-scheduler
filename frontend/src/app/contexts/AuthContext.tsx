import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '@teacher-scheduler/shared-types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: Omit<User, 'password'> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  checkTokenExpiration: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true;
  }
};

// Helper function to get token expiration time
const getTokenExpirationTime = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // Convert to milliseconds
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const checkTokenExpiration = useCallback((): boolean => {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    if (isTokenExpired(token)) {
      logout();
      return false;
    }

    return true;
  }, [logout]);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        if (isTokenExpired(token)) {
          localStorage.removeItem('token');
        } else {
          try {
            const userData = await authService.getCurrentUser();
            setUser(userData);

            // Set up token expiration check
            const expirationTime = getTokenExpirationTime(token);
            if (expirationTime) {
              const timeUntilExpiration = expirationTime - Date.now();

              // Set a timeout to auto-logout when token expires
              if (timeUntilExpiration > 0) {
                setTimeout(() => {
                  logout();
                  // Optionally show a notification to the user
                  console.warn('Session expired. Please log in again.');
                }, timeUntilExpiration);
              }
            }
          } catch (error) {
            console.error('Failed to fetch user data:', error);
            localStorage.removeItem('token');
          }
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [logout]);

  // Set up periodic token expiration checks
  useEffect(() => {
    const interval = setInterval(() => {
      checkTokenExpiration();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [checkTokenExpiration]);

  const login = async (credentials: LoginRequest) => {
    const response: AuthResponse = await authService.login(credentials);
    localStorage.setItem('token', response.token);
    setUser(response.user);

    // Set up auto-logout for new token
    const expirationTime = getTokenExpirationTime(response.token);
    if (expirationTime) {
      const timeUntilExpiration = expirationTime - Date.now();

      if (timeUntilExpiration > 0) {
        setTimeout(() => {
          logout();
          console.warn('Session expired. Please log in again.');
        }, timeUntilExpiration);
      }
    }
  };

  const register = async (userData: RegisterRequest) => {
    const response: AuthResponse = await authService.register(userData);
    localStorage.setItem('token', response.token);
    setUser(response.user);

    // Set up auto-logout for new token
    const expirationTime = getTokenExpirationTime(response.token);
    if (expirationTime) {
      const timeUntilExpiration = expirationTime - Date.now();

      if (timeUntilExpiration > 0) {
        setTimeout(() => {
          logout();
          console.warn('Session expired. Please log in again.');
        }, timeUntilExpiration);
      }
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    checkTokenExpiration,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
