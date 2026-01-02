import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { CreateGoalsDTO, GoalsResponseDTO } from "../../../server/types";
import { createQueryClient, queryKeys } from "../../react-query";
import GoalsService from "../../services/GoalsService/GoalsService";

/**
 * Defines the return type for useGoalsMutation hook
 * @params <ResponseDTO, Error, VariablesDTO, Context>
 */
interface UseGoalsMutationReturn {
  createGoal: UseMutationResult<
    GoalsResponseDTO,
    Error,
    {
      data: CreateGoalsDTO;
    },
    unknown
  >;
  updateGoal: UseMutationResult<
    GoalsResponseDTO,
    Error,
    {
      id: number;
      data: CreateGoalsDTO;
    },
    unknown
  >;
}

export function useGoalsMutation(): UseGoalsMutationReturn {
  const queryClient = createQueryClient();
  const service = GoalsService();

  // Create Goals mutation
  const createGoal = useMutation({
    mutationFn: (params: { data: CreateGoalsDTO }) =>
      service.postGoalsDetails(params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all() });
    },
    onError: (error: Error) => {
        console.error("Error creating goal:", error)
    }
  });
  // Create Goals mutation
  const updateGoal = useMutation({
    mutationFn: (params: {id: number, data: CreateGoalsDTO }) =>
      service.updateGoalsDetails(params.id,params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all() });
    },
    onError: (error: Error) => {
        console.error("Error creating goal:", error)
    }
  });

  return {
    createGoal,
    updateGoal
  }
}
