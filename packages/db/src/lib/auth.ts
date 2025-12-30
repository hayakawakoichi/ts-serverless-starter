import { neon } from "@neondatabase/serverless"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "../schema"

function createAuthDb() {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
        throw new Error("DATABASE_URL is not set")
    }
    const sql = neon(databaseUrl)
    return drizzle(sql, { schema })
}

// Lazy initialization singleton
let _auth: ReturnType<typeof betterAuth> | null = null

export function getAuth() {
    if (!_auth) {
        _auth = betterAuth({
            database: drizzleAdapter(createAuthDb(), {
                provider: "pg",
            }),
            secret: process.env.BETTER_AUTH_SECRET,
            baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
            emailAndPassword: {
                enabled: true,
            },
            session: {
                expiresIn: 60 * 60 * 24 * 7, // 7 days
                updateAge: 60 * 60 * 24, // 1 day
                cookieCache: {
                    enabled: true,
                    maxAge: 60 * 5, // 5 minutes
                },
            },
        })
    }
    return _auth
}

// For backwards compatibility and direct usage where env is already loaded
export const auth = {
    get handler() {
        return getAuth().handler
    },
    get api() {
        return getAuth().api
    },
    get $Infer() {
        return getAuth().$Infer
    },
}

export type Auth = ReturnType<typeof getAuth>
