import { type DashboardData } from "../../../server/types";
import { httpService, baseURL } from "../axiosConnection";

function DashboardService() {
  return {
    getDashboard: async (): Promise<DashboardData | null> => {
      const res = await httpService.get<{ status: string; data: DashboardData }>(
        `${baseURL}/dashboard`
      );
      return res?.data ?? null;
    },
  };
}

export default DashboardService;
