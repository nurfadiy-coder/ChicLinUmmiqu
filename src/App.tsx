/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  FileText, 
  Settings, 
  Bell, 
  Plus, 
  Minus,
  TrendingUp,
  CreditCard,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

// Components (to be created)
import Dashboard from './components/Dashboard';
import SalesManagement from './components/SalesManagement';
import InventoryManagement from './components/InventoryManagement';
import PayrollManagement from './components/PayrollManagement';
import Reports from './components/Reports';

// Types & Constants
import { Sale, Expense, Ingredient, MenuItem, Employee, SalaryPayment, DashboardStats } from './types';
import { MAIN_MENU, INITIAL_INGREDIENTS } from './constants';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sales' | 'inventory' | 'payroll' | 'reports'>('dashboard');
  
  // Persistence using LocalStorage
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('chiclin_sales');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('chiclin_expenses');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('chiclin_menu');
    return saved ? JSON.parse(saved) : MAIN_MENU;
  });
  
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem('chiclin_ingredients');
    return saved ? JSON.parse(saved) : INITIAL_INGREDIENTS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('chiclin_employees');
    return saved ? JSON.parse(saved) : [
      { id: 'emp-1', name: 'Budi Santoso', baseSalary: 1500000, payPeriod: 'Monthly' },
      { id: 'emp-2', name: 'Siti Aminah', baseSalary: 400000, payPeriod: 'Weekly' }
    ];
  });

  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>(() => {
    const saved = localStorage.getItem('chiclin_salary_payments');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('chiclin_sales', JSON.stringify(sales));
    localStorage.setItem('chiclin_expenses', JSON.stringify(expenses));
    localStorage.setItem('chiclin_menu', JSON.stringify(menu));
    localStorage.setItem('chiclin_ingredients', JSON.stringify(ingredients));
    localStorage.setItem('chiclin_employees', JSON.stringify(employees));
    localStorage.setItem('chiclin_salary_payments', JSON.stringify(salaryPayments));
  }, [sales, expenses, menu, ingredients, employees, salaryPayments]);

  // Derived Stats
  const stats = useMemo(() => {
    const totalSales = sales.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalCost = sales.reduce((acc, s) => acc + s.totalCost, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const totalProfit = totalSales - totalCost;
    const netIncome = totalProfit - totalExpenses;
    
    return { totalSales, totalCost, totalExpenses, totalProfit, netIncome };
  }, [sales, expenses]);

  // Low Stock Alerts
  const lowStockIngredients = ingredients.filter(i => i.stock <= i.minStock);
  const lowStockMenu = menu.filter(m => m.stock !== undefined && m.stock <= 5);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sales', label: 'Penjualan', icon: ShoppingBag },
    { id: 'inventory', label: 'Stok & Menu', icon: Package },
    { id: 'payroll', label: 'Gaji Karyawan', icon: Users },
    { id: 'reports', label: 'Laporan', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-[#dc2626] text-white flex flex-col sticky top-0 h-screen shadow-2xl z-40">
        <div className="p-8">
          <div className="mb-10">
            <h1 className="text-3xl font-black italic tracking-tighter text-[#facc15] leading-tight">
              CHICLIN<br/>UMMIQU
            </h1>
            <div className="h-1 w-12 bg-white/30 mt-2 rounded-full" />
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={cn(
                  "w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300",
                  activeTab === item.id 
                    ? "bg-white text-[#dc2626] shadow-xl scale-105" 
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-[#dc2626]" : "text-white/40")} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8">
          <button 
            onClick={() => setActiveTab('reports')}
            className="w-full bg-[#facc15] text-[#dc2626] font-black text-xs py-4 rounded-2xl shadow-lg hover:shadow-yellow-400/20 transition-all uppercase tracking-widest active:scale-95 flex items-center justify-center gap-2 mb-6"
          >
            <FileText className="w-4 h-4" />
            Ekspor Laporan
          </button>
          
          <div className="flex items-center gap-3 p-4 bg-white/10 rounded-2xl border border-white/5">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/20">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-white truncate">Owner Ummiqu</p>
              <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Dashboard Pro</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-24 bg-white/50 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-10">
          <div>
            <h2 className="text-[10px] font-black text-[#dc2626] uppercase tracking-[0.2em] mb-1">
              Management Sysem
            </h2>
            <h3 className="text-2xl font-black text-slate-800">
              {navItems.find(i => i.id === activeTab)?.label}
            </h3>
          </div>
          
          <div className="flex items-center gap-6">
            {(lowStockIngredients.length > 0 || lowStockMenu.length > 0) && (
              <div className="flex items-center gap-3 bg-red-50 px-4 py-2 rounded-full border border-red-100 animate-pulse">
                <AlertTriangle className="w-4 h-4 text-[#dc2626]" />
                <span className="text-xs font-black text-[#dc2626] italic underline">
                  {lowStockIngredients.length + lowStockMenu.length} Bahan Hampir Habis!
                </span>
              </div>
            )}
            <div className="text-right border-l-2 border-slate-100 pl-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Hari Ini</p>
              <p className="text-sm font-black text-slate-700">{format(new Date(), 'EEEE, d MMM yyyy')}</p>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard 
                  stats={stats} 
                  sales={sales} 
                  expenses={expenses}
                  lowStockAlerts={{ ingredients: lowStockIngredients, menu: lowStockMenu }}
                />
              )}
              {activeTab === 'sales' && (
                <SalesManagement 
                  sales={sales} 
                  onAddSale={(s) => setSales(prev => [s, ...prev])} 
                  onDeleteSale={(id) => setSales(prev => prev.filter(s => s.id !== id))}
                  onAddExpense={(e) => setExpenses(prev => [...prev, e])}
                  menu={menu}
                  updateStock={(menuId, qty) => {
                    setMenu(prev => prev.map(m => m.id === menuId ? { ...m, stock: (m.stock || 0) - qty } : m));
                  }}
                />
              )}
              {activeTab === 'inventory' && (
                <InventoryManagement 
                  ingredients={ingredients} 
                  menu={menu}
                  onUpdateIngredients={setIngredients}
                  onUpdateMenu={setMenu}
                  onDeleteIngredient={(id) => setIngredients(prev => prev.filter(i => i.id !== id))}
                />
              )}
              {activeTab === 'payroll' && (
                <PayrollManagement 
                  employees={employees}
                  payments={salaryPayments}
                  onUpdateEmployees={setEmployees}
                  onDeleteEmployee={(id) => {
                    setEmployees(prev => prev.filter(e => e.id !== id));
                    // Also filter out their payments
                    setSalaryPayments(prev => prev.filter(p => p.employeeId !== id));
                  }}
                  onDeletePayment={(id) => {
                    const payment = salaryPayments.find(p => p.id === id);
                    setSalaryPayments(prev => prev.filter(p => p.id !== id));
                    // Also find and delete the corresponding expense
                    if (payment) {
                      setExpenses(prev => prev.filter(e => !(e.amount === (payment.amount + payment.bonus) && e.category === 'Salary' && e.date === payment.date)));
                    }
                  }}
                  onAddPayment={(p) => {
                    setSalaryPayments(prev => [p, ...prev]);
                    setExpenses(prev => [...prev, {
                      id: `exp-${Date.now()}`,
                      date: p.date,
                      amount: p.amount + p.bonus,
                      description: `Gaji: ${employees.find(e => e.id === p.employeeId)?.name}`,
                      category: 'Salary'
                    }]);
                  }}
                />
              )}
              {activeTab === 'reports' && (
                <Reports 
                  sales={sales} 
                  expenses={expenses} 
                  menu={menu}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
