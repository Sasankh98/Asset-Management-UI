import {
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { UserLoginDTO, UserInfoDTO } from "../../../server/types";
import {loginService} from "../../services/CRUDService";

/**
 * Defines the return type for useLoginMutation hook
 * @params <ResponseDTO, Error, VariablesDTO, Context>
 */
interface UseLoginMutationReturn {
  createToken: UseMutationResult<
    UserInfoDTO,
    Error,
    {
      data: UserLoginDTO;
    },
    unknown
  >;
}

export function useLoginMutation(): UseLoginMutationReturn {
  const service = loginService;

  // Create Goals mutation
  const createToken = useMutation({
    mutationFn: (params: { data: UserLoginDTO }) =>
      service.create(params.data),
    onError: (error: Error) => {
      console.error("Error creating goal:", error);
    },
  });
  return {
    createToken,
  };
}
