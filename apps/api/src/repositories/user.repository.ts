import { type AuthUser, eq, type NewAuthUser, user } from "@repo/db"
import { getDb } from "../lib/db"
import type { CreateUserInput } from "../validators"

function generateId(): string {
    return crypto.randomUUID().replace(/-/g, "")
}

export const userRepository = {
    async findById(id: string): Promise<AuthUser | undefined> {
        const db = getDb()
        const result = await db.select().from(user).where(eq(user.id, id))
        return result[0]
    },

    async findByEmail(email: string): Promise<AuthUser | undefined> {
        const db = getDb()
        const result = await db.select().from(user).where(eq(user.email, email))
        return result[0]
    },

    async findAll(): Promise<AuthUser[]> {
        const db = getDb()
        return db.select().from(user)
    },

    async create(data: CreateUserInput): Promise<AuthUser> {
        const db = getDb()
        const result = await db
            .insert(user)
            .values({
                id: generateId(),
                email: data.email,
                name: data.name ?? data.email.split("@")[0],
            })
            .returning()
        return result[0]
    },

    async update(id: string, data: Partial<NewAuthUser>): Promise<AuthUser | undefined> {
        const db = getDb()
        const result = await db
            .update(user)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(user.id, id))
            .returning()
        return result[0]
    },

    async delete(id: string): Promise<boolean> {
        const db = getDb()
        const result = await db.delete(user).where(eq(user.id, id)).returning()
        return result.length > 0
    },
}
