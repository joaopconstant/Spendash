import { supabase } from "./supabase";
import type { Database } from "@/types/supabase";
import type {
  AuthUser,
  Category,
  Expense,
  DashboardData,
} from "@/types/finance";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type ExpenseRow = Database["public"]["Tables"]["expenses"]["Row"];

// Auth Services
export const authService = {
  async signUp(
    email: string,
    password: string,
    name: string
  ): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (authError) throw authError;

      // Após signup, faça login explicitamente para garantir sessão ativa
      await supabase.auth.signInWithPassword({ email, password });

      if (authData.user) {
        // Aguarda o perfil ser criado automaticamente pelo trigger
        let profile = null;
        for (let i = 0; i < 10; i++) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authData.user.id)
            .single();
          if (data) {
            profile = data;
            break;
          }
          await new Promise(res => setTimeout(res, 400));
        }
        if (!profile) throw new Error("Perfil não criado automaticamente");
        return {
          user: {
            id: profile.id,
            email: profile.email,
            name: profile.name,
          },
          error: null,
        };
      }

      return { user: null, error: "Erro ao criar usuário" };
    } catch (error) {
      return { user: null, error: (error as Error).message };
    }
  },

  async signIn(
    email: string,
    password: string
  ): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profile) {
          return {
            user: {
              id: profile.id,
              email: profile.email,
              name: profile.name,
            },
            error: null,
          };
        }
      }

      return { user: null, error: "Usuário não encontrado" };
    } catch (error) {
      return { user: null, error: (error as Error).message };
    }
  },

  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  async getCurrentUser(): Promise<{
    user: AuthUser | null;
    error: string | null;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { user: null, error: null };
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        return {
          user: {
            id: profile.id,
            email: profile.email,
            name: profile.name,
          },
          error: null,
        };
      }

      return { user: null, error: "Perfil não encontrado" };
    } catch (error) {
      return { user: null, error: (error as Error).message };
    }
  },
};

// Category Services
export const categoryService = {
  async getCategories(
    userId: string
  ): Promise<{ categories: Category[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .or(`user_id.eq.${userId},is_default.eq.true`)
        .order("name");

      if (error) throw error;

      const categories: Category[] = data.map((row: CategoryRow) => ({
        id: row.id,
        name: row.name,
        color: row.color,
        icon: row.icon || undefined,
        isDefault: row.is_default,
        userId: row.user_id || undefined,
      }));

      return { categories, error: null };
    } catch (error) {
      return { categories: [], error: (error as Error).message };
    }
  },

  async createCategory(
    category: Omit<Category, "id">
  ): Promise<{ category: Category | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: category.name,
          color: category.color,
          icon: category.icon,
          is_default: category.isDefault,
          user_id: category.userId,
        })
        .select()
        .single();

      if (error) throw error;

      const newCategory: Category = {
        id: data.id,
        name: data.name,
        color: data.color,
        icon: data.icon || undefined,
        isDefault: data.is_default,
        userId: data.user_id || undefined,
      };

      return { category: newCategory, error: null };
    } catch (error) {
      return { category: null, error: (error as Error).message };
    }
  },

  async updateCategory(
    id: string,
    updates: Partial<Category>
  ): Promise<{ category: Category | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .update({
          name: updates.name,
          color: updates.color,
          icon: updates.icon,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const category: Category = {
        id: data.id,
        name: data.name,
        color: data.color,
        icon: data.icon || undefined,
        isDefault: data.is_default,
        userId: data.user_id || undefined,
      };

      return { category, error: null };
    } catch (error) {
      return { category: null, error: (error as Error).message };
    }
  },

  async deleteCategory(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },
};

