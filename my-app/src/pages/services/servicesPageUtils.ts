import { format } from "date-fns";
import { ja } from "date-fns/locale";

export type SortKey = "id" | "name" | "category" | "owner";

export type ServiceFilters = {
  categories: string[];
  owners: string[];
  executedFrom?: string;
  executedTo?: string;
};

export const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;

export const createEmptyFilters = (): ServiceFilters => ({
  categories: [],
  owners: [],
});

export const countActiveFilters = (filters: ServiceFilters) => {
  return (
    filters.categories.length +
    filters.owners.length +
    (filters.executedFrom ? 1 : 0) +
    (filters.executedTo ? 1 : 0)
  );
};

export const normalizeDateRange = (filters: ServiceFilters): ServiceFilters => {
  if (filters.executedFrom && filters.executedTo && filters.executedFrom > filters.executedTo) {
    return {
      ...filters,
      executedFrom: filters.executedTo,
      executedTo: filters.executedFrom,
    };
  }

  return filters;
};

export const isSameFilterState = (left: ServiceFilters, right: ServiceFilters) => {
  return (
    left.executedFrom === right.executedFrom &&
    left.executedTo === right.executedTo &&
    left.categories.length === right.categories.length &&
    left.owners.length === right.owners.length &&
    left.categories.every((value, index) => value === right.categories[index]) &&
    left.owners.every((value, index) => value === right.owners[index])
  );
};

export const toDateValue = (date?: Date) => (date ? format(date, "yyyy-MM-dd") : undefined);

export const toDateObject = (value?: string) => {
  if (!value) {
    return undefined;
  }

  return new Date(`${value}T00:00:00`);
};

export const toDateLabel = (value?: string) => {
  if (!value) {
    return "日付を選択";
  }

  return format(new Date(`${value}T00:00:00`), "yyyy/MM/dd", { locale: ja });
};
