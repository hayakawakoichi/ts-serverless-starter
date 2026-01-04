import type { BaseFindOptions, PaginatedResult } from "@repo/core"
import {
    type AuthUser,
    and,
    asc,
    desc,
    eq,
    gt,
    ilike,
    lt,
    type NewAuthUser,
    or,
    user,
} from "@repo/db"
import { getDb } from "../lib/db"
import type { CreateUserInput, UserSortField } from "../validators"

function generateId(): string {
    return crypto.randomUUID().replace(/-/g, "")
}

export interface UserFindOptions extends BaseFindOptions<UserSortField> {
    search?: string
    emailVerified?: boolean
}

export const userRepository = {
    async findById(id: string): Promise<AuthUser | undefined> {
        const db = getDb()
        const result = await db.select().from(user).where(eq(user.id, id))
        return result[0]
    },

    async findByEmail(email: string): Promise<AuthUser | undefined> {
        const db = getDb()
        const result = await db.select().from(user).where(eq(user.email, email))
        return result[0]
    },

    async findAll(): Promise<AuthUser[]> {
        const db = getDb()
        return db.select().from(user)
    },

    async create(data: CreateUserInput): Promise<AuthUser> {
        const db = getDb()
        const result = await db
            .insert(user)
            .values({
                id: generateId(),
                email: data.email,
                name: data.name ?? data.email.split("@")[0],
            })
            .returning()
        return result[0]
    },

    async update(id: string, data: Partial<NewAuthUser>): Promise<AuthUser | undefined> {
        const db = getDb()
        const result = await db
            .update(user)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(user.id, id))
            .returning()
        return result[0]
    },

    async delete(id: string): Promise<boolean> {
        const db = getDb()
        const result = await db.delete(user).where(eq(user.id, id)).returning()
        return result.length > 0
    },

    async findPaginated(options: UserFindOptions): Promise<PaginatedResult<AuthUser>> {
        const db = getDb()
        const { limit, cursor, sort, order, search, emailVerified } = options

        // Build where conditions
        const conditions = []

        // Search filter (name or email)
        if (search) {
            const searchPattern = `%${search}%`
            conditions.push(or(ilike(user.name, searchPattern), ilike(user.email, searchPattern)))
        }

        // Email verified filter
        if (emailVerified !== undefined) {
            conditions.push(eq(user.emailVerified, emailVerified))
        }

        // Cursor condition based on sort field
        if (cursor) {
            const sortColumn = user[sort]
            const comparison = order === "asc" ? gt : lt

            // Parse cursor value based on field type
            const isDateField = sort === "createdAt" || sort === "updatedAt"
            const cursorValue = isDateField ? new Date(cursor) : cursor

            conditions.push(comparison(sortColumn, cursorValue))
        }

        // Build order by
        const orderFn = order === "asc" ? asc : desc
        const orderBy = [orderFn(user[sort])]

        // Add secondary sort by id for stability when sort column has duplicates
        if (sort !== "id") {
            orderBy.push(orderFn(user.id))
        }

        // Fetch limit + 1 to determine hasMore
        const results = await db
            .select()
            .from(user)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(...orderBy)
            .limit(limit + 1)

        const hasMore = results.length > limit
        const items = hasMore ? results.slice(0, limit) : results

        // Generate next cursor from last item
        let nextCursor: string | null = null
        if (hasMore && items.length > 0) {
            const lastItem = items[items.length - 1]
            const cursorValue = lastItem[sort]
            // Convert Date to ISO string for cursor
            nextCursor =
                cursorValue instanceof Date ? cursorValue.toISOString() : String(cursorValue)
        }

        return { items, nextCursor, hasMore }
    },
}
