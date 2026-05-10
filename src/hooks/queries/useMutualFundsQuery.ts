import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../react-query";
import MutualFundsService from "../../services/MutualFunds/MutualFundsService";
import { type MutualFund, type MutualFundsDashboard } from "../../../server/types";

export function useMutualFundsQuery() {
  return useQuery({
    queryKey: queryKeys.mutualFunds.all(),
    queryFn: async (): Promise<MutualFund[]> => {
      const res = await MutualFundsService().getMutualFundsDetails();
      const data = res?.data;
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useMutualFundsDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.mutualFunds.dashboard(),
    queryFn: async (): Promise<MutualFundsDashboard | undefined> => {
      const res = await MutualFundsService().getmutualFundsDashboardList();
      return res?.data ?? undefined;
    },
  });
}
