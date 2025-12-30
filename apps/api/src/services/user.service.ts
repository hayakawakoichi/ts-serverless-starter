import type { AuthUser } from "@repo/db"
import { ConflictError, NotFoundError } from "../lib/errors"
import { userRepository } from "../repositories/user.repository"
import type { CreateUserInput, UpdateUserInput } from "../validators"

export const userService = {
    async getUserById(id: string): Promise<AuthUser> {
        const user = await userRepository.findById(id)
        if (!user) {
            throw new NotFoundError(`User with id ${id} not found`)
        }
        return user
    },

    async getAllUsers(): Promise<AuthUser[]> {
        return userRepository.findAll()
    },

    async createUser(data: CreateUserInput): Promise<AuthUser> {
        const existing = await userRepository.findByEmail(data.email)
        if (existing) {
            throw new ConflictError(`User with email ${data.email} already exists`)
        }
        return userRepository.create(data)
    },

    async updateUser(id: string, data: UpdateUserInput): Promise<AuthUser> {
        const existing = await userRepository.findById(id)
        if (!existing) {
            throw new NotFoundError(`User with id ${id} not found`)
        }

        if (data.email && data.email !== existing.email) {
            const emailExists = await userRepository.findByEmail(data.email)
            if (emailExists) {
                throw new ConflictError(`User with email ${data.email} already exists`)
            }
        }

        const updated = await userRepository.update(id, data)
        if (!updated) {
            throw new NotFoundError(`User with id ${id} not found`)
        }
        return updated
    },

    async deleteUser(id: string): Promise<void> {
        const deleted = await userRepository.delete(id)
        if (!deleted) {
            throw new NotFoundError(`User with id ${id} not found`)
        }
    },
}
