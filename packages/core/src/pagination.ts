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
 * Sort order type
 */
export type SortOrder = "asc" | "desc"

/**
 * Pagination parameters for queries
 */
export interface PaginationParams {
    limit: number
    cursor?: string
}

/**
 * Sort parameters for queries (generic)
 */
export interface SortParams<TSortField extends string = string> {
    sort: TSortField
    order: SortOrder
}

/**
 * Base find options combining pagination and sorting (generic)
 */
export interface BaseFindOptions<TSortField extends string = string>
    extends PaginationParams,
        SortParams<TSortField> {}

/**
 * Internal paginated result from repository
 */
export interface PaginatedResult<T> {
    items: T[]
    nextCursor: string | null
    hasMore: boolean
}
