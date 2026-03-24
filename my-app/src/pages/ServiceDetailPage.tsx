import { useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useServices } from "@/hooks/api/useServices";
import { useServiceSessions } from "@/hooks/api/useServiceSessions";

export function ServiceDetailPage() {
  const { isLoading: isAuthLoading, isAuthenticated } = useRequireAuth();
  const { serviceId } = useParams<{ serviceId: string }>();
  const { data: servicesData, isLoading: isServicesLoading } = useServices();
  const { data: sessionsData, isLoading: isSessionsLoading } = useServiceSessions(serviceId);

  const service = servicesData?.services.find((item) => item.id === serviceId);
  const sessions = sessionsData?.sessions ?? [];

  const createExecutionPath = useCallback((targetServiceId: string) => {
    const executionToken =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return `/services/${encodeURIComponent(targetServiceId)}/execute?executionToken=${encodeURIComponent(executionToken)}`;
  }, []);

  const handleExecuteService = useCallback((targetServiceId: string) => {
    const executionPath = createExecutionPath(targetServiceId);
    const executionUrl = new URL(executionPath, window.location.origin).toString();
    const windowFeatures = [
      "popup=yes",
      "width=1280",
      "height=860",
      "left=120",
      "top=80",
      "noopener",
      "noreferrer",
    ].join(",");

    window.open(executionUrl, `_service_execute_${encodeURIComponent(targetServiceId)}`, windowFeatures);
  }, [createExecutionPath]);

  if (isAuthLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">サービス詳細</h1>
          <p className="text-sm text-muted-foreground">
            サービスIDごとの基本情報と最新の実行履歴を確認できます。
          </p>
        </div>

        <Button asChild type="button" variant="outline" size="sm">
          <Link to="/services">一覧に戻る</Link>
        </Button>
      </div>

      {isServicesLoading ? <p className="text-sm text-muted-foreground">サービス情報を読み込み中です...</p> : null}

      {!isServicesLoading && !service ? (
        <div className="rounded-md border bg-muted/20 p-4 text-sm text-destructive">
          指定されたサービスが見つかりませんでした。
        </div>
      ) : null}

      {service ? (
        <section className="space-y-3 rounded-md border bg-background p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-1">
              <p className="font-mono text-xs text-muted-foreground">{service.id}</p>
              <h2 className="text-lg font-semibold">{service.name}</h2>
            </div>
            <Button type="button" size="sm" variant="secondary" onClick={() => handleExecuteService(service.id)}>
              実行
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">{service.description}</p>

          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="rounded-md border bg-muted/20 p-2.5">
              <dt className="text-xs text-muted-foreground">カテゴリ</dt>
              <dd className="mt-1 font-medium">{service.category}</dd>
            </div>
            <div className="rounded-md border bg-muted/20 p-2.5">
              <dt className="text-xs text-muted-foreground">担当</dt>
              <dd className="mt-1 font-medium">{service.owner}</dd>
            </div>
            <div className="rounded-md border bg-muted/20 p-2.5">
              <dt className="text-xs text-muted-foreground">最終実行日時</dt>
              <dd className="mt-1 font-medium">
                {service.lastExecutedAt
                  ? new Date(service.lastExecutedAt).toLocaleString("ja-JP")
                  : "未実行"}
              </dd>
            </div>
            <div className="rounded-md border bg-muted/20 p-2.5">
              <dt className="text-xs text-muted-foreground">累計実行回数</dt>
              <dd className="mt-1 font-medium">{service.totalExecutions ?? 0}回</dd>
            </div>
          </dl>
        </section>
      ) : null}

      <section className="space-y-2 rounded-md border bg-background p-4">
        <h2 className="text-base font-semibold">直近の実行履歴</h2>

        {isSessionsLoading ? (
          <p className="text-sm text-muted-foreground">実行履歴を読み込み中です...</p>
        ) : null}

        {!isSessionsLoading && sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">まだ実行履歴はありません。</p>
        ) : null}

        {sessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">session_id</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">executed_by</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">executed_at</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">result</th>
                </tr>
              </thead>
              <tbody>
                {sessions.slice(0, 10).map((session) => (
                  <tr key={session.id} className="border-t">
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{session.id}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                      {session.executedByName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                      {new Date(session.executedAt).toLocaleString("ja-JP")}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-emerald-700">{session.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
