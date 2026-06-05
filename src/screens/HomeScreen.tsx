import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Cloud, Droplets, Thermometer, ChevronRight, AlertTriangle, ListTodo, Sprout, Plus, Leaf, Sun, CloudRain, Wind, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSyncState } from '../lib/store';
import { useAuth } from '../lib/AuthContext';
import { Task } from './TasksScreen';
import { motion } from 'framer-motion';
import { fetchWeather, fetchSprayRecommendation } from '../lib/api';

export function HomeScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks] = useSyncState<Task[]>('ks_tasks', []);

  const [weatherData, setWeatherData] = useState<any>(null);
  const [sprayRec, setSprayRec] = useState<any>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);

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
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">5-Day Forecast</h3>
            </div>
            {sprayRec && (
              <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${sprayRec.isGood ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                {sprayRec.recommendation || 'Spray Rec'}
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
                          <strong className="text-gray-900 dark:text-white block mb-0.5">AI Spray Advice</strong>
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
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">2</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t("active_crops")}</div>
            </div>
            <div 
              onClick={() => navigate('/dairy')}
              className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col justify-center items-center text-center cursor-pointer hover:shadow-lg transition-shadow active:scale-95">
              <div className="bg-secondary/10 dark:bg-secondary/20 text-secondary dark:text-secondary-light w-14 h-14 rounded-full flex items-center justify-center mb-3">
                <Thermometer size={28} />
              </div>
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">12.5</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t("milk_produced")}</div>
            </div>
          </div>
        </motion.section>

        {/* Smart Alert */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 rounded-r-2xl rounded-l-sm p-5 flex items-start space-x-4 shadow-sm">
            <div className="text-orange-500 dark:text-orange-400 mt-0.5 animate-pulse">
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-bold text-orange-800 dark:text-orange-300">Smart Alert</h4>
              <p className="text-sm text-orange-700 dark:text-orange-400 mt-1 leading-relaxed">Wheat crop needs irrigation soon. Moisture looks low based on weather forecast.</p>
            </div>
          </div>
        </motion.section>

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
    </div>
  );
}
