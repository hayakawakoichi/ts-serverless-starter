// Pagination types and utilities

/**
 * Generic paginated response type
 */
export interface PaginatedResponse<T> {
    data: T[]
    nextCursor: string | null
    hasMore: boolean
}

/**
 * Pagination parameters for queries
 */
export interface PaginationParams {
    limit: number
    cursor?: string
}

/**
 * Sort parameters for queries
 */
export interface SortParams {
    sort: string
    order: "asc" | "desc"
}

/**
 * Internal paginated result from repository
 */
export interface PaginatedResult<T> {
    items: T[]
    nextCursor: string | null
    hasMore: boolean
}
