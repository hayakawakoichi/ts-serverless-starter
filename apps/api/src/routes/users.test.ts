import type { AuthUser } from "@repo/db"
import { Hono } from "hono"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { userService } from "../services/user.service"
import { userRoutes } from "./users"

// Mock the user service
vi.mock("../services/user.service", () => ({
    userService: {
        getUsers: vi.fn(),
        getUserById: vi.fn(),
        createUser: vi.fn(),
        updateUser: vi.fn(),
        deleteUser: vi.fn(),
    },
}))

// Sample user data for tests
const mockUsers: AuthUser[] = [
    {
        id: "user-1",
        email: "alice@example.com",
        name: "Alice",
        emailVerified: true,
        image: null,
        createdAt: new Date("2024-01-15T10:00:00.000Z"),
        updatedAt: new Date("2024-01-15T10:00:00.000Z"),
    },
    {
        id: "user-2",
        email: "bob@example.com",
        name: "Bob",
        emailVerified: false,
        image: null,
        createdAt: new Date("2024-01-14T10:00:00.000Z"),
        updatedAt: new Date("2024-01-14T10:00:00.000Z"),
    },
    {
        id: "user-3",
        email: "charlie@example.com",
        name: "Charlie",
        emailVerified: true,
        image: null,
        createdAt: new Date("2024-01-13T10:00:00.000Z"),
        updatedAt: new Date("2024-01-13T10:00:00.000Z"),
    },
]

describe("users routes", () => {
    let app: Hono

    beforeEach(() => {
        app = new Hono()
        app.route("/api/users", userRoutes)
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe("GET /api/users - pagination", () => {
        it("returns paginated users with default params", async () => {
            vi.mocked(userService.getUsers).mockResolvedValue({
                items: mockUsers,
                nextCursor: null,
                hasMore: false,
            })

            const res = await app.request("/api/users")

            expect(res.status).toBe(200)

            const json = await res.json()
            expect(json.data).toHaveLength(3)
            expect(json.nextCursor).toBeNull()
            expect(json.hasMore).toBe(false)

            // Verify service was called with default params
            expect(userService.getUsers).toHaveBeenCalledWith({
                limit: 20,
                cursor: undefined,
                sort: "createdAt",
                order: "desc",
                q: undefined,
                emailVerified: undefined,
            })
        })

        it("accepts custom limit parameter", async () => {
            vi.mocked(userService.getUsers).mockResolvedValue({
                items: mockUsers.slice(0, 2),
                nextCursor: "2024-01-14T10:00:00.000Z",
                hasMore: true,
            })

            const res = await app.request("/api/users?limit=2")

            expect(res.status).toBe(200)

            const json = await res.json()
            expect(json.data).toHaveLength(2)
            expect(json.nextCursor).toBe("2024-01-14T10:00:00.000Z")
            expect(json.hasMore).toBe(true)

            expect(userService.getUsers).toHaveBeenCalledWith(expect.objectContaining({ limit: 2 }))
        })

        it("accepts cursor parameter for pagination", async () => {
            const cursor = "2024-01-14T10:00:00.000Z"
            vi.mocked(userService.getUsers).mockResolvedValue({
                items: [mockUsers[2]],
                nextCursor: null,
                hasMore: false,
            })

            const res = await app.request(`/api/users?cursor=${encodeURIComponent(cursor)}`)

            expect(res.status).toBe(200)

            expect(userService.getUsers).toHaveBeenCalledWith(expect.objectContaining({ cursor }))
        })

        it("accepts sort and order parameters", async () => {
            vi.mocked(userService.getUsers).mockResolvedValue({
                items: mockUsers,
                nextCursor: null,
                hasMore: false,
            })

            const res = await app.request("/api/users?sort=name&order=asc")

            expect(res.status).toBe(200)

            expect(userService.getUsers).toHaveBeenCalledWith(
                expect.objectContaining({ sort: "name", order: "asc" })
            )
        })

        it("accepts search query parameter", async () => {
            vi.mocked(userService.getUsers).mockResolvedValue({
                items: [mockUsers[0]],
                nextCursor: null,
                hasMore: false,
            })

            const res = await app.request("/api/users?q=alice")

            expect(res.status).toBe(200)

            expect(userService.getUsers).toHaveBeenCalledWith(
                expect.objectContaining({ q: "alice" })
            )
        })

        it("accepts emailVerified filter", async () => {
            vi.mocked(userService.getUsers).mockResolvedValue({
                items: mockUsers.filter((u) => u.emailVerified),
                nextCursor: null,
                hasMore: false,
            })

            const res = await app.request("/api/users?emailVerified=true")

            expect(res.status).toBe(200)

            const json = await res.json()
            expect(json.data).toHaveLength(2)

            expect(userService.getUsers).toHaveBeenCalledWith(
                expect.objectContaining({ emailVerified: true })
            )
        })

        it("accepts combined query parameters", async () => {
            vi.mocked(userService.getUsers).mockResolvedValue({
                items: [mockUsers[0]],
                nextCursor: null,
                hasMore: false,
            })

            const res = await app.request(
                "/api/users?limit=10&sort=email&order=asc&q=example&emailVerified=true"
            )

            expect(res.status).toBe(200)

            expect(userService.getUsers).toHaveBeenCalledWith({
                limit: 10,
                cursor: undefined,
                sort: "email",
                order: "asc",
                q: "example",
                emailVerified: true,
            })
        })

        it("returns 400 for invalid limit (too high)", async () => {
            const res = await app.request("/api/users?limit=101")

            expect(res.status).toBe(400)
        })

        it("returns 400 for invalid limit (zero)", async () => {
            const res = await app.request("/api/users?limit=0")

            expect(res.status).toBe(400)
        })

        it("returns 400 for invalid sort field", async () => {
            const res = await app.request("/api/users?sort=invalid")

            expect(res.status).toBe(400)
        })

        it("returns 400 for invalid order value", async () => {
            const res = await app.request("/api/users?order=invalid")

            expect(res.status).toBe(400)
        })
    })

    describe("GET /api/users/:id", () => {
        it("returns user by id", async () => {
            vi.mocked(userService.getUserById).mockResolvedValue(mockUsers[0])

            const res = await app.request("/api/users/user-1")

            expect(res.status).toBe(200)

            const json = await res.json()
            expect(json.user.id).toBe("user-1")
            expect(json.user.email).toBe("alice@example.com")
        })
    })
})
