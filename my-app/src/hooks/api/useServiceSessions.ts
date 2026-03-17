import { useQuery } from "@tanstack/react-query";
import {
  devMockServiceDb,
  type ServiceSessionRecord,
} from "@/api/services/devMockServiceDb";

export type ServiceSession = ServiceSessionRecord;

export function useServiceSessions(serviceId: string | undefined) {
  return useQuery({
    queryKey: ["serviceSessions", serviceId],
    queryFn: async () => {
      if (!serviceId) {
        return { sessions: [] as ServiceSession[] };
      }

      return {
        sessions: devMockServiceDb.listServiceSessions(serviceId),
      };
    },
    enabled: Boolean(serviceId),
  });
}
