import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/api/session/useSession";

export function useRequireAuth() {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated } = useSession();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  return { isLoading, isAuthenticated };
}