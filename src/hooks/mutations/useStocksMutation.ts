import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../react-query";
import StocksService from "../../services/StocksService/StocksService";
import { type CreateStocksDTO } from "../../../server/types";
import { useAssetManagementContext } from "../../AssetManagement/ContextProvider/ContextProvider";

export function useStocksMutation() {
  const queryClient = useQueryClient();
  const { showSnackbar } = useAssetManagementContext();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.stocks.all() });

  const createStock = useMutation({
    mutationFn: (data: CreateStocksDTO) => StocksService().postStockDetails(data),
    onSuccess: invalidate,
    onError: () => showSnackbar("Failed to create stock.", "error"),
  });

  const updateStock = useMutation({
    mutationFn: ({ id, data }: { id: number | undefined; data: CreateStocksDTO }) =>
      StocksService().updateStockDetails(id, data),
    onSuccess: invalidate,
    onError: () => showSnackbar("Failed to update stock.", "error"),
  });

  return { createStock, updateStock };
}
