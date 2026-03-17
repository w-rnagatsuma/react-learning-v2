import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useSession } from "@/api/session/SessionContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useServices } from "@/hooks/api/useServices";
import { useServiceSessions } from "@/hooks/api/useServiceSessions";
import { useExecuteService } from "@/hooks/api/useExecuteService";

export function ServiceExecutionPage() {
  const { isLoading: isAuthLoading, isAuthenticated } = useRequireAuth();
  const { serviceId } = useParams<{ serviceId: string }>();
  const [searchParams] = useSearchParams();
  const executionToken = searchParams.get("executionToken");
  const { user } = useSession();
  const { data: servicesData, isLoading: isServicesLoading } = useServices();
  const { data: sessionsData, isLoading: isSessionsLoading } = useServiceSessions(serviceId);
  const { mutateAsync, isPending, isSuccess, isError } = useExecuteService();

  const service = servicesData?.services.find((item) => item.id === serviceId);
  const sessions = sessionsData?.sessions ?? [];

  useEffect(() => {
    if (!serviceId || !service || !user || !executionToken) {
      return;
    }

    const guardKey = `service_execute_once_${executionToken}`;
    const guard = sessionStorage.getItem(guardKey);
    if (guard === "inflight" || guard === "done") {
      return;
    }

    sessionStorage.setItem(guardKey, "inflight");

    mutateAsync({
      serviceId,
      executedByUserId: user.id,
      executedByName: user.name,
    })
      .then(() => {
        sessionStorage.setItem(guardKey, "done");
      })
      .catch(() => {
        sessionStorage.removeItem(guardKey);
      });
  }, [executionToken, mutateAsync, service, serviceId, user]);

  if (isAuthLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">サービス実行画面</h1>

      <div className="rounded-md border bg-muted/20 p-4 text-sm">
        <p className="text-muted-foreground">
          対象サービスID: <span className="font-mono">{serviceId}</span>
        </p>
        <p className="mt-1 font-medium">{service?.name ?? "サービス情報を確認中"}</p>
        <p className="mt-1 text-muted-foreground">実行者: {user?.name ?? "-"}</p>

        <div className="mt-3">
          {!executionToken ? (
            <p className="text-xs text-muted-foreground">
              サービス一覧の「実行」から開いたときに、自動で executeService を実行します。
            </p>
          ) : null}

          {isPending ? (
            <p className="text-xs text-muted-foreground">executeService を実行中です...</p>
          ) : null}

          {executionToken && isSuccess ? (
            <p className="text-xs text-emerald-700">service_session に実行履歴を追加しました。</p>
          ) : null}

          {executionToken && isError ? (
            <p className="text-xs text-destructive">実行に失敗しました。再実行は一覧画面の「実行」から行ってください。</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2 rounded-md border bg-background p-4">
        <h2 className="text-base font-semibold">service_session</h2>

        {isServicesLoading || isSessionsLoading ? (
          <p className="text-sm text-muted-foreground">履歴を読み込み中です...</p>
        ) : null}

        {!isServicesLoading && !service ? (
          <p className="text-sm text-destructive">対象サービスが見つかりません。</p>
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
                  <th className="whitespace-nowrap px-3 py-2 font-medium">service_id</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">executed_by</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">executed_at</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">result</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-t">
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{session.id}</td>
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-muted-foreground">
                      {session.serviceId}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                      {session.executedByName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                      {new Date(session.executedAt).toLocaleString("ja-JP")}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-emerald-700">
                      {session.result}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
