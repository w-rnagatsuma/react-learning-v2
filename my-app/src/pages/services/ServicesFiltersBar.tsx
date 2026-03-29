import { CalendarIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  toDateLabel,
  toDateObject,
  type ServiceFilters,
} from "@/pages/services/servicesPageUtils";

type ServicesFiltersBarProps = {
  keyword: string;
  onKeywordChange: (value: string) => void;
  isFilterPopoverOpen: boolean;
  onFilterPopoverOpenChange: (open: boolean) => void;
  appliedFilterCount: number;
  unappliedDraftCount: number;
  categories: string[];
  owners: string[];
  draftFilters: ServiceFilters;
  onToggleDraftValue: (key: "categories" | "owners", value: string) => void;
  onDraftExecutedFromChange: (date: Date | undefined) => void;
  onDraftExecutedToChange: (date: Date | undefined) => void;
  onResetDraftFilters: () => void;
  onApplyDraftFilters: () => void;
  onResetAppliedFilters: () => void;
};

export function ServicesFiltersBar({
  keyword,
  onKeywordChange,
  isFilterPopoverOpen,
  onFilterPopoverOpenChange,
  appliedFilterCount,
  unappliedDraftCount,
  categories,
  owners,
  draftFilters,
  onToggleDraftValue,
  onDraftExecutedFromChange,
  onDraftExecutedToChange,
  onResetDraftFilters,
  onApplyDraftFilters,
  onResetAppliedFilters,
}: ServicesFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-start justify-end gap-2">
      <div className="w-full min-w-[240px] flex-1 md:max-w-sm">
        <InputGroup>
          <InputGroupAddon>
            <Search className="size-4" aria-hidden="true" />
          </InputGroupAddon>
          <Input
            value={keyword}
            onChange={(event) => {
              onKeywordChange(event.target.value);
            }}
            placeholder="テキスト検索 (部分一致)"
            className="pl-8"
            aria-label="サービス一覧のテキスト検索"
          />
        </InputGroup>
      </div>

      <Popover open={isFilterPopoverOpen} onOpenChange={onFilterPopoverOpenChange}>
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
                          onChange={() => onToggleDraftValue("categories", category)}
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
                          onChange={() => onToggleDraftValue("owners", owner)}
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
                      onSelect={onDraftExecutedFromChange}
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
                      onSelect={onDraftExecutedToChange}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t bg-muted/30 p-3">
            <Button type="button" variant="ghost" onClick={onResetDraftFilters}>
              リセット
            </Button>
            <Button type="button" onClick={onApplyDraftFilters} className="relative">
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
        <Button type="button" variant="ghost" onClick={onResetAppliedFilters}>
          リセット
        </Button>
      ) : null}
    </div>
  );
}
