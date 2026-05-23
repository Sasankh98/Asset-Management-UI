import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../react-query";
import { httpService, baseURL } from "../../services/axiosConnection";

export interface UserProfile {
  name?: string;
  email: string;
  id?: number;
  createdAt?: string;
}

export function useSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.settings.profile(),
    queryFn: async (): Promise<UserProfile | null> => {
      const res = await httpService.get<{ status: string; data: { user: UserProfile } }>(
        `${baseURL}/users/me`
      );
      return res?.data?.user ?? null;
    },
  });
}
