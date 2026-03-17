import { useParams } from "react-router-dom";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export function ServiceExecutionPage() {
  const { isLoading: isAuthLoading, isAuthenticated } = useRequireAuth();
  const { serviceId } = useParams<{ serviceId: string }>();

  if (isAuthLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">サービス実行画面</h1>
      <p className="text-sm text-muted-foreground">
        対象サービスID: <span className="font-mono">{serviceId}</span>
      </p>
      <p className="text-sm text-muted-foreground">
        ここにサービス固有の実行UIを実装してください。
      </p>
    </div>
  );
}
