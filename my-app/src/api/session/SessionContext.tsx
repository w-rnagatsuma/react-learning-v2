import { createContext, useContext, type PropsWithChildren } from "react";
import { useCurrentUser } from "@/hooks/api/useCurrentUser";

type SessionContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
};

const SessionContext = createContext<SessionContextValue | null>(null);

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

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return context;
}