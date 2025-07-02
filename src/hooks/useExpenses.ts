import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { expenseService } from "@/lib/supabaseService";
import type { Expense } from "@/types/finance";

export const useExpenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { expenses: fetchedExpenses, error: fetchError } =
        await expenseService.getExpenses(user.id);

      if (fetchError) {
        setError(fetchError);
      } else {
        setExpenses(fetchedExpenses);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const addExpense = async (expense: Omit<Expense, "id" | "createdAt">) => {
    if (!user) return { success: false, error: "Usuário não autenticado" };

    try {
      const { expense: newExpense, error: addError } =
        await expenseService.createExpense({
          ...expense,
          userId: user.id,
        });

      if (addError) {
        return { success: false, error: addError };
      }

      if (newExpense) {
        setExpenses((prev) => [newExpense, ...prev]);
        return { success: true };
      }

      return { success: false, error: "Erro ao criar despesa" };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      const { expense: updatedExpense, error: updateError } =
        await expenseService.updateExpense(id, updates);

      if (updateError) {
        return { success: false, error: updateError };
      }

      if (updatedExpense) {
        setExpenses((prev) =>
          prev.map((expense) => (expense.id === id ? updatedExpense : expense))
        );
        return { success: true };
      }

      return { success: false, error: "Erro ao atualizar despesa" };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const { error: deleteError } = await expenseService.deleteExpense(id);

      if (deleteError) {
        return { success: false, error: deleteError };
      }

      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  return {
    expenses,
    isLoading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses,
  };
};
