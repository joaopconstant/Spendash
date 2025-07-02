
import { Category, Expense, DashboardData } from '@/types/finance';

export const defaultCategories: Category[] = [
  { id: '1', name: 'Alimentação', color: '#ef4444', icon: '🍽️', isDefault: true },
  { id: '2', name: 'Transporte', color: '#3b82f6', icon: '🚗', isDefault: true },
  { id: '3', name: 'Moradia', color: '#10b981', icon: '🏠', isDefault: true },
  { id: '4', name: 'Lazer', color: '#f59e0b', icon: '🎉', isDefault: true },
  { id: '5', name: 'Saúde', color: '#8b5cf6', icon: '🏥', isDefault: true },
  { id: '6', name: 'Educação', color: '#06b6d4', icon: '📚', isDefault: true },
  { id: '7', name: 'Outros', color: '#6b7280', icon: '📦', isDefault: true },
];

export const mockExpenses: Expense[] = [
  {
    id: '1',
    amount: 45.50,
    description: 'Almoço no restaurante',
    date: new Date('2024-06-20'),
    categoryId: '1',
    userId: '1',
    createdAt: new Date('2024-06-20')
  },
  {
    id: '2',
    amount: 25.00,
    description: 'Combustível',
    date: new Date('2024-06-19'),
    categoryId: '2',
    userId: '1',
    createdAt: new Date('2024-06-19')
  },
  {
    id: '3',
    amount: 120.00,
    description: 'Supermercado',
    date: new Date('2024-06-18'),
    categoryId: '1',
    userId: '1',
    createdAt: new Date('2024-06-18')
  },
  {
    id: '4',
    amount: 80.00,
    description: 'Cinema',
    date: new Date('2024-06-17'),
    categoryId: '4',
    userId: '1',
    createdAt: new Date('2024-06-17')
  },
  {
    id: '5',
    amount: 200.00,
    description: 'Consulta médica',
    date: new Date('2024-06-16'),
    categoryId: '5',
    userId: '1',
    createdAt: new Date('2024-06-16')
  }
];

export const generateMockDashboardData = (): DashboardData => {
  const categoriesData = defaultCategories.map(category => {
    const categoryExpenses = mockExpenses.filter(expense => expense.categoryId === category.id);
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    return {
      name: category.name,
      value: total,
      color: category.color
    };
  }).filter(item => item.value > 0);

  const dailyExpenses = mockExpenses.reduce((acc, expense) => {
    const date = expense.date.toISOString().split('T')[0];
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.amount += expense.amount;
    } else {
      acc.push({ date, amount: expense.amount });
    }
    return acc;
  }, [] as Array<{ date: string; amount: number }>);

  const totalExpenses = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const currentMonth = new Date().getMonth();
  const monthlyExpenses = mockExpenses
    .filter(expense => expense.date.getMonth() === currentMonth)
    .reduce((sum, expense) => sum + expense.amount, 0);

  return {
    totalExpenses,
    monthlyExpenses,
    categoriesData,
    dailyExpenses: dailyExpenses.sort((a, b) => a.date.localeCompare(b.date))
  };
};
