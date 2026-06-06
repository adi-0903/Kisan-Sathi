import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Search, Filter, Landmark, ShieldCheck, Wallet, ChevronRight, BadgePercent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

type SchemeCategory = 'All' | 'Subsidies' | 'Loans' | 'Insurance';

interface Scheme {
  id: string;
  title: string;
  provider: string;
  category: SchemeCategory;
  description: string;
  eligibility: string[];
  link: string;
  icon: React.ReactNode;
}

const mockSchemes: Scheme[] = [
  {
    id: 'pm-kisan',
    title: 'PM-KISAN Samman Nidhi',
    provider: 'Central Government',
    category: 'Subsidies',
    description: 'Income support of Rs. 6,000 per year in three equal installments to all land holding farmer families.',
    eligibility: ['Small and marginal farmers', 'Valid Aadhaar Linked Bank Account'],
    link: '#',
    icon: <Wallet className="text-emerald-500" size={24} />
  },
  {
    id: 'pm-fby',
    title: 'PM Fasal Bima Yojana',
    provider: 'Central Government',
    category: 'Insurance',
    description: 'Comprehensive crop insurance coverage against non-preventable natural risks from pre-sowing to post-harvest.',
    eligibility: ['All farmers growing notified crops', 'Loanee and Non-Loanee farmers'],
    link: '#',
    icon: <ShieldCheck className="text-blue-500" size={24} />
  },
  {
    id: 'kcc',
    title: 'Kisan Credit Card (KCC)',
    provider: 'Public Sector Banks',
    category: 'Loans',
    description: 'Affordable credit for agricultural inputs and expenses at subsidized interest rates.',
    eligibility: ['Individual farmers/Joint borrowers', 'Tenant Farmers, Oral Lessees'],
    link: '#',
    icon: <Landmark className="text-amber-500" size={24} />
  },
  {
    id: 'smam',
    title: 'Agri Mechanization Subsidy',
    provider: 'State/Central',
    category: 'Subsidies',
    description: 'Subsidy up to 50-80% for purchasing agricultural machinery and equipment (Tractors, Harvesters).',
    eligibility: ['Valid Farmer ID', 'Depending on state guidelines'],
    link: '#',
    icon: <BadgePercent className="text-purple-500" size={24} />
  }
];

export function SchemesScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<SchemeCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSchemes = mockSchemes.filter(scheme => {
    const matchesCategory = activeCategory === 'All' || scheme.category === activeCategory;
    const matchesSearch = scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          scheme.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <header className="bg-white dark:bg-gray-800 px-5 pt-12 pb-4 shadow-sm z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate(-1)} 
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Schemes & Subsidies</h1>
          </div>
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-2xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-800 transition-colors shadow-inner"
            placeholder="Search schemes, loans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2">
          {(['All', 'Subsidies', 'Loans', 'Insurance'] as SchemeCategory[]).map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                activeCategory === category
                  ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5">
        <AnimatePresence>
          {filteredSchemes.length > 0 ? (
            <div className="space-y-4">
              {filteredSchemes.map((scheme, index) => (
                <motion.div
                  key={scheme.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-4 mb-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                      {scheme.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          {scheme.provider}
                        </span>
                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                          {scheme.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-1 leading-tight">
                        {scheme.title}
                      </h3>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {scheme.description}
                  </p>

                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 mb-4 border border-gray-100 dark:border-gray-700/50">
                    <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Eligibility Highlights</h4>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      {scheme.eligibility.map((req, i) => (
                        <li key={i} className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-secondary rounded-full mr-2" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button className="w-full py-3 bg-gray-50 dark:bg-gray-700 hover:bg-primary hover:text-white dark:hover:bg-primary text-primary font-bold rounded-xl transition-colors flex items-center justify-center group">
                    <span>Check Eligibility & Apply</span>
                    <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center py-20 text-gray-500 dark:text-gray-400"
            >
              <Landmark size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No schemes found.</p>
              <p className="text-sm">Try adjusting your filters or search.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
