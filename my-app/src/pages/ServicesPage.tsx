import { useCallback, useMemo, useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarIcon, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useServices } from "@/hooks/api/useServices";

type SortKey = "id" | "name" | "category" | "owner";

type ServiceFilters = {
  categories: string[];
  owners: string[];
  executedFrom?: string;
  executedTo?: string;
};

const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;

const createEmptyFilters = (): ServiceFilters => ({
  categories: [],
  owners: [],
});

const countActiveFilters = (filters: ServiceFilters) => {
  return (
    filters.categories.length +
    filters.owners.length +
    (filters.executedFrom ? 1 : 0) +
    (filters.executedTo ? 1 : 0)
  );
};

const normalizeDateRange = (filters: ServiceFilters): ServiceFilters => {
  if (filters.executedFrom && filters.executedTo && filters.executedFrom > filters.executedTo) {
    return {
      ...filters,
      executedFrom: filters.executedTo,
      executedTo: filters.executedFrom,
    };
  }

  return filters;
};

const isSameFilterState = (left: ServiceFilters, right: ServiceFilters) => {
  return (
    left.executedFrom === right.executedFrom &&
    left.executedTo === right.executedTo &&
    left.categories.length === right.categories.length &&
    left.owners.length === right.owners.length &&
    left.categories.every((value, index) => value === right.categories[index]) &&
    left.owners.every((value, index) => value === right.owners[index])
  );
};

const toDateValue = (date?: Date) => (date ? format(date, "yyyy-MM-dd") : undefined);

const toDateObject = (value?: string) => {
  if (!value) {
    return undefined;
  }

  return new Date(`${value}T00:00:00`);
};

const toDateLabel = (value?: string) => {
  if (!value) {
    return "日付を選択";
  }

  return format(new Date(`${value}T00:00:00`), "yyyy/MM/dd", { locale: ja });
};

