import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, CheckCircle2, X } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useSyncState } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';

export function DairyScreen() {
  const { t } = useTranslation();
  
  const [cattle, setCattle] = useSyncState('ks_cattle', []);

  const [showAdd, setShowAdd] = useState(false);
  const [tagId, setTagId] = useState('');
  const [breed, setBreed] = useState('');
  const [status, setStatus] = useState('Milking');

  const handleAddCattle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagId.trim()) return;
    
    const newCow = {
      id: tagId,
      breed: breed || 'Mixed',
      status,
      yield: status === 'Milking' ? '0L/day' : '-'
    };
    
    setCattle([newCow, ...cattle]);
    setShowAdd(false);
    setTagId('');
    setBreed('');
    setStatus('Milking');
  };

  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center py-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('dairy')}</h1>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary-dark transition-colors active:scale-95"
        >
          <Plus size={20} />
        </button>
      </header>

      {/* Milk Log Card */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Herd Overview</h2>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-3xl font-light text-gray-800 dark:text-gray-100">{cattle.length} <span className="text-lg text-gray-400 dark:text-gray-500">Cattle</span></div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{cattle.filter(c => c.status === 'Milking').length} Milking • {cattle.filter(c => c.status === 'Dry').length} Dry</div>
          </div>
        </div>
      </section>

      {/* Cattle List */}
      <section>
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-wider uppercase mb-3">My Herd</h3>
        <div className="space-y-3">
          {cattle.map(c => (
            <div key={c.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <div>
                <div className="font-bold text-gray-800 dark:text-gray-200">Tag #{c.id}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{c.breed}</div>
              </div>
              <div className="text-right">
                <div className={`text-xs font-bold px-2 py-1 inline-block rounded mb-1 ${c.status === 'Milking' ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                  {c.status}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{c.yield}</div>
              </div>
            </div>
          ))}
          {cattle.length === 0 && (
            <div className="text-center py-6 text-gray-500 text-sm">
              No cattle added to herd.
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl h-[85vh] sm:h-auto overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add New Cattle</h2>
                <button onClick={() => setShowAdd(false)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 dark:text-gray-300">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddCattle} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Tag ID *</label>
                  <input required value={tagId} onChange={e => setTagId(e.target.value)} type="text" placeholder="e.g. 103" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Breed</label>
                  <input value={breed} onChange={e => setBreed(e.target.value)} type="text" placeholder="e.g. HF, Murrah" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:text-white appearance-none">
                    <option value="Milking">Milking</option>
                    <option value="Dry">Dry</option>
                    <option value="Pregnant">Pregnant</option>
                  </select>
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-md active:scale-95 transition-transform">
                    Save Cattle
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
