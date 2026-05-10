import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../react-query";
import ProvidentFundService from "../../services/ProvidentFundService/ProvidentFundService";
import { type CreatePfConfigDTO } from "../../../server/types";

const USER = "Sasankh";

export function useProvidentFundMutation() {
  const queryClient = useQueryClient();

  const upsertConfig = useMutation({
    mutationFn: (data: CreatePfConfigDTO) => ProvidentFundService().upsert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.providentFund.config(USER) });
    },
  });

  return { upsertConfig };
}
