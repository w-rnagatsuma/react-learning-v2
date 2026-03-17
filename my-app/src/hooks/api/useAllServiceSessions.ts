import { useQuery } from "@tanstack/react-query";
import {
  devMockServiceDb,
  type ServiceSessionRecord,
} from "@/api/services/devMockServiceDb";

export type ServiceSession = ServiceSessionRecord;

export function useAllServiceSessions() {
  return useQuery({
    queryKey: ["serviceSessions", "all"],
    queryFn: async () => {
      return {
        sessions: devMockServiceDb.listAllServiceSessions(),
      };
    },
  });
}
