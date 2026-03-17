import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useServices } from "@/hooks/api/useServices";

type SortKey = "id" | "name" | "category" | "owner" | "status" | "updatedAt";

const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;

export function ServicesPage() {
  const { isLoading: isAuthLoading, isAuthenticated } = useRequireAuth();
  const { data, isLoading, isError } = useServices();
  const services = useMemo(() => data?.services ?? [], [data?.services]);
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);

  const categories = useMemo(
    () => Array.from(new Set(services.map((service) => service.category))).sort(),
    [services],
  );

  const statuses = useMemo(
    () => Array.from(new Set(services.map((service) => service.status))),
    [services],
  );

  const filteredServices = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return services.filter((service) => {
      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        service.id.toLowerCase().includes(normalizedKeyword) ||
        service.name.toLowerCase().includes(normalizedKeyword) ||
        service.description.toLowerCase().includes(normalizedKeyword) ||
        service.owner.toLowerCase().includes(normalizedKeyword);

      const matchesCategory =
        selectedCategory === "all" || service.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "all" || service.status === selectedStatus;

      return matchesKeyword && matchesCategory && matchesStatus;
    });
  }, [services, keyword, selectedCategory, selectedStatus]);

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
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">キーワード</p>
              <Input
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setPage(1);
                }}
                placeholder="ID・サービス名・説明・担当で検索"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">カテゴリ</p>
              <select
                value={selectedCategory}
                onChange={(event) => {
                  setSelectedCategory(event.target.value);
                  setPage(1);
                }}
                className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="all">すべて</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">ステータス</p>
              <select
                value={selectedStatus}
                onChange={(event) => {
                  setSelectedStatus(event.target.value);
                  setPage(1);
                }}
                className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="all">すべて</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
              <th className="whitespace-nowrap px-4 py-3 font-medium">
                <button type="button" onClick={() => handleSort("status")} className="hover:text-foreground">
                  ステータス{sortIndicator("status")}
                </button>
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">
                <button type="button" onClick={() => handleSort("updatedAt")} className="hover:text-foreground">
                  最終更新日{sortIndicator("updatedAt")}
                </button>
              </th>
              <th className="px-4 py-3 font-medium">説明</th>
            </tr>
          </thead>

          <tbody>
            {pagedServices.map((service, index) => (
              <tr
                key={service.id}
                className={index % 2 === 0 ? "border-t bg-background hover:bg-accent/40" : "border-t bg-muted/20 hover:bg-accent/40"}
              >
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">{service.id}</td>
                <td className="whitespace-nowrap px-4 py-3 font-medium">{service.name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{service.category}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{service.owner}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{service.status}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{service.updatedAt}</td>
                <td className="min-w-80 px-4 py-3 text-muted-foreground">{service.description}</td>
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
