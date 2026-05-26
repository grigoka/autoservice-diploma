export function TablePagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: {
  page: number
  totalItems: number
  pageSize: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalItems === 0) return null

  const start = page * pageSize + 1
  const end = Math.min(totalItems, (page + 1) * pageSize)

  return (
    <div className="table-pagination">
      <p className="table-pagination-info">
        Showing {start}–{end} of {totalItems}
      </p>
      <div className="table-pagination-controls">
        <button
          type="button"
          className="btn-secondary"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <span className="table-pagination-page">
          Page {page + 1} of {totalPages}
        </span>
        <button
          type="button"
          className="btn-secondary"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}
