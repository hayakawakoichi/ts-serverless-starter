import { type AuthUser, auth } from "@repo/db/auth"
import { type RoleName, roles } from "@repo/db/permissions"
import { createMiddleware } from "hono/factory"

type AuthSession = typeof auth.$Infer.Session

export type AuthVariables = {
    user: AuthUser | null
    session: AuthSession["session"] | null
}

/**
 * Check if a user is currently banned.
 * Returns true if user is banned and ban has not expired.
 */
function isUserBanned(user: AuthUser): boolean {
    if (!user.banned) return false

    // If banExpires is set and has passed, user is no longer banned
    if (user.banExpires && new Date() > user.banExpires) {
        return false
    }

    return true
}

/**
 * Create a ban error response with details.
 */
function createBanResponse(user: AuthUser) {
    return {
        error: "User is banned",
        reason: user.banReason,
        expiresAt: user.banExpires?.toISOString() ?? null,
    }
}

/**
 * Authentication middleware that extracts session from request headers.
 * Sets `user` and `session` in context variables.
 * Does NOT block requests - use `requireAuth` for protected routes.
 */
export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    })

    if (!session) {
        c.set("user", null)
        c.set("session", null)
        await next()
        return
    }

    c.set("user", session.user as AuthUser)
    c.set("session", session.session)
    await next()
})

/**
 * Middleware that requires authentication.
 * Returns 401 if user is not authenticated.
 * Returns 403 if user is banned.
 */
export const requireAuth = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const user = c.get("user")

    if (!user) {
        return c.json({ error: "Unauthorized" }, 401)
    }

    if (isUserBanned(user)) {
        return c.json(createBanResponse(user), 403)
    }

    await next()
})

/**
 * Middleware that requires authentication AND specific email address.
 * Uses DOCS_ALLOWED_EMAILS env var (comma-separated list).
 * Returns 401 if not authenticated, 403 if email not in allowed list.
 */
export const requireDocsAccess = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const user = c.get("user")

    if (!user) {
        return c.json({ error: "Unauthorized" }, 401)
    }

    const allowedEmails =
        process.env.DOCS_ALLOWED_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ?? []

    if (allowedEmails.length === 0) {
        // 設定されていない場合は全認証ユーザーを許可
        await next()
        return
    }

    if (!allowedEmails.includes(user.email.toLowerCase())) {
        return c.json({ error: "Forbidden" }, 403)
    }

    await next()
})

/**
 * Middleware factory that requires a specific role.
 * Returns 401 if not authenticated, 403 if user is banned or doesn't have the required role.
 *
 * @example
 * app.use("/admin/*", requireRole("admin"))
 */
export function requireRole(role: RoleName) {
    return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
        const user = c.get("user")

        if (!user) {
            return c.json({ error: "Unauthorized" }, 401)
        }

        if (isUserBanned(user)) {
            return c.json(createBanResponse(user), 403)
        }

        if (user.role !== role) {
            return c.json({ error: "Forbidden" }, 403)
        }

        await next()
    })
}

/**
 * Check if a role has a specific permission.
 * Uses the roles defined in @repo/db/permissions.
 */
function hasPermission(roleName: RoleName, resource: string, action: string): boolean {
    const role = roles[roleName]
    if (!role) return false

    const statements = role.statements as Record<string, readonly string[]>
    const actions = statements[resource]
    if (!actions) return false

    return actions.includes(action)
}

/**
 * Middleware factory that requires a specific permission.
 * Returns 401 if not authenticated, 403 if user is banned or doesn't have the required permission.
 *
 * @example
 * app.delete("/users/:id", requirePermission("user", "delete"), handler)
 */
export function requirePermission(resource: string, action: string) {
    return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
        const user = c.get("user")

        if (!user) {
            return c.json({ error: "Unauthorized" }, 401)
        }

        if (isUserBanned(user)) {
            return c.json(createBanResponse(user), 403)
        }

        if (!hasPermission(user.role, resource, action)) {
            return c.json({ error: "Forbidden" }, 403)
        }

        await next()
    })
}

/**
 * Middleware that requires admin role.
 * Shorthand for requireRole("admin").
 */
export const requireAdmin = requireRole("admin")
