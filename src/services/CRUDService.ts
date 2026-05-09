import {
  CreateGoalsDTO,
  CreateMutualFundsDTO,
  CreateSalaryDTO,
  CreateStocksDTO,
  GoalsDTO,
  MutualFundsDashboardDTO,
  MutualFundsDTO,
  SalaryDTO,
  StocksDTO,
  UserInfoDTO,
  UserLoginDTO,
} from "../../server/types";
import { httpService, baseURL } from "./axiosConnection";

export function createCRUDService<T, CreateT = T>(endpoint: string) {
  return {
    list: async (): Promise<{ data: T[] }> => {
      try {
        const response = await httpService.get<{ status: string; data: T[] }>(
          `${baseURL}${endpoint}`
        );
        return { data: response!.data };
      } catch (error) {
        console.error(`Failed to fetch ${endpoint}`, error);
        throw error;
      }
    },

    get: async (id: number): Promise<T> => {
      try {
        const response = await httpService.get<T>(`${baseURL}${endpoint}/${id}`);
        return response as T;
      } catch (error) {
        console.error(`Failed to fetch ${endpoint}/${id}`, error);
        throw error;
      }
    },

    create: async (data: CreateT): Promise<T> => {
      try {
        const response = await httpService.post<CreateT, T>(
          `${baseURL}${endpoint}`,
          data
        );
        return response;
      } catch (error) {
        console.error(`Failed to create at ${endpoint}`, error);
        throw error;
      }
    },

    update: async (id: number, data: CreateT): Promise<T> => {
      try {
        const response = await httpService.patch<CreateT, T>(
          `${baseURL}${endpoint}?id=${id}`,
          data
        );
        return response;
      } catch (error) {
        console.error(`Failed to update ${endpoint}/${id}`, error);
        throw error;
      }
    },

    delete: async (id: number): Promise<void> => {
      try {
        await httpService.del(`${baseURL}${endpoint}/${id}`);
      } catch (error) {
        console.error(`Failed to delete ${endpoint}/${id}`, error);
        throw error;
      }
    },
  };
}

export const loginService = createCRUDService<UserInfoDTO, UserLoginDTO>(
  "/login"
);
export const goalsService = createCRUDService<GoalsDTO, CreateGoalsDTO>(
  "/goals"
);
export const mutualFundsService = createCRUDService<
  MutualFundsDTO,
  CreateMutualFundsDTO
>("/mutualFunds");
export const mutualFundsDashboardService = createCRUDService<
  MutualFundsDashboardDTO,
  CreateMutualFundsDTO
>("/mutualFunds/dashboard");
export const salaryService = createCRUDService<SalaryDTO, CreateSalaryDTO>(
  "/salary"
);
export const stocksService = createCRUDService<StocksDTO, CreateStocksDTO>(
  "/stocks"
);
