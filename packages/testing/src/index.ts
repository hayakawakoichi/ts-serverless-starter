/**
 * @repo/testing - Shared test utilities for the monorepo
 *
 * This package provides common testing utilities, mocks, and helpers
 * that can be used across all packages in the monorepo.
 */

// Re-export vitest utilities for convenience
export { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest"

// Test utilities
export function createMockDate(isoString: string): Date {
    return new Date(isoString)
}

export function createMockUUID(): string {
    return "00000000-0000-0000-0000-000000000000"
}

/**
 * Wait for a specified amount of time
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Create a mock function that tracks calls
 */
// biome-ignore lint/suspicious/noExplicitAny: Required for flexible spy function typing
export function createSpy<T extends (...args: any[]) => any>(fn?: T) {
    const calls: Parameters<T>[] = []
    const spy = ((...args: Parameters<T>) => {
        calls.push(args)
        return fn?.(...args)
    }) as T & { calls: typeof calls; reset: () => void }

    spy.calls = calls
    spy.reset = () => {
        calls.length = 0
    }

    return spy
}
