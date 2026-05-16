import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../react-query";
import DashboardService from "../../services/DashboardService/DashboardService";
import SalaryService from "../../services/SalaryService/SalaryService";
import ProvidentFundService from "../../services/ProvidentFundService/ProvidentFundService";

export interface StagesDefaults {
  age0: number;
  salary0: number;
  expense0: number;
  corpus0: number;
}

const FALLBACKS: StagesDefaults = {
  age0: 28,
  salary0: 924000,
  expense0: 600000,
  corpus0: 1432000,
};

export function useStagesDefaultsQuery() {
  return useQuery({
    queryKey: queryKeys.stages.defaults(),
    queryFn: async (): Promise<StagesDefaults> => {
      const [dash, transactions, pf] = await Promise.allSettled([
        DashboardService().getDashboard(),
        SalaryService().getSalaryDetails().then((r) => r?.data ?? []),
        ProvidentFundService().getConfig(),
      ]);

      const corpus0 =
        dash.status === "fulfilled" && dash.value
          ? Number(dash.value.totalAssets ?? 0)
          : FALLBACKS.corpus0;

      const age0 =
        pf.status === "fulfilled" && pf.value
          ? Number((pf.value as { currentAge?: number }).currentAge ?? FALLBACKS.age0)
          : FALLBACKS.age0;

      const cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - 1);
      const txns =
        transactions.status === "fulfilled" ? transactions.value : [];
      const recent = txns.filter((t) => new Date(t.date) >= cutoff);
      const salary0 = recent
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + Number(t.amount ?? 0), 0);
      const expense0 = recent
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + Number(t.amount ?? 0), 0);

      return {
        age0: Math.min(Math.max(age0, 20), 55),
        salary0: salary0 > 0 ? salary0 : FALLBACKS.salary0,
        expense0: expense0 > 0 ? expense0 : FALLBACKS.expense0,
        corpus0: corpus0 > 0 ? corpus0 : FALLBACKS.corpus0,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}
