import React, { createContext, useContext, useState, useEffect } from 'react';
import { ExtendedUserRole } from '../types';
import { mintTokenForRole, setAuthToken } from './api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: ExtendedUserRole;
  department?: string;
  isLoggedIn: boolean;
}

export interface DemoAccount {
  email: string;
  password: string;
  name: string;
  role: ExtendedUserRole;
  department?: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'citizen@civic.com',
    password: 'citizen123',
    name: 'Zoya Khan',
    role: 'citizen'
  },
  {
    email: 'officer@civic.com',
    password: 'officer123',
    name: 'Officer Imran Shahid',
    role: 'field_officer',
    department: 'Department of Public Works'
  },
  {
    email: 'supervisor@civic.com',
    password: 'supervisor123',
    name: 'Supv. Khalid Mehmood',
    role: 'supervisor',
    department: 'Water & Sanitation Authority'
  },
  {
    email: 'admin@civic.com',
    password: 'admin123',
    name: 'Ahmed Khan',
    role: 'municipal_admin',
    department: 'Municipal Operations'
  },
  {
    email: 'superadmin@civic.com',
    password: 'superadmin123',
    name: 'Zain ul Abideen',
    role: 'super_admin'
  }
];

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string, role: ExtendedUserRole) => { success: boolean; error?: string };
  logout: () => void;
  getCurrentUser: () => AuthUser | null;
  switchDemoRole: (role: ExtendedUserRole) => void;
}

const STORAGE_KEY = 'civic_smart_auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isLoggedIn) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse auth user from storage', e);
    }
    return null;
  });

  useEffect(() => {
    if (user && user.isLoggedIn) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      // Mint a JWT for hardened endpoints; best-effort and async (UI keeps
      // working header-only if the backend is the legacy Express server).
      mintTokenForRole(user.role).then((token) => setAuthToken(token));
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setAuthToken(null);
    }
  }, [user]);

  const login = (email: string, password: string, rememberMe = true) => {
    const trimmedEmail = email.trim().toLowerCase();
    
    // Find matching demo account or saved user
    const found = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === trimmedEmail);
    
    if (!found) {
      // Check custom registered users from localStorage
      try {
        const customUsersRaw = localStorage.getItem('civic_custom_users');
        if (customUsersRaw) {
          const customUsers = JSON.parse(customUsersRaw);
          const customMatch = customUsers.find((u: any) => u.email.toLowerCase() === trimmedEmail && u.password === password);
          if (customMatch) {
            const authUser: AuthUser = {
              id: customMatch.id || `user-${Date.now()}`,
              name: customMatch.name,
              email: customMatch.email,
              role: customMatch.role,
              department: customMatch.department,
              isLoggedIn: true
            };
            setUser(authUser);
            return { success: true };
          }
        }
      } catch (e) {
        console.error('Error checking custom users', e);
      }
      return { success: false, error: 'Invalid email or password.' };
    }

    if (found.password !== password) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const authUser: AuthUser = {
      id: `usr-${found.role}-${Date.now()}`,
      name: found.name,
      email: found.email,
      role: found.role,
      department: found.department,
      isLoggedIn: true
    };

    setUser(authUser);
    if (!rememberMe) {
      // If remember me is false, we can use sessionStorage instead
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    }
    return { success: true };
  };

  const register = (name: string, email: string, password: string, role: ExtendedUserRole) => {
    if (!name.trim() || !email.trim() || !password) {
      return { success: false, error: 'Please fill in all required fields.' };
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    // Check if email already exists
    if (DEMO_ACCOUNTS.some(a => a.email.toLowerCase() === trimmedEmail)) {
      return { success: false, error: 'Account with this email already exists.' };
    }

    const newUser = {
      id: `usr-custom-${Date.now()}`,
      name: name.trim(),
      email: trimmedEmail,
      password,
      role,
      isLoggedIn: true
    };

    try {
      const existingRaw = localStorage.getItem('civic_custom_users');
      const existingList = existingRaw ? JSON.parse(existingRaw) : [];
      existingList.push(newUser);
      localStorage.setItem('civic_custom_users', JSON.stringify(existingList));
    } catch (e) {
      console.error('Failed to save custom user', e);
    }

    const authUser: AuthUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isLoggedIn: true
    };

    setUser(authUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    setAuthToken(null);
  };

  const getCurrentUser = () => user;

  const switchDemoRole = (role: ExtendedUserRole) => {
    const demo = DEMO_ACCOUNTS.find(a => a.role === role) || DEMO_ACCOUNTS[0];
    const authUser: AuthUser = {
      id: `usr-${demo.role}-${Date.now()}`,
      name: demo.name,
      email: demo.email,
      role: demo.role,
      department: demo.department,
      isLoggedIn: true
    };
    setUser(authUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user?.isLoggedIn,
        login,
        register,
        logout,
        getCurrentUser,
        switchDemoRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
