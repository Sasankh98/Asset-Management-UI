import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../react-query";
import SalaryService from "../../services/SalaryService/SalaryService";
import { type Salary } from "../../../server/types";

export function useSalaryQuery() {
  return useQuery({
    queryKey: queryKeys.salary.all(),
    queryFn: async (): Promise<Salary[]> => {
      const res = await SalaryService().getSalaryDetails();
      return res?.data ?? [];
    },
  });
}
