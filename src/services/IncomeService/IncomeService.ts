import { IncomeDTO,CreateIncomeDTO } from "../../../server/types";
import { httpService, baseURL } from "../axiosConnection";

function IncomeService() {
  return {
    postIncomeDetails: async (incomeData: CreateIncomeDTO): Promise<IncomeDTO | null> => {
      try {
        const response = await httpService.post<CreateIncomeDTO, IncomeDTO>(
          `${baseURL}/income`,
          incomeData
        );
        return response as IncomeDTO;
      } catch (error) {
        console.error("error creating Income details:", error);
        throw error; // rethrowing the error so the caller can handle it
      }
    },
    updateIncomeDetails: async (id:number |undefined,incomeData: CreateIncomeDTO): Promise<IncomeDTO | null> => {
      try {
        const response = await httpService.patch<CreateIncomeDTO, IncomeDTO>(
          `${baseURL}/income?id=${id}`,
          incomeData
        );
        return response as IncomeDTO;
      } catch (error) {
        console.error("error creating Income details:", error);
        throw error; // rethrowing the error so the caller can handle it
      }
    },
    getIncomeDetails: async (): Promise<IncomeDTO | null> => {
      try {
        const response = await httpService.get<IncomeDTO>(
          `${baseURL}/income`
        );
        return response as IncomeDTO;
      } catch (error) {
        console.error("error fetching Income details:", error);
        throw error; // rethrowing the error so the caller can handle it
      }
    },
  };
}
export default IncomeService;