import type { PropsWithChildren } from "react";
import { SessionContext, type SessionContextValue } from "./SessionContext";
import { useCurrentUser } from "@/hooks/api/useCurrentUser";

export function SessionProvider({ children }: PropsWithChildren) {
  const { data, isLoading } = useCurrentUser();

  const value: SessionContextValue = {
    isLoading,
    isAuthenticated: !!data?.user,
    user: data?.user ?? null,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}