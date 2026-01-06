import { createAccessControl } from "better-auth/plugins/access"
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access"

/**
 * Permission statements define resources and their available actions.
 * Add new resources here as your application grows.
 */
export const statement = {
    ...defaultStatements,
    // Example: project resource with CRUD + share actions
    // project: ["create", "read", "update", "delete", "share"],
} as const

/**
 * Access controller instance used for permission checks.
 */
export const ac = createAccessControl(statement)

/**
 * User role - default role for new users.
 * Has limited permissions.
 */
export const userRole = ac.newRole({
    // Users have no admin permissions by default
})

/**
 * Admin role - has full administrative permissions.
 * Can manage users, ban users, impersonate, etc.
 */
export const adminRole = ac.newRole({
    ...adminAc.statements,
})

/**
 * All available roles.
 */
export const roles = {
    user: userRole,
    admin: adminRole,
} as const

/**
 * Role names type for type-safe role handling.
 */
export type RoleName = keyof typeof roles
