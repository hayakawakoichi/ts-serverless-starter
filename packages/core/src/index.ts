// Shared utilities and types

export function formatDate(date: Date): string {
    return date.toISOString()
}

export function generateId(): string {
    return globalThis.crypto.randomUUID()
}

// Constants
export { APP_NAME } from "./constants"
// Email utilities
export { type EmailOptions, sendEmail } from "./email"
export {
    type EmailTemplate,
    getPasswordResetEmailTemplate,
    getVerificationEmailTemplate,
} from "./email-templates"
// Logger
export {
    type CreateLoggerOptions,
    createChildLogger,
    createLogger,
    type Logger,
    logger,
    serializeError,
} from "./logger"
// Pagination utilities and types
export * from "./pagination"

// Auth schemas and constants
export {
    AUTH_CONSTANTS,
    emailSchema,
    type ForgotPasswordFormData,
    forgotPasswordSchema,
    nameSchema,
    passwordSchema,
    type ResetPasswordFormData,
    resetPasswordSchema,
    type SignInFormData,
    type SignUpFormData,
    signInSchema,
    signUpSchema,
} from "./schemas/auth"
