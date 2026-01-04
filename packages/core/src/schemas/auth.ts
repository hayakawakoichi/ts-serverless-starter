import { z } from "zod"

// ============================================================
// Auth Constants
// ============================================================

export const AUTH_CONSTANTS = {
    /** Minimum password length */
    MIN_PASSWORD_LENGTH: 8,
    /** Maximum password length */
    MAX_PASSWORD_LENGTH: 128,
} as const

// ============================================================
// Base Schemas (reusable building blocks)
// ============================================================

/** Email validation schema */
export const emailSchema = z.string().email("Invalid email format")

/** Password validation schema (for new passwords) */
export const passwordSchema = z
    .string()
    .min(1, "Password is required")
    .min(
        AUTH_CONSTANTS.MIN_PASSWORD_LENGTH,
        `Password must be at least ${AUTH_CONSTANTS.MIN_PASSWORD_LENGTH} characters`
    )
    .max(
        AUTH_CONSTANTS.MAX_PASSWORD_LENGTH,
        `Password must be at most ${AUTH_CONSTANTS.MAX_PASSWORD_LENGTH} characters`
    )

/** Name validation schema */
export const nameSchema = z.string().min(1, "Name is required")

// ============================================================
// Form Schemas
// ============================================================

/** Sign in form schema */
export const signInSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
})

/** Sign up form schema */
export const signUpSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
})

/** Forgot password form schema */
export const forgotPasswordSchema = z.object({
    email: emailSchema,
})

/** Reset password form schema */
export const resetPasswordSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })

// ============================================================
// Types
// ============================================================

export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
