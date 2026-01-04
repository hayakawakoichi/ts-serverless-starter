import { beforeEach, describe, expect, it, vi } from "vitest"
import { createMockDate, createMockUUID, createSpy, sleep } from "./index"

describe("testing utilities", () => {
    describe("createMockDate", () => {
        it("creates a Date from ISO string", () => {
            const date = createMockDate("2025-01-01T00:00:00.000Z")
            expect(date.toISOString()).toBe("2025-01-01T00:00:00.000Z")
        })
    })

    describe("createMockUUID", () => {
        it("returns a zero UUID", () => {
            expect(createMockUUID()).toBe("00000000-0000-0000-0000-000000000000")
        })
    })

    describe("sleep", () => {
        beforeEach(() => {
            vi.useFakeTimers()
        })

        it("resolves after the specified time", async () => {
            const promise = sleep(100)
            vi.advanceTimersByTime(100)
            await expect(promise).resolves.toBeUndefined()
        })
    })

    describe("createSpy", () => {
        it("tracks function calls", () => {
            const spy = createSpy<(a: number, b: number) => number>((a, b) => a + b)

            expect(spy(1, 2)).toBe(3)
            expect(spy(3, 4)).toBe(7)

            expect(spy.calls).toEqual([
                [1, 2],
                [3, 4],
            ])
        })

        it("can be reset", () => {
            const spy = createSpy<(x: string) => void>()

            spy("hello")
            spy("world")
            expect(spy.calls).toHaveLength(2)

            spy.reset()
            expect(spy.calls).toHaveLength(0)
        })
    })
})
