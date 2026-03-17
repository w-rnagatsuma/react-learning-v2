import { useQuery } from "@tanstack/react-query";
import { trpcFetch } from "@/api/trpc/client";

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
      return trpcFetch<MeResponse>("auth.me");
    },
  });
}