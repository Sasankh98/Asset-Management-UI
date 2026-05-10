import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../react-query";
import SalaryService from "../../services/SalaryService/SalaryService";
import { type CreateSalaryDTO } from "../../../server/types";
import { useAssetManagementContext } from "../../AssetManagement/ContextProvider/ContextProvider";

export function useSalaryMutation() {
  const queryClient = useQueryClient();
  const { setSnackBarOptions } = useAssetManagementContext();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.salary.all() });

  const createTransaction = useMutation({
    mutationFn: (data: CreateSalaryDTO) => SalaryService().postSalaryDetails(data),
    onSuccess: () => {
      invalidate();
      setSnackBarOptions({ open: true, message: "Created transaction successfully", severity: "success" });
    },
    onError: () =>
      setSnackBarOptions({ open: true, message: "Failed to create transaction", severity: "error" }),
  });

  const updateTransaction = useMutation({
    mutationFn: ({ id, data }: { id: number | undefined; data: CreateSalaryDTO }) =>
      SalaryService().updateSalaryDetails(id, data),
    onSuccess: invalidate,
    onError: () =>
      setSnackBarOptions({ open: true, message: "Failed to update transaction", severity: "error" }),
  });

  return { createTransaction, updateTransaction };
}
