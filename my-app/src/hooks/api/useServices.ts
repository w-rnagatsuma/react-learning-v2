import { useQuery } from "@tanstack/react-query";
import { trpcFetch } from "@/api/trpc/client";

export type Service = {
  id: string;
  name: string;
  description: string;
  category: string;
  owner: string;
  status: "稼働中" | "メンテナンス" | "停止中";
  updatedAt: string;
};

type ServicesResponse = {
  services: Service[];
};

const devServices: Service[] = [
  {
    id: "svc-001",
    name: "会員管理サービス",
    description: "ユーザー登録・認証・権限管理を行う管理対象サービス。",
    category: "認証",
    owner: "運用チームA",
    status: "稼働中",
    updatedAt: "2026-03-15",
  },
  {
    id: "svc-002",
    name: "決済連携サービス",
    description: "カード決済・請求処理を管理する管理対象サービス。",
    category: "決済",
    owner: "業務システム部",
    status: "メンテナンス",
    updatedAt: "2026-03-12",
  },
  {
    id: "svc-003",
    name: "通知配信サービス",
    description: "メール・Push通知配信を管理する管理対象サービス。",
    category: "コミュニケーション",
    owner: "顧客基盤チーム",
    status: "稼働中",
    updatedAt: "2026-03-10",
  },
  {
    id: "svc-004",
    name: "監査ログ管理サービス",
    description: "操作履歴・監査ログを一元管理する管理対象サービス。",
    category: "監査",
    owner: "セキュリティ管理室",
    status: "停止中",
    updatedAt: "2026-03-08",
  },
];

export function useServices() {
  return useQuery({
    queryKey: ["services", "list"],
    queryFn: async () => {
      try {
        return await trpcFetch<ServicesResponse>("services.list");
      } catch {
        return { services: devServices };
      }
    },
  });
}
