/**
 * Hono API testing utilities
 */

import type { Hono } from "hono"

type RequestInit = {
    method?: string
    headers?: Record<string, string>
    body?: string | object
}

/**
 * Create a test client for Hono apps
 */
export function createTestClient(app: Hono) {
    const baseUrl = "http://localhost"

    async function request(path: string, init?: RequestInit) {
        const url = new URL(path, baseUrl)
        const headers: Record<string, string> = {
            ...init?.headers,
        }

        let body: string | undefined
        if (init?.body) {
            if (typeof init.body === "object") {
                body = JSON.stringify(init.body)
                headers["Content-Type"] = "application/json"
            } else {
                body = init.body
            }
        }

        const req = new Request(url.toString(), {
            method: init?.method || "GET",
            headers,
            body,
        })

        return app.fetch(req)
    }

    return {
        get: (path: string, init?: Omit<RequestInit, "method" | "body">) =>
            request(path, { ...init, method: "GET" }),

        post: (path: string, init?: Omit<RequestInit, "method">) =>
            request(path, { ...init, method: "POST" }),

        put: (path: string, init?: Omit<RequestInit, "method">) =>
            request(path, { ...init, method: "PUT" }),

        patch: (path: string, init?: Omit<RequestInit, "method">) =>
            request(path, { ...init, method: "PATCH" }),

        delete: (path: string, init?: Omit<RequestInit, "method" | "body">) =>
            request(path, { ...init, method: "DELETE" }),
    }
}

/**
 * Helper to parse JSON response with type safety
 */
export async function parseJsonResponse<T>(response: Response): Promise<T> {
    return response.json() as Promise<T>
}

/**
 * Assert response status and return typed JSON
 */
export async function expectJsonResponse<T>(response: Response, expectedStatus = 200): Promise<T> {
    if (response.status !== expectedStatus) {
        const text = await response.text()
        throw new Error(`Expected status ${expectedStatus}, got ${response.status}. Body: ${text}`)
    }
    return response.json() as Promise<T>
}
