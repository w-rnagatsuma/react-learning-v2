import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpcFetch } from "@/api/trpc/client";

type LoginInput = {
  email: string;
  password: string;
};

type LoginResponse = {
  success: boolean;
};

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      return trpcFetch<LoginResponse>("auth.login", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["auth", "me"],
      });
    },
  });
}