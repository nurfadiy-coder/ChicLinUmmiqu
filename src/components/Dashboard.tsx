import React, { useMemo, useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  AreaChart,
  Area,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  AlertTriangle,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, isSameDay } from 'date-fns';
import { DashboardStats, Sale, Expense, Ingredient, MenuItem } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { analyzeBusinessPerformance } from '../services/geminiService';

interface DashboardProps {
  stats: DashboardStats;
  sales: Sale[];
  expenses: Expense[];
  lowStockAlerts: {
    ingredients: Ingredient[];
    menu: MenuItem[];
  };
}

export default function Dashboard({ stats, sales, expenses, lowStockAlerts }: DashboardProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Daily Chart Data (Last 7 Days)
  const chartData = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    });

    return last7Days.map(day => {
      const daySales = sales
        .filter(s => isSameDay(new Date(s.date), day))
        .reduce((sum, s) => sum + s.totalAmount, 0);
      
      const dayExpenses = expenses
        .filter(e => isSameDay(new Date(e.date), day))
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        name: format(day, 'EEE'),
        sales: daySales,
        expenses: dayExpenses,
        profit: daySales - dayExpenses
      };
    });
  }, [sales, expenses]);

  const handleAnalisis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeBusinessPerformance(stats, sales.slice(0, 50), expenses.slice(0, 50));
    setAnalysis(result || "Analisis tidak tersedia.");
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Penjualan', value: stats.totalSales, icon: ShoppingBag, border: 'border-red-500', iconColor: 'text-red-500' },
          { label: 'Laba Bersih', value: stats.netIncome, icon: TrendingUp, border: 'border-green-500', iconColor: 'text-green-600' },
          { label: 'Modal (HPP)', value: stats.totalCost, icon: DollarSign, border: 'border-yellow-400', iconColor: 'text-[#facc15]' },
          { label: 'Pengeluaran', value: stats.totalExpenses, icon: TrendingDown, border: 'border-slate-400', iconColor: 'text-slate-500' },
        ].map((stat, i) => (
          <div key={i} className={cn(
            "bg-white p-6 rounded-3xl shadow-sm border-l-4 transition-all hover:-translate-y-1 hover:shadow-md",
            stat.border
          )}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{stat.label}</p>
              <stat.icon className={cn("w-4 h-4", stat.iconColor)} />
            </div>
            <h4 className="text-2xl font-black text-slate-800">{formatCurrency(stat.value)}</h4>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Sales & Expenses Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 italic uppercase italic tracking-tighter">Performa Hari Ini</h3>
              <p className="text-xs font-bold text-slate-400">Statistik penjualan 7 hari terakhir</p>
            </div>
            <div className="flex gap-2">
              <span className="text-[10px] bg-red-100 px-3 py-1 rounded-full text-red-600 font-black uppercase tracking-wider">Penjualan</span>
              <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full text-slate-500 font-black uppercase tracking-wider">Pengeluaran</span>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} tickFormatter={(val) => `Rp${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '16px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 800 }}
                  labelStyle={{ marginBottom: '8px', opacity: 0.5 }}
                />
                <Area type="monotone" dataKey="sales" stroke="#dc2626" strokeWidth={5} fillOpacity={1} fill="url(#colorSales)" name="Penjualan" />
                <Area type="monotone" dataKey="expenses" stroke="#94a3b8" strokeWidth={3} strokeDasharray="8 8" fill="none" name="Pengeluaran" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI & Alerts */}
        <div className="space-y-10">
          {/* AI Analysis */}
          <div className="bg-[#dc2626] rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                  <Lightbulb className="w-6 h-6 text-[#facc15]" />
                </div>
                <h3 className="font-black text-xl italic tracking-tighter uppercase">ANALISIS KEMAJUAN</h3>
              </div>
              
              {!analysis && !isAnalyzing ? (
                <button 
                  onClick={handleAnalisis}
                  className="w-full bg-[#facc15] text-[#dc2626] font-black py-4 rounded-2xl hover:scale-105 transition-all shadow-xl shadow-red-900/40 uppercase text-xs tracking-widest"
                >
                  Dapatkan Insight AI
                </button>
              ) : isAnalyzing ? (
                <div className="flex flex-col items-center gap-4 py-4 animate-pulse">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" />
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest opacity-60">Mengkalkulasi Masa Depan...</span>
                </div>
              ) : (
                <div className="text-sm leading-relaxed space-y-4 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="bg-white/10 p-5 rounded-3xl border border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#facc15] mb-2 text-center underline decoration-2">Status Bisnis: SEHAT ✅</p>
                    {analysis?.split('\n').map((line, i) => (
                      <p key={i} className="text-xs font-bold leading-6 opacity-90">{line}</p>
                    ))}
                  </div>
                  <button onClick={() => setAnalysis(null)} className="w-full text-[10px] uppercase font-black text-[#facc15] hover:tracking-widest transition-all">
                    Reset Analisis
                  </button>
                </div>
              )}
            </div>
            
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl transition-transform group-hover:scale-125 duration-700" />
          </div>

          {/* Low Stock Alerts */}
          {(lowStockAlerts.ingredients.length > 0 || lowStockAlerts.menu.length > 0) && (
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 flex-1">
              <div className="flex items-center gap-3 mb-8">
                <AlertTriangle className="w-6 h-6 text-[#dc2626]" />
                <h3 className="font-black text-slate-900 uppercase italic tracking-tighter">PERINGATAN STOK</h3>
              </div>
              
              <div className="space-y-4">
                {[...lowStockAlerts.ingredients.map(i => ({...i, type: 'Bahan'})), ...lowStockAlerts.menu.map(m => ({...m, type: 'Menu', unit: 'pcs'}))].slice(0, 4).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border-l-4 border-[#dc2626]">
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase">{item.name}</p>
                      <p className="text-[10px] text-[#dc2626] font-black tracking-widest">{item.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-[#dc2626] bg-white px-2 py-1 rounded-lg border border-red-100">{item.stock} {item.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
