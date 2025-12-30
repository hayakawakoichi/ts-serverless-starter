import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

export function createDb(databaseUrl: string) {
    const sql = neon(databaseUrl)
    return drizzle(sql, { schema })
}

export type Database = ReturnType<typeof createDb>

// Re-export drizzle-orm operators for use in repositories
export { and, eq, gt, gte, isNotNull, isNull, lt, lte, ne, not, or } from "drizzle-orm"
export * from "./schema"
