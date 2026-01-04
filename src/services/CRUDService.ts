import { CreateGoalsDTO, GoalsDTO } from "../../server/types";
import { httpService, baseURL } from "./axiosConnection";

export function createCRUDService<T, CreateT = T>(endpoint: string) {
  return {
    list: async (): Promise<{ data: T[] }> => {
      try {
        const response = await httpService.get(`${baseURL}${endpoint}`);
        return response as { data: T[] };
      } catch (error) {
        console.error(`Failed to fetch ${endpoint}`, error);
        throw error;
      }
    },

    get: async (id: number): Promise<T> => {
      try {
        const response = await httpService.get(`${baseURL}${endpoint}/${id}`);
        return response as T;
      } catch (error) {
        console.error(`Failed to fetch ${endpoint}/${id}`, error);
        throw error;
      }
    },

    create: async (data: CreateT): Promise<T> => {
      try {
        const response = await httpService.post(`${baseURL}${endpoint}`, data);
        return response as T;
      } catch (error) {
        console.error(`Failed to create at ${endpoint}`, error);
        throw error;
      }
    },

    update: async (id: number, data: CreateT): Promise<T> => {
      try {
        const response = await httpService.patch(
          `${baseURL}${endpoint}?id=${id}`,
          data
        );
        return response as T;
      } catch (error) {
        console.error(`Failed to update ${endpoint}/${id}`, error);
        throw error;
      }
    },

    // delete: async (id: number): Promise<void> => {
    //   try {
    //     await httpService.delete(`${baseURL}${endpoint}/${id}`);
    //   } catch (error) {
    //     console.error(`Failed to delete ${endpoint}/${id}`, error);
    //     throw error;
    //   }
    // },
  };
}

// Then each service becomes ONE LINE:
export const goalsService = createCRUDService<GoalsDTO, CreateGoalsDTO>('/goals');
// export const mutualFundsService = createCRUDService<MutualFund, CreateMutualFund>('/mutualFunds');
// export const salaryService = createCRUDService<Salary, CreateSalary>('/salary');