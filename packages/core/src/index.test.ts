import { describe, expect, it } from "vitest"
import { APP_NAME, formatDate, generateId } from "./index"

describe("core utilities", () => {
    describe("formatDate", () => {
        it("formats date to ISO string", () => {
            const date = new Date("2025-01-01T12:00:00.000Z")
            expect(formatDate(date)).toBe("2025-01-01T12:00:00.000Z")
        })

        it("handles different dates correctly", () => {
            const date = new Date("2024-06-15T08:30:45.123Z")
            expect(formatDate(date)).toBe("2024-06-15T08:30:45.123Z")
        })
    })

    describe("generateId", () => {
        it("returns a valid UUID format", () => {
            const id = generateId()
            // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            expect(id).toMatch(uuidRegex)
        })

        it("generates unique IDs", () => {
            const id1 = generateId()
            const id2 = generateId()
            expect(id1).not.toBe(id2)
        })
    })

    describe("APP_NAME", () => {
        it("has correct value", () => {
            expect(APP_NAME).toBe("ts-serverless-starter")
        })
    })
})
