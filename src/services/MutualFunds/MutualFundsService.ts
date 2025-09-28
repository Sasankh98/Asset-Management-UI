import { CreateMutualFundsDTO, MutualFundsDTO } from "../../../server/types";
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
    postMutualFundDetails: async (goalsData:CreateMutualFundsDTO): Promise<MutualFundsDTO | null> => {
      try {
        const response = await httpService.post<CreateMutualFundsDTO,MutualFundsDTO>(
          `${baseURL}/mutualFunds`,goalsData
        );
        return response as MutualFundsDTO;
      } catch (error) {
        console.error("Creation failed:", error);
        throw error; // rethrowing the error so the caller can handle it
      }
    },
    // updateMutualFundDetails: async (id:number,goalsData:CreateGoalsDTO): Promise<GoalsDTO | null> => {
    //   try {
    //     const response = await httpService.patch<CreateGoalsDTO,GoalsDTO>(
    //       `${baseURL}/mutualFunds?id=${id}`,goalsData
    //     );
    //     return response as GoalsDTO;
    //   } catch (error) {
    //     console.error("Update failed:", error);
    //     throw error; // rethrowing the error so the caller can handle it
    //   }
    // },
  };
}
export default MutualFundsService;