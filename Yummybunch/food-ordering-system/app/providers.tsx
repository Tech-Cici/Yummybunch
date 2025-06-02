'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  role: 'customer' | 'restaurant' | 'RESTAURANT_OWNER';
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  updateCookies: (newToken: string, newUser: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const storedToken = Cookies.get('token');
        const storedUser = Cookies.get('user');
        
        console.log('Stored token:', storedToken ? 'Present' : 'Missing');
        console.log('Stored user:', storedUser ? 'Present' : 'Missing');
        
        if (storedToken && storedUser) {
          console.log('Verifying token...');
          const isValid = await verifyToken(storedToken);
          console.log('Token verification result:', isValid);
          
          if (isValid) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            console.log('Auth initialized successfully');
          } else {
            console.log('Token invalid, clearing auth data');
            // If token is invalid, clear everything
            Cookies.remove('token');
            Cookies.remove('user');
            setToken(null);
            setUser(null);
          }
        } else {
          console.log('No stored auth data found');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        Cookies.remove('token');
        Cookies.remove('user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const verifyToken = async (authToken: string): Promise<boolean> => {
    try {
      console.log('Verifying token with backend...');
      const response = await fetch('http://localhost:8080/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      console.log('Token verification response status:', response.status);
      if (!response.ok) {
        console.log('Token verification failed');
        return false;
      }

      const userData = await response.json();
      console.log('Token verification successful, user data:', userData);
      setUser(userData);
      Cookies.set('user', JSON.stringify(userData), { expires: 7 });
      return true;
    } catch (error) {
      console.error('Error verifying token:', error);
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const { token: authToken, user: userData } = data;

      // Store in cookies
      Cookies.set('token', authToken, { expires: 7 });
      Cookies.set('user', JSON.stringify(userData), { expires: 7 });
      
      setToken(authToken);
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      logout,
      setUser,
      setToken,
      updateCookies: (newToken: string, newUser: User) => {
        Cookies.set('token', newToken, { expires: 7 });
        Cookies.set('user', JSON.stringify(newUser), { expires: 7 });
        setToken(newToken);
        setUser(newUser);
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
} 