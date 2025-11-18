import { CreateGoalsDTO, GoalsResponseDTO } from "../../../server/types";
import { httpService, baseURL } from "../axiosConnection";

function GoalsService() {
  return {
    getGoalsDetails: async (): Promise<GoalsResponseDTO> => {
      try {
        const response = await httpService.get(
          `${baseURL}/goals`
        );
        return response as GoalsResponseDTO;
      } catch (error) {
        console.error("Fetching failed:", error);
        throw error; // rethrowing the error so the caller can handle it
      }
    },
    postGoalsDetails: async (goalsData:CreateGoalsDTO): Promise<GoalsResponseDTO | null> => {
      try {
        const response = await httpService.post<CreateGoalsDTO,GoalsResponseDTO>(
          `${baseURL}/goals`,goalsData
        );
        return response as GoalsResponseDTO;
      } catch (error) {
        console.error("Creation failed:", error);
        throw error; // rethrowing the error so the caller can handle it
      }
    },
    updateGoalsDetails: async (id:number,goalsData:CreateGoalsDTO): Promise<GoalsResponseDTO | null> => {
      try {
        const response = await httpService.patch<CreateGoalsDTO,GoalsResponseDTO>(
          `${baseURL}/goals?id=${id}`,goalsData
        );
        return response as GoalsResponseDTO;
      } catch (error) {
        console.error("Update failed:", error);
        throw error; // rethrowing the error so the caller can handle it
      }
    },
  };
}
export default GoalsService;