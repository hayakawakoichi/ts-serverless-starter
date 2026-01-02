// Shared utilities and types

export function formatDate(date: Date): string {
    return date.toISOString()
}

export function generateId(): string {
    return globalThis.crypto.randomUUID()
}

// Constants
export { APP_NAME } from "./constants"

// Logger
export {
    createLogger,
    createChildLogger,
    serializeError,
    logger,
    type Logger,
    type CreateLoggerOptions,
} from "./logger"
