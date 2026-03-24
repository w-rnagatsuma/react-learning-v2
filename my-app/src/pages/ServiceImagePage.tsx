import { useParams } from "react-router-dom";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export function ServiceImagePage() {
  const { isLoading, isAuthenticated } = useRequireAuth();
  const { serviceId } = useParams<{ serviceId: string }>();

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-2 p-6">
      <h1 className="text-2xl font-bold">イメージ</h1>
      <p className="text-sm text-muted-foreground">ダミー画面です。</p>
      <p className="font-mono text-xs">serviceId: {serviceId}</p>
    </div>
  );
}
