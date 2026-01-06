import { auth } from "@repo/db/auth"
import { type RoleName, roles } from "@repo/db/permissions"
import { createMiddleware } from "hono/factory"

type AuthSession = typeof auth.$Infer.Session

/**
 * Extended user type with role field from Admin Plugin.
 */
type UserWithRole = AuthSession["user"] & {
    role: RoleName
    banned: boolean | null
    banReason: string | null
    banExpires: Date | null
}

export type AuthVariables = {
    user: UserWithRole | null
    session: AuthSession["session"] | null
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

    c.set("user", session.user as UserWithRole)
    c.set("session", session.session)
    await next()
})

/**
 * Middleware that requires authentication.
 * Returns 401 if user is not authenticated.
 */
export const requireAuth = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const user = c.get("user")

    if (!user) {
        return c.json({ error: "Unauthorized" }, 401)
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
 * Returns 401 if not authenticated, 403 if user doesn't have the required role.
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
 * Returns 401 if not authenticated, 403 if user doesn't have the required permission.
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
