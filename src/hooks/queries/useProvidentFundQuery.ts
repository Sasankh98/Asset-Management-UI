import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../react-query";
import ProvidentFundService from "../../services/ProvidentFundService/ProvidentFundService";
import { type PfConfig } from "../../../server/types";
import { useCurrentUser } from "../useCurrentUser";

export function useProvidentFundQuery() {
  const { email } = useCurrentUser();
  return useQuery({
    queryKey: queryKeys.providentFund.config(email),
    queryFn: async (): Promise<PfConfig | null> => {
      return ProvidentFundService().getConfig(email);
    },
  });
}
