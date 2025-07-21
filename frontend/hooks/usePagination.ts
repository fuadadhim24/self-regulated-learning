import { useState, useMemo } from "react"

export interface UsePaginationOptions {
    totalItems: number
    initialPage?: number
    pageSize?: number
}

export interface UsePaginationResult<T> {
    currentPage: number
    totalPages: number
    pageSize: number
    setCurrentPage: (page: number) => void
    setPageSize: (size: number) => void
    paginatedData: T[]
    startIndex: number
    endIndex: number
}

export function usePagination<T = any>(
    data: T[],
    options: UsePaginationOptions
): UsePaginationResult<T> {
    const { totalItems, initialPage = 1, pageSize: defaultPageSize = 10 } = options
    const [currentPage, setCurrentPage] = useState(initialPage)
    const [pageSize, setPageSize] = useState(defaultPageSize)

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

    const startIndex = (currentPage - 1) * pageSize
    const endIndex = Math.min(startIndex + pageSize, totalItems)

    const paginatedData = useMemo(() => {
        return data.slice(startIndex, endIndex)
    }, [data, startIndex, endIndex])

    // Reset to first page if data or pageSize changes
    // (optional: can be controlled by parent)
    // useEffect(() => { setCurrentPage(1) }, [data, pageSize])

    return {
        currentPage,
        totalPages,
        pageSize,
        setCurrentPage,
        setPageSize,
        paginatedData,
        startIndex,
        endIndex
    }
} 