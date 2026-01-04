import type { Logger } from "@repo/core"
import { createLogger, generateId } from "@repo/core"
import type { Context } from "hono"
import { pinoLogger } from "hono-pino"

// API 用のロガーを作成
export const apiLogger = createLogger({
    name: "api",
    base: {
        service: "api",
    },
})

// pino-logger 用の型定義
export type LoggerVariables = {
    logger: Logger
    requestId: string
}

/**
 * Hono 用ロガーミドルウェア
 * - リクエストごとに一意の requestId を付与
 * - レスポンスタイムを自動計測
 * - 開発環境では pino-pretty で整形出力
 */
export const loggerMiddleware = pinoLogger({
    pino: apiLogger,
    http: {
        // リクエストIDを生成（X-Request-Id があれば使用）
        reqId: () => generateId(),
        // リクエストログにバインディング追加
        onReqBindings: (c: Context) => ({
            requestId: c.req.header("X-Request-Id") ?? generateId(),
            method: c.req.method,
            path: c.req.path,
            userAgent: c.req.header("User-Agent"),
        }),
        // リクエストログメッセージ
        onReqMessage: (c: Context) => {
            return `→ ${c.req.method} ${c.req.path}`
        },
        // レスポンスログメッセージ
        onResMessage: (c: Context) => {
            return `← ${c.req.method} ${c.req.path} ${c.res.status}`
        },
        // レスポンスタイム計測を有効化
        responseTime: true,
    },
})
