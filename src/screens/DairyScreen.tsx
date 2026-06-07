import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, CheckCircle2, X, Droplet } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useSyncState } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';

export function DairyScreen() {
  const { t } = useTranslation();
  
  const [cattle, setCattle] = useSyncState<any[]>('ks_cattle', []);
  const [milkLogs, setMilkLogs] = useSyncState<any[]>('ks_milk_logs', []);

  const [showAdd, setShowAdd] = useState(false);
  const [editCattle, setEditCattle] = useState<any | null>(null);
  const [tagId, setTagId] = useState('');
  const [breed, setBreed] = useState('');
  const [status, setStatus] = useState('Milking');
  
  const today = new Date().toISOString().split('T')[0];

  const [logDateInput, setLogDateInput] = useState(today);
  const [logAmountInput, setLogAmountInput] = useState('');

  const handleAddCattle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagId.trim()) return;
    
    const newCow = {
      id: tagId,
      breed: breed || 'Mixed',
      status,
      yield: status === 'Milking' ? '0.0L/day' : '-'
    };
    
    setCattle([newCow, ...cattle]);
    setShowAdd(false);
    setTagId('');
    setBreed('');
    setStatus('Milking');
  };

  const handleUpdateCattle = () => {
    if (!editCattle) return;
    setCattle(cattle.map(c => c.id === editCattle.id ? editCattle : c));
  };

  const handleDeleteCattle = () => {
    if (!editCattle) return;
    setCattle(cattle.filter(c => c.id !== editCattle.id));
    setMilkLogs(milkLogs.filter(l => l.cattleId !== editCattle.id));
    setEditCattle(null);
  };

  const addLogToCattle = () => {
    if (!editCattle || !logAmountInput) return;
    
    let newLogs = [...milkLogs];
    const existingIndex = newLogs.findIndex(l => l.cattleId === editCattle.id && l.date === logDateInput);
    
    if (existingIndex >= 0) {
      newLogs[existingIndex] = { ...newLogs[existingIndex], amount: parseFloat(logAmountInput) };
    } else {
      newLogs.push({
        id: Date.now(),
        cattleId: editCattle.id,
        date: logDateInput,
        amount: parseFloat(logAmountInput)
      });
    }
    
    setMilkLogs(newLogs);
    
    const cowLogs = newLogs.filter(l => l.cattleId === editCattle.id);
    const avgYield = cowLogs.length ? (cowLogs.reduce((acc, curr) => acc + curr.amount, 0) / cowLogs.length).toFixed(1) : '0.0';
    
    const updatedCattle = { ...editCattle, yield: `${avgYield}L/day` };
    setEditCattle(updatedCattle);
    setCattle(cattle.map(c => c.id === editCattle.id ? updatedCattle : c));
    
    setLogAmountInput('');
  };

  const aggregateMilkData = useMemo(() => {
    const days = 7;
    const data = [];
    const existingCattleIds = new Set(cattle.map(c => c.id));
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLogs = milkLogs.filter(l => l.date === dateStr && existingCattleIds.has(l.cattleId));
      const total = dayLogs.reduce((acc, curr) => acc + curr.amount, 0);
      data.push({
        fullDate: dateStr,
        day: d.toLocaleDateString('en-US', { weekday: 'short' })[0],
        value: total
      });
    }
    return data;
  }, [milkLogs, cattle]);

  const todaysTotal = aggregateMilkData[aggregateMilkData.length - 1]?.value || 0;

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
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="text-3xl font-light text-gray-800 dark:text-gray-100">{cattle.length} <span className="text-lg text-gray-400 dark:text-gray-500">Cattle</span></div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{cattle.filter(c => c.status === 'Milking').length} Milking • {cattle.filter(c => c.status === 'Dry').length} Dry</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-light text-blue-600 dark:text-blue-400">{todaysTotal.toFixed(1)} <span className="text-sm text-blue-400 dark:text-blue-500">Liters</span></div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold">Today's Milk</div>
          </div>
        </div>

        {todaysTotal > 0 && (
          <div className="h-24 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <AreaChart data={aggregateMilkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMilk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-background)', color: 'var(--color-text)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}/>
                <Area type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorMilk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Cattle List */}
      <section>
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-wider uppercase mb-3">My Herd</h3>
        <div className="space-y-3">
          {cattle.map(c => (
            <div key={c.id} onClick={() => setEditCattle(c)} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center cursor-pointer active:scale-[0.98] transition-transform">
              <div>
                <div className="font-bold text-gray-800 dark:text-gray-200">Tag #{c.id}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{c.breed}</div>
              </div>
              <div className="text-right flex items-center justify-end space-x-3">
                <div>
                  <div className={`text-[10px] font-bold px-2 py-0.5 inline-block rounded mb-1 ${c.status === 'Milking' ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                    {c.status}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{c.yield}</div>
                </div>
                {c.status === 'Milking' && !milkLogs.find(l => l.cattleId === c.id && l.date === today && l.amount > 0) && (
                  <button onClick={(e) => { e.stopPropagation(); setEditCattle(c); }} className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                    <Droplet size={16} />
                  </button>
                )}
                {c.status === 'Milking' && milkLogs.find(l => l.cattleId === c.id && l.date === today && l.amount > 0) && (
                  <div className="p-2 text-green-500 cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); setEditCattle(c); }}>
                    <CheckCircle2 size={16} />
                  </div>
                )}
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
        {editCattle && (
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
              className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl h-[90vh] sm:h-auto overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Cattle Details</h2>
                <button onClick={() => setEditCattle(null)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 dark:text-gray-300">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Profile Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Profile</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Tag ID</label>
                    <input disabled value={editCattle.id} type="text" className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-500 dark:text-gray-400 opacity-70 cursor-not-allowed" />
                  </div>
                  <div className="flex space-x-3 w-full">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Breed</label>
                      <input required value={editCattle.breed} onChange={e => setEditCattle({ ...editCattle, breed: e.target.value })} type="text" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:text-white" />
                    </div>
                    <div className="flex-[0.8]">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Status</label>
                      <select value={editCattle.status} onChange={e => setEditCattle({ ...editCattle, status: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:text-white appearance-none">
                        <option value="Milking">Milking</option>
                        <option value="Dry">Dry</option>
                        <option value="Pregnant">Pregnant</option>
                      </select>
                    </div>
                  </div>
                  <button onClick={handleUpdateCattle} className="w-full bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-light font-bold py-3 rounded-xl transition-colors active:scale-95">
                    Save Profile Changes
                  </button>
                </div>
                
                {/* Daily Milk Logs Section */}
                <div className="space-y-4 border-t border-gray-100 dark:border-gray-700 pt-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center">
                      <Droplet size={14} className="mr-1" /> Daily Milk Log
                    </h3>
                    <div className="text-xs text-gray-500 font-bold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Avg: {editCattle.yield}</div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <input type="date" value={logDateInput} onChange={e => {
                        setLogDateInput(e.target.value);
                        const existing = milkLogs.find(l => l.cattleId === editCattle.id && l.date === e.target.value);
                        setLogAmountInput(existing ? existing.amount.toString() : '');
                    }} className="flex-[1.2] bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 focus:outline-none dark:text-white [&::-webkit-calendar-picker-indicator]:dark:invert" />
                    <input type="number" step="0.1" value={logAmountInput} onChange={e => setLogAmountInput(e.target.value)} placeholder="0.0 L" className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 focus:outline-none dark:text-white" />
                    <button onClick={addLogToCattle} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-white font-bold transition-colors shadow-sm active:scale-95">
                      <Plus size={18} />
                    </button>
                  </div>
                  
                  <div className="mt-4 space-y-2 max-h-[200px] overflow-y-auto pr-2">
                     {milkLogs.filter(l => l.cattleId === editCattle.id).sort((a,b)=> new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                       <div key={log.id} className="flex justify-between items-center p-3 border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-sm">
                         <span className="font-bold text-gray-600 dark:text-gray-300">{new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                         <span className="font-bold text-blue-600 dark:text-blue-400">{log.amount.toFixed(1)} L</span>
                       </div>
                     ))}
                     {milkLogs.filter(l => l.cattleId === editCattle.id).length === 0 && (
                       <div className="text-center py-4 text-xs text-gray-400">No milk logs recorded.</div>
                     )}
                  </div>
                </div>

                {/* Danger Section */}
                <div className="border-t border-red-100 dark:border-red-900/30 pt-4 mt-4">
                  <button onClick={handleDeleteCattle} className="w-full text-red-500 dark:text-red-400 text-sm font-bold p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                    Remove Cattle from Herd
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
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