// Expense Services
export const expenseService = {
  async getExpenses(
    userId: string
  ): Promise<{ expenses: Expense[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select(
          `
          *,
          categories (
            id,
            name,
            color,
            icon
          )
        `
        )
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (error) throw error;

      const expenses: Expense[] = data.map((row: any) => ({
        id: row.id,
        amount: row.amount,
        description: row.description,
        date: new Date(row.date),
        categoryId: row.category_id,
        category: row.categories
          ? {
              id: row.categories.id,
              name: row.categories.name,
              color: row.categories.color,
              icon: row.categories.icon,
              isDefault: false,
            }
          : undefined,
        userId: row.user_id,
        createdAt: new Date(row.created_at),
      }));

      return { expenses, error: null };
    } catch (error) {
      return { expenses: [], error: (error as Error).message };
    }
  },

  async createExpense(
    expense: Omit<Expense, "id" | "createdAt">
  ): Promise<{ expense: Expense | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .insert({
          amount: expense.amount,
          description: expense.description,
          date: expense.date.toISOString().split("T")[0],
          category_id: expense.categoryId,
          user_id: expense.userId,
        })
        .select(
          `
          *,
          categories (
            id,
            name,
            color,
            icon
          )
        `
        )
        .single();

      if (error) throw error;

      const newExpense: Expense = {
        id: data.id,
        amount: data.amount,
        description: data.description,
        date: new Date(data.date),
        categoryId: data.category_id,
        category: data.categories
          ? {
              id: data.categories.id,
              name: data.categories.name,
              color: data.categories.color,
              icon: data.categories.icon,
              isDefault: false,
            }
          : undefined,
        userId: data.user_id,
        createdAt: new Date(data.created_at),
      };

      return { expense: newExpense, error: null };
    } catch (error) {
      return { expense: null, error: (error as Error).message };
    }
  },

  async updateExpense(
    id: string,
    updates: Partial<Expense>
  ): Promise<{ expense: Expense | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .update({
          amount: updates.amount,
          description: updates.description,
          date: updates.date?.toISOString().split("T")[0],
          category_id: updates.categoryId,
        })
        .eq("id", id)
        .select(
          `
          *,
          categories (
            id,
            name,
            color,
            icon
          )
        `
        )
        .single();

      if (error) throw error;

      const expense: Expense = {
        id: data.id,
        amount: data.amount,
        description: data.description,
        date: new Date(data.date),
        categoryId: data.category_id,
        category: data.categories
          ? {
              id: data.categories.id,
              name: data.categories.name,
              color: data.categories.color,
              icon: data.categories.icon,
              isDefault: false,
            }
          : undefined,
        userId: data.user_id,
        createdAt: new Date(data.created_at),
      };

      return { expense, error: null };
    } catch (error) {
      return { expense: null, error: (error as Error).message };
    }
  },

  async deleteExpense(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.from("expenses").delete().eq("id", id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },
};

// Dashboard Services
export const dashboardService = {
  async getDashboardData(
    userId: string
  ): Promise<{ data: DashboardData | null; error: string | null }> {
    try {
      // Buscar despesas do usuário
      const { expenses, error: expensesError } =
        await expenseService.getExpenses(userId);
      if (expensesError) throw new Error(expensesError);

      // Buscar categorias
      const { categories, error: categoriesError } =
        await categoryService.getCategories(userId);
      if (categoriesError) throw new Error(categoriesError);

      // Calcular dados do dashboard
      const totalExpenses = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      const currentMonth = new Date().getMonth();
      const monthlyExpenses = expenses
        .filter(expense => expense.date.getMonth() === currentMonth)
        .reduce((sum, expense) => sum + expense.amount, 0);

      const categoriesData = categories
        .map(category => {
          const categoryExpenses = expenses.filter(
            expense => expense.categoryId === category.id
          );
          const total = categoryExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
          );
          return {
            name: category.name,
            value: total,
            color: category.color,
          };
        })
        .filter(item => item.value > 0);

      const dailyExpenses = expenses.reduce((acc, expense) => {
        const date = expense.date.toISOString().split("T")[0];
        const existing = acc.find(item => item.date === date);
        if (existing) {
          existing.amount += expense.amount;
        } else {
          acc.push({ date, amount: expense.amount });
        }
        return acc;
      }, [] as Array<{ date: string; amount: number }>);

      const dashboardData: DashboardData = {
        totalExpenses,
        monthlyExpenses,
        categoriesData,
        dailyExpenses: dailyExpenses.sort((a, b) =>
          a.date.localeCompare(b.date)
        ),
      };

      return { data: dashboardData, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },
};

// Função auxiliar para criar categorias padrão
async function createDefaultCategories(userId: string) {
  const defaultCategories = [
    { name: "Alimentação", color: "#ef4444", icon: "🍽️" },
    { name: "Transporte", color: "#3b82f6", icon: "🚗" },
    { name: "Moradia", color: "#10b981", icon: "🏠" },
    { name: "Lazer", color: "#f59e0b", icon: "🎉" },
    { name: "Saúde", color: "#8b5cf6", icon: "🏥" },
    { name: "Educação", color: "#06b6d4", icon: "📚" },
    { name: "Outros", color: "#6b7280", icon: "📦" },
  ];

  for (const category of defaultCategories) {
    await supabase.from("categories").insert({
      name: category.name,
      color: category.color,
      icon: category.icon,
      is_default: true,
      user_id: userId,
    });
  }
}
