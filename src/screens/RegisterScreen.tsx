import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/AuthContext';
import { BrandLogo } from '../components/BrandLogo';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

type RegisterStep = 'PHONE' | 'OTP' | 'DETAILS';

export function RegisterScreen() {
  const { t } = useTranslation();
  const { register, pendingVerification, setPendingVerification } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<RegisterStep>(() => pendingVerification?.step || 'PHONE');
  
  const [name, setName] = useState(() => pendingVerification?.name || '');
  const [phone, setPhone] = useState(() => pendingVerification?.phone || '');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [village, setVillage] = useState(() => pendingVerification?.village || '');
  const [state, setState] = useState(() => pendingVerification?.state || '');
  const [landSize, setLandSize] = useState(() => pendingVerification?.landSize || '');
  const [error, setError] = useState('');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !phone) {
      setError('Please fill in Name and Phone Number');
      return;
    }
    if (phone.length < 8) {
      setError('Please enter a valid phone number');
      return;
    }
    // Simulate sending OTP
    setStep('OTP');
    setPendingVerification({ step: 'OTP', name, phone });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otp.length < 4) {
      setError('Please enter a valid 4-digit code (try any 4 digits)');
      return;
    }
    // Simulate successful verification
    setStep('DETAILS');
    setPendingVerification({ step: 'DETAILS', name, phone });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!pin) {
      setError('Please set a PIN for your account');
      return;
    }
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }
    
    await register({ 
      id: Date.now().toString(), 
      name, 
      phone, 
      pin,
      village,
      state,
      landSize
    });
  };

  return (
    <div className="flex flex-col min-h-screen p-6 max-w-md mx-auto items-center justify-center bg-background py-10">
      <div className="mb-4">
        <BrandLogo size={80} />
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{t("create_account")}</h1>
      <p className="text-gray-500 mb-6 text-center">{t("join_kisansaathi")}</p>
      
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-2 mb-8 w-full max-w-[200px]">
        <div className={`h-2 flex-1 rounded-full ${step === 'PHONE' || step === 'OTP' || step === 'DETAILS' ? 'bg-secondary' : 'bg-gray-200'}`} />
        <div className={`h-2 flex-1 rounded-full ${step === 'OTP' || step === 'DETAILS' ? 'bg-secondary' : 'bg-gray-200'}`} />
        <div className={`h-2 flex-1 rounded-full ${step === 'DETAILS' ? 'bg-secondary' : 'bg-gray-200'}`} />
      </div>
      
      <div className="w-full">
        {error && <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-xl border border-red-100 mb-4">{error}</div>}

        {step === 'PHONE' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">{t("full_name")} *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                placeholder={t("full_name")}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">{t("phone_number")} *</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                placeholder="Mobile Number"
              />
            </div>

            <button type="submit" className="w-full bg-secondary text-white font-bold py-4 rounded-xl shadow-md mt-6 active:scale-95 transition-transform">
              Send Verification Code
            </button>
          </form>
        )}

        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-center">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl mb-6 flex flex-col items-center">
              <ShieldCheck size={40} className="mb-2" />
              <p className="text-sm font-medium">We've sent a verification code to</p>
              <p className="font-bold">{phone}</p>
              <p className="text-xs mt-2 opacity-75">(For demo: enter any 4 digits)</p>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-sm font-bold text-gray-700 ml-1">Enter Verification Code *</label>
              <input
                type="text"
                maxLength={4}
                value={otp}
                onChange={e => setOtp(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-center text-xl tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-secondary/50"
                placeholder="••••"
              />
            </div>

            <button type="submit" className="w-full bg-secondary text-white font-bold py-4 rounded-xl shadow-md mt-6 active:scale-95 transition-transform">
              Verify Code
            </button>
            <button type="button" onClick={() => {
              setStep('PHONE');
              setPendingVerification(null);
            }} className="text-sm text-gray-500 font-medium mt-4">
              Wrong number? Go back
            </button>
          </form>
        )}

        {step === 'DETAILS' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
              <CheckCircle2 size={20} className="text-emerald-500" />
              <span className="text-sm font-bold text-gray-700">Phone Verified ({phone})</span>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">{t("pin_code")} *</label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={e => setPin(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                placeholder="••••"
              />
              <p className="text-xs text-gray-500 ml-1">Set a 4-digit PIN for future login</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">{t("village")}</label>
                <input
                  type="text"
                  value={village}
                  onChange={e => setVillage(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  placeholder={t("village")}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">{t("state")}</label>
                <input
                  type="text"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  placeholder={t("state")}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">{t("total_land")}</label>
              <div className="relative">
                <input
                  type="number"
                  value={landSize}
                  onChange={e => setLandSize(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  placeholder="0"
                />
                <span className="absolute right-3 top-3.5 text-xs font-bold text-gray-400">{t("acres")}</span>
              </div>
            </div>

            <button type="submit" className="w-full bg-secondary text-white font-bold py-4 rounded-xl shadow-md mt-6 active:scale-95 transition-transform">
              {t("create_account")}
            </button>
          </form>
        )}
      </div>

      <div className="mt-8 text-center pb-6">
        <span className="text-gray-500 text-sm">{t("have_account")} </span>
        <button onClick={() => navigate('/')} className="text-secondary font-bold text-sm">{t("sign_in")}</button>
      </div>
    </div>
  );
}
