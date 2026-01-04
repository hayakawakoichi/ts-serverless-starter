import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
})

export const { signIn, signUp, signOut, useSession, sendVerificationEmail } = authClient

// Password reset - use fetch to call the API directly
export async function forgetPassword(options: { email: string; redirectTo: string }) {
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const response = await fetch(`${baseURL}/api/auth/request-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
    })
    const data = await response.json()
    if (!response.ok) {
        return { error: { message: data.message || "Failed to request password reset" } }
    }
    return { data }
}

export async function resetPassword(options: { newPassword: string; token: string }) {
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const response = await fetch(`${baseURL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
    })
    const data = await response.json()
    if (!response.ok) {
        return { error: { message: data.message || "Failed to reset password" } }
    }
    return { data }
}
