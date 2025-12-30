import { Hono } from "hono"
import type { AuthVariables } from "../middleware/auth"

// All routes in this file require authentication
// (requireAuth is applied at /api/me/* level in index.ts)

export const meRoutes = new Hono<{ Variables: AuthVariables }>()

// GET /api/me - Get current user
meRoutes.get("/", (c) => {
    // user is guaranteed to exist (enforced by requireAuth middleware)
    const user = c.get("user")!
    const session = c.get("session")!

    return c.json({
        user,
        session: {
            id: session.id,
            expiresAt: session.expiresAt,
        },
    })
})
