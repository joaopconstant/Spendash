import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { categoryService } from "@/lib/supabaseService";
import type { Category } from "@/types/finance";

export const useCategories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { categories: fetchedCategories, error: fetchError } =
        await categoryService.getCategories(user.id);

      if (fetchError) {
        setError(fetchError);
      } else {
        setCategories(fetchedCategories);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = async (category: Omit<Category, "id">) => {
    if (!user) return { success: false, error: "Usuário não autenticado" };

    try {
      const { category: newCategory, error: addError } =
        await categoryService.createCategory({
          ...category,
          userId: user.id,
        });

      if (addError) {
        return { success: false, error: addError };
      }

      if (newCategory) {
        setCategories((prev) => [...prev, newCategory]);
        return { success: true };
      }

      return { success: false, error: "Erro ao criar categoria" };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const { category: updatedCategory, error: updateError } =
        await categoryService.updateCategory(id, updates);

      if (updateError) {
        return { success: false, error: updateError };
      }

      if (updatedCategory) {
        setCategories((prev) =>
          prev.map((category) =>
            category.id === id ? updatedCategory : category
          )
        );
        return { success: true };
      }

      return { success: false, error: "Erro ao atualizar categoria" };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error: deleteError } = await categoryService.deleteCategory(id);

      if (deleteError) {
        return { success: false, error: deleteError };
      }

      setCategories((prev) => prev.filter((category) => category.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  return {
    categories,
    isLoading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
  };
};
