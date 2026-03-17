import { useQuery } from "@tanstack/react-query";
import {
  devMockServiceDb,
  type RecentServiceExecutionRecord,
} from "@/api/services/devMockServiceDb";

export type RecentServiceExecution = RecentServiceExecutionRecord;

export function useRecentServiceExecutions(limit = 4) {
  return useQuery({
    queryKey: ["services", "recentExecutions", limit],
    queryFn: async () => {
      return {
        recentExecutions: devMockServiceDb.listRecentServiceExecutions(limit),
      };
    },
  });
}
