import { type NetWorthSnapshot, type CreateSnapshotDTO } from "../../../server/types";
import { httpService, baseURL } from "../axiosConnection";

function ReportsService() {
  return {
    getNetWorthTrend: async (period?: string): Promise<NetWorthSnapshot[]> => {
      const query = period ? `?period=${period}` : "";
      const res = await httpService.get<{ status: string; data: NetWorthSnapshot[] }>(
        `${baseURL}/reports/netWorth${query}`
      );
      return res?.data ?? [];
    },
    getAllocationHistory: async (): Promise<NetWorthSnapshot[]> => {
      const res = await httpService.get<{ status: string; data: NetWorthSnapshot[] }>(
        `${baseURL}/reports/allocation`
      );
      return res?.data ?? [];
    },
    getStatements: async (limit = 12): Promise<NetWorthSnapshot[]> => {
      const res = await httpService.get<{ status: string; data: NetWorthSnapshot[] }>(
        `${baseURL}/reports/statements?limit=${limit}`
      );
      return res?.data ?? [];
    },
    createSnapshot: async (data: CreateSnapshotDTO): Promise<NetWorthSnapshot> => {
      const res = await httpService.post<CreateSnapshotDTO, { status: string; data: NetWorthSnapshot }>(
        `${baseURL}/reports/snapshots`,
        data
      );
      return res.data;
    },
    deleteSnapshot: async (id: number): Promise<void> => {
      await httpService.del(`${baseURL}/reports/snapshots/${id}`);
    },
  };
}

export default ReportsService;
