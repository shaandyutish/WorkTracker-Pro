import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { getAuthUser, setAuthUser, getUsers, verifyPassword, initializeData } from '../store/dataStore';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize seed data first
    initializeData();

    // Check for existing session
    const storedUser = getAuthUser();
    if (storedUser) {
      const users = getUsers();
      const freshUser = users.find((u) => u.id === storedUser.id);
      if (freshUser) {
        setUser(freshUser);
        setIsAuthenticated(true);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    const users = getUsers();
    const foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!foundUser) {
      return { success: false, error: 'No account found with this email address.' };
    }
    if (!verifyPassword(password, foundUser.password)) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }
    setUser(foundUser);
    setIsAuthenticated(true);
    setAuthUser(foundUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setAuthUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
