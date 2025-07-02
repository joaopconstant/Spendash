import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser } from "@/types/finance";
import { authService } from "@/lib/supabaseService";

interface AuthContextType {
  user: AuthUser | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { user, error } = await authService.getCurrentUser();
      if (error) {
        console.error("Erro ao verificar usuário:", error);
      }
      setUser(user);
    } catch (error) {
      console.error("Erro ao verificar usuário:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { user, error } = await authService.signIn(email, password);
      if (error) {
        return { success: false, error };
      }
      if (user) {
        setUser(user);
        return { success: true };
      }
      return { success: false, error: "Erro ao fazer login" };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { user, error } = await authService.signUp(email, password, name);
      if (error) {
        return { success: false, error };
      }
      if (user) {
        setUser(user);
        return { success: true };
      }
      return { success: false, error: "Erro ao criar conta" };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const logout = async () => {
    try {
      const { error } = await authService.signOut();
      if (error) {
        console.error("Erro ao fazer logout:", error);
      }
    setUser(null);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
