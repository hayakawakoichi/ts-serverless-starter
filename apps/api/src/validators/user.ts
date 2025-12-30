import { z } from "zod"

// User ID validation (Better Auth uses text IDs)
export const userIdSchema = z.string().min(1, "User ID is required")

// User response schema
export const userSchema = z.object({
    id: z.string(),
    email: z.email(),
    name: z.string(),
    emailVerified: z.boolean(),
    image: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

// Create user request schema
export const createUserSchema = z.object({
    email: z.email({ error: "Invalid email format" }),
    name: z.string().optional(),
})

// Update user request schema
export const updateUserSchema = z.object({
    email: z.email({ error: "Invalid email format" }).optional(),
    name: z.string().optional(),
})

// Path params
export const userIdParamSchema = z.object({
    id: userIdSchema,
})

// Types
export type UserResponse = z.infer<typeof userSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
