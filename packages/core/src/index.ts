// Shared utilities and types

export function formatDate(date: Date): string {
    return date.toISOString()
}

export function generateId(): string {
    return globalThis.crypto.randomUUID()
}

// Add shared types, constants, and utilities here
export const APP_NAME = "ts-serverless-starter"
