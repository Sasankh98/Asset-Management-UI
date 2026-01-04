import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { goalsService } from "../../services/CRUDService";
import { queryKeys } from "../../react-query";
import { GoalsDTO } from "../../../server/types";

export function useGoalsQuery(): UseQueryResult<GoalsDTO[], Error> {
  const service = goalsService;

  return useQuery({
    queryKey: queryKeys.goals.all(),
    queryFn: async () => {
      const response = await service.list();
      return response.data;
    },
    enabled: true,
    staleTime: 1000 * 60 * 60 * 24,
  });
}
