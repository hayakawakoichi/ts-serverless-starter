import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { userService } from "../services/user.service"
import { createUserSchema, updateUserSchema, userIdParamSchema } from "../validators"

export const userRoutes = new Hono()

// GET /api/users
userRoutes.get("/", async (c) => {
    const users = await userService.getAllUsers()
    return c.json({ users })
})

// GET /api/users/:id
userRoutes.get("/:id", zValidator("param", userIdParamSchema), async (c) => {
    const { id } = c.req.valid("param")
    const user = await userService.getUserById(id)
    return c.json({ user })
})

// POST /api/users
userRoutes.post("/", zValidator("json", createUserSchema), async (c) => {
    const data = c.req.valid("json")
    const user = await userService.createUser(data)
    return c.json({ user }, 201)
})

// PUT /api/users/:id
userRoutes.put(
    "/:id",
    zValidator("param", userIdParamSchema),
    zValidator("json", updateUserSchema),
    async (c) => {
        const { id } = c.req.valid("param")
        const data = c.req.valid("json")
        const user = await userService.updateUser(id, data)
        return c.json({ user })
    }
)

// DELETE /api/users/:id
userRoutes.delete("/:id", zValidator("param", userIdParamSchema), async (c) => {
    const { id } = c.req.valid("param")
    await userService.deleteUser(id)
    return c.json({ message: "User deleted" })
})
