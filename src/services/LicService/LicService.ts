import { type LicPolicy, type CreateLicPolicyDTO } from "../../../server/types";
import { httpService, baseURL } from "../axiosConnection";

function LicService() {
  return {
    getPolicies: async (): Promise<LicPolicy[]> => {
      const res = await httpService.get<{ status: string; data: LicPolicy[] }>(`${baseURL}/lic`);
      return res?.data ?? [];
    },
    createPolicy: async (data: CreateLicPolicyDTO): Promise<LicPolicy> => {
      const res = await httpService.post<CreateLicPolicyDTO, { status: string; data: LicPolicy }>(
        `${baseURL}/lic`,
        data
      );
      return res.data;
    },
    updatePolicy: async (id: number, data: CreateLicPolicyDTO): Promise<void> => {
      await httpService.patch<CreateLicPolicyDTO, unknown>(`${baseURL}/lic?id=${id}`, data);
    },
    deletePolicy: async (id: number): Promise<void> => {
      await httpService.del(`${baseURL}/lic/${id}`);
    },
  };
}

export default LicService;
