import { useQuery } from "@tanstack/react-query";
import { trpcFetch } from "@/api/trpc/client";
import { getDevLoggedInUser } from "@/api/session/devMockAuth";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

type MeResponse = {
  user: CurrentUser | null;
};

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        return await trpcFetch<MeResponse>("auth.me");
      } catch {
        const devUser = getDevLoggedInUser();
        return { user: devUser };
      }
    },
  });
}