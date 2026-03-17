import { useQuery } from "@tanstack/react-query";
import { trpcClient } from "@/api/trpc/client";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      return await trpcClient.auth.me.query();
    },
  });
}