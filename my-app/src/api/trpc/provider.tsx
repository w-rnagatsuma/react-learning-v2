import { QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useState } from "react";
import { reactQueryClient } from "./reactQueryClient";
import { trpcClient } from "./client";
// 新しい tanstack integration を使う場合の構成は BFF 側の型共有方式に応じて少し変わるため、
// まずは provider の責務を分離しておく

export function AppQueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => reactQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}