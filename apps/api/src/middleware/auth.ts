import { auth } from "@repo/db/auth"
import { createMiddleware } from "hono/factory"

type AuthSession = typeof auth.$Infer.Session

export type AuthVariables = {
    user: AuthSession["user"] | null
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

    c.set("user", session.user)
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
