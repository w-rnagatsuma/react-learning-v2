import { useCallback, useMemo, useState } from "react";
import type { Service } from "@/hooks/api/useServices";
import {
  PAGE_SIZE_OPTIONS,
  countActiveFilters,
  createEmptyFilters,
  isSameFilterState,
  normalizeDateRange,
  toDateValue,
  type ServiceFilters,
  type SortKey,
} from "@/pages/services/servicesPageUtils";

export function useServicesPageState(services: Service[]) {
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

  const handleSort = useCallback(
    (key: SortKey) => {
      setPage(1);
      if (sortKey === key) {
        setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
        return;
      }

      setSortKey(key);
      setSortDir("asc");
    },
    [sortKey],
  );

  const sortIndicator = useCallback(
    (key: SortKey) => {
      if (sortKey !== key) {
        return "";
      }

      return sortDir === "asc" ? " ▲" : " ▼";
    },
    [sortDir, sortKey],
  );

  const handlePageSizeChange = useCallback((nextPageSize: (typeof PAGE_SIZE_OPTIONS)[number]) => {
    setPageSize(nextPageSize);
    setPage(1);
  }, []);

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

  const handleDraftExecutedFromChange = useCallback((date: Date | undefined) => {
    setDraftFilters((prev) => ({
      ...prev,
      executedFrom: toDateValue(date),
    }));
  }, []);

  const handleDraftExecutedToChange = useCallback((date: Date | undefined) => {
    setDraftFilters((prev) => ({
      ...prev,
      executedTo: toDateValue(date),
    }));
  }, []);

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

  const handleKeywordChange = useCallback((value: string) => {
    setKeyword(value);
    setPage(1);
  }, []);

  const goToPrevPage = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  const goToPage = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  const createExecutionPath = useCallback((serviceId: string) => {
    const executionToken =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return `/services/${encodeURIComponent(serviceId)}/execute?executionToken=${encodeURIComponent(executionToken)}`;
  }, []);

  const handleExecuteService = useCallback(
    (serviceId: string) => {
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
    },
    [createExecutionPath],
  );

  return {
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
  };
}
