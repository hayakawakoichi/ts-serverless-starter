import { describe, it, expect, beforeEach } from "vitest"
import { Hono } from "hono"
import { healthRoutes } from "./routes/health"

// Test the app without auth middleware to avoid DATABASE_URL dependency
// Auth-related integration tests should be in a separate e2e test suite

describe("API routes", () => {
    let app: Hono

    beforeEach(() => {
        app = new Hono()
        app.route("/api/health", healthRoutes)

        // Simple root endpoint for testing
        app.get("/", (c) => {
            return c.json({
                message: "ts-serverless-starter API",
                version: "0.0.1",
                docs: "/api/docs",
            })
        })
    })

    describe("GET /", () => {
        it("returns API info", async () => {
            const res = await app.request("/")

            expect(res.status).toBe(200)

            const json = await res.json()
            expect(json.message).toBe("ts-serverless-starter API")
            expect(json.version).toBe("0.0.1")
            expect(json.docs).toBe("/api/docs")
        })
    })

    describe("GET /api/health", () => {
        it("returns health status", async () => {
            const res = await app.request("/api/health")

            expect(res.status).toBe(200)

            const json = await res.json()
            expect(json.status).toBe("ok")
        })
    })
})
