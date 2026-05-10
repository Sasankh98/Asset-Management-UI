import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../react-query";
import StocksService from "../../services/StocksService/StocksService";
import { type Stock } from "../../../server/types";

export function useStocksQuery() {
  return useQuery({
    queryKey: queryKeys.stocks.all(),
    queryFn: async (): Promise<Stock[]> => {
      const res = await StocksService().getStocksDetails();
      const data = res?.data;
      return Array.isArray(data) ? data : [];
    },
  });
}
