import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../react-query";
import LoansService from "../../services/LoansService/LoansService";
import { type Loan } from "../../../server/types";

export function useLoansQuery() {
  return useQuery({
    queryKey: queryKeys.loans.all(),
    queryFn: async (): Promise<Loan[]> => {
      return LoansService().getLoans();
    },
  });
}
