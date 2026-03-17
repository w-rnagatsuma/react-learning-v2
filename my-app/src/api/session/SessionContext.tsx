import { createContext, useContext } from "react";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

export type SessionContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: SessionUser | null;
};

export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return context;
}