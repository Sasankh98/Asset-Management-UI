import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../react-query";
import ProvidentFundService from "../../services/ProvidentFundService/ProvidentFundService";
import { type PfConfig } from "../../../server/types";

const USER = "Sasankh";

export function useProvidentFundQuery() {
  return useQuery({
    queryKey: queryKeys.providentFund.config(USER),
    queryFn: async (): Promise<PfConfig | null> => {
      return ProvidentFundService().getConfig(USER);
    },
  });
}
