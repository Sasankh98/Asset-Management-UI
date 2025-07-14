import { GoalsDTO } from "../../../server/types";
import { httpService, baseURL } from "../axiosConnection";

function GoalsService() {
  return {

    getGoalsDetails: async (): Promise<GoalsDTO | null> => {
      try {
        const response = await httpService.get<GoalsDTO>(
          `${baseURL}/goals`
        );
        return response as GoalsDTO;
      } catch (error) {
        console.error("Login failed:", error);
        throw error; // rethrowing the error so the caller can handle it
      }
    },
  };
}
export default GoalsService;