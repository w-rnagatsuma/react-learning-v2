import { useMemo } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useServices } from "@/hooks/api/useServices";
import { ServicesFiltersBar } from "@/pages/services/ServicesFiltersBar";
import { ServicesPagination } from "@/pages/services/ServicesPagination";
import { ServicesTable } from "@/pages/services/ServicesTable";
import { PAGE_SIZE_OPTIONS } from "@/pages/services/servicesPageUtils";
import { useServicesPageState } from "@/pages/services/useServicesPageState";

export function ServicesPage() {
  const { isLoading: isAuthLoading, isAuthenticated } = useRequireAuth();
  const { data, isLoading, isError } = useServices();
  const services = useMemo(() => data?.services ?? [], [data?.services]);
  const {
    categories,
    owners,
    keyword,
    handleKeywordChange,
    isFilterPopoverOpen,
    setIsFilterPopoverOpen,
    draftFilters,
    appliedFilterCount,
    unappliedDraftCount,
    handleToggleDraftValue,
    handleDraftExecutedFromChange,
    handleDraftExecutedToChange,
    handleResetDraftFilters,
    handleApplyDraftFilters,
    handleResetAppliedFilters,
    sortIndicator,
    handleSort,
    pageSize,
    handlePageSizeChange,
    totalPages,
    currentPage,
    pagedServices,
    sortedServices,
    goToPrevPage,
    goToNextPage,
    goToPage,
    handleExecuteService,
  } = useServicesPageState(services);

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

      <ServicesFiltersBar
        keyword={keyword}
        onKeywordChange={handleKeywordChange}
        isFilterPopoverOpen={isFilterPopoverOpen}
        onFilterPopoverOpenChange={setIsFilterPopoverOpen}
        appliedFilterCount={appliedFilterCount}
        unappliedDraftCount={unappliedDraftCount}
        categories={categories}
        owners={owners}
        draftFilters={draftFilters}
        onToggleDraftValue={handleToggleDraftValue}
        onDraftExecutedFromChange={handleDraftExecutedFromChange}
        onDraftExecutedToChange={handleDraftExecutedToChange}
        onResetDraftFilters={handleResetDraftFilters}
        onApplyDraftFilters={handleApplyDraftFilters}
        onResetAppliedFilters={handleResetAppliedFilters}
      />

      <ServicesTable
        services={pagedServices}
        onSort={handleSort}
        sortIndicator={sortIndicator}
        onExecuteService={handleExecuteService}
      />

      {!isLoading && !isError ? (
        <ServicesPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevPage={goToPrevPage}
          onNextPage={goToNextPage}
          onGoToPage={goToPage}
        />
      ) : null}
    </div>
  );
}
