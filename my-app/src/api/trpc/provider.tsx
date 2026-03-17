import { QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { reactQueryClient } from "./reactQueryClient";

export function AppQueryProvider({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={reactQueryClient}>
      {children}
    </QueryClientProvider>
  );
}