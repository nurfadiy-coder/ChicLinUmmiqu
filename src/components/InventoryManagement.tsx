import React, { useState } from 'react';
import { 
  Package, 
  Utensils, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2,
  Box,
  Flame,
  ArrowRight
} from 'lucide-react';
import { Ingredient, MenuItem } from '../types';
import { formatCurrency, cn } from '../lib/utils';

interface InventoryManagementProps {
  ingredients: Ingredient[];
  menu: MenuItem[];
  onUpdateIngredients: (ingredients: Ingredient[]) => void;
  onUpdateMenu: (menu: MenuItem[]) => void;
  onDeleteIngredient: (id: string) => void;
}

export default function InventoryManagement({ ingredients, menu, onUpdateIngredients, onUpdateMenu, onDeleteIngredient }: InventoryManagementProps) {
  const [activeSubTab, setActiveSubTab] = useState<'ingredients' | 'menu'>('ingredients');
  const [isAddingMenu, setIsAddingMenu] = useState(false);
  const [deletingMenuId, setDeletingMenuId] = useState<string | null>(null);
  const [deletingIngredientId, setDeletingIngredientId] = useState<string | null>(null);
  
  const [newMenu, setNewMenu] = useState<Partial<MenuItem>>({
    name: '',
    price: 0,
    cost: 0,
    stock: 0,
    category: 'Temporary'
  });

  const handleAddMenu = () => {
    if (!newMenu.name || !newMenu.price) return;
    
    const item: MenuItem = {
      id: `menu-${Date.now()}`,
      name: newMenu.name!,
      price: Number(newMenu.price),
      cost: Number(newMenu.cost) || 0,
      stock: Number(newMenu.stock) || 0,
      category: newMenu.category as any
    };

    onUpdateMenu([...menu, item]);
    setIsAddingMenu(false);
    setNewMenu({ name: '', price: 0, cost: 0, stock: 0, category: 'Temporary' });
  };

  const updateIngredientStock = (id: string, newStock: number) => {
    onUpdateIngredients(ingredients.map(i => i.id === id ? { ...i, stock: newStock } : i));
  };

  const updateMenuItemCost = (id: string, newCost: number) => {
    onUpdateMenu(menu.map(m => m.id === id ? { ...m, cost: newCost } : m));
  };

  return (
    <div className="space-y-8">
      {/* Sub Tabs */}
      <div className="flex bg-white p-2 rounded-3xl border border-slate-100 w-fit shadow-sm">
        <button 
          onClick={() => setActiveSubTab('ingredients')}
          className={cn(
            "px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
            activeSubTab === 'ingredients' ? "bg-[#dc2626] text-white shadow-xl shadow-red-100" : "text-slate-400 hover:bg-slate-50"
          )}
        >
          <Box className="w-4 h-4 inline mr-2" />
          Bahan Baku
        </button>
        <button 
          onClick={() => setActiveSubTab('menu')}
          className={cn(
            "px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
            activeSubTab === 'menu' ? "bg-[#dc2626] text-white shadow-xl shadow-red-100" : "text-slate-400 hover:bg-slate-50"
          )}
        >
          <Utensils className="w-4 h-4 inline mr-2" />
          Daftar Menu
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Table / List */}
        <div className="lg:col-span-2 space-y-6">
          {activeSubTab === 'ingredients' ? (
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
               <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="font-black text-slate-900 uppercase italic tracking-tighter text-lg">STOK BAHAN BAKU</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-3 py-1 rounded-full">
                  {ingredients.length} JENIS
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Bahan</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Stok</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Ambang</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ingredients.map((ing) => (
                      <tr key={ing.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-900">{ing.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <span className={cn(
                               "text-xs font-black px-2 py-1 rounded-lg",
                               ing.stock <= ing.minStock ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
                             )}>
                               {ing.stock} {ing.unit}
                             </span>
                             {ing.stock <= ing.minStock && <AlertTriangle className="w-4 h-4 text-yellow-500 animate-pulse" />}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-slate-400">{ing.minStock} {ing.unit}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <input 
                              type="number"
                              className="w-20 px-2 py-1 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-100"
                              placeholder="Set stok"
                              onChange={(e) => updateIngredientStock(ing.id, Number(e.target.value))}
                            />
                            {deletingIngredientId === ing.id ? (
                               <div className="flex items-center gap-1">
                                 <button 
                                   onClick={() => {
                                     onDeleteIngredient(ing.id);
                                     setDeletingIngredientId(null);
                                   }}
                                   className="px-2 py-1 text-[8px] font-black uppercase bg-red-600 text-white rounded-lg"
                                 >
                                   Hapus
                                 </button>
                                 <button onClick={() => setDeletingIngredientId(null)} className="px-2 py-1 text-[8px] font-black uppercase bg-slate-100 text-slate-500 rounded-lg">
                                   X
                                 </button>
                               </div>
                            ) : (
                              <button 
                                onClick={() => setDeletingIngredientId(ing.id)}
                                className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Daftar Produk & Menu</h3>
                <button 
                  onClick={() => setIsAddingMenu(true)}
                  className="p-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menu</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Harga</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">HPP (Modal)</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stok</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {menu.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900">{m.name}</p>
                            {m.category === 'Temporary' && (
                              <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">Temp</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-600 font-mono italic">{formatCurrency(m.price)}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atur HPP</span>
                            <input 
                              type="number"
                              defaultValue={m.cost}
                              onBlur={(e) => updateMenuItemCost(m.id, Number(e.target.value))}
                              className="w-28 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-4 focus:ring-red-50 font-mono font-bold transition-all"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={cn(
                             "text-xs font-black px-2 py-1 rounded-lg",
                             (m.stock || 0) <= 5 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-700"
                           )}>
                             {m.stock ?? '∞'} <span className="text-[10px] opacity-60">pcs</span>
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {deletingMenuId === m.id ? (
                            <div className="flex items-center justify-end gap-1">
                               <button 
                                 onClick={() => {
                                   onUpdateMenu(menu.filter(item => item.id !== m.id));
                                   setDeletingMenuId(null);
                                 }}
                                 className="px-3 py-1.5 text-[9px] font-black uppercase bg-red-600 text-white rounded-xl shadow-lg"
                               >
                                 Konfirmasi Hapus
                               </button>
                               <button 
                                 onClick={() => setDeletingMenuId(null)}
                                 className="px-3 py-1.5 text-[9px] font-black uppercase bg-slate-100 text-slate-500 rounded-xl"
                               >
                                 Batal
                               </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setDeletingMenuId(m.id)}
                              className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Add Side Panel */}
        <div className="space-y-6">
          {isAddingMenu ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl border-t-4 border-red-600">
              <h3 className="font-bold text-lg mb-6 text-slate-900">Tambah Menu Khusus</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Nama Menu</label>
                  <input 
                    type="text" 
                    value={newMenu.name}
                    onChange={e => setNewMenu({...newMenu, name: e.target.value})}
                    placeholder="Contoh: Paket Ramadhan"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-red-100 font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Harga Jual</label>
                    <input 
                      type="number" 
                      value={newMenu.price || ''}
                      onChange={e => setNewMenu({...newMenu, price: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-red-100 font-medium font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">HPP (Modal)</label>
                    <input 
                      type="number" 
                      value={newMenu.cost || ''}
                      onChange={e => setNewMenu({...newMenu, cost: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-red-100 font-medium font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Stok Awal</label>
                  <input 
                    type="number" 
                    value={newMenu.stock || ''}
                    onChange={e => setNewMenu({...newMenu, stock: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-red-100 font-medium font-mono"
                  />
                </div>
                
                <div className="pt-4 flex gap-3">
                   <button 
                    onClick={() => setIsAddingMenu(false)}
                    className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold text-xs"
                   >
                    Batal
                   </button>
                   <button 
                    onClick={handleAddMenu}
                    className="flex-[2] px-4 py-3 rounded-2xl bg-red-600 text-white font-bold text-xs shadow-lg shadow-red-100"
                   >
                    Simpan Menu
                   </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <Flame className="w-10 h-10 text-yellow-400 mb-6" />
                <h3 className="text-xl font-bold mb-2">Ingin Buat Penawaran Baru?</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium mb-8">
                  Anda bisa menambahkan menu sementara untuk promo atau event tertentu secara instan.
                </p>
                <button 
                  onClick={() => setIsAddingMenu(true)}
                  className="flex items-center gap-2 group text-sm font-bold bg-white text-slate-900 px-6 py-3 rounded-2xl hover:bg-yellow-400 transition-all shadow-xl"
                >
                  Buat Menu Sementara
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-red-600/20 rounded-full blur-3xl" />
            </div>
          )}

          {/* Quick Alert list */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Status Ringkasan</h4>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 rounded-2xl border border-red-100">
                  <Flame className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{menu.filter(m => m.category === 'Main').length} Menu Utama</p>
                  <p className="text-[10px] text-slate-400 font-medium">Aktif & Permanen</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                  <Flame className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{menu.filter(m => m.category === 'Temporary').length} Menu Spesial</p>
                  <p className="text-[10px] text-slate-400 font-medium">Promo Berlangsung</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
