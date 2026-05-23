import { useSettingsQuery } from "./queries/useSettingsQuery";

export interface CurrentUser {
  email: string;
  name: string;
  initials: string;
}

function getTokenEmail(): string {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) return "";
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (payload.email ?? payload.sub ?? "") as string;
  } catch {
    return "";
  }
}

export function useCurrentUser(): CurrentUser {
  const { data: profile } = useSettingsQuery();

  const email = profile?.email ?? getTokenEmail();
  const name = profile?.name || email;
  const initials = name.slice(0, 2).toUpperCase();

  return { email, name, initials };
}
