import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../react-query";
import ProvidentFundService from "../../services/ProvidentFundService/ProvidentFundService";
import { type CreatePfConfigDTO } from "../../../server/types";
import { useCurrentUser } from "../useCurrentUser";

export function useProvidentFundMutation() {
  const queryClient = useQueryClient();
  const { email } = useCurrentUser();

  const upsertConfig = useMutation({
    mutationFn: (data: CreatePfConfigDTO) => ProvidentFundService().upsert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.providentFund.config(email) });
    },
  });

  return { upsertConfig };
}
