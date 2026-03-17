import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpcFetch } from "@/api/trpc/client";

type UpdateProfileInput = {
  displayName: string;
};

type UpdateProfileResponse = {
  success: boolean;
};

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      return trpcFetch<UpdateProfileResponse>("user.updateProfile", {
        method: "POST",
        body: JSON.stringify(input),
      });
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