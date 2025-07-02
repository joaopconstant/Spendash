import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExpenses } from "@/hooks/useExpenses";
import { useToast } from "@/hooks/use-toast";

const ExpenseList: React.FC = () => {
  const { expenses, isLoading, deleteExpense } = useExpenses();
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR");
  };

  const handleDeleteExpense = async (id: string) => {
    const result = await deleteExpense(id);
    if (result.success) {
      toast({
        title: "Despesa removida",
        description: "A despesa foi removida com sucesso",
      });
    } else {
      toast({
        title: "Erro ao remover",
        description: result.error || "Erro ao remover a despesa",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Gastos Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando despesas...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma despesa encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense, index) => {
              const category = expense.category;
              return (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category?.color }}
                      />
                      <span className="text-sm">{category?.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {formatCurrency(expense.amount)}
                        </span>
                        <Badge variant="secondary">{category?.name}</Badge>
                      </div>
                      {expense.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {expense.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDate(expense.date)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteExpense(expense.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseList;
