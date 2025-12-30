// Force dynamic to prevent build-time evaluation
export const dynamic = "force-dynamic"

// Rewrite the URL to match Hono's expected path
function rewriteRequest(request: Request): Request {
    const url = new URL(request.url)
    // /api/v1/users -> /api/users
    url.pathname = url.pathname.replace("/api/v1", "/api")
    return new Request(url, request)
}

// Lazy load API to avoid build-time database connection
async function getApp() {
    const { default: app } = await import("@repo/api")
    return app
}

export const GET = async (request: Request) => {
    const app = await getApp()
    return app.fetch(rewriteRequest(request))
}

export const POST = async (request: Request) => {
    const app = await getApp()
    return app.fetch(rewriteRequest(request))
}

export const PUT = async (request: Request) => {
    const app = await getApp()
    return app.fetch(rewriteRequest(request))
}

export const DELETE = async (request: Request) => {
    const app = await getApp()
    return app.fetch(rewriteRequest(request))
}

export const PATCH = async (request: Request) => {
    const app = await getApp()
    return app.fetch(rewriteRequest(request))
}
