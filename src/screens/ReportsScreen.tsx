import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { ChevronLeft, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSyncState } from '../lib/store';

export function ReportsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cattle, tasks } = useSyncState();
  const [reportType, setReportType] = useState('monthly');

  const generateData = () => {
    // Mock aggregated data based on existing store + some mock numbers
    const expenses = [
      { date: '2023-10-01', category: 'Seeds', amount: 1200 },
      { date: '2023-10-15', category: 'Fertilizer', amount: 3500 },
      { date: '2023-10-20', category: 'Cattle Feed', amount: 2000 },
    ];
    
    // Convert tasks into activity
    const activity = (tasks || []).map(task => ({
      date: task.date || '2023-10-01',
      activity: task.title,
      status: task.completed ? 'Completed' : 'Pending'
    }));

    // Mock monthly milk
    const milkProduction = cattle?.map(c => ({
      tag: c.id,
      breed: c.breed,
      monthlyYield: parseFloat(c.yield || '0') * 30 + ' L'
    })) || [];

    return { expenses, activity, milkProduction };
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const data = generateData();

    doc.setFontSize(20);
    doc.text('Farm Activity & Finance Report', 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Report Period: ${reportType === 'monthly' ? 'Last 30 Days' : 'This Year'}`, 14, 30);

    // Expenses Table
    doc.setFontSize(16);
    doc.text('Expenses', 14, 45);
    (doc as any).autoTable({
      startY: 50,
      head: [['Date', 'Category', 'Amount (INR)']],
      body: data.expenses.map(e => [e.date, e.category, e.amount]),
      theme: 'grid',
      headStyles: { fillColor: [45, 122, 58] }
    });

    // Milk Production Table
    let finalY = (doc as any).lastAutoTable.finalY || 50;
    doc.text('Monthly Milk Production estimates', 14, finalY + 15);
    (doc as any).autoTable({
      startY: finalY + 20,
      head: [['Cattle Tag', 'Breed', 'Est. Monthly Yield']],
      body: data.milkProduction.map(m => [m.tag, m.breed, m.monthlyYield]),
      theme: 'grid',
      headStyles: { fillColor: [245, 166, 35] }
    });

    // Activities Table
    finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.text('Farm Activities', 14, finalY + 15);
    (doc as any).autoTable({
      startY: finalY + 20,
      head: [['Date', 'Activity', 'Status']],
      body: data.activity.map(a => [a.date, a.activity, a.status]),
      theme: 'grid',
      headStyles: { fillColor: [26, 115, 232] }
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

      <div className="p-4 space-y-6 flex-1 overflow-y-auto">
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
      </div>
    </div>
  );
}
