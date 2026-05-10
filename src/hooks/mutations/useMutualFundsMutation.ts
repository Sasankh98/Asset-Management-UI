import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../react-query";
import MutualFundsService from "../../services/MutualFunds/MutualFundsService";
import { type CreateMutualFundsDTO } from "../../../server/types";
import { useAssetManagementContext } from "../../AssetManagement/ContextProvider/ContextProvider";

export function useMutualFundsMutation() {
  const queryClient = useQueryClient();
  const { showSnackbar } = useAssetManagementContext();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.mutualFunds.all() });
    queryClient.invalidateQueries({ queryKey: queryKeys.mutualFunds.dashboard() });
  };

  const createFund = useMutation({
    mutationFn: (data: CreateMutualFundsDTO) => MutualFundsService().postMutualFundDetails(data),
    onSuccess: invalidate,
    onError: () => showSnackbar("Failed to create mutual fund.", "error"),
  });

  const updateFund = useMutation({
    mutationFn: ({ id, data }: { id: number | undefined; data: CreateMutualFundsDTO }) =>
      MutualFundsService().updateMutualFundDetails(id, data),
    onSuccess: invalidate,
    onError: () => showSnackbar("Failed to update mutual fund.", "error"),
  });

  return { createFund, updateFund };
}
