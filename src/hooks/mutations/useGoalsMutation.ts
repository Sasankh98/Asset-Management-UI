import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { CreateGoalsDTO, GoalsDTO } from "../../../server/types";
import { queryKeys } from "../../react-query";
import {goalsService} from "../../services/CRUDService";

/**
 * Defines the return type for useGoalsMutation hook
 * @params <ResponseDTO, Error, VariablesDTO, Context>
 */
interface UseGoalsMutationReturn {
  createGoal: UseMutationResult<
    GoalsDTO,
    Error,
    {
      data: CreateGoalsDTO;
    },
    unknown
  >;
  updateGoal: UseMutationResult<
    GoalsDTO,
    Error,
    {
      id: number;
      data: CreateGoalsDTO;
    },
    unknown
  >;
}

export function useGoalsMutation(): UseGoalsMutationReturn {
  const queryClient = useQueryClient();
  const service = goalsService;

  // Create Goals mutation
  const createGoal = useMutation({
    mutationFn: (params: { data: CreateGoalsDTO }) =>
      service.create(params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all() });
    },
    onError: (error: Error) => {
      console.error("Error creating goal:", error);
    },
  });
  // Update Goals mutation
  const updateGoal = useMutation({
    mutationFn: (params: { id: number; data: CreateGoalsDTO }) =>
      service.update(params.id, params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all() });
    },
    onError: (error: Error) => {
      console.error("Error updating goal:", error);
    },
  });

  return {
    createGoal,
    updateGoal,
  };
}
