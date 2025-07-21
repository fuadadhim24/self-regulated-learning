import React from "react"

interface PaginationProps {
    currentPage: number
    totalPages: number
    pageSize: number
    pageSizeOptions?: number[]
    onPageChange: (page: number) => void
    onPageSizeChange?: (size: number) => void
    className?: string
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    pageSize,
    pageSizeOptions = [5, 10, 20, 50],
    onPageChange,
    onPageSizeChange,
    className = ""
}) => {
    // Generate page numbers (show up to 5 at a time, with ellipsis)
    const getPageNumbers = () => {
        const pages = []
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, "...", totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
            } else {
                pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages)
            }
        }
        return pages
    }

    return (
        <div className={`flex flex-wrap items-center justify-between gap-2 ${className}`}>
            <div className="flex items-center gap-2">
                <button
                    className="py-1 px-3 rounded border bg-white dark:bg-slate-800 disabled:opacity-50"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                {getPageNumbers().map((page, idx) =>
                    typeof page === "number" ? (
                        <button
                            key={page}
                            className={`py-1 px-3 rounded border ${page === currentPage ? "bg-blue-500 text-white" : "bg-white dark:bg-slate-800"}`}
                            onClick={() => onPageChange(page)}
                            disabled={page === currentPage}
                        >
                            {page}
                        </button>
                    ) : (
                        <span key={"ellipsis-" + idx} className="px-2 text-muted-foreground">...</span>
                    )
                )}
                <button
                    className="py-1 px-3 rounded border bg-white dark:bg-slate-800 disabled:opacity-50"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
            {onPageSizeChange && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rows per page:</span>
                    <select
                        className="border rounded px-2 py-1 bg-white dark:bg-slate-800"
                        value={pageSize}
                        onChange={e => onPageSizeChange(Number(e.target.value))}
                    >
                        {pageSizeOptions.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    )
} 