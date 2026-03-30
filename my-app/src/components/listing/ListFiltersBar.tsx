import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type ListFiltersBarProps = {
  keyword: string;
  onKeywordChange: (value: string) => void;
  isFilterPopoverOpen: boolean;
  onFilterPopoverOpenChange: (open: boolean) => void;
  appliedFilterCount: number;
  unappliedDraftCount: number;
  onResetDraftFilters: () => void;
  onApplyDraftFilters: () => void;
  onResetAppliedFilters: () => void;
  keywordPlaceholder?: string;
  keywordAriaLabel?: string;
  filterButtonLabel?: string;
  children: ReactNode;
};

export function ListFiltersBar({
  keyword,
  onKeywordChange,
  isFilterPopoverOpen,
  onFilterPopoverOpenChange,
  appliedFilterCount,
  unappliedDraftCount,
  onResetDraftFilters,
  onApplyDraftFilters,
  onResetAppliedFilters,
  keywordPlaceholder = "テキスト検索 (部分一致)",
  keywordAriaLabel = "一覧のテキスト検索",
  filterButtonLabel = "フィルター",
  children,
}: ListFiltersBarProps) {
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
            placeholder={keywordPlaceholder}
            className="pl-8"
            aria-label={keywordAriaLabel}
          />
        </InputGroup>
      </div>

      <Popover open={isFilterPopoverOpen} onOpenChange={onFilterPopoverOpenChange}>
        <PopoverTrigger asChild>
          <Button type="button" variant={appliedFilterCount > 0 ? "default" : "outline"} className="relative">
            {filterButtonLabel}
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
          <div className="space-y-4 p-4">{children}</div>

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