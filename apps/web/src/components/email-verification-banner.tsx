"use client"

import { useState } from "react"
import { sendVerificationEmail, useSession } from "@/lib/auth-client"
import { css } from "../../styled-system/css"

export function EmailVerificationBanner() {
    const { data: session } = useSession()
    const [isSending, setIsSending] = useState(false)
    const [isSent, setIsSent] = useState(false)

    // Don't show banner if not logged in or already verified
    if (!session || session.user.emailVerified) {
        return null
    }

    const handleResend = async () => {
        setIsSending(true)
        try {
            await sendVerificationEmail({
                email: session.user.email,
                callbackURL: "/",
            })
            setIsSent(true)
        } catch {
            // Silently fail - user can try again
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div
            className={css({
                padding: "0.75rem 1rem",
                background: "rgba(255, 165, 0, 0.1)",
                border: "1px solid rgba(255, 165, 0, 0.3)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
            })}
        >
            <p
                className={css({
                    fontFamily: "mono",
                    fontSize: "0.875rem",
                    color: "#ffa500",
                    margin: 0,
                })}
            >
                {isSent
                    ? "Verification email sent! Check your inbox."
                    : "Please verify your email address to access all features."}
            </p>
            {!isSent && (
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={isSending}
                    className={css({
                        padding: "0.5rem 1rem",
                        background: "rgba(255, 165, 0, 0.2)",
                        border: "1px solid rgba(255, 165, 0, 0.4)",
                        borderRadius: "6px",
                        color: "#ffa500",
                        fontFamily: "mono",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                        cursor: isSending ? "not-allowed" : "pointer",
                        opacity: isSending ? 0.6 : 1,
                        transition: "all 0.2s ease",
                        _hover: {
                            background: isSending
                                ? "rgba(255, 165, 0, 0.2)"
                                : "rgba(255, 165, 0, 0.3)",
                        },
                    })}
                >
                    {isSending ? "Sending..." : "Resend Email"}
                </button>
            )}
        </div>
    )
}
