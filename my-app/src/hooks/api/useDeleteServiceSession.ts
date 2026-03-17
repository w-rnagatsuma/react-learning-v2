import { useMutation, useQueryClient } from "@tanstack/react-query";
import { devMockServiceDb } from "@/api/services/devMockServiceDb";

export function useDeleteServiceSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      return devMockServiceDb.deleteServiceSession(sessionId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["serviceSessions"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["services", "recentExecutions"],
      });
    },
  });
}
