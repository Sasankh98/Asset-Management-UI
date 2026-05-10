import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../react-query";
import LoansService from "../../services/LoansService/LoansService";
import { type CreateLoanDTO } from "../../../server/types";

export function useLoansMutation() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.loans.all() });

  const createLoan = useMutation({
    mutationFn: (data: CreateLoanDTO) => LoansService().createLoan(data),
    onSuccess: invalidate,
  });

  const updateLoan = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateLoanDTO }) =>
      LoansService().updateLoan(id, data),
    onSuccess: invalidate,
  });

  const deleteLoan = useMutation({
    mutationFn: (id: number) => LoansService().deleteLoan(id),
    onSuccess: invalidate,
  });

  return { createLoan, updateLoan, deleteLoan };
}
