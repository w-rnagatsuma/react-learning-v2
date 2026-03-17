import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useRecentServiceExecutions } from "@/hooks/api/useRecentServiceExecutions";
import { useServices } from "@/hooks/api/useServices";
import { useAllServiceSessions } from "@/hooks/api/useAllServiceSessions";
import { useDeleteServiceSession } from "@/hooks/api/useDeleteServiceSession";

export function ServiceManagementPage() {
  const { isLoading: isAuthLoading, isAuthenticated } = useRequireAuth();
  const { data: servicesData } = useServices();
  const {
    data: sessionsData,
    isLoading: isSessionsLoading,
    isError: isSessionsError,
  } = useAllServiceSessions();
  const {
    data: recentExecutionsData,
    isLoading: isRecentExecutionsLoading,
    isError: isRecentExecutionsError,
  } = useRecentServiceExecutions(8);
  const deleteServiceSessionMutation = useDeleteServiceSession();

  const allSessions = useMemo(() => sessionsData?.sessions ?? [], [sessionsData?.sessions]);
  const servicesById = useMemo(
    () => new Map((servicesData?.services ?? []).map((service) => [service.id, service] as const)),
    [servicesData?.services],
  );

  const recentExecutions = useMemo(
    () => recentExecutionsData?.recentExecutions ?? [],
    [recentExecutionsData?.recentExecutions],
  );

  const createExecutionPath = useCallback((serviceId: string) => {
    const executionToken =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return `/services/${encodeURIComponent(serviceId)}/execute?executionToken=${encodeURIComponent(executionToken)}`;
  }, []);

  const handleExecuteService = useCallback((serviceId: string) => {
    const executionPath = createExecutionPath(serviceId);
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

    window.open(executionUrl, `_service_execute_${encodeURIComponent(serviceId)}`, windowFeatures);
  }, [createExecutionPath]);

  if (isAuthLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-4 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">サービス管理</h1>
        <p className="text-sm text-muted-foreground">
          最近実行したサービスをカード形式で確認できます。
        </p>
      </div>

      <section className="space-y-3 rounded-md border bg-gradient-to-r from-sky-50 via-blue-50 to-cyan-50 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">最近実行したサービス</h2>
          <p className="text-xs text-slate-600">最新8件（サービス単位）</p>
        </div>

        {isRecentExecutionsLoading ? (
          <p className="text-sm text-slate-600">最近の実行履歴を読み込み中です...</p>
        ) : null}

        {isRecentExecutionsError ? (
          <p className="text-sm text-destructive">最近の実行履歴の取得に失敗しました。</p>
        ) : null}

        {!isRecentExecutionsLoading && !isRecentExecutionsError && recentExecutions.length === 0 ? (
          <p className="text-sm text-slate-600">まだ実行されたサービスはありません。</p>
        ) : null}

        {recentExecutions.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {recentExecutions.map((recent) => (
              <Card
                key={recent.serviceId}
                className="border border-sky-200/70 bg-white/90 transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardHeader className="space-y-1">
                  <CardDescription className="text-xs text-slate-500">{recent.serviceId}</CardDescription>
                  <CardTitle className="text-sm font-semibold text-slate-900">{recent.serviceName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 text-xs text-slate-700">
                  <p>カテゴリ: {recent.category}</p>
                  <p>最終実行者: {recent.lastExecutedByName}</p>
                  <p>最終実行: {new Date(recent.lastExecutedAt).toLocaleString("ja-JP")}</p>
                  <p className="font-medium text-sky-700">累計実行回数: {recent.totalExecutions}回</p>
                  <div className="pt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => handleExecuteService(recent.serviceId)}
                    >
                      実行
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </section>

      <section className="space-y-3 rounded-md border bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">セッション一覧</h2>
          <p className="text-xs text-slate-600">最新順</p>
        </div>

        {isSessionsLoading ? (
          <p className="text-sm text-slate-600">セッション一覧を読み込み中です...</p>
        ) : null}

        {isSessionsError ? (
          <p className="text-sm text-destructive">セッション一覧の取得に失敗しました。</p>
        ) : null}

        {deleteServiceSessionMutation.isError ? (
          <p className="text-sm text-destructive">セッションの削除に失敗しました。</p>
        ) : null}

        {!isSessionsLoading && !isSessionsError && allSessions.length === 0 ? (
          <p className="text-sm text-slate-600">表示できるセッションはありません。</p>
        ) : null}

        {!isSessionsLoading && !isSessionsError && allSessions.length > 0 ? (
          <div className="overflow-x-auto rounded-md border bg-background">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">セッションID</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">サービス名</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">サービスID</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">実行者</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">実行日時</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">削除</th>
                </tr>
              </thead>
              <tbody>
                {allSessions.map((session, index) => (
                  <tr
                    key={session.id}
                    className={index % 2 === 0 ? "border-t bg-background" : "border-t bg-muted/10"}
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                      {session.id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium">
                      {servicesById.get(session.serviceId)?.name ?? "不明なサービス"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{session.serviceId}</td>
                    <td className="whitespace-nowrap px-4 py-3">{session.executedByName}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {new Date(session.executedAt).toLocaleString("ja-JP")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={
                          deleteServiceSessionMutation.isPending &&
                          deleteServiceSessionMutation.variables === session.id
                        }
                        onClick={() => {
                          deleteServiceSessionMutation.mutate(session.id);
                        }}
                      >
                        {deleteServiceSessionMutation.isPending &&
                        deleteServiceSessionMutation.variables === session.id
                          ? "削除中..."
                          : "削除"}
                      </Button>
                    </td>
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
