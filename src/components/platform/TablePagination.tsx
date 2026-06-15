'use client';

import { Button } from '@/components/ui/button';

/**
 * Shared "Previous / Page X of Y / Next" footer used by the platform tables.
 *
 * Consolidates the repeated pagination block that was copy-pasted across the
 * organizations, users and billing tables. Behaviour-preserving: same disabled
 * rules and same "Showing N of total" summary.
 */
export interface TablePaginationProps {
  page: number;
  pages: number;
  total: number;
  /** Number of rows currently shown (for the "Showing N of total" summary). */
  shownCount: number;
  noun?: string;
  onPageChange: (page: number) => void;
}

export function TablePagination({
  page,
  pages,
  total,
  shownCount,
  noun = 'items',
  onPageChange,
}: TablePaginationProps) {
  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
      <p className="text-sm text-gray-600">
        Showing {shownCount} of {total} {noun}
      </p>
      {pages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500">
            Page {page} of {pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(pages, page + 1))}
            disabled={page >= pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default TablePagination;
