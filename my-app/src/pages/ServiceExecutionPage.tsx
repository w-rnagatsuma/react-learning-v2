import { useEffect, useMemo, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useSession } from "@/api/session/SessionContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useServices } from "@/hooks/api/useServices";
import { useServiceSessions, type ServiceSession } from "@/hooks/api/useServiceSessions";
import { useExecuteService } from "@/hooks/api/useExecuteService";

function readRestoredSession(executionToken: string | null): ServiceSession | null {
  if (!executionToken) {
    return null;
  }

  const resultKey = `service_execute_result_${executionToken}`;
  const raw = sessionStorage.getItem(resultKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ServiceSession;
  } catch {
    sessionStorage.removeItem(resultKey);
    return null;
  }
}

function readExecutionGuard(executionToken: string | null): "inflight" | "done" | null {
  if (!executionToken) {
    return null;
  }

  const guardKey = `service_execute_once_${executionToken}`;
  const guard = sessionStorage.getItem(guardKey);
  if (guard === "inflight" || guard === "done") {
    return guard;
  }

  return null;
}

export function ServiceExecutionPage() {
  const { isLoading: isAuthLoading, isAuthenticated } = useRequireAuth();
  const { serviceId } = useParams<{ serviceId: string }>();
  const [searchParams] = useSearchParams();
  const executionToken = searchParams.get("executionToken");
  const { user } = useSession();
  const { data: servicesData, isLoading: isServicesLoading } = useServices();
  const { data: sessionsData, isLoading: isSessionsLoading } = useServiceSessions(serviceId);
  const { mutateAsync, data: createdSession, isPending, isSuccess, isError } = useExecuteService();
  const executionLockRef = useRef<string | null>(null);

  const service = servicesData?.services.find((item) => item.id === serviceId);
  const sessions = sessionsData?.sessions ?? [];
  const restoredSession = useMemo(() => readRestoredSession(executionToken), [executionToken]);
  const executionGuard = readExecutionGuard(executionToken);
  const isExecutionGuardLoading = Boolean(executionToken) && executionGuard !== "done" && !isError;
  const displayedSession = createdSession ?? restoredSession;

  useEffect(() => {
    executionLockRef.current = null;
  }, [executionToken]);

  useEffect(() => {
    if (!serviceId || !service || !user || !executionToken || restoredSession) {
      return;
    }

    const guardKey = `service_execute_once_${executionToken}`;
    const resultKey = `service_execute_result_${executionToken}`;
    if (executionGuard || executionLockRef.current === executionToken) {
      return;
    }

    executionLockRef.current = executionToken;
    sessionStorage.setItem(guardKey, "inflight");

    mutateAsync({
      serviceId,
      executedByUserId: user.id,
      executedByName: user.name,
    })
      .then((result) => {
        sessionStorage.setItem(resultKey, JSON.stringify(result));
        sessionStorage.setItem(guardKey, "done");
      })
      .catch(() => {
        sessionStorage.removeItem(guardKey);
        executionLockRef.current = null;
      });
  }, [executionGuard, executionToken, mutateAsync, restoredSession, service, serviceId, user]);

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

          {isExecutionGuardLoading ? (
            <p className="text-xs text-muted-foreground">executeService の完了を待機中です...</p>
          ) : null}

          {executionToken && isSuccess ? (
            <p className="text-xs text-emerald-700">service_session に実行履歴を追加しました。</p>
          ) : null}

          {executionToken && !isPending && !isError && restoredSession && !isSuccess ? (
            <p className="text-xs text-emerald-700">同一セッションで作成した情報を復元しました。</p>
          ) : null}

          {executionToken && displayedSession ? (
            <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs">
              <p className="font-semibold text-emerald-800">今回作成した情報</p>
              <p className="mt-1 text-emerald-900">
                session_id: <span className="font-mono">{displayedSession.id}</span>
              </p>
              <p className="text-emerald-900">
                service_id: <span className="font-mono">{displayedSession.serviceId}</span>
              </p>
              <p className="text-emerald-900">executed_by: {displayedSession.executedByName}</p>
              <p className="text-emerald-900">
                executed_at: {new Date(displayedSession.executedAt).toLocaleString("ja-JP")}
              </p>
              <p className="text-emerald-900">result: {displayedSession.result}</p>
            </div>
          ) : null}

          {executionToken && isError ? (
            <p className="text-xs text-destructive">実行に失敗しました。再実行は一覧画面の「実行」から行ってください。</p>
          ) : null}

          {executionToken && !isPending && !isError && !isSuccess && executionGuard === "done" ? (
            <p className="text-xs text-muted-foreground">この executionToken は既に実行済みです。</p>
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
