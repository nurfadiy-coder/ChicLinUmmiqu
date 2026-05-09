export interface MenuItem {
  id: string;
  name: string;
  price: number;
  cost: number; // HPP
  category: 'Main' | 'Temporary';
  stock?: number;
}

export interface Ingredient {
  id: string;
  name: string;
  stock: number;
  unit: string;
  minStock: number;
}

export interface Sale {
  id: string;
  date: string;
  items: {
    menuId: string;
    quantity: number;
    price: number;
    cost: number;
  }[];
  totalAmount: number;
  totalCost: number;
  profit: number;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: 'Operational' | 'Ingredients' | 'Salary' | 'Adjustment' | 'Other';
}

export interface Employee {
  id: string;
  name: string;
  baseSalary: number;
  payPeriod: 'Weekly' | 'Biweekly' | 'Monthly';
}

export interface SalaryPayment {
  id: string;
  employeeId: string;
  date: string;
  amount: number;
  bonus: number;
  periodStart: string;
  periodEnd: string;
}

export interface DashboardStats {
  totalSales: number;
  totalCost: number;
  totalExpenses: number;
  totalProfit: number;
  netIncome: number;
}
