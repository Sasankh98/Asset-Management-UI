import { useQuery, UseQueryResult } from "@tanstack/react-query";
import GoalsService from "../../services/GoalsService/GoalsService";
import { queryKeys } from "../../react-query";
import { GoalsResponseDTO } from "../../../server/types";

export function useGoalsQuery(): UseQueryResult<GoalsResponseDTO, Error> {
  const service = GoalsService();
  
  return useQuery({
    queryKey: queryKeys.goals.all(),
    queryFn: async () => await service.getGoalsDetails(),
    enabled: true,
    staleTime: 1000*60*60*24,
  })
}