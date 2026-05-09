import { type PfConfig, type CreatePfConfigDTO } from "../../../server/types";
import { httpService, baseURL } from "../axiosConnection";

function ProvidentFundService() {
  return {
    getConfig: async (user?: string): Promise<PfConfig | null> => {
      const query = user ? `?user=${encodeURIComponent(user)}` : "";
      const res = await httpService.get<{ status: string; data: PfConfig | null }>(
        `${baseURL}/providentFund${query}`
      );
      return res?.data ?? null;
    },
    upsert: async (data: CreatePfConfigDTO): Promise<PfConfig> => {
      const res = await httpService.post<CreatePfConfigDTO, { status: string; data: PfConfig }>(
        `${baseURL}/providentFund`,
        data
      );
      return res.data;
    },
  };
}

export default ProvidentFundService;
