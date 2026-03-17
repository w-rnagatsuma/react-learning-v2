import { useMutation, useQueryClient } from "@tanstack/react-query";
import { devMockServiceDb } from "@/api/services/devMockServiceDb";

type ExecuteServiceInput = {
  serviceId: string;
  executedByUserId: string;
  executedByName: string;
};

export function useExecuteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ExecuteServiceInput) => {
      return devMockServiceDb.executeService(input);
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["services", "list"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["serviceSessions", variables.serviceId],
      });
    },
  });
}
