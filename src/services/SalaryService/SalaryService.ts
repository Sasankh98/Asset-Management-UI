import { SalaryDTO,CreateSalaryDTO } from "../../../server/types";
import { httpService, baseURL } from "../axiosConnection";

function SalaryService() {
  return {
    postSalaryDetails: async (incomeData: CreateSalaryDTO): Promise<SalaryDTO | null> => {
      try {
        const response = await httpService.post<CreateSalaryDTO, SalaryDTO>(
          `${baseURL}/salary`,
          incomeData
        );
        return response as SalaryDTO;
      } catch (error) {
        console.error("error creating Salary details:", error);
        throw error; // rethrowing the error so the caller can handle it
      }
    },
    updateSalaryDetails: async (id:number |undefined,incomeData: CreateSalaryDTO): Promise<SalaryDTO | null> => {
      try {
        const response = await httpService.patch<CreateSalaryDTO, SalaryDTO>(
          `${baseURL}/salary?id=${id}`,
          incomeData
        );
        return response as SalaryDTO;
      } catch (error) {
        console.error("error creating Salary details:", error);
        throw error; // rethrowing the error so the caller can handle it
      }
    },
    getSalaryDetails: async (): Promise<SalaryDTO | null> => {
      try {
        const response = await httpService.get<SalaryDTO>(
          `${baseURL}/salary`
        );
        return response as SalaryDTO;
      } catch (error) {
        console.error("error fetching Salary details:", error);
        throw error; // rethrowing the error so the caller can handle it
      }
    },
  };
}
export default SalaryService;