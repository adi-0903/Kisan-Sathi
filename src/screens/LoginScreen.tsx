import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Tractor, ArrowRight } from 'lucide-react';

export function LoginScreen() {
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
    const success = await login(phone, pin);
    if (!success) {
      setError("Invalid phone number or PIN");
    }
  };

  return (
    <div className="flex flex-col h-screen p-6 max-w-md mx-auto items-center justify-center bg-background">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
        <Tractor size={32} />
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
      <p className="text-gray-500 mb-8 text-center">Enter your details to manage your farm efficiently.</p>
      
      <form onSubmit={handleLogin} className="w-full space-y-4">
        {error && <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}
        
        <div className="space-y-1">
          <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="e.g., 9876543210"
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-bold text-gray-700 ml-1">4-Digit PIN</label>
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
          <span>Login securely</span>
          <ArrowRight size={18} />
        </button>
      </form>

      <div className="mt-8 text-center">
        <span className="text-gray-500 text-sm">Don't have an account? </span>
        <button onClick={() => navigate('/register')} className="text-primary font-bold text-sm">Register here</button>
      </div>
    </div>
  );
}
