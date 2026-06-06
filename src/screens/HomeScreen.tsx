import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Cloud, Droplets, Thermometer, ChevronRight, AlertTriangle, ListTodo, Sprout, Plus, Leaf, Sun, CloudRain, Wind, Loader2, Package, TestTube2, Crown, Clock, X, Landmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSyncState } from '../lib/store';
import { useAuth } from '../lib/AuthContext';
import { Task } from './TasksScreen';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWeather, fetchSprayRecommendation } from '../lib/api';
import { PremiumModal } from '../components/PremiumModal';
import { useSubscription } from '../lib/subscription';

export function HomeScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks] = useSyncState<Task[]>('ks_tasks', []);
  const [crops] = useSyncState<any[]>('ks_crops', []);
  const [cattle] = useSyncState<any[]>('ks_cattle', []);

  const [weatherData, setWeatherData] = useState<any>(null);
  const [sprayRec, setSprayRec] = useState<any>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [showPremium, setShowPremium] = useState(false);
  const [showAlertPopUp, setShowAlertPopUp] = useState(false);
  
  const { isExpired, daysLeft } = useSubscription();

  useEffect(() => {
    const hasSeenAlert = sessionStorage.getItem('ks_seen_alert');
    if (!hasSeenAlert && crops.length > 0) {
      const timer = setTimeout(() => {
        setShowAlertPopUp(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [crops]);

  const dismissAlert = () => {
    setShowAlertPopUp(false);
    sessionStorage.setItem('ks_seen_alert', 'true');
  };

  useEffect(() => {
    fetchWeather()
      .then(data => {
        setWeatherData(data);
        return fetchSprayRecommendation(data.forecast);
      })
      .then(rec => setSprayRec(rec))
      .catch(err => setWeatherError(err.message));
  }, []);

  const currentLang = i18n.language;
  const isHindi = currentLang === 'hi';
  const isPa = currentLang === 'pa';
  
  const weather = weatherData || { temp: 32, condition: "Sunny" };

  const upcomingTasks = (tasks || []).filter(t => !t.completed).slice(0, 3);
  
  const greetingText = () => {
    const hour = new Date().getHours();
    if (hour < 12) return isHindi ? 'सुप्रभात' : isPa ? 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ' : 'Good Morning';
    if (hour < 18) return isHindi ? 'शुभ दोपहर' : isPa ? 'ਸ਼ੁਭ ਦੁਪਹਿਰ' : 'Good Afternoon';
    return isHindi ? 'शुभ संध्या' : isPa ? 'ਸ਼ੁਭ ਸ਼ਾਮ' : 'Good Evening';
  };

  return (
    <div className="space-y-6">
      {/* Immersive Hero Banner */}
      <div className="bg-gradient-to-br from-primary to-[#1B4323] dark:from-[#113118] dark:to-black rounded-b-3xl p-5 pt-6 pb-10 shadow-md relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/20 dark:bg-yellow-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white/5 rounded-t-[100%] translate-y-6 scale-110" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-white/10 rounded-t-[100%] translate-y-4" />

        <header className="flex justify-between items-center relative z-10 mb-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-[10px] text-green-200/80 font-bold uppercase tracking-widest mb-0.5 flex items-center gap-1">
              <Leaf size={10}/> KisanSaathi
              {!isExpired ? (
                <span className="ml-2 bg-white/20 text-white rounded-full px-2 py-0.5 text-[8px] font-bold shadow-sm flex items-center">
                  <Clock size={8} className="mr-1" /> {daysLeft} Days Free
                </span>
              ) : (
                <button 
                  onClick={() => setShowPremium(true)}
                  className="ml-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full px-2 py-0.5 text-[8px] font-black shadow-sm flex items-center shadow-red-500/20"
                >
                  <AlertTriangle size={8} className="mr-0.5" /> EXPIRED
                </button>
              )}
              <button 
                onClick={() => setShowPremium(true)}
                className="ml-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full px-2 py-0.5 text-[8px] font-black shadow-sm flex items-center"
              >
                <Crown size={8} className="mr-0.5" /> PRO
              </button>
            </h1>
            <h2 className="text-xl font-bold text-white tracking-tight flex flex-wrap items-center gap-1">
              <span>{greetingText()},</span>
              <span className="text-secondary-light">{user?.name?.split(' ')[0] || 'Kisan'}</span>
            </h2>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/10 backdrop-blur-md p-1 rounded-full shadow-sm border border-white/20 cursor-pointer hover:bg-white/20" 
            onClick={() => navigate('/profile')}
          >
            <div className="w-10 h-10 bg-white text-primary rounded-full flex items-center justify-center font-bold text-sm uppercase shadow-inner">
              {user?.name?.charAt(0) || 'K'}
            </div>
          </motion.div>
        </header>

        {/* Quick Weather inside Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-10 flex items-center justify-between text-white"
        >
          <div className="flex items-center space-x-2">
            <Sun size={28} className="text-yellow-400 drop-shadow-md" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">{t("weather_forecast")}</div>
              <div className="text-lg font-medium">{weather.temp}°C • {weather.condition}</div>
            </div>
          </div>
          <button 
            onClick={() => navigate('/weather')}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold transition-colors border border-white/20"
          >
            Details
          </button>
        </motion.div>
      </div>

      <div className="px-5 space-y-8 -mt-6 relative z-20 pb-10">
        {/* Weather Forecast Widget */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center space-x-2">
              <Cloud size={18} className="text-gray-400" />
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">{t("5_day_forecast")}</h3>
            </div>
            {sprayRec && (
              <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${sprayRec.isGood ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                {sprayRec.recommendation || t("spray_rec")}
              </div>
            )}
          </div>
          
          <div className="p-4">
            {weatherError ? (
              <div className="text-xs text-orange-500 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl border border-orange-100 dark:border-orange-800">
                {weatherError}
              </div>
            ) : !weatherData ? (
              <div className="flex items-center justify-center p-6 text-gray-400">
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : (
              <>
                <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-hide">
                  {weatherData.forecast?.map((day: any, i: number) => (
                    <div key={i} className="flex-shrink-0 w-20 flex flex-col items-center p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">{day.day}</span>
                      {day.icon ? (
                        <img src={`https://openweathermap.org/img/wn/${day.icon}.png`} alt={day.condition} className="w-10 h-10 mb-1 drop-shadow-sm" />
                      ) : (
                        <CloudRain size={24} className="text-blue-400 mb-2" />
                      )}
                      <span className="text-base font-bold text-gray-800 dark:text-gray-200">{day.temp}°</span>
                    </div>
                  ))}
                </div>

                {sprayRec && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-start space-x-3">
                      <div className={`mt-0.5 p-1.5 rounded-full ${sprayRec.isGood ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                        <Sprout size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                          <strong className="text-gray-900 dark:text-white block mb-0.5">{t("ai_spray_advice")}</strong>
                          {sprayRec.reasoning}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.section>

        {/* Summary Cards */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div 
              onClick={() => navigate('/crops')}
              className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col justify-center items-center text-center cursor-pointer hover:shadow-lg transition-shadow active:scale-95">
              <div className="w-14 h-14 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light rounded-full flex items-center justify-center mb-3">
                <Sprout size={28} />
              </div>
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">{crops.length}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t("active_crops")}</div>
            </div>
            <div 
              onClick={() => navigate('/dairy')}
              className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col justify-center items-center text-center cursor-pointer hover:shadow-lg transition-shadow active:scale-95">
              <div className="bg-secondary/10 dark:bg-secondary/20 text-secondary dark:text-secondary-light w-14 h-14 rounded-full flex items-center justify-center mb-3">
                <Thermometer size={28} />
              </div>
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">{cattle.length}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t("cattle_count")}</div>
            </div>
          </div>
        </motion.section>

        {/* Premium Upgrade CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <div 
            onClick={() => setShowPremium(true)}
            className="relative overflow-hidden bg-gray-900 rounded-3xl p-5 shadow-lg group cursor-pointer active:scale-95 transition-transform"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5 mb-1">
                  <Crown size={14} className="text-orange-400" />
                  <h4 className="text-sm font-black tracking-widest text-orange-400 uppercase">KisanSaathi Pro</h4>
                </div>
                <p className="text-white font-bold text-lg">Unlock AI Scans, Reports & Kisan GPT ✨</p>
              </div>
              <div className="bg-white/10 text-white p-2.5 rounded-full backdrop-blur-sm shadow-sm group-hover:bg-white group-hover:text-gray-900 transition-colors">
                <ChevronRight size={20} />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Smart Alert Removed from inline and moved to pop-up */}

        {/* Action shortcuts */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid grid-cols-2 gap-4"
        >
          <button onClick={() => navigate('/disease')} className="bg-white dark:bg-gray-800 border-2 border-primary/20 hover:border-primary/50 transition-colors p-5 rounded-3xl flex flex-col items-start text-left shadow-sm active:scale-95 group">
            <div className="bg-primary/10 text-primary p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
               <Sprout size={24} />
            </div>
            <span className="text-base font-bold text-gray-800 dark:text-gray-200">Diagnose<br/>Disease</span>
          </button>
          
          <button onClick={() => navigate('/market')} className="bg-white dark:bg-gray-800 border-2 border-secondary/20 hover:border-secondary/50 transition-colors p-5 rounded-3xl flex flex-col items-start text-left shadow-sm active:scale-95 group">
            <div className="bg-secondary/10 text-secondary p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
               <ChevronRight size={24} />
            </div>
            <span className="text-base font-bold text-gray-800 dark:text-gray-200">Live Mandi<br/>Rates</span>
          </button>

          <button onClick={() => navigate('/schemes')} className="bg-white dark:bg-gray-800 border-2 border-blue-500/20 hover:border-blue-500/50 transition-colors p-5 rounded-3xl flex flex-col items-start text-left shadow-sm active:scale-95 group">
            <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
               <Landmark size={24} />
            </div>
            <span className="text-base font-bold text-gray-800 dark:text-gray-200">Govt.<br/>Schemes</span>
          </button>
          
          <button onClick={() => navigate('/inventory')} className="bg-white dark:bg-gray-800 border-2 border-emerald-500/20 hover:border-emerald-500/50 transition-colors p-5 rounded-3xl flex flex-col items-start text-left shadow-sm active:scale-95 group">
            <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
               <Package size={24} />
            </div>
            <span className="text-base font-bold text-gray-800 dark:text-gray-200">{t('inventory')}</span>
          </button>
          
          <button onClick={() => navigate('/soil-health')} className="bg-white dark:bg-gray-800 border-2 border-amber-600/20 hover:border-amber-600/50 transition-colors p-5 rounded-3xl flex flex-col items-start text-left shadow-sm active:scale-95 group">
            <div className="bg-amber-600/10 text-amber-700 dark:text-amber-500 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
               <TestTube2 size={24} />
            </div>
            <span className="text-base font-bold text-gray-800 dark:text-gray-200">{t('soil_health')}</span>
          </button>
        </motion.section>

        {/* Upcoming Tasks */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="pb-10"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-5 bg-primary rounded-full" />
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">{t("upcoming_tasks")}</h3>
            </div>
            <button onClick={() => navigate('/tasks')} className="text-sm font-bold text-primary dark:text-primary-light hover:underline">
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  key={task.id} 
                  className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center cursor-pointer hover:shadow-md transition-all active:scale-[0.98]" 
                  onClick={() => navigate('/tasks')}
                >
                  <span className="text-base font-medium text-gray-800 dark:text-gray-200 truncate pr-3">{task.title}</span>
                  <span className="text-sm text-secondary dark:text-secondary-light font-bold bg-secondary/10 px-3 py-1.5 rounded-full whitespace-nowrap">{task.date}</span>
                </motion.div>
              ))
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => navigate('/tasks')}>
                <Plus size={28} className="text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                <p className="text-base text-gray-500 dark:text-gray-400 font-medium">Add a task to your field</p>
              </div>
            )}
          </div>
        </motion.section>
      </div>

      <AnimatePresence>
        {showAlertPopUp && crops.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-20 left-4 right-4 z-50 shadow-2xl"
          >
            <div className="bg-orange-50 dark:bg-orange-900/40 border border-orange-200 dark:border-orange-500/30 rounded-2xl p-5 flex items-start space-x-4 shadow-xl relative backdrop-blur-md">
              <button 
                onClick={dismissAlert}
                className="absolute top-3 right-3 text-orange-400 hover:text-orange-600 dark:text-orange-300 dark:hover:text-orange-100 transition-colors bg-orange-100/50 dark:bg-orange-900/50 rounded-full p-1"
              >
                <X size={16} />
              </button>
              <div className="text-orange-500 dark:text-orange-400 mt-0.5 shadow-orange-500/20">
                <AlertTriangle size={24} />
              </div>
              <div className="flex-1 pr-6">
                <h4 className="text-base font-bold text-orange-800 dark:text-orange-300">{t("smart_alerts")}</h4>
                <p className="text-sm text-orange-700 dark:text-orange-200 mt-1 leading-relaxed">
                  Consider checking field moisture levels for <span className="font-bold">{crops[0]?.name || 'your crops'}</span> soon based on upcoming weather forecast.
                </p>
                <div className="mt-3">
                  <button onClick={dismissAlert} className="text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-full shadow-sm active:scale-95 transition-all">
                    Got it
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PremiumModal isOpen={showPremium} onClose={() => setShowPremium(false)} />
    </div>
  );
}
