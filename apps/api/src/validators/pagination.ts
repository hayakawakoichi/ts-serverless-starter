import { z } from "zod"

// Sort fields for users
export const userSortFields = ["id", "name", "email", "createdAt", "updatedAt"] as const
export type UserSortField = (typeof userSortFields)[number]

// Pagination query schema
export const paginationQuerySchema = z.object({
    limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 20))
        .pipe(z.number().min(1).max(100)),
    cursor: z.string().optional(),
})

// Sort query schema
export const sortQuerySchema = z.object({
    sort: z.enum(userSortFields).optional().default("createdAt"),
    order: z.enum(["asc", "desc"]).optional().default("desc"),
})

// User-specific filter schema
export const userFilterQuerySchema = z.object({
    q: z.string().optional(),
    emailVerified: z
        .string()
        .optional()
        .transform((val) => (val === "true" ? true : val === "false" ? false : undefined)),
})

// Combined query schema for users list
export const usersListQuerySchema = paginationQuerySchema
    .merge(sortQuerySchema)
    .merge(userFilterQuerySchema)

// Types
export type PaginationQuery = z.infer<typeof paginationQuerySchema>
export type SortQuery = z.infer<typeof sortQuerySchema>
export type UserFilterQuery = z.infer<typeof userFilterQuerySchema>
export type UsersListQuery = z.infer<typeof usersListQuerySchema>
