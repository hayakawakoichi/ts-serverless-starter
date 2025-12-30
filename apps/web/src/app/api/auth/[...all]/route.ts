import { getAuth } from "@repo/db/auth"
import { toNextJsHandler } from "better-auth/next-js"

// Force dynamic to prevent build-time evaluation
export const dynamic = "force-dynamic"

// Lazy create handler to avoid build-time database connection
export const GET = async (req: Request) => {
    const { GET } = toNextJsHandler(getAuth())
    return GET(req)
}

export const POST = async (req: Request) => {
    const { POST } = toNextJsHandler(getAuth())
    return POST(req)
}
