import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../react-query";
import LicService from "../../services/LicService/LicService";
import { type CreateLicPolicyDTO } from "../../../server/types";

export function useLicMutation() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.lic.all() });

  const createPolicy = useMutation({
    mutationFn: (data: CreateLicPolicyDTO) => LicService().createPolicy(data),
    onSuccess: invalidate,
  });

  const updatePolicy = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateLicPolicyDTO }) =>
      LicService().updatePolicy(id, data),
    onSuccess: invalidate,
  });

  const deletePolicy = useMutation({
    mutationFn: (id: number) => LicService().deletePolicy(id),
    onSuccess: invalidate,
  });

  return { createPolicy, updatePolicy, deletePolicy };
}
