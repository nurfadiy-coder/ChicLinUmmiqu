import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ShoppingBag, 
  Trash2, 
  Filter,
  CheckCircle2,
  XCircle,
  PlusCircle,
  History
} from 'lucide-react';
import { format } from 'date-fns';
import { Sale, MenuItem } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SalesManagementProps {
  sales: Sale[];
  onAddSale: (sale: Sale) => void;
  onDeleteSale: (id: string) => void;
  onAddExpense: (expense: any) => void;
  menu: MenuItem[];
  updateStock: (menuId: string, qty: number) => void;
}

export default function SalesManagement({ sales, onAddSale, onDeleteSale, onAddExpense, menu, updateStock }: SalesManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [cart, setCart] = useState<{ menuId: string; quantity: number }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredMenu = menu.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (menuId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuId === menuId);
      if (existing) {
        return prev.map(i => i.menuId === menuId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuId, quantity: 1 }];
    });
  };

  const removeFromCart = (menuId: string) => {
    setCart(prev => prev.filter(i => i.menuId !== menuId));
  };

  const cartTotal = cart.reduce((acc, item) => {
    const menuItem = menu.find(m => m.id === item.menuId);
    return acc + (menuItem?.price || 0) * item.quantity;
  }, 0);

  const cartCost = cart.reduce((acc, item) => {
    const menuItem = menu.find(m => m.id === item.menuId);
    return acc + (menuItem?.cost || 0) * item.quantity;
  }, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      date: new Date().toISOString(),
      items: cart.map(item => {
        const m = menu.find(mi => mi.id === item.menuId)!;
        return {
          menuId: item.menuId,
          quantity: item.quantity,
          price: m.price,
          cost: m.cost
        };
      }),
      totalAmount: cartTotal,
      totalCost: cartCost,
      profit: cartTotal - cartCost
    };

    onAddSale(newSale);
    
    // Update stock for each item
    cart.forEach(item => updateStock(item.menuId, item.quantity));
    
    setCart([]);
    setIsAdding(false);
  };

  const [reconcileAmount, setReconcileAmount] = useState<number>(0);
  const [reconcileReason, setReconcileReason] = useState<string>('');
  const [isReconciling, setIsReconciling] = useState(false);

  const handleReconcile = () => {
    if (reconcileAmount <= 0) return;
    
    // We record this as an expense of category 'Adjustment'
    // In props, I need to add onAddExpense or similar.
    // Actually I'll pass it back through a new prop or handle it in App.tsx if I update the interface.
  };

  const salesToday = sales.filter(s => s.date.startsWith(new Date().toISOString().split('T')[0]));
  const totalSalesToday = salesToday.reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Menu / History */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-[#dc2626] uppercase italic tracking-tighter italic">REKONSILIASI KAS HARIAN</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
              Sinkronisasi Pendapatan
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="p-6 bg-red-50 rounded-3xl border border-red-100">
              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Total Penjualan Sistem (Hari Ini)</p>
              <p className="text-xl font-black text-slate-800">{formatCurrency(totalSalesToday)}</p>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Jumlah Selisih (Minus)</p>
                  <input 
                    type="number"
                    value={reconcileAmount || ''}
                    onChange={(e) => setReconcileAmount(Number(e.target.value))}
                    placeholder="Contoh: 5000"
                    className="w-full px-5 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold focus:ring-4 focus:ring-red-100"
                  />
                </div>
              </div>
              <input 
                type="text"
                value={reconcileReason}
                onChange={(e) => setReconcileReason(e.target.value)}
                placeholder="Alasan selisih (Contoh: Salah kembalian atau uang hilang)"
                className="w-full px-5 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold focus:ring-4 focus:ring-red-100"
              />
              <button 
                onClick={() => {
                  if (reconcileAmount > 0 && reconcileReason) {
                    onAddExpense({
                      id: `adj-${Date.now()}`,
                      date: new Date().toISOString(),
                      description: `Minus Pendapatan: ${reconcileReason}`,
                      amount: reconcileAmount,
                      category: 'Adjustment'
                    });
                    setReconcileAmount(0);
                    setReconcileReason('');
                    alert('Minus pendapatan berhasil dicatat sebagai pengeluaran penyesuaian.');
                  }
                }}
                className="w-full py-4 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95"
              >
                Catat Selisih (Minus)
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari menu nikmat..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-5 py-4 rounded-2xl bg-slate-50 border-none text-sm focus:ring-4 focus:ring-red-100 placeholder:text-slate-400 font-bold"
            />
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAdding(true)}
              className="px-8 py-4 rounded-2xl bg-[#dc2626] text-white text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-red-700 transition-all shadow-xl shadow-red-200 active:scale-95"
            >
              <PlusCircle className="w-5 h-5" />
              Catat Penjualan
            </button>
          </div>
        </div>

        {/* Recent Sales List */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white">
            <h3 className="font-black text-slate-900 flex items-center gap-3 uppercase italic tracking-tighter italic">
              <History className="w-5 h-5 text-[#dc2626]" />
              RIWAYAT TRANSAKSI
            </h3>
            <span className="text-[10px] font-black text-[#dc2626] uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-100">
              {sales.length} PENJUALAN
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Waktu</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Detail</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Total</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Laba</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">Belum ada transaksi hari ini</td>
                  </tr>
                ) : (
                  sales.slice(0, 10).map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-900">{format(new Date(sale.date), 'HH:mm')}</p>
                        <p className="text-[10px] text-slate-400">{format(new Date(sale.date), 'd MMM yyyy')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {sale.items.map((item, idx) => {
                            const menuItem = menu.find(m => m.id === item.menuId);
                            return (
                              <span key={idx} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-50 text-red-700 text-[10px] font-bold border border-red-100">
                                {menuItem?.name} <span className="opacity-40">×</span> {item.quantity}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-xs font-bold text-slate-900">
                        {formatCurrency(sale.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-md">
                            +{formatCurrency(sale.profit)}
                          </span>
                          {deletingId === sale.id ? (
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => {
                                  onDeleteSale(sale.id);
                                  setDeletingId(null);
                                }}
                                className="px-2 py-1 text-[8px] font-black uppercase tracking-widest bg-red-600 text-white rounded-lg"
                              >
                                Ya, Hapus
                              </button>
                              <button 
                                onClick={() => setDeletingId(null)}
                                className="px-2 py-1 text-[8px] font-black uppercase tracking-widest bg-slate-200 text-slate-600 rounded-lg"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setDeletingId(sale.id)}
                              className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* POS Panel (Recording) */}
      <div className="space-y-6 sticky top-28">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-red-600 rounded-2xl">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Pesanan Baru</h3>
              <p className="text-sm text-slate-500">Pilih menu dari daftar</p>
            </div>
          </div>

          <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredMenu.map(item => (
              <button 
                key={item.id}
                onClick={() => addToCart(item.id)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-red-50 hover:border-red-100 border border-slate-100 transition-all group active:scale-95"
              >
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900 group-hover:text-red-700">{item.name}</p>
                  <p className="text-xs text-slate-500">{formatCurrency(item.price)}</p>
                </div>
                <div className="p-2 rounded-full bg-white text-slate-400 group-hover:text-red-600 shadow-sm border border-slate-100">
                  <Plus className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-8 space-y-6">
            <div className="space-y-3">
              {cart.map(item => {
                const menuItem = menu.find(m => m.id === item.menuId);
                return (
                  <div key={item.menuId} className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => removeFromCart(item.menuId)}
                        className="p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{menuItem?.name}</p>
                        <p className="text-[10px] text-slate-500">{formatCurrency(menuItem?.price || 0)} × {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-red-600">{formatCurrency((menuItem?.price || 0) * item.quantity)}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">HPP Estimasi</span>
                  <span className="text-xs font-bold text-slate-300">{formatCurrency(cartCost)}</span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
                    <p className="text-2xl font-black text-yellow-400">{formatCurrency(cartTotal)}</p>
                  </div>
                  <button 
                    disabled={cart.length === 0}
                    onClick={handleCheckout}
                    className="px-6 py-3 bg-red-600 rounded-xl font-bold text-sm tracking-wide disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-700 transition-colors shadow-lg active:scale-95"
                  >
                    Simpan
                  </button>
                </div>
               </div>
               
               <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
