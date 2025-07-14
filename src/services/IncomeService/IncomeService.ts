import { IncomeDTO } from "../../../server/types";
import { httpService, baseURL } from "../axiosConnection";

function IncomeService() {
  return {
    // postIncomeDetails: async (data: UserLoginDTO): Promise<UserInfoDTO | null> => {
    //   try {
    //     const response = await httpService.post<UserLoginDTO, UserInfoDTO>(
    //       `${baseURL}/login`,
    //       data
    //     );
    //     return response as UserInfoDTO;
    //   } catch (error) {
    //     console.error("Login failed:", error);
    //     throw error; // rethrowing the error so the caller can handle it
    //   }
    // },
    getIncomeDetails: async (): Promise<IncomeDTO | null> => {
      try {
        const response = await httpService.get<IncomeDTO>(
          `${baseURL}/income`
        );
        return response as IncomeDTO;
      } catch (error) {
        console.error("Login failed:", error);
        throw error; // rethrowing the error so the caller can handle it
      }
    },
  };
}
export default IncomeService;