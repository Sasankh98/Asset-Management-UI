import { CreateMutualFundsDTO, MutualFundsDTO, MutualFundsDashboardDTO } from "../../../server/types";
import { httpService, baseURL } from "../axiosConnection";

function MutualFundsService() {
  return {
    getMutualFundsDetails: async (): Promise<MutualFundsDTO | null> => {
      try {
        const response = await httpService.get<MutualFundsDTO>(
          `${baseURL}/mutualFunds`
        );
        return response as MutualFundsDTO;
      } catch (error) {
        console.error("Fetching failed:", error);
        throw error; // rethrowing the error so the caller can handle it
      }
    },
    getmutualFundsDashboardList: async (): Promise<MutualFundsDashboardDTO | null> => {
      try {
        const response = await httpService.get<MutualFundsDashboardDTO>(
          `${baseURL}/mutualFunds/dashboard`
        );
        return response as MutualFundsDashboardDTO;
      } catch (error) {
        console.error("Fetching failed:", error);
        throw error; // rethrowing the error so the caller can handle it
      }
    },

    postMutualFundDetails: async (mutualFundsData:CreateMutualFundsDTO): Promise<MutualFundsDTO | null> => {
      try {
        const response = await httpService.post<CreateMutualFundsDTO,MutualFundsDTO>(
          `${baseURL}/mutualFunds`,mutualFundsData
        );
        return response as MutualFundsDTO;
      } catch (error) {
        console.error("Creation failed:", error);
        throw error; // rethrowing the error so the caller can handle it
      }
    },
    updateMutualFundDetails: async (id:number | undefined,mutualFundsData:CreateMutualFundsDTO): Promise<MutualFundsDTO | null> => {
      try {
        const response = await httpService.patch<CreateMutualFundsDTO,MutualFundsDTO>(
          `${baseURL}/mutualFunds?id=${id}`,mutualFundsData
        );
        return response as MutualFundsDTO;
      } catch (error) {
        console.error("Update failed:", error);
        throw error; // rethrowing the error so the caller can handle it
      }
    },
  };
}
export default MutualFundsService;