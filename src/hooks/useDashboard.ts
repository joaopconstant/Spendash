import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardService } from "@/lib/supabaseService";
import type { DashboardData } from "@/types/finance";

export const useDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } =
        await dashboardService.getDashboardData(user.id);

      if (fetchError) {
        setError(fetchError);
      } else {
        setDashboardData(data);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  return {
    dashboardData,
    isLoading,
    error,
    refetch: fetchDashboardData,
  };
};
