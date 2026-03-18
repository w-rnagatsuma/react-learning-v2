export type ServiceRecord = {
  id: string;
  name: string;
  description: string;
  category: string;
  owner: string;
  updatedAt: string;
};

export type ServiceSessionRecord = {
  id: string;
  serviceId: string;
  executedByUserId: string;
  executedByName: string;
  executedAt: string;
  result: "success";
};

export type RecentServiceExecutionRecord = {
  serviceId: string;
  serviceName: string;
  category: string;
  lastExecutedAt: string;
  lastExecutedByName: string;
  totalExecutions: number;
};

const DEV_SERVICE_TABLE_KEY = "dev_mock_service_table";
const DEV_SERVICE_SESSION_TABLE_KEY = "dev_mock_service_session_table";

const initialServiceTable: ServiceRecord[] = [
  {
    id: "svc-001",
    name: "会員管理サービス",
    description: "ユーザー登録・認証・権限管理を行う管理対象サービス。",
    category: "認証",
    owner: "運用チームA",
    updatedAt: "2026-03-15T09:30:00Z",
  },
  {
    id: "svc-002",
    name: "決済連携サービス",
    description: "カード決済・請求処理を管理する管理対象サービス。",
    category: "決済",
    owner: "業務システム部",
    updatedAt: "2026-03-12T15:10:00Z",
  },
  {
    id: "svc-003",
    name: "通知配信サービス",
    description: "メール・Push通知配信を管理する管理対象サービス。",
    category: "コミュニケーション",
    owner: "顧客基盤チーム",
    updatedAt: "2026-03-10T11:45:00Z",
  },
  {
    id: "svc-004",
    name: "監査ログ管理サービス",
    description: "操作履歴・監査ログを一元管理する管理対象サービス。",
    category: "監査",
    owner: "セキュリティ管理室",
    updatedAt: "2026-03-08T08:20:00Z",
  },
];

function isBrowser() {
  return typeof window !== "undefined";
}

function readTable<T>(key: string, fallback: T): T {
  if (!isBrowser()) {
    return fallback;
  }

  const raw = localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

function writeTable<T>(key: string, value: T) {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeUpdatedAt(value: string) {
  // Keep existing ISO datetime values as-is. Legacy date-only values are expanded.
  if (value.includes("T")) {
    return value;
  }

  return `${value}T00:00:00Z`;
}

function getServiceTable() {
  const table = readTable<ServiceRecord[]>(DEV_SERVICE_TABLE_KEY, initialServiceTable);

  if (table.length === 0) {
    writeTable(DEV_SERVICE_TABLE_KEY, initialServiceTable);
    return [...initialServiceTable];
  }

  const normalized = table.map((service) => ({
    ...service,
    updatedAt: normalizeUpdatedAt(service.updatedAt),
  }));

  const hasLegacyValue = normalized.some((service, index) => service.updatedAt !== table[index]?.updatedAt);
  if (hasLegacyValue) {
    writeTable(DEV_SERVICE_TABLE_KEY, normalized);
  }

  return normalized;
}

function setServiceTable(next: ServiceRecord[]) {
  writeTable(DEV_SERVICE_TABLE_KEY, next);
}

function getServiceSessionTable() {
  return readTable<ServiceSessionRecord[]>(DEV_SERVICE_SESSION_TABLE_KEY, []);
}

function setServiceSessionTable(next: ServiceSessionRecord[]) {
  writeTable(DEV_SERVICE_SESSION_TABLE_KEY, next);
}

function createServiceSessionId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `ssn-${timestamp}-${random}`;
}

export const devMockServiceDb = {
  listServices() {
    return [...getServiceTable()];
  },

  getServiceById(serviceId: string) {
    return getServiceTable().find((service) => service.id === serviceId) ?? null;
  },

  listServiceSessions(serviceId: string) {
    return getServiceSessionTable()
      .filter((session) => session.serviceId === serviceId)
      .sort((a, b) => b.executedAt.localeCompare(a.executedAt));
  },

  listAllServiceSessions() {
    return [...getServiceSessionTable()].sort((a, b) => b.executedAt.localeCompare(a.executedAt));
  },

  deleteServiceSession(sessionId: string) {
    const sessions = getServiceSessionTable();
    const target = sessions.find((session) => session.id === sessionId);

    if (!target) {
      return null;
    }

    const nextSessions = sessions.filter((session) => session.id !== sessionId);
    setServiceSessionTable(nextSessions);

    return target;
  },

  listRecentServiceExecutions(limit = 4) {
    const sessions = [...getServiceSessionTable()].sort(
      (a, b) => b.executedAt.localeCompare(a.executedAt),
    );
    const servicesById = new Map(
      getServiceTable().map((service) => [service.id, service] as const),
    );
    const totalExecutionsByServiceId = sessions.reduce((acc, session) => {
      const current = acc.get(session.serviceId) ?? 0;
      acc.set(session.serviceId, current + 1);
      return acc;
    }, new Map<string, number>());
    const recent: RecentServiceExecutionRecord[] = [];
    const seenServiceIds = new Set<string>();

    for (const session of sessions) {
      if (seenServiceIds.has(session.serviceId)) {
        continue;
      }

      const service = servicesById.get(session.serviceId);
      if (!service) {
        continue;
      }

      recent.push({
        serviceId: service.id,
        serviceName: service.name,
        category: service.category,
        lastExecutedAt: session.executedAt,
        lastExecutedByName: session.executedByName,
        totalExecutions: totalExecutionsByServiceId.get(service.id) ?? 1,
      });
      seenServiceIds.add(session.serviceId);

      if (recent.length >= limit) {
        break;
      }
    }

    return recent;
  },

  executeService(input: {
    serviceId: string;
    executedByUserId: string;
    executedByName: string;
  }) {
    const services = getServiceTable();
    const target = services.find((service) => service.id === input.serviceId);

    if (!target) {
      throw new Error("Service not found");
    }

    const now = new Date();
    const executedAt = now.toISOString();
    const serviceSession: ServiceSessionRecord = {
      id: createServiceSessionId(),
      serviceId: input.serviceId,
      executedByUserId: input.executedByUserId,
      executedByName: input.executedByName,
      executedAt,
      result: "success",
    };

    setServiceSessionTable([serviceSession, ...getServiceSessionTable()]);

    const nextServices = services.map((service) => {
      if (service.id !== input.serviceId) {
        return service;
      }

      return {
        ...service,
        updatedAt: executedAt,
      };
    });

    setServiceTable(nextServices);

    return serviceSession;
  },
};
