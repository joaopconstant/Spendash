
import React, { useState } from 'react';
import AddExpenseForm from '@/components/expenses/AddExpenseForm';
import ExpenseList from '@/components/expenses/ExpenseList';

const Expenses: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleExpenseAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Gerenciar Gastos</h1>
        <p className="text-muted-foreground">Adicione e gerencie seus gastos diários</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AddExpenseForm onExpenseAdded={handleExpenseAdded} />
        <ExpenseList key={refreshKey} />
      </div>
    </div>
  );
};

export default Expenses;
