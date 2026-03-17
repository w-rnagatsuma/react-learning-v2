import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpcFetch } from "@/api/trpc/client";
import { tryDevLogin } from "@/api/session/devMockAuth";

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
      if (tryDevLogin(input.email, input.password)) {
        return { success: true };
      }

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