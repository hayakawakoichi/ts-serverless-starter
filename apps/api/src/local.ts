import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { config } from "dotenv"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env from project root (apps/api/src -> apps/api -> apps -> root)
config({ path: resolve(__dirname, "../../../.env") })

import { serve } from "@hono/node-server"
import app from "./index"

const port = parseInt(process.env.PORT || "3001", 10)

console.log(`Server is running on http://localhost:${port}`)

serve({
    fetch: app.fetch,
    port,
})
