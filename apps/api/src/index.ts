import { Scalar } from "@scalar/hono-api-reference"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import { logger } from "hono/logger"
import { AppError } from "./lib/errors"
import { openApiSpec } from "./lib/openapi"
import { type AuthVariables, authMiddleware, requireAuth, requireDocsAccess } from "./middleware/auth"
import { healthRoutes } from "./routes/health"
import { meRoutes } from "./routes/me"
import { userRoutes } from "./routes/users"

const app = new Hono<{ Variables: AuthVariables }>()

// Middleware
app.use("*", logger())
app.use("*", cors())
app.use("*", authMiddleware)

// Global error handler
app.onError((err, c) => {
    console.error("Error:", err)

    // Handle AppError (NotFoundError, ValidationError, etc.)
    if (err instanceof AppError) {
        return c.json(
            {
                error: err.message,
                code: err.code,
            },
            err.statusCode as 400 | 404 | 409 | 500
        )
    }

    // Handle Hono HTTPException
    if (err instanceof HTTPException) {
        return c.json(
            {
                error: err.message,
            },
            err.status
        )
    }

    // Handle unknown errors
    return c.json(
        {
            error: "Internal server error",
        },
        500
    )
})

// ===== Public Routes =====
app.route("/api/health", healthRoutes)
app.route("/api/users", userRoutes)

// ===== Protected Routes (/api/me/*) =====
// All routes under /api/me require authentication
app.use("/api/me/*", requireAuth)
app.route("/api/me", meRoutes)

// OpenAPI spec (許可されたユーザーのみ)
app.get("/api/openapi.json", requireDocsAccess, (c) => {
    return c.json(openApiSpec)
})

// Scalar API Reference UI (許可されたユーザーのみ)
app.get(
    "/api/docs",
    requireDocsAccess,
    Scalar({
        url: "./openapi.json",
        theme: "purple",
    })
)

// Root
app.get("/", (c) => {
    return c.json({
        message: "ts-serverless-starter API",
        version: "0.0.1",
        docs: "/api/docs",
    })
})

export default app
export type AppType = typeof app
