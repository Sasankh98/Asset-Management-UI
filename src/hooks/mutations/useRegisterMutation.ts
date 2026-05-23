import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { UserRegisterDTO, UserInfoDTO } from "../../../server/types";
import { registerService } from "../../services/CRUDService";

interface UseRegisterMutationReturn {
  registerUser: UseMutationResult<
    UserInfoDTO,
    Error,
    { data: UserRegisterDTO },
    unknown
  >;
}

export function useRegisterMutation(): UseRegisterMutationReturn {
  const registerUser = useMutation({
    mutationFn: (params: { data: UserRegisterDTO }) =>
      registerService.create(params.data),
    onError: (error: Error) => {
      console.error("Registration failed:", error);
    },
  });

  return { registerUser };
}
