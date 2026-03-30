import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * 一覧画面向けの共通フィルターバー。
 *
 * 役割:
 * - キーワード検索入力
 * - フィルターPopoverの開閉
 * - フィルター適用/下書きリセット/適用済みリセットの操作導線
 *
 * 依存関係:
 * - UI: `Button`, `Input`, `InputGroup`, `Popover`
 * - アイコン: `lucide-react` の `Search`
 *
 * 設計メモ:
 * - 実際のフィルター項目UIは `children` に委譲する。
 * - フィルター状態は呼び出し側で管理し、このコンポーネントは制御コンポーネントとして扱う。
 */
type FilterBarShellProps = {
  /** キーワード検索欄の現在値 */
  keyword: string;
  /** キーワード検索欄の変更ハンドラ */
  onKeywordChange: (value: string) => void;
  /** フィルターPopoverの開閉状態 */
  isFilterPopoverOpen: boolean;
  /** フィルターPopoverの開閉状態変更ハンドラ */
  onFilterPopoverOpenChange: (open: boolean) => void;
  /** 適用済みフィルター数。0より大きいと件数バッジを表示 */
  appliedFilterCount: number;
  /** 未適用の下書き変更数。0より大きいと適用ボタンに件数バッジを表示 */
  unappliedDraftCount: number;
  /** 下書き状態を初期値へ戻す */
  onResetDraftFilters: () => void;
  /** 下書き状態を適用済み状態へ反映する */
  onApplyDraftFilters: () => void;
  /** 適用済み状態を初期値へ戻す */
  onResetAppliedFilters: () => void;
  /** キーワード入力欄のプレースホルダー */
  keywordPlaceholder?: string;
  /** キーワード入力欄のaria-label */
  keywordAriaLabel?: string;
  /** フィルターボタンのラベル */
  filterButtonLabel?: string;
  /** フィルター項目UI。カテゴリや日付範囲などを任意に差し込む */
  children: ReactNode;
};

export function FilterBarShell({
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
}: FilterBarShellProps) {
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