import { serializeError } from "@repo/core"
import { Scalar } from "@scalar/hono-api-reference"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import type { PinoLogger } from "hono-pino"
import { AppError } from "./lib/errors"
import { openApiSpec } from "./lib/openapi"
import {
    type AuthVariables,
    authMiddleware,
    requireAuth,
    requireDocsAccess,
} from "./middleware/auth"
import { apiLogger, loggerMiddleware } from "./middleware/logger"
import { healthRoutes } from "./routes/health"
import { meRoutes } from "./routes/me"
import { userRoutes } from "./routes/users"

// アプリケーション変数の型定義
type AppVariables = AuthVariables & {
    logger: PinoLogger
}

const app = new Hono<{ Variables: AppVariables }>()

// Middleware
app.use("*", loggerMiddleware)
app.use("*", cors())
app.use("*", authMiddleware)

// Global error handler
app.onError((err, c) => {
    // リクエストコンテキストからロガーを取得（ミドルウェア前のエラーは apiLogger を使用）
    const logger = c.var.logger ?? apiLogger

    // Handle AppError (NotFoundError, ValidationError, etc.)
    if (err instanceof AppError) {
        // AppError は warn レベル（クライアントエラー）
        logger.warn(
            {
                err: serializeError(err),
                statusCode: err.statusCode,
                code: err.code,
            },
            `AppError: ${err.message}`
        )
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
        // HTTPException は warn レベル
        logger.warn(
            {
                err: serializeError(err),
                statusCode: err.status,
            },
            `HTTPException: ${err.message}`
        )
        return c.json(
            {
                error: err.message,
            },
            err.status
        )
    }

    // Handle unknown errors - これは error レベル（サーバーエラー）
    logger.error(
        {
            err: serializeError(err),
        },
        `Unexpected error: ${err instanceof Error ? err.message : "Unknown error"}`
    )
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
