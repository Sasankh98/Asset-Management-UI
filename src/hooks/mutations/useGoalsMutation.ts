import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { CreateGoalsDTO, GoalsDTO } from "../../../server/types";
import { queryKeys } from "../../react-query";
import { goalsService } from "../../services/CRUDService";
import { useAssetManagementContext } from "../../AssetManagement/ContextProvider/ContextProvider";

interface UseGoalsMutationReturn {
  createGoal: UseMutationResult<
    GoalsDTO,
    Error,
    { data: CreateGoalsDTO },
    unknown
  >;
  updateGoal: UseMutationResult<
    GoalsDTO,
    Error,
    { id: number; data: CreateGoalsDTO },
    unknown
  >;
  deleteGoal: UseMutationResult<void, Error, { id: number }, unknown>;
}

export function useGoalsMutation(): UseGoalsMutationReturn {
  const queryClient = useQueryClient();
  const { showSnackbar } = useAssetManagementContext();
  const service = goalsService;

  const createGoal = useMutation({
    mutationFn: (params: { data: CreateGoalsDTO }) =>
      service.create(params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all() });
    },
    onError: (error: Error) => {
      console.error("Error creating goal:", error);
      showSnackbar("Failed to create goal. Please try again.", "error");
    },
  });

  const updateGoal = useMutation({
    mutationFn: (params: { id: number; data: CreateGoalsDTO }) =>
      service.update(params.id, params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all() });
    },
    onError: (error: Error) => {
      console.error("Error updating goal:", error);
      showSnackbar("Failed to update goal. Please try again.", "error");
    },
  });

  const deleteGoal = useMutation({
    mutationFn: (params: { id: number }) => service.delete(params.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all() });
      showSnackbar("Goal deleted successfully.", "success");
    },
    onError: (error: Error) => {
      console.error("Error deleting goal:", error);
      showSnackbar("Failed to delete goal. Please try again.", "error");
    },
  });

  return {
    createGoal,
    updateGoal,
    deleteGoal,
  };
}
