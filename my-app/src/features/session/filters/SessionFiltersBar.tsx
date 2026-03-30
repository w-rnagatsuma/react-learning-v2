import { FilterBarShell } from "@/components/filters/FilterBarShell";

type SessionFiltersState = {
  keyword: string;
  isFilterPopoverOpen: boolean;
  appliedFilterCount: number;
  unappliedDraftCount: number;
  serviceIdOptions: string[];
  executorOptions: string[];
  draftServiceIds: string[];
  draftExecutors: string[];
};

type SessionFiltersActions = {
  onKeywordChange: (value: string) => void;
  onFilterPopoverOpenChange: (open: boolean) => void;
  onResetDraftFilters: () => void;
  onApplyDraftFilters: () => void;
  onResetAppliedFilters: () => void;
  onToggleDraftServiceId: (serviceId: string) => void;
  onToggleDraftExecutor: (executor: string) => void;
};

type SessionFiltersBarProps = {
  filterState: SessionFiltersState;
  filterActions: SessionFiltersActions;
};

export function SessionFiltersBar({ filterState, filterActions }: SessionFiltersBarProps) {
  const {
    keyword,
    isFilterPopoverOpen,
    appliedFilterCount,
    unappliedDraftCount,
    serviceIdOptions,
    executorOptions,
    draftServiceIds,
    draftExecutors,
  } = filterState;
  const {
    onKeywordChange,
    onFilterPopoverOpenChange,
    onResetDraftFilters,
    onApplyDraftFilters,
    onResetAppliedFilters,
    onToggleDraftServiceId,
    onToggleDraftExecutor,
  } = filterActions;

  return (
    <FilterBarShell
      keyword={keyword}
      onKeywordChange={onKeywordChange}
      keywordAriaLabel="セッション一覧のテキスト検索"
      isFilterPopoverOpen={isFilterPopoverOpen}
      onFilterPopoverOpenChange={onFilterPopoverOpenChange}
      appliedFilterCount={appliedFilterCount}
      unappliedDraftCount={unappliedDraftCount}
      onResetDraftFilters={onResetDraftFilters}
      onApplyDraftFilters={onApplyDraftFilters}
      onResetAppliedFilters={onResetAppliedFilters}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-muted-foreground">サービスID</p>
            {draftServiceIds.length > 0 ? (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-sky-100 px-1.5 text-[11px] font-semibold text-sky-700">
                {draftServiceIds.length}
              </span>
            ) : null}
          </div>
          <div className="max-h-36 space-y-1 overflow-y-auto rounded-lg border bg-background p-2">
            {serviceIdOptions.map((serviceId) => {
              const checked = draftServiceIds.includes(serviceId);

              return (
                <label key={serviceId} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      onToggleDraftServiceId(serviceId);
                    }}
                    className="size-4 rounded border-input text-sky-600 focus-visible:ring-2 focus-visible:ring-ring/50"
                  />
                  <span>{serviceId}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-muted-foreground">実行者</p>
            {draftExecutors.length > 0 ? (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-sky-100 px-1.5 text-[11px] font-semibold text-sky-700">
                {draftExecutors.length}
              </span>
            ) : null}
          </div>
          <div className="max-h-36 space-y-1 overflow-y-auto rounded-lg border bg-background p-2">
            {executorOptions.map((executor) => {
              const checked = draftExecutors.includes(executor);

              return (
                <label key={executor} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      onToggleDraftExecutor(executor);
                    }}
                    className="size-4 rounded border-input text-sky-600 focus-visible:ring-2 focus-visible:ring-ring/50"
                  />
                  <span>{executor}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </FilterBarShell>
  );
}
