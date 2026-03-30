import { CalendarIcon } from "lucide-react";
import { ListFiltersBar } from "@/components/listing/ListFiltersBar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  toDateLabel,
  toDateObject,
  type ServiceFilters,
} from "@/pages/services/servicesPageUtils";

type ServicesFiltersBarProps = {
  filterState: {
    keyword: string;
    isFilterPopoverOpen: boolean;
    appliedFilterCount: number;
    unappliedDraftCount: number;
    categories: string[];
    owners: string[];
    draftFilters: ServiceFilters;
  };
  filterActions: {
    handleKeywordChange: (value: string) => void;
    setIsFilterPopoverOpen: (open: boolean) => void;
    handleToggleDraftValue: (key: "categories" | "owners", value: string) => void;
    handleDraftExecutedFromChange: (date: Date | undefined) => void;
    handleDraftExecutedToChange: (date: Date | undefined) => void;
    handleResetDraftFilters: () => void;
    handleApplyDraftFilters: () => void;
    handleResetAppliedFilters: () => void;
  };
};

export function ServicesFiltersBar({
  filterState,
  filterActions,
}: ServicesFiltersBarProps) {
  const { keyword, isFilterPopoverOpen, appliedFilterCount, unappliedDraftCount, categories, owners, draftFilters } =
    filterState;
  const {
    handleKeywordChange,
    setIsFilterPopoverOpen,
    handleToggleDraftValue,
    handleDraftExecutedFromChange,
    handleDraftExecutedToChange,
    handleResetDraftFilters,
    handleApplyDraftFilters,
    handleResetAppliedFilters,
  } = filterActions;

  return (
    <ListFiltersBar
      keyword={keyword}
      onKeywordChange={handleKeywordChange}
      keywordAriaLabel="サービス一覧のテキスト検索"
      isFilterPopoverOpen={isFilterPopoverOpen}
      onFilterPopoverOpenChange={setIsFilterPopoverOpen}
      appliedFilterCount={appliedFilterCount}
      unappliedDraftCount={unappliedDraftCount}
      onResetDraftFilters={handleResetDraftFilters}
      onApplyDraftFilters={handleApplyDraftFilters}
      onResetAppliedFilters={handleResetAppliedFilters}
    >
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
                      onSelect={handleDraftExecutedFromChange}
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
                      onSelect={handleDraftExecutedToChange}
                    />
                  </PopoverContent>
                </Popover>
              </div>
      </div>
    </ListFiltersBar>
  );
}
