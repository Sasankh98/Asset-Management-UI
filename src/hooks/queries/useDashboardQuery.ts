import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../react-query";
import DashboardService from "../../services/DashboardService/DashboardService";
import { type DashboardData } from "../../../server/types";

export function useDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.dashboard.all(),
    queryFn: async (): Promise<DashboardData | null> => {
      return DashboardService().getDashboard();
    },
  });
}
