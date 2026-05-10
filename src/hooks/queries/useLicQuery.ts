import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../react-query";
import LicService from "../../services/LicService/LicService";
import { type LicPolicy } from "../../../server/types";

export function useLicQuery() {
  return useQuery({
    queryKey: queryKeys.lic.all(),
    queryFn: async (): Promise<LicPolicy[]> => {
      return LicService().getPolicies();
    },
  });
}
