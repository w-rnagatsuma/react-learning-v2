import { useQuery } from "@tanstack/react-query";
import { trpcFetch } from "@/api/trpc/client";
import {
  devMockServiceDb,
  type ServiceRecord,
} from "@/api/services/devMockServiceDb";

export type Service = ServiceRecord;

type ServicesResponse = {
  services: Service[];
};

export function useServices() {
  return useQuery({
    queryKey: ["services", "list"],
    queryFn: async () => {
      try {
        return await trpcFetch<ServicesResponse>("services.list");
      } catch {
        return { services: devMockServiceDb.listServices() };
      }
    },
  });
}
