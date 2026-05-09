import { type Emi, type CreateEmiDTO } from "../../../server/types";
import { httpService, baseURL } from "../axiosConnection";

function EmisService() {
  return {
    getEmis: async (): Promise<Emi[]> => {
      const res = await httpService.get<{ status: string; data: Emi[] }>(`${baseURL}/emis`);
      return res?.data ?? [];
    },
    createEmi: async (data: CreateEmiDTO): Promise<Emi> => {
      const res = await httpService.post<CreateEmiDTO, { status: string; data: Emi }>(
        `${baseURL}/emis`,
        data
      );
      return res.data;
    },
    updateEmi: async (id: number, data: CreateEmiDTO): Promise<void> => {
      await httpService.patch<CreateEmiDTO, unknown>(`${baseURL}/emis?id=${id}`, data);
    },
    deleteEmi: async (id: number): Promise<void> => {
      await httpService.del(`${baseURL}/emis/${id}`);
    },
  };
}

export default EmisService;