export function ServicesPage() {
  const { isLoading: isAuthLoading, isAuthenticated } = useRequireAuth();
  const { data, isLoading, isError } = useServices();
  const services = useMemo(() => data?.services ?? [], [data?.services]);
  const [keyword, setKeyword] = useState("");
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<ServiceFilters>(() => createEmptyFilters());
  const [draftFilters, setDraftFilters] = useState<ServiceFilters>(() => createEmptyFilters());
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);

  const categories = useMemo(
    () => Array.from(new Set(services.map((service) => service.category))).sort(),
    [services],
  );
  const owners = useMemo(
    () => Array.from(new Set(services.map((service) => service.owner))).sort(),
    [services],
  );

  const appliedFilterCount = useMemo(() => countActiveFilters(appliedFilters), [appliedFilters]);
  const draftFilterCount = useMemo(() => countActiveFilters(draftFilters), [draftFilters]);
  const hasPendingDraft = useMemo(
    () => !isSameFilterState(draftFilters, appliedFilters),
    [draftFilters, appliedFilters],
  );
  const unappliedDraftCount = hasPendingDraft ? draftFilterCount : 0;

  const filteredServices = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    const normalizedFilters = normalizeDateRange(appliedFilters);

    return services.filter((service) => {
      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        service.id.toLowerCase().includes(normalizedKeyword) ||
        service.name.toLowerCase().includes(normalizedKeyword) ||
        service.description.toLowerCase().includes(normalizedKeyword) ||
        service.owner.toLowerCase().includes(normalizedKeyword);

      const matchesCategory =
        normalizedFilters.categories.length === 0 ||
        normalizedFilters.categories.includes(service.category);

      const matchesOwner =
        normalizedFilters.owners.length === 0 ||
        normalizedFilters.owners.includes(service.owner);

      const executedDate = service.lastExecutedAt?.slice(0, 10);
      const matchesExecutedFrom =
        !normalizedFilters.executedFrom ||
        (executedDate ? executedDate >= normalizedFilters.executedFrom : false);
      const matchesExecutedTo =
        !normalizedFilters.executedTo ||
        (executedDate ? executedDate <= normalizedFilters.executedTo : false);

      return (
        matchesKeyword &&
        matchesCategory &&
        matchesOwner &&
        matchesExecutedFrom &&
        matchesExecutedTo
      );
    });
  }, [services, keyword, appliedFilters]);

  const sortedServices = useMemo(() => {
    const sorted = [...filteredServices].sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];
      const compared = String(left).localeCompare(String(right), "ja");
      return sortDir === "asc" ? compared : -compared;
    });

    return sorted;
  }, [filteredServices, sortDir, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedServices.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedServices.slice(startIndex, startIndex + pageSize);
  }, [sortedServices, currentPage, pageSize]);

  const handleSort = (key: SortKey) => {
    setPage(1);
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir("asc");
  };

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) {
      return "";
    }

    return sortDir === "asc" ? " ▲" : " ▼";
  };

  const handlePageSizeChange = (nextPageSize: (typeof PAGE_SIZE_OPTIONS)[number]) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  const handleToggleDraftValue = useCallback(
    (key: "categories" | "owners", value: string) => {
      setDraftFilters((prev) => {
        const hasValue = prev[key].includes(value);
        const nextValues = hasValue
          ? prev[key].filter((item) => item !== value)
          : [...prev[key], value].sort((a, b) => a.localeCompare(b, "ja"));

        return {
          ...prev,
          [key]: nextValues,
        };
      });
    },
    [],
  );

  const handleResetDraftFilters = useCallback(() => {
    setDraftFilters(createEmptyFilters());
  }, []);

  const handleApplyDraftFilters = useCallback(() => {
    const nextApplied = normalizeDateRange(draftFilters);
    setAppliedFilters(nextApplied);
    setDraftFilters(nextApplied);
    setPage(1);
    setIsFilterPopoverOpen(false);
  }, [draftFilters]);

  const handleResetAppliedFilters = useCallback(() => {
    const emptyFilters = createEmptyFilters();
    setAppliedFilters(emptyFilters);
    setDraftFilters(emptyFilters);
    setPage(1);
  }, []);

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
        <h1 className="text-2xl font-bold">管理対象サービス一覧</h1>
        <p className="text-sm text-muted-foreground">
          この管理サイトで運用しているサービスを一覧表示しています。
        </p>
      </div>

      {isLoading ? <p>サービスを読み込み中です...</p> : null}
      {isError ? <p className="text-destructive">サービスの取得に失敗しました。</p> : null}

      {!isLoading && !isError ? (
        <div className="space-y-3 rounded-md border bg-muted/20 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <p>
              全{services.length}件中 {sortedServices.length}件を表示 / {currentPage}ページ目
            </p>

            <div className="flex items-center gap-2">
              <label htmlFor="page-size" className="text-xs font-medium">
                表示件数
              </label>
              <select
                id="page-size"
                value={pageSize}
                onChange={(event) => handlePageSizeChange(Number(event.target.value) as (typeof PAGE_SIZE_OPTIONS)[number])}
                className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}件
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-end gap-2">
        <div className="w-full min-w-[240px] flex-1 md:max-w-sm">
          <InputGroup>
            <InputGroupAddon>
              <Search className="size-4" aria-hidden="true" />
            </InputGroupAddon>
            <Input
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setPage(1);
              }}
              placeholder="テキスト検索 (部分一致)"
              className="pl-8"
              aria-label="サービス一覧のテキスト検索"
            />
          </InputGroup>
        </div>

        <Popover open={isFilterPopoverOpen} onOpenChange={setIsFilterPopoverOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant={appliedFilterCount > 0 ? "default" : "outline"} className="relative">
              フィルター
              {appliedFilterCount > 0 ? (
                <span className="absolute -top-2 -right-2 inline-flex size-5 items-center justify-center rounded-full bg-sky-600 text-[11px] font-semibold text-white">
                  {appliedFilterCount}
                </span>
              ) : null}
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align="end"
            className="w-[min(94vw,720px)] p-0"
            onInteractOutside={(event) => {
              const target = event.target as HTMLElement | null;
              if (target?.closest('[data-slot="popover-content"]')) {
                event.preventDefault();
              }
            }}
          >
            <div className="space-y-4 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-muted-foreground">カテゴリ</p>
                    {draftFilters.categories.length > 0 ? (
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-sky-100 px-1.5 text-[11px] font-semibold text-sky-700">
                        {draftFilters.categories.length}
                      </span>
                    ) : null}
                  </div>
                  <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border bg-background p-2">
                    {categories.map((category) => {
                      const checked = draftFilters.categories.includes(category);
                      return (
                        <label key={category} className="flex cursor-pointer items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleDraftValue("categories", category)}
                            className="size-4 rounded border-input text-sky-600 focus-visible:ring-2 focus-visible:ring-ring/50"
                          />
                          <span>{category}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-muted-foreground">担当</p>
                    {draftFilters.owners.length > 0 ? (
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-sky-100 px-1.5 text-[11px] font-semibold text-sky-700">
                        {draftFilters.owners.length}
                      </span>
                    ) : null}
                  </div>
                  <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border bg-background p-2">
                    {owners.map((owner) => {
                      const checked = draftFilters.owners.includes(owner);
                      return (
                        <label key={owner} className="flex cursor-pointer items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleDraftValue("owners", owner)}
                            className="size-4 rounded border-input text-sky-600 focus-visible:ring-2 focus-visible:ring-ring/50"
                          />
                          <span>{owner}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-muted-foreground">最終実行日 (開始)</p>
                    {draftFilters.executedFrom ? (
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-sky-100 px-1.5 text-[11px] font-semibold text-sky-700">
                        1
                      </span>
                    ) : null}
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" className="w-full justify-between font-normal">
                        {toDateLabel(draftFilters.executedFrom)}
                        <CalendarIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={toDateObject(draftFilters.executedFrom)}
                        onSelect={(date: Date | undefined) => {
                          setDraftFilters((prev) => ({
                            ...prev,
                            executedFrom: toDateValue(date),
                          }));
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-muted-foreground">最終実行日 (終了)</p>
                    {draftFilters.executedTo ? (
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-sky-100 px-1.5 text-[11px] font-semibold text-sky-700">
                        1
                      </span>
                    ) : null}
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" className="w-full justify-between font-normal">
                        {toDateLabel(draftFilters.executedTo)}
                        <CalendarIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={toDateObject(draftFilters.executedTo)}
                        onSelect={(date: Date | undefined) => {
                          setDraftFilters((prev) => ({
                            ...prev,
                            executedTo: toDateValue(date),
                          }));
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t bg-muted/30 p-3">
              <Button type="button" variant="ghost" onClick={handleResetDraftFilters}>
                リセット
              </Button>
              <Button type="button" onClick={handleApplyDraftFilters} className="relative">
                {unappliedDraftCount > 0 ? (
                  <span className="absolute -top-2 -left-2 inline-flex size-5 items-center justify-center rounded-full bg-sky-600 text-[11px] font-semibold text-white">
                    {unappliedDraftCount}
                  </span>
                ) : null}
                適用
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {appliedFilterCount > 0 ? (
          <Button type="button" variant="ghost" onClick={handleResetAppliedFilters}>
            リセット
          </Button>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-md border bg-background">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 font-medium">
                <button type="button" onClick={() => handleSort("id")} className="hover:text-foreground">
                  ID{sortIndicator("id")}
                </button>
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">
                <button type="button" onClick={() => handleSort("name")} className="hover:text-foreground">
                  サービス名{sortIndicator("name")}
                </button>
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">
                <button type="button" onClick={() => handleSort("category")} className="hover:text-foreground">
                  カテゴリ{sortIndicator("category")}
                </button>
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">
                <button type="button" onClick={() => handleSort("owner")} className="hover:text-foreground">
                  担当{sortIndicator("owner")}
                </button>
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">実行</th>
            </tr>
          </thead>

          <tbody>
            {pagedServices.map((service, index) => (
              <tr
                key={service.id}
                className={index % 2 === 0 ? "border-t bg-background hover:bg-accent/40" : "border-t bg-muted/20 hover:bg-accent/40"}
              >
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">
                  <Link
                    to={`/services/${encodeURIComponent(service.id)}`}
                    className="text-sky-700 underline-offset-2 hover:underline"
                  >
                    {service.id}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-medium">{service.name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{service.category}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{service.owner}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => handleExecuteService(service.id)}
                  >
                    実行
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isLoading && !isError ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            前へ
          </Button>

          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNumber) => (
            <Button
              key={pageNumber}
              type="button"
              variant={pageNumber === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            次へ
          </Button>
        </div>
      ) : null}
    </div>
  );
}
