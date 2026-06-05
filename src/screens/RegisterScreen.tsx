import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Tractor, UserPlus } from 'lucide-react';

export function RegisterScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [village, setVillage] = useState('');
  const [state, setState] = useState('');
  const [landSize, setLandSize] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !phone || !pin) {
      setError('Please fill in Name, Phone, and PIN');
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
      <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center text-secondary mb-4">
        <UserPlus size={32} />
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
      <p className="text-gray-500 mb-8 text-center">Join KisanSaathi today.</p>
      
      <form onSubmit={handleRegister} className="w-full space-y-4 mb-8">
        {error && <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}
        
        <div className="space-y-1">
          <label className="text-sm font-bold text-gray-700 ml-1">Full Name *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary/50"
            placeholder="Farmer Name"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-gray-700 ml-1">Phone Number *</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary/50"
            placeholder="Mobile Number"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-gray-700 ml-1">Set a 4-Digit PIN *</label>
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary/50"
            placeholder="••••"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 ml-1">Village</label>
            <input
              type="text"
              value={village}
              onChange={e => setVillage(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary/50"
              placeholder="Village Name"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 ml-1">State</label>
            <input
              type="text"
              value={state}
              onChange={e => setState(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary/50"
              placeholder="State"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-gray-700 ml-1">Total Land</label>
          <div className="relative">
            <input
              type="number"
              value={landSize}
              onChange={e => setLandSize(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-secondary/50"
              placeholder="0"
            />
            <span className="absolute right-3 top-3.5 text-xs font-bold text-gray-400">ACRES</span>
          </div>
        </div>

        <button type="submit" className="w-full bg-secondary text-white font-bold py-4 rounded-xl shadow-md mt-6 active:scale-95 transition-transform">
          Register
        </button>
      </form>

      <div className="mt-auto text-center">
        <span className="text-gray-500 text-sm">Already registered? </span>
        <button onClick={() => navigate('/')} className="text-secondary font-bold text-sm">Login</button>
      </div>
    </div>
  );
}
