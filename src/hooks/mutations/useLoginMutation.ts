import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { UserLoginDTO, UserInfoDTO } from "../../../server/types";
import { loginService } from "../../services/CRUDService";

interface UseLoginMutationReturn {
  createToken: UseMutationResult<
    UserInfoDTO,
    Error,
    { data: UserLoginDTO },
    unknown
  >;
}

export function useLoginMutation(): UseLoginMutationReturn {
  const service = loginService;

  const createToken = useMutation({
    mutationFn: (params: { data: UserLoginDTO }) =>
      service.create(params.data),
    onError: (error: Error) => {
      console.error("Login failed:", error);
    },
  });

  return {
    createToken,
  };
}
