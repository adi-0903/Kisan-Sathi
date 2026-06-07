import React, { createContext, useContext, useState, useEffect } from 'react';
import { get, set } from 'idb-keyval';

export type User = {
  id: string;
  name: string;
  phone: string;
  village?: string;
  state?: string;
  landSize?: string;
};

export type PendingVerification = {
  step: 'PHONE' | 'OTP' | 'DETAILS';
  name: string;
  phone: string;
  village?: string;
  state?: string;
  landSize?: string;
} | null;

type AuthContextType = {
  user: User | null;
  loading: boolean;
  pendingVerification: PendingVerification;
  setPendingVerification: (data: PendingVerification) => void;
  login: (phone: string, pin: string) => Promise<boolean>;
  register: (data: User & { pin: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingVerificationState, setPendingVerificationState] = useState<PendingVerification>(() => {
    const pendingJson = sessionStorage.getItem('ks_pending_verification');
    if (pendingJson) {
      try {
        return JSON.parse(pendingJson);
      } catch (e) {}
    }
    return null;
  });

  useEffect(() => {
    get('ks_user_session').then(session => {
      if (session) setUser(session);
      setLoading(false);
    });
  }, []);

  const setPendingVerification = (data: PendingVerification) => {
    setPendingVerificationState(data);
    if (data) {
      sessionStorage.setItem('ks_pending_verification', JSON.stringify(data));
    } else {
      sessionStorage.removeItem('ks_pending_verification');
    }
  };

  const login = async (phone: string, pin: string) => {
    const users = await get('ks_users') || {};
    const account = users[phone];
    if (account && account.pin === pin) {
      const { pin: _, ...userData } = account;
      setUser(userData);
      await set('ks_user_session', userData);
      return true;
    }
    return false;
  };

  const register = async (data: User & { pin: string }) => {
    const users = await get('ks_users') || {};
    users[data.phone] = data;
    await set('ks_users', users);
    const { pin: _, ...userData } = data;
    setUser(userData);
    await set('ks_user_session', userData);
    setPendingVerification(null);
  };

  const logout = async () => {
    setUser(null);
    setPendingVerification(null);
    await set('ks_user_session', null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      pendingVerification: pendingVerificationState, 
      setPendingVerification, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
