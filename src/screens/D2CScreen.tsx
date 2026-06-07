import React, { useState } from 'react';
import { Store, Plus, Tag, MapPin, Search, Package, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  quantity: number;
  image: string;
  status: 'Listed' | 'Draft' | 'Sold Out';
};



export function D2CScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'listings' | 'orders'>('listings');
  const [products, setProducts] = useState<Product[]>([]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 border-b border-gray-100 dark:border-gray-700">
        <div className="p-4 flex justify-between items-center bg-gradient-to-r from-emerald-600 to-green-500 text-white">
          <div>
            <h1 className="font-bold text-xl flex items-center space-x-2">
              <Store size={22} />
              <span>D2C Storefront</span>
            </h1>
            <p className="text-xs text-emerald-100 opacity-90 mt-1">Sell directly to urban consumers</p>
          </div>
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
            <TrendingUp size={24} className="text-white" />
          </div>
        </div>

        <div className="flex px-4 py-2 space-x-4">
          <button 
            onClick={() => setActiveTab('listings')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'listings' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            My Listings
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'orders' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Active Orders (0)
          </button>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {activeTab === 'listings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <button className="w-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 border-dashed rounded-xl p-4 flex items-center justify-center space-x-2 font-bold transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-900/40">
              <Plus size={20} />
              <span>Create New Listing</span>
            </button>

            {products.map(p => (
              <div key={p.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex">
                <div className="w-28 h-28 relative flex-shrink-0">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {p.status}
                  </div>
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 leading-tight">{p.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{p.category} &bull; {p.quantity} {p.unit} remaining</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{p.price}<span className="text-sm text-gray-500 font-normal">/{p.unit}</span>
                    </div>
                    <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
            <Package size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
            <p className="font-medium text-lg text-gray-700 dark:text-gray-300 mb-1">No pending orders</p>
            <p className="text-sm">When urban buyers purchase your produce, it will appear here.</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
