import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export function CropLogScreen() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <header className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="mr-3 p-2 rounded-full bg-white text-gray-800 shadow-sm border border-gray-100">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Crop Diary</h1>
      </header>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Crop</h2>
        <div className="text-2xl font-bold text-primary mb-4">Wheat HD 3226</div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Expected Yield</div>
            <div className="text-sm font-bold text-gray-800">120 Quintals</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Est. Profit</div>
            <div className="text-sm font-bold text-gray-800">₹ 1,45,000</div>
          </div>
        </div>
      </div>

      <h3 className="text-sm font-bold text-gray-500 tracking-wider uppercase mb-3">Activity Timeline</h3>
      
      <div className="relative pl-4 space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
            <div className="w-2 h-2 rounded-full bg-white"></div>
          </div>
          <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-bold text-gray-400">Dec 10</div>
            </div>
            <div className="text-sm text-gray-800 font-bold mb-1">Applied Urea</div>
            <div className="text-xs text-gray-500">2 Bags (100kg), ₹550 setup cost.</div>
          </div>
        </div>

        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white bg-secondary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
            <div className="w-2 h-2 rounded-full bg-white"></div>
          </div>
          <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-bold text-gray-400">Nov 15</div>
            </div>
            <div className="text-sm text-gray-800 font-bold mb-1">Sowing Completed</div>
            <div className="text-xs text-gray-500">Seed rate 40kg/acre. Irrigation done.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
