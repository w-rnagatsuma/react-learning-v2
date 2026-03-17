import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpcClient } from "@/api/trpc/client";

type Input = {
  displayName: string;
};

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Input) => {
      return await trpcClient.user.updateProfile.mutate(input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["auth", "me"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["user", "profile"],
      });
    },
  });
}