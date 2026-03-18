import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DEV_SERVICE_DB_SYNC_KEY,
  devMockServiceDb,
  type RecentServiceExecutionRecord,
} from "@/api/services/devMockServiceDb";

export type RecentServiceExecution = RecentServiceExecutionRecord;

export function useRecentServiceExecutions(limit = 4) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["services", "recentExecutions", limit],
    queryFn: async () => {
      return {
        recentExecutions: devMockServiceDb.listRecentServiceExecutions(limit),
      };
    },
  });

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== DEV_SERVICE_DB_SYNC_KEY) {
        return;
      }

      queryClient.invalidateQueries({
        queryKey: ["services", "recentExecutions"],
      });
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [queryClient]);

  return query;
}
