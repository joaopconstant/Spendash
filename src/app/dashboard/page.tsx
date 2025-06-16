"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { motion } from "framer-motion";
import {
  CreditCardIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  category_name: string;
  category_color: string;
}

interface DashboardData {
  totalExpenses: number;
  transactionCount: number;
  recentTransactions: Transaction[];
  monthlyComparison: {
    current: number;
    previous: number;
    percentageChange: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const now = new Date();
      const startDate = format(startOfMonth(now), "yyyy-MM-dd");
      const endDate = format(endOfMonth(now), "yyyy-MM-dd");

      // Buscar transações do mês atual
      const transactionsResponse = await fetch(
        `/api/transactions?startDate=${startDate}&endDate=${endDate}&limit=5`
      );
      const transactionsData = await transactionsResponse.json();

      // Buscar relatório do mês atual
      const month = format(now, "M");
      const year = format(now, "yyyy");
      const reportsResponse = await fetch(`/api/reports?month=${month}&year=${year}`);
      const reportsData = await reportsResponse.json();

      const dashboardData: DashboardData = {
        totalExpenses: reportsData.total || 0,
        transactionCount: transactionsData.pagination?.total || 0,
        recentTransactions: transactionsData.data || [],
        monthlyComparison: {
          current: reportsData.total || 0,
          previous: reportsData.comparison?.previousMonthTotal || 0,
          percentageChange: reportsData.comparison?.percentageChange || 0,
        },
      };

      setData(dashboardData);
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          {trend && (
            <div className="flex items-center mt-2">
              {trend === "up" ? (
                <TrendingUpIcon className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <TrendingDownIcon className="h-4 w-4 text-green-500 mr-1" />
              )}
              <span
                className={`text-sm font-medium ${
                  trend === "up" ? "text-red-600" : "text-green-600"
                }`}
              >
                {Math.abs(trendValue).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                vs mês anterior
              </span>
            </div>
          )}
        </div>
        <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse"
              >
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Gastos do Mês"
            value={formatCurrency(data?.totalExpenses || 0)}
            icon={CreditCardIcon}
            trend={
              data?.monthlyComparison.percentageChange > 0
                ? "up"
                : data?.monthlyComparison.percentageChange < 0
                ? "down"
                : null
            }
            trendValue={data?.monthlyComparison.percentageChange || 0}
          />
          <StatCard
            title="Transações"
            value={data?.transactionCount || 0}
            icon={CalendarIcon}
          />
          <StatCard
            title="Mês Anterior"
            value={formatCurrency(data?.monthlyComparison.previous || 0)}
            icon={TrendingDownIcon}
          />
        </div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Transações Recentes
            </h3>
          </div>
          <div className="p-6">
            {data?.recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhuma transação encontrada
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {data?.recentTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: transaction.category_color }}
                      >
                        <span className="text-white font-medium text-sm">
                          {transaction.category_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transaction.description || transaction.category_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(transaction.date), "dd 'de' MMMM", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {transaction.category_name}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}