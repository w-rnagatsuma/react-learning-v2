import { Button } from "@/components/ui/button";

type ServicesPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onGoToPage: (pageNumber: number) => void;
};

export function ServicesPagination({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onGoToPage,
}: ServicesPaginationProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onPrevPage}
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
          onClick={() => onGoToPage(pageNumber)}
        >
          {pageNumber}
        </Button>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onNextPage}
        disabled={currentPage === totalPages}
      >
        次へ
      </Button>
    </div>
  );
}
