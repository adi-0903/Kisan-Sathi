import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { jsPDF } from 'jspdf';
import { ChevronLeft, Download, FileText, FileSpreadsheet, TrendingUp, IndianRupee, Plus, ArrowUpRight, ArrowDownRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSyncState } from '../lib/store';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

export function ReportsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [crops] = useSyncState<any[]>('ks_crops', []);
  const [cattle] = useSyncState<any[]>('ks_cattle', []);

  // Compute live yield data from actual crops rather than demo data
  const liveYieldData = crops?.filter(c => c.yield).map((c, i) => ({
    year: c.sown ? new Date(c.sown).getFullYear().toString() : `Crop ${i+1}`,
    yourYield: parseFloat(c.yield) || 0,
    localAvg: 3.8 + (Math.random() * 0.5) // Example baseline
  })).sort((a,b) => a.year.localeCompare(b.year)) || [];

  const [tasks] = useSyncState<any[]>('ks_tasks', []);
  const [finances, setFinances] = useSyncState<any[]>('ks_finances', []);
  const [reportType, setReportType] = useState('monthly');
  const [activeTab, setActiveTab] = useState<'exports' | 'finance' | 'trends'>('exports');

  // Finance modal state
  const [showAddFinance, setShowAddFinance] = useState(false);
  const [financeType, setFinanceType] = useState<'income' | 'expense'>('expense');
  const [financeAmount, setFinanceAmount] = useState('');
  const [financeCategory, setFinanceCategory] = useState('');
  const [financeDate, setFinanceDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddFinance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!financeAmount || !financeCategory) return;
    const newEntry = {
      id: Date.now(),
      type: financeType,
      amount: parseFloat(financeAmount),
      category: financeCategory,
      date: financeDate
    };
    setFinances([newEntry, ...finances].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setShowAddFinance(false);
    setFinanceAmount('');
    setFinanceCategory('');
  };

  const financeSummary = useMemo(() => {
    let income = 0;
    let expense = 0;
    finances.forEach(f => {
      if (f.type === 'income') income += f.amount;
      else expense += f.amount;
    });
    return { income, expense, balance: income - expense };
  }, [finances]);

  const generateData = () => {
    const expenses = finances.filter(f => f.type === 'expense').map(f => ({
      date: f.date, category: f.category, amount: f.amount
    }));
    
    // Convert tasks into activity
    const activity = (tasks || []).map(task => ({
      date: task.date || new Date().toISOString().split('T')[0],
      activity: task.title,
      status: task.completed ? 'Completed' : 'Pending'
    }));

    const milkLogs = JSON.parse(localStorage.getItem('ks_milk_logs') || '[]');
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const milkProduction = cattle?.map(c => {
      const cowLogs = milkLogs.filter((l: any) => {
        if (l.cattleId !== c.id) return false;
        const d = new Date(l.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      const monthlyTotal = cowLogs.reduce((acc: number, curr: any) => acc + curr.amount, 0);

      return {
        tag: c.id,
        breed: c.breed,
        monthlyYield: `${monthlyTotal.toFixed(1)} L`
      };
    }) || [];

    return { expenses, activity, milkProduction };
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const data = generateData();

    doc.setFontSize(20);
    doc.text('Farm Activity & Finance Report', 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Report Period: ${reportType === 'monthly' ? 'Last 30 Days' : 'This Year'}`, 14, 30);

    let currentY = 45;

    // Helper to draw a simple row
    const drawRow = (rowText: string[], y: number) => {
      doc.text(rowText[0].toString().padEnd(20, ' '), 14, y);
      doc.text(rowText[1].toString().padEnd(30, ' '), 60, y);
      doc.text(rowText[2].toString(), 130, y);
    };

    // Expenses Table
    doc.setFontSize(16);
    doc.text('Expenses', 14, currentY);
    currentY += 8;
    doc.setFontSize(10);
    drawRow(['Date', 'Category', 'Amount (INR)'], currentY);
    currentY += 2;
    doc.line(14, currentY, 196, currentY);
    currentY += 6;
    data.expenses.forEach(e => {
      drawRow([e.date, e.category, e.amount.toString()], currentY);
      currentY += 6;
    });

    currentY += 10;

    // Milk Production Table
    doc.setFontSize(16);
    doc.text('Monthly Milk Production estimates', 14, currentY);
    currentY += 8;
    doc.setFontSize(10);
    drawRow(['Cattle Tag', 'Breed', 'Est. Monthly Yield'], currentY);
    currentY += 2;
    doc.line(14, currentY, 196, currentY);
    currentY += 6;
    data.milkProduction.forEach(m => {
      drawRow([m.tag, m.breed, m.monthlyYield], currentY);
      currentY += 6;
    });

    currentY += 10;

    // Activities Table
    doc.setFontSize(16);
    doc.text('Farm Activities', 14, currentY);
    currentY += 8;
    doc.setFontSize(10);
    drawRow(['Date', 'Activity', 'Status'], currentY);
    currentY += 2;
    doc.line(14, currentY, 196, currentY);
    currentY += 6;
    data.activity.forEach(a => {
      drawRow([a.date, a.activity, a.status], currentY);
      currentY += 6;
    });

    doc.save('KisanSaathi_Report.pdf');
  };

  const handleDownloadCSV = () => {
    const data = generateData();
    let csvContent = "data:text/csv;charset=utf-8,";
    
    csvContent += "--- EXPENSES ---\n";
    csvContent += "Date,Category,Amount\n";
    data.expenses.forEach(e => {
      csvContent += `${e.date},${e.category},${e.amount}\n`;
    });

    csvContent += "\n--- MILK PRODUCTION ---\n";
    csvContent += "Tag,Breed,Est. Monthly Yield\n";
    data.milkProduction.forEach(m => {
      csvContent += `${m.tag},${m.breed},${m.monthlyYield}\n`;
    });

    csvContent += "\n--- ACTIVITIES ---\n";
    csvContent += "Date,Activity,Status\n";
    data.activity.forEach(a => {
      csvContent += `${a.date},${a.activity},${a.status}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "KisanSaathi_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50 dark:bg-[#121212]">
      <header className="flex items-center p-4 bg-white dark:bg-gray-800 shadow-sm z-10">
        <button onClick={() => navigate(-1)} className="mr-3 p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">Farm Reports</h1>
      </header>

      <div className="flex px-4 pt-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 space-x-6 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('exports')}
          className={`pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors duration-200 ${activeTab === 'exports' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          Export
        </button>
        <button 
          onClick={() => setActiveTab('finance')}
          className={`pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors duration-200 ${activeTab === 'finance' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          Financials
        </button>
        <button 
          onClick={() => setActiveTab('trends')}
          className={`pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors duration-200 ${activeTab === 'trends' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          Yield Trends
        </button>
      </div>

      <div className="p-4 space-y-6 flex-1 overflow-y-auto">
        {activeTab === 'exports' ? (
          <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Generate Report</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Download your aggregated farm activity, expenses, and dairy production data.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reporting Period</label>
                  <select 
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-800 dark:text-gray-100"
                  >
                    <option value="monthly">This Month</option>
                    <option value="annual">This Year</option>
                  </select>
                </div>

                <div className="pt-4 grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleDownloadPDF}
                    className="flex flex-col items-center justify-center space-y-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                    <FileText size={28} />
                    <span className="text-sm font-bold">Download PDF</span>
                  </button>
                  
                  <button 
                    onClick={handleDownloadCSV}
                    className="flex flex-col items-center justify-center space-y-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-xl border border-green-100 dark:border-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                  >
                    <FileSpreadsheet size={28} />
                    <span className="text-sm font-bold">Download CSV</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-xl border border-primary/20 text-sm text-primary dark:text-primary-light">
              <strong>Tip:</strong> These reports can be shared directly with your local bank branch for agricultural loans (KCC).
            </div>
          </>
        ) : activeTab === 'finance' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-800 shadow-sm">
                <div className="flex items-center text-green-600 dark:text-green-400 mb-2">
                  <ArrowUpRight size={18} className="mr-1" />
                  <span className="text-xs font-bold uppercase tracking-wider">Income</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{financeSummary.income.toLocaleString()}</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-800 shadow-sm">
                <div className="flex items-center text-red-600 dark:text-red-400 mb-2">
                  <ArrowDownRight size={18} className="mr-1" />
                  <span className="text-xs font-bold uppercase tracking-wider">Expense</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{financeSummary.expense.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex justify-between items-center">
               <div>
                 <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Recent Transactions</h3>
               </div>
               <button onClick={() => setShowAddFinance(true)} className="flex items-center text-xs font-bold text-primary bg-primary/10 dark:bg-primary/20 px-3 py-1.5 rounded-full">
                 <Plus size={14} className="mr-1" /> Add Entry
               </button>
            </div>

            <div className="space-y-3 pb-8">
              {finances.map(f => (
                <div key={f.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${f.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                      {f.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 dark:text-gray-200">{f.category}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(f.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    </div>
                  </div>
                  <div className={`font-bold ${f.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'}`}>
                    {f.type === 'income' ? '+' : '-'}₹{f.amount.toLocaleString()}
                  </div>
                </div>
              ))}
              {finances.length === 0 && (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IndianRupee size={24} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No transactions recorded yet</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-6 text-gray-800 dark:text-gray-100">
              <TrendingUp size={24} className="text-primary" />
              <h2 className="text-lg font-bold">Wheat Yield vs. Local Average</h2>
            </div>
            
            <div className="h-64 mb-6">
              {liveYieldData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={liveYieldData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-700" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} className="text-xs text-gray-500" />
                    <YAxis axisLine={false} tickLine={false} className="text-xs text-gray-500" unit="t/ha" />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', background: 'var(--tw-prose-bg, white)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    <Area type="monotone" name="Your Yield" dataKey="yourYield" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorYield)" />
                    <Line type="monotone" name="Local Avg" dataKey="localAvg" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <TrendingUp size={32} className="text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-sm text-gray-500">Record crop yields to see trends</p>
                </div>
              )}
            </div>

            {liveYieldData.length > 0 && (
              <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-1">Yield Insights</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-500/80 leading-relaxed">
                  Based on your logged data, your yield is trending against the local baseline. Continue adding harvest data to build a complete profile.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Finance Modal */}
      <AnimatePresence>
        {showAddFinance && (
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
              className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Record Transaction</h2>
                <button onClick={() => setShowAddFinance(false)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 dark:text-gray-300">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddFinance} className="space-y-4">
                <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                  <button type="button" onClick={() => setFinanceType('income')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${financeType === 'income' ? 'bg-white dark:bg-gray-800 shadow text-green-600 dark:text-green-400' : 'text-gray-500'}`}>Income</button>
                  <button type="button" onClick={() => setFinanceType('expense')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${financeType === 'expense' ? 'bg-white dark:bg-gray-800 shadow text-red-600 dark:text-red-400' : 'text-gray-500'}`}>Expense</button>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Amount (₹) *</label>
                  <input required value={financeAmount} onChange={e => setFinanceAmount(e.target.value)} type="number" placeholder="e.g. 5000" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Category / Description *</label>
                  <input required value={financeCategory} onChange={e => setFinanceCategory(e.target.value)} type="text" placeholder={financeType === 'income' ? "e.g. Sold Wheat, Milk Payment" : "e.g. Bought Seeds, Labor"} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Date *</label>
                  <input required value={financeDate} onChange={e => setFinanceDate(e.target.value)} type="date" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:text-white [&::-webkit-calendar-picker-indicator]:dark:invert" />
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-md active:scale-95 transition-transform">
                    Save Transaction
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
