import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../react-query";
import EmisService from "../../services/EmisService/EmisService";
import { type Emi } from "../../../server/types";

export function useEmisQuery() {
  return useQuery({
    queryKey: queryKeys.emis.all(),
    queryFn: async (): Promise<Emi[]> => {
      return EmisService().getEmis();
    },
  });
}
