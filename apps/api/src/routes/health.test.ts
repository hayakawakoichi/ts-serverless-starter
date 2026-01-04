import { Hono } from "hono"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { healthRoutes } from "./health"

describe("health routes", () => {
    let app: Hono

    beforeEach(() => {
        app = new Hono()
        app.route("/api/health", healthRoutes)
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe("GET /api/health", () => {
        it("returns status ok", async () => {
            const res = await app.request("/api/health")

            expect(res.status).toBe(200)

            const json = await res.json()
            expect(json.status).toBe("ok")
            expect(json.timestamp).toBeDefined()
        })

        it("returns valid ISO timestamp", async () => {
            const mockDate = new Date("2025-01-01T12:00:00.000Z")
            vi.setSystemTime(mockDate)

            const res = await app.request("/api/health")
            const json = await res.json()

            expect(json.timestamp).toBe("2025-01-01T12:00:00.000Z")

            vi.useRealTimers()
        })
    })
})
