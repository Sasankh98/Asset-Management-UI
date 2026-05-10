import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../react-query";
import EmisService from "../../services/EmisService/EmisService";
import { type CreateEmiDTO } from "../../../server/types";

export function useEmisMutation() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.emis.all() });

  const createEmi = useMutation({
    mutationFn: (data: CreateEmiDTO) => EmisService().createEmi(data),
    onSuccess: invalidate,
  });

  const updateEmi = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateEmiDTO }) =>
      EmisService().updateEmi(id, data),
    onSuccess: invalidate,
  });

  const deleteEmi = useMutation({
    mutationFn: (id: number) => EmisService().deleteEmi(id),
    onSuccess: invalidate,
  });

  return { createEmi, updateEmi, deleteEmi };
}
