import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/AuthContext';
import { ArrowRight } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';

export function LoginScreen() {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phone || !pin) {
      setError('Please fill in all fields');
      return;
    }
    try {
      const success = await login(phone, pin);
      if (!success) {
        setError("Invalid phone number or PIN");
      }
    } catch (e: any) {
      setError(e.message || "Invalid phone number or PIN");
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 max-w-md mx-auto items-center justify-center bg-background">
      <div className="mb-6">
        <BrandLogo size={80} />
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{t("welcome_back")}</h1>
      <p className="text-gray-500 mb-8 text-center">{t("login_to_continue")}</p>
      
      <form onSubmit={handleLogin} className="w-full space-y-4">
        {error && <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}
        
        <div className="space-y-1">
          <label className="text-sm font-bold text-gray-700 ml-1">{t("phone_number")}</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="e.g., 9876543210"
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-bold text-gray-700 ml-1">{t("pin_code")}</label>
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="••••"
          />
        </div>

        <button type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-md flex items-center justify-center space-x-2 mt-6 active:scale-95 transition-transform">
          <span>{t("login")}</span>
          <ArrowRight size={18} />
        </button>
      </form>

      <div className="mt-8 text-center">
        <span className="text-gray-500 text-sm">{t("no_account")} </span>
        <button onClick={() => navigate('/register')} className="text-primary font-bold text-sm">{t("create_one")}</button>
      </div>

    </div>
  );
}

