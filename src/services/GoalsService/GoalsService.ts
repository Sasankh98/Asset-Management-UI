import { CreateGoalsDTO, GoalsDTO } from "../../../server/types";
import { httpService, baseURL } from "../axiosConnection";

function GoalsService() {
  return {
    getGoalsDetails: async (): Promise<GoalsDTO[]> => {
      try {
        const response = await httpService.get(
          `${baseURL}/goals`
        );
        return response?.data as GoalsDTO[];
      } catch (error) {
        console.error("Fetching failed:", error);
        throw error; // rethrowing the error so the caller can handle it
      }
    },
    postGoalsDetails: async (goalsData:CreateGoalsDTO): Promise<GoalsDTO | null> => {
      try {
        const response = await httpService.post<CreateGoalsDTO,GoalsDTO>(
          `${baseURL}/goals`,goalsData
        );
        return response as GoalsDTO;
      } catch (error) {
        console.error("Creation failed:", error);
        throw error; // rethrowing the error so the caller can handle it
      }
    },
    updateGoalsDetails: async (id:number,goalsData:CreateGoalsDTO): Promise<GoalsDTO | null> => {
      try {
        const response = await httpService.patch<CreateGoalsDTO,GoalsDTO>(
          `${baseURL}/goals?id=${id}`,goalsData
        );
        return response as GoalsDTO;
      } catch (error) {
        console.error("Update failed:", error);
        throw error; // rethrowing the error so the caller can handle it
      }
    },
  };
}
export default GoalsService;