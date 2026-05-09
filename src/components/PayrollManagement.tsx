import React, { useState } from 'react';
import { 
  Users, 
  Wallet, 
  Plus, 
  Settings, 
  History, 
  Gift, 
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  Trash2
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays } from 'date-fns';
import { Employee, SalaryPayment } from '../types';
import { formatCurrency, cn } from '../lib/utils';

interface PayrollManagementProps {
  employees: Employee[];
  payments: SalaryPayment[];
  onUpdateEmployees: (employees: Employee[]) => void;
  onDeleteEmployee: (id: string) => void;
  onDeletePayment: (id: string) => void;
  onAddPayment: (payment: SalaryPayment) => void;
}

export default function PayrollManagement({ employees, payments, onUpdateEmployees, onDeleteEmployee, onDeletePayment, onAddPayment }: PayrollManagementProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[0]?.id || '');
  const [bonusAmount, setBonusAmount] = useState<number>(0);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', baseSalary: 0, payPeriod: 'Weekly' as any });

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  const handleAddEmployee = () => {
    if (!newEmployee.name) return;
    const item: Employee = {
      id: `emp-${Date.now()}`,
      name: newEmployee.name,
      baseSalary: newEmployee.baseSalary,
      payPeriod: newEmployee.payPeriod
    };
    onUpdateEmployees([...employees, item]);
    setIsAddingEmployee(false);
    setNewEmployee({ name: '', baseSalary: 0, payPeriod: 'Weekly' });
  };
  
  const handleBaseSalaryChange = (id: string, newSalary: number) => {
    onUpdateEmployees(employees.map(e => e.id === id ? { ...e, baseSalary: newSalary } : e));
  };
  
  const handlePay = () => {
    if (!selectedEmployee) return;

    const payment: SalaryPayment = {
      id: `pay-${Date.now()}`,
      employeeId: selectedEmployee.id,
      date: new Date().toISOString(),
      amount: selectedEmployee.baseSalary,
      bonus: bonusAmount,
      periodStart: new Date().toISOString(), // Simplified for demo
      periodEnd: new Date().toISOString()
    };

    onAddPayment(payment);
    setBonusAmount(0);
    alert(`Gaji untuk ${selectedEmployee.name} berhasil dibayarkan!`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Employee List & Selection */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-red-600" />
              Daftar Karyawan Aktif
            </h3>
            <div className="flex gap-2">
              {employees.length > 0 && selectedEmployeeId && (
                <button 
                  onClick={() => {
                    if (confirm(`Hapus karyawan ${selectedEmployee?.name}? Semua riwayat gajinya juga akan dihapus.`)) {
                      onDeleteEmployee(selectedEmployeeId);
                      setSelectedEmployeeId(employees[0]?.id || '');
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  title="Hapus Karyawan Terpilih"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button 
                onClick={() => setIsAddingEmployee(true)}
                className="text-[10px] font-bold text-red-600 uppercase tracking-widest bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 hover:bg-red-100 transition-colors"
              >
                Tambah Karyawan
              </button>
            </div>
          </div>
          
          {isAddingEmployee && (
            <div className="p-6 bg-slate-50 border-b border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input 
                    type="text" 
                    placeholder="Nama Karyawan"
                    value={newEmployee.name}
                    onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                    className="px-4 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                  />
                  <input 
                    type="number" 
                    placeholder="Gaji Pokok"
                    value={newEmployee.baseSalary || ''}
                    onChange={e => setNewEmployee({...newEmployee, baseSalary: Number(e.target.value)})}
                    className="px-4 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                  />
                  <select 
                    value={newEmployee.payPeriod}
                    onChange={e => setNewEmployee({...newEmployee, payPeriod: e.target.value as any})}
                    className="px-4 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="Weekly">Mingguan</option>
                    <option value="Biweekly">2 Pekan</option>
                    <option value="Monthly">Bulanan</option>
                  </select>
               </div>
               <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => setIsAddingEmployee(false)} className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase">Batal</button>
                  <button onClick={handleAddEmployee} className="px-6 py-2 text-[10px] font-bold bg-red-600 text-white rounded-xl uppercase shadow-lg shadow-red-100">Simpan</button>
               </div>
            </div>
          )}
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {employees.map((emp) => (
              <button
                key={emp.id}
                onClick={() => setSelectedEmployeeId(emp.id)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group",
                  selectedEmployeeId === emp.id 
                    ? "bg-red-50 border-red-200 shadow-sm" 
                    : "bg-white border-slate-100 hover:border-slate-300"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
                  selectedEmployeeId === emp.id ? "bg-red-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                )}>
                  {emp.name.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className={cn("text-sm font-bold truncate", selectedEmployeeId === emp.id ? "text-red-900" : "text-slate-900")}>
                    {emp.name}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {emp.payPeriod}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <input 
                    type="number"
                    defaultValue={emp.baseSalary}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => handleBaseSalaryChange(emp.id, Number(e.target.value))}
                    className="w-24 text-right px-2 py-1 text-xs font-black bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-100"
                  />
                  <p className="text-[10px] text-slate-400 font-medium">Gaji Pokok</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              Riwayat Pembayaran Gaji
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Karyawan</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tanggal Bayar</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Gaji Pokok</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Bonus</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Total</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium italic">Belum ada riwayat pembayaran</td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                            {employees.find(e => e.id === p.employeeId)?.name.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-slate-900">{employees.find(e => e.id === p.employeeId)?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{format(new Date(p.date), 'd MMM yyyy')}</td>
                      <td className="px-6 py-4 text-right text-xs font-medium">{formatCurrency(p.amount)}</td>
                      <td className="px-6 py-4 text-right text-xs font-medium text-green-600">+{formatCurrency(p.bonus)}</td>
                      <td className="px-6 py-4 text-right text-xs font-bold text-slate-900">{formatCurrency(p.amount + p.bonus)}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => {
                            if (confirm('Batalkan pembayaran gaji ini?')) {
                              onDeletePayment(p.id);
                            }
                          }}
                          className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Action Panel */}
      <div className="space-y-6 sticky top-28">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
          {selectedEmployee ? (
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-red-600 rounded-2xl shadow-lg shadow-red-100">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Pembayaran Gaji</h3>
                  <p className="text-sm text-slate-500">Selesaikan gaji untuk periode ini</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-white">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Karyawan</p>
                    <p className="text-sm font-bold text-slate-900">{selectedEmployee.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Siklus</p>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-black border border-amber-100 uppercase">
                      {selectedEmployee.payPeriod}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">Gaji Utama</span>
                    <span className="text-xs font-black text-slate-900">{formatCurrency(selectedEmployee.baseSalary)}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500">Bonus Tambahan</span>
                      <span className="text-xs font-black text-green-600">+{formatCurrency(bonusAmount)}</span>
                    </div>
                    <input 
                      type="number" 
                      placeholder="Masukkan nominal bonus..."
                      value={bonusAmount || ''}
                      onChange={(e) => setBonusAmount(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-100 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-2xl">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Dibayarkan</p>
                    <p className="text-2xl font-black text-yellow-400">{formatCurrency(selectedEmployee.baseSalary + bonusAmount)}</p>
                  </div>
                </div>
                <button 
                  onClick={handlePay}
                  className="w-full py-4 bg-red-600 rounded-2xl font-bold text-sm tracking-wide hover:bg-red-700 transition-all shadow-lg shadow-red-900/40 active:scale-95"
                >
                  Bayarkan Sekarang
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
               <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
               <p className="text-sm font-bold text-slate-400">Pilih karyawan untuk mengelola gaji</p>
            </div>
          )}
          
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-slate-50 rounded-full blur-2xl opacity-50" />
        </div>
        
        {/* Help Tip */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-yellow-50 rounded-xl border border-yellow-100">
               <Gift className="w-4 h-4 text-yellow-600" />
             </div>
             <p className="text-xs font-bold text-slate-900">Tentang Bonus Harian</p>
           </div>
           <p className="text-[10px] text-slate-500 leading-relaxed font-medium capitalize">
             Setiap hari bonus dapat bervariasi tergantung kerajinan atau event tertentu. Tambahkan bonus saat melakukan pembayaran gaji total.
           </p>
        </div>
      </div>
    </div>
  );
}
