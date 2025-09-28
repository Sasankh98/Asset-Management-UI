import { StocksDTO,CreateStocksDTO } from "../../../server/types";
import { httpService, baseURL } from "../axiosConnection";

function StocksService() {
  return {
    postStockDetails: async (stocksData: CreateStocksDTO): Promise<StocksDTO | null> => {
      try {
        const response = await httpService.post<CreateStocksDTO, StocksDTO>(
          `${baseURL}/stocks`,
          stocksData
        );
        return response as StocksDTO;
      } catch (error) {
        console.error("error creating Salary details:", error);
        throw error; // rethrowing the error so the caller can handle it
      }
    },
    updateStockDetails: async (id:number |undefined,stocksData: CreateStocksDTO): Promise<StocksDTO | null> => {
      try {
        const response = await httpService.patch<CreateStocksDTO, StocksDTO>(
          `${baseURL}/stocks?id=${id}`,
          stocksData
        );
        return response as StocksDTO;
      } catch (error) {
        console.error("error creating Salary details:", error);
        throw error; // rethrowing the error so the caller can handle it
      }
    },
    getStocksDetails: async (): Promise<StocksDTO | null> => {
      try {
        const response = await httpService.get<StocksDTO>(
          `${baseURL}/stocks`
        );
        return response as StocksDTO;
      } catch (error) {
        console.error("error fetching Salary details:", error);
        throw error; // rethrowing the error so the caller can handle it
      }
    },
    getDailyStocksDetails: async (symbol:string): Promise<unknown | null> => {
      try {
        const response = await httpService.get<unknown>(
          `${baseURL}/stocks/daily?symbol=${symbol}`
        );
        return response as unknown;
      } catch (error) {
        console.error("error fetching Salary details:", error);
        throw error; // rethrowing the error so the caller can handle it
      }
    },
  };
}
export default StocksService;