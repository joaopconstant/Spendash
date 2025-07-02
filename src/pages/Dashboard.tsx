import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import StatsCards from "@/components/dashboard/StatsCards";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import DailyExpenseChart from "@/components/dashboard/DailyExpenseChart";
import { useDashboard } from "@/hooks/useDashboard";

const Dashboard: React.FC = () => {
  const { dashboardData, isLoading, error } = useDashboard();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Dashboard Financeiro
          </h1>
          <p className="text-muted-foreground">
            Acompanhe seus gastos e mantenha suas finanças organizadas
          </p>
        </div>
        <Button
          onClick={() => navigate("/expenses")}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Gasto
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">Erro ao carregar dados: {error}</p>
        </div>
      ) : dashboardData ? (
        <>
          <StatsCards data={dashboardData} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExpenseChart data={dashboardData} />
            <DailyExpenseChart data={dashboardData} />
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum dado disponível</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
