import type { Logger, LoggerOptions } from "pino"
import pino from "pino"
import { APP_NAME } from "./constants"

export type { Logger }

// 環境変数から設定を取得
const isDevelopment = process.env.NODE_ENV !== "production"
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info")

/**
 * ロガー設定オプション
 */
export interface CreateLoggerOptions {
    /** ログレベル (trace, debug, info, warn, error, fatal) */
    level?: string
    /** ロガー名（アプリケーション識別子） */
    name?: string
    /** 全ログに付与するベース情報 */
    base?: Record<string, unknown>
}

/**
 * pino ロガーの基本設定
 * - 本番: JSON 形式（CloudWatch Logs 連携）
 * - 開発: pino-pretty による整形出力
 */
function getBaseOptions(options: CreateLoggerOptions = {}): LoggerOptions {
    const { level = logLevel, name, base } = options

    const baseConfig: LoggerOptions = {
        level,
        // CloudWatch Logs での検索を容易にするフォーマッター
        formatters: {
            level: (label) => ({ level: label }),
        },
        // ISO 8601 タイムスタンプ
        timestamp: pino.stdTimeFunctions.isoTime,
    }

    // name が指定された場合のみ追加
    if (name) {
        baseConfig.name = name
    }

    // base 情報のマージ（デフォルトで pid, hostname を除去）
    baseConfig.base = base ?? {}

    return baseConfig
}

/**
 * 本番環境用ロガーを作成
 * - JSON 形式で stdout に出力
 * - CloudWatch Logs で直接解析可能
 */
function createProductionLogger(options: CreateLoggerOptions = {}): Logger {
    return pino(getBaseOptions(options))
}

/**
 * 開発環境用ロガーを作成
 * - pino-pretty による整形出力
 * - カラー表示で視認性向上
 */
function createDevelopmentLogger(options: CreateLoggerOptions = {}): Logger {
    return pino({
        ...getBaseOptions(options),
        transport: {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "SYS:HH:MM:ss.l",
                ignore: "pid,hostname",
            },
        },
    })
}

/**
 * 環境に応じたロガーを作成
 *
 * @example
 * ```ts
 * import { createLogger } from "@repo/core/logger"
 *
 * const logger = createLogger({ name: "api" })
 * logger.info({ userId: "123" }, "User logged in")
 * ```
 */
export function createLogger(options: CreateLoggerOptions = {}): Logger {
    if (isDevelopment) {
        return createDevelopmentLogger(options)
    }
    return createProductionLogger(options)
}

/**
 * 子ロガーを作成（リクエストコンテキスト付与用）
 *
 * @example
 * ```ts
 * const requestLogger = createChildLogger(logger, {
 *   requestId: "abc-123",
 *   userId: "user-456"
 * })
 * requestLogger.info("Processing request")
 * ```
 */
export function createChildLogger(parent: Logger, bindings: Record<string, unknown>): Logger {
    return parent.child(bindings)
}

/**
 * エラーオブジェクトをシリアライズ可能な形式に変換
 * スタックトレースを含む
 */
export function serializeError(error: unknown): Record<string, unknown> {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
            // カスタムエラーのプロパティも含める
            ...Object.getOwnPropertyNames(error).reduce(
                (acc, key) => {
                    if (!["name", "message", "stack"].includes(key)) {
                        acc[key] = (error as unknown as Record<string, unknown>)[key]
                    }
                    return acc
                },
                {} as Record<string, unknown>
            ),
        }
    }
    return { error }
}

// デフォルトロガー（アプリケーション起動時に使用）
export const logger = createLogger({ name: APP_NAME })
