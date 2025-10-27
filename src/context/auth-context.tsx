import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers } from '../../lib/mock-data';
import { User } from '../../lib/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Initialize mock users if not already in localStorage
    const usersJson = localStorage.getItem('kasi-konnect-users');
    if (!usersJson) {
      localStorage.setItem('kasi-konnect-users', JSON.stringify(mockUsers));
    }

    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('kasi-konnect-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string): Promise<boolean> => {
    // Get all users from localStorage
    const usersJson = localStorage.getItem('kasi-konnect-users');
    const users = usersJson ? JSON.parse(usersJson) : [];

    // Find user by email
    const foundUser = users.find((u: User) => u.email === email);

    if (foundUser) {
      // In a real app, we'd verify the password here
      setUser(foundUser);
      localStorage.setItem('kasi-konnect-user', JSON.stringify(foundUser));
      return true;
    }

    return false;
  };

  const register = async (
    name: string,
    email: string,
    role: string
  ): Promise<boolean> => {
    // Get existing users
    const usersJson = localStorage.getItem('kasi-konnect-users');
    const users = usersJson ? JSON.parse(usersJson) : [];

    // Check if email already exists
    if (users.some((u: User) => u.email === email)) {
      return false;
    }

    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role: role as User['role'],
      verified: true, // Auto-verify for demo purposes
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    users.push(newUser);
    localStorage.setItem('kasi-konnect-users', JSON.stringify(users));

    // Auto-login
    setUser(newUser);
    localStorage.setItem('kasi-konnect-user', JSON.stringify(newUser));

    return true;
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('kasi-konnect-user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
