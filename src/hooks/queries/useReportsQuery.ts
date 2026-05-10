import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../react-query";
import ReportsService from "../../services/ReportsService/ReportsService";
import { type NetWorthSnapshot } from "../../../server/types";

export function useNetWorthTrendQuery(period: string) {
  return useQuery({
    queryKey: queryKeys.reports.trend(period),
    queryFn: async (): Promise<NetWorthSnapshot[]> => {
      return ReportsService().getNetWorthTrend(period);
    },
  });
}

export function useAllocationQuery() {
  return useQuery({
    queryKey: queryKeys.reports.allocation(),
    queryFn: async (): Promise<NetWorthSnapshot[]> => {
      return ReportsService().getAllocationHistory();
    },
  });
}

export function useStatementsQuery(limit = 12) {
  return useQuery({
    queryKey: queryKeys.reports.statements(limit),
    queryFn: async (): Promise<NetWorthSnapshot[]> => {
      return ReportsService().getStatements(limit);
    },
  });
}
