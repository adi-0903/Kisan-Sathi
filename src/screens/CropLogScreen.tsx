import React, { useState } from 'react';
import { ChevronLeft, Plus, X, Trash2, Sprout } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSyncState } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';

export function CropLogScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [crops, setCrops] = useSyncState<any[]>('ks_crops', []);
  const crop = crops.find(c => c.id === Number(id));

  const [activities, setActivities] = useSyncState<any[]>('ks_activities', []);
  
  const [showAdd, setShowAdd] = useState(false);
  const [showHarvest, setShowHarvest] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [yieldAmount, setYieldAmount] = useState(crop?.yield || '');

  const cropActivities = activities.filter(a => a.cropId === Number(id)).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (!crop) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 mb-4">Crop not found</p>
        <button onClick={() => navigate(-1)} className="bg-primary text-white px-4 py-2 rounded-lg">Go Back</button>
      </div>
    );
  }

  const handleDeleteCrop = () => {
    if (window.confirm('Are you sure you want to delete this crop? All activities associated with it will also be deleted.')) {
      setCrops(crops.filter(c => c.id !== Number(id)));
      setActivities(activities.filter(a => a.cropId !== Number(id)));
      navigate(-1);
    }
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim()) return;

    let displayDate = date;
    try {
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch(e) {}

    const newActivity = {
      id: Date.now(),
      cropId: crop.id,
      title,
      date: displayDate,
      description
    };
    
    setActivities([newActivity, ...activities]);
    setShowAdd(false);
    setTitle('');
    setDate('');
    setDescription('');
  };

  const handleHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yieldAmount) return;

    // Update crop
    const updatedCrops = crops.map(c => 
      c.id === crop.id ? { ...c, yield: yieldAmount } : c
    );
    setCrops(updatedCrops);

    // Add activity
    const newActivity = {
      id: Date.now(),
      cropId: crop.id,
      title: 'Harvested',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      description: `Yield recorded: ${yieldAmount} t/ha`
    };
    setActivities([newActivity, ...activities]);

    setShowHarvest(false);
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-[#121212] min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 p-2 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Crop Diary</h1>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary-dark transition-colors active:scale-95"
        >
          <Plus size={20} />
        </button>
      </header>

      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Crop</h2>
        <div className="flex justify-between items-start mb-4">
          <div className="text-2xl font-bold text-primary">{crop.name} {crop.variety !== 'Standard' && crop.variety}</div>
          <button onClick={handleDeleteCrop} className="p-2 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 transition">
            <Trash2 size={18} />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-600">
            <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">Area</div>
            <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{crop.area}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-600">
            <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">Sown Date</div>
            <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{crop.sown}</div>
          </div>
        </div>

        <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-800/30">
          <div>
            <div className="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase tracking-wider mb-1">Recorded Yield</div>
            <div className="text-sm font-bold text-green-800 dark:text-green-300">{crop.yield ? `${crop.yield} t/ha` : 'Not recorded'}</div>
          </div>
          <button onClick={() => setShowHarvest(true)} className="flex items-center text-xs font-bold text-green-700 bg-green-100 dark:bg-green-800 border border-green-200 dark:border-green-700 px-3 py-2 rounded-lg">
            <Sprout size={14} className="mr-1" /> Log Harvest
          </button>
        </div>
      </div>

      <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-wider uppercase mb-3">Activity Timeline</h3>
      
      {cropActivities.length === 0 ? (
        <div className="text-center text-gray-500 text-sm py-10">No activities recorded yet.</div>
      ) : (
        <div className="relative pl-4 space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 dark:before:via-gray-600 before:to-transparent">
          {cropActivities.map((activity, i) => (
            <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full border border-white dark:border-gray-800 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${i === 0 ? 'bg-primary' : 'bg-gray-400 dark:bg-gray-600'}`}>
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-bold text-gray-400 dark:text-gray-500">{activity.date}</div>
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-200 font-bold mb-1">{activity.title}</div>
                {activity.description && <div className="text-xs text-gray-500 dark:text-gray-400">{activity.description}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

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
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add Activity</h2>
                <button onClick={() => setShowAdd(false)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 dark:text-gray-300">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddActivity} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Activity Title *</label>
                  <input required value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder="e.g. Applied Urea, Sowing, Irrigation" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Date *</label>
                  <input required value={date} onChange={e => setDate(e.target.value)} type="date" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:text-white [&::-webkit-calendar-picker-indicator]:dark:invert" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. 2 Bags (100kg), ₹550 setup cost." className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:text-white min-h-[100px]" />
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-md active:scale-95 transition-transform">
                    Save Activity
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showHarvest && (
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
              className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl h-[50vh] sm:h-auto overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Log Harvest Yield</h2>
                <button onClick={() => setShowHarvest(false)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 dark:text-gray-300">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleHarvest} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Total Yield (t/ha) *</label>
                  <input required value={yieldAmount} onChange={e => setYieldAmount(e.target.value)} type="number" step="0.1" placeholder="e.g. 4.5" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:text-white" />
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-md active:scale-95 transition-transform">
                    Save Yield Data
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

