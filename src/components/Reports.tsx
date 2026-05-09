import React, { useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Table as TableIcon, 
  FileSpreadsheet, 
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  Printer
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, isWithinInterval } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';
import { Sale, Expense, MenuItem } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ReportsProps {
  sales: Sale[];
  expenses: Expense[];
  menu: MenuItem[];
}

export default function Reports({ sales, expenses, menu }: ReportsProps) {
  // Monthly Revenue Data (Last 6 Months)
  const monthlyData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date(),
    });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const monthSales = sales
        .filter(s => isWithinInterval(new Date(s.date), { start: monthStart, end: monthEnd }));
      
      const revenue = monthSales.reduce((sum, s) => sum + s.totalAmount, 0);
      const hpp = monthSales.reduce((sum, s) => sum + s.totalCost, 0);

      const opExpenses = expenses
        .filter(e => isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd }))
        .reduce((sum, e) => sum + e.amount, 0);

      const totalExpenses = hpp + opExpenses;
      const monthProfit = revenue - totalExpenses;

      return {
        name: format(month, 'MMM'),
        revenue: revenue,
        expenses: totalExpenses,
        profit: monthProfit
      };
    });
  }, [sales, expenses]);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(sales.map(s => ({
      ID: s.id,
      Tanggal: format(new Date(s.date), 'yyyy-MM-dd HH:mm'),
      Total: s.totalAmount,
      Modal: s.totalCost,
      Laba: s.profit
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Penjualan");
    XLSX.writeFile(wb, `Laporan_Penjualan_Chiclin_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF() as any;
    doc.text("LAPORAN PENJUALAN CHICLIN UMMIQU", 14, 15);
    doc.autoTable({
      head: [['ID', 'Tanggal', 'Item', 'Total Sales', 'Profit']],
      body: sales.map(s => [
        s.id.slice(-5),
        format(new Date(s.date), 'dd/MM/yyyy HH:mm'),
        s.items.length + ' pcs',
        formatCurrency(s.totalAmount),
        formatCurrency(s.profit)
      ]),
      startY: 25,
    });
    doc.save(`Laporan_Chiclin_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Performance Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Performa Tiap Bulan</h3>
              <p className="text-sm text-slate-500">Pertumbuhan pendapatan selama 6 bulan terakhir</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} tickFormatter={(val) => `Rp${val/1000000}jt`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [formatCurrency(value).replace('Rp', 'Rp '), '']}
                />
                <Bar dataKey="revenue" fill="#E11D48" radius={[6, 6, 0, 0]} barSize={40} name="Pendapatan" />
                <Bar dataKey="profit" fill="#FACC15" radius={[6, 6, 0, 0]} barSize={40} name="Laba" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Export Panel */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-red-600 rounded-2xl shadow-lg shadow-red-100">
                <Download className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Ekspor Laporan</h3>
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={exportToExcel}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-green-200 hover:bg-green-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl text-green-600 shadow-sm">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900">Excel Format</p>
                    <p className="text-[10px] text-slate-500 font-medium">Data mentah transaksi (.xlsx)</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button 
                onClick={exportToPDF}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-red-200 hover:bg-red-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl text-red-600 shadow-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900">PDF Report</p>
                    <p className="text-[10px] text-slate-500 font-medium">Dokumen formal (.pdf)</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button 
                onClick={() => {
                  const ws = XLSX.utils.json_to_sheet(expenses.map(e => ({
                    ID: e.id,
                    Tanggal: format(new Date(e.date), 'yyyy-MM-dd HH:mm'),
                    Kategori: e.category,
                    Deskripsi: e.description,
                    Jumlah: e.amount
                  })));
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "Pengeluaran");
                  XLSX.writeFile(wb, `Laporan_Pengeluaran_Chiclin_${format(new Date(), 'yyyyMMdd')}.xlsx`);
                }}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-amber-50/50 border border-amber-100 hover:border-amber-200 hover:bg-amber-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl text-amber-600 shadow-sm">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900">Export Pengeluaran</p>
                    <p className="text-[10px] text-slate-500 font-medium">Data pengeluaran & minus (.xlsx)</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button 
                onClick={() => window.print()}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-300 hover:bg-slate-100 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl text-slate-600 shadow-sm">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900">Print Direct</p>
                    <p className="text-[10px] text-slate-500 font-medium">Cetak langsung ke printer</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-slate-50 rounded-full blur-3xl opacity-50" />
        </div>
      </div>

      {/* Summary Mini Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Penjualan Bulan Ini</p>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(monthlyData[5]?.revenue || 0)}</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Laba Bersih Bulan Ini</p>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(monthlyData[5]?.profit || 0)}</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <TableIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Margin Profit Rata-rata</p>
              <p className="text-lg font-bold text-slate-900">
                {monthlyData[5]?.revenue ? Math.round((monthlyData[5].profit / monthlyData[5].revenue) * 100) : 0}%
              </p>
            </div>
         </div>
      </div>
    </div>
  );
}

function ArrowRight(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    >
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  );
}
