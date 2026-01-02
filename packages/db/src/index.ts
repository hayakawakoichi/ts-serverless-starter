import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

export function createDb(databaseUrl: string) {
    const sql = neon(databaseUrl)
    return drizzle(sql, { schema })
}

export type Database = ReturnType<typeof createDb>

// Re-export drizzle-orm operators for use in repositories
export {
    and,
    asc,
    desc,
    eq,
    gt,
    gte,
    ilike,
    isNotNull,
    isNull,
    like,
    lt,
    lte,
    ne,
    not,
    or,
    sql,
} from "drizzle-orm"
export * from "./schema"
