
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isDefault: boolean;
  userId?: string;
}

export interface Expense {
  id: string;
  amount: number;
  description?: string;
  date: Date;
  categoryId: string;
  category?: Category;
  userId: string;
  createdAt: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface DashboardData {
  totalExpenses: number;
  monthlyExpenses: number;
  categoriesData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  dailyExpenses: Array<{
    date: string;
    amount: number;
  }>;
}

export interface ExpenseForm {
  amount: string;
  categoryId: string;
  description: string;
  date: string;
}
