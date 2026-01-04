"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"
import { css } from "../../../../styled-system/css"

type VerificationState = "loading" | "success" | "error" | "invalid"

function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const errorParam = searchParams.get("error")

    const [state, setState] = useState<VerificationState>("loading")
    const [errorMessage, setErrorMessage] = useState<string>("")

    useEffect(() => {
        if (errorParam) {
            setState("error")
            setErrorMessage("This verification link has expired or is invalid.")
            return
        }

        if (!token) {
            setState("invalid")
            return
        }

        // Call the verify email endpoint
        const verifyEmail = async () => {
            try {
                // Better Auth handles verification via the API endpoint
                // The token in the URL is processed automatically when the page loads
                // We just need to call the verify endpoint
                const response = await fetch(
                    `/api/auth/verify-email?token=${encodeURIComponent(token)}`,
                    { method: "GET" }
                )

                if (response.ok) {
                    setState("success")
                    // Refresh the session to update emailVerified status
                    await authClient.getSession()
                } else {
                    const data = await response.json().catch(() => ({}))
                    setState("error")
                    setErrorMessage(data.message || "Failed to verify email")
                }
            } catch {
                setState("error")
                setErrorMessage("An unexpected error occurred")
            }
        }

        verifyEmail()
    }, [token, errorParam])

    if (state === "loading") {
        return (
            <div className="glass-card" style={{ padding: "2rem" }}>
                <div
                    className={css({
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "1rem",
                    })}
                >
                    <span
                        className={css({
                            width: "32px",
                            height: "32px",
                            border: "2px solid rgba(0, 255, 255, 0.3)",
                            borderTopColor: "#00ffff",
                            borderRadius: "50%",
                            animation: "spin 0.6s linear infinite",
                        })}
                    />
                    <p
                        className={css({
                            fontFamily: "mono",
                            fontSize: "0.875rem",
                            color: "subtle",
                        })}
                    >
                        Verifying your email...
                    </p>
                </div>
            </div>
        )
    }

    if (state === "success") {
        return (
            <div className="glass-card" style={{ padding: "2rem" }}>
                <h1
                    className={css({
                        fontFamily: "display",
                        fontSize: "1.75rem",
                        fontWeight: "700",
                        color: "text",
                        textAlign: "center",
                        marginBottom: "0.5rem",
                    })}
                >
                    Email Verified!
                </h1>
                <p
                    className={css({
                        fontFamily: "mono",
                        fontSize: "0.875rem",
                        color: "subtle",
                        textAlign: "center",
                        marginBottom: "1.5rem",
                    })}
                >
                    Your email has been successfully verified.
                </p>
                <div
                    className={css({
                        padding: "0.75rem 1rem",
                        background: "rgba(57, 255, 20, 0.1)",
                        border: "1px solid rgba(57, 255, 20, 0.3)",
                        borderRadius: "8px",
                        color: "neonGreen",
                        fontSize: "0.875rem",
                        fontFamily: "mono",
                        textAlign: "center",
                        marginBottom: "1.5rem",
                    })}
                >
                    You can now access all features.
                </div>
                <Link
                    href="/"
                    className={css({
                        display: "block",
                        width: "100%",
                        padding: "0.875rem",
                        background: "linear-gradient(135deg, #00ffff 0%, #39ff14 100%)",
                        color: "#0a0a0f",
                        fontFamily: "mono",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        borderRadius: "8px",
                        textAlign: "center",
                        textDecoration: "none",
                        transition: "all 0.2s ease",
                        _hover: {
                            transform: "translateY(-1px)",
                            boxShadow: "0 10px 30px rgba(0, 255, 255, 0.3)",
                        },
                    })}
                >
                    Go to Home
                </Link>
            </div>
        )
    }

    if (state === "invalid") {
        return (
            <div className="glass-card" style={{ padding: "2rem" }}>
                <h1
                    className={css({
                        fontFamily: "display",
                        fontSize: "1.75rem",
                        fontWeight: "700",
                        color: "text",
                        textAlign: "center",
                        marginBottom: "0.5rem",
                    })}
                >
                    Invalid Link
                </h1>
                <p
                    className={css({
                        fontFamily: "mono",
                        fontSize: "0.875rem",
                        color: "subtle",
                        textAlign: "center",
                        marginBottom: "1.5rem",
                    })}
                >
                    This verification link is invalid or missing.
                </p>
                <Link
                    href="/sign-in"
                    className={css({
                        display: "block",
                        width: "100%",
                        padding: "0.875rem",
                        background: "linear-gradient(135deg, #00ffff 0%, #39ff14 100%)",
                        color: "#0a0a0f",
                        fontFamily: "mono",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        borderRadius: "8px",
                        textAlign: "center",
                        textDecoration: "none",
                        transition: "all 0.2s ease",
                        _hover: {
                            transform: "translateY(-1px)",
                            boxShadow: "0 10px 30px rgba(0, 255, 255, 0.3)",
                        },
                    })}
                >
                    Go to Sign In
                </Link>
            </div>
        )
    }

    // Error state
    return (
        <div className="glass-card" style={{ padding: "2rem" }}>
            <h1
                className={css({
                    fontFamily: "display",
                    fontSize: "1.75rem",
                    fontWeight: "700",
                    color: "text",
                    textAlign: "center",
                    marginBottom: "0.5rem",
                })}
            >
                Verification Failed
            </h1>
            <p
                className={css({
                    fontFamily: "mono",
                    fontSize: "0.875rem",
                    color: "subtle",
                    textAlign: "center",
                    marginBottom: "1.5rem",
                })}
            >
                We couldn&apos;t verify your email.
            </p>
            <div
                className={css({
                    padding: "0.75rem 1rem",
                    background: "rgba(255, 0, 127, 0.1)",
                    border: "1px solid rgba(255, 0, 127, 0.3)",
                    borderRadius: "8px",
                    color: "neonPink",
                    fontSize: "0.875rem",
                    fontFamily: "mono",
                    textAlign: "center",
                    marginBottom: "1.5rem",
                })}
            >
                {errorMessage}
            </div>
            <Link
                href="/sign-in"
                className={css({
                    display: "block",
                    width: "100%",
                    padding: "0.875rem",
                    background: "linear-gradient(135deg, #00ffff 0%, #39ff14 100%)",
                    color: "#0a0a0f",
                    fontFamily: "mono",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    borderRadius: "8px",
                    textAlign: "center",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    _hover: {
                        transform: "translateY(-1px)",
                        boxShadow: "0 10px 30px rgba(0, 255, 255, 0.3)",
                    },
                })}
            >
                Go to Sign In
            </Link>
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <main
            className={css({
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
            })}
        >
            <div
                className={css({
                    width: "100%",
                    maxWidth: "400px",
                })}
            >
                {/* Logo */}
                <Link
                    href="/"
                    className={css({
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        marginBottom: "2rem",
                        justifyContent: "center",
                        textDecoration: "none",
                    })}
                >
                    <div
                        className={css({
                            width: "40px",
                            height: "40px",
                            background: "linear-gradient(135deg, #00ffff 0%, #39ff14 100%)",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "700",
                            fontSize: "16px",
                            color: "#0a0a0f",
                            fontFamily: "mono",
                        })}
                    >
                        TS
                    </div>
                </Link>

                <Suspense
                    fallback={
                        <div className="glass-card" style={{ padding: "2rem" }}>
                            <div
                                className={css({
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    minHeight: "200px",
                                })}
                            >
                                <span
                                    className={css({
                                        width: "24px",
                                        height: "24px",
                                        border: "2px solid rgba(0, 255, 255, 0.3)",
                                        borderTopColor: "#00ffff",
                                        borderRadius: "50%",
                                        animation: "spin 0.6s linear infinite",
                                    })}
                                />
                            </div>
                        </div>
                    }
                >
                    <VerifyEmailContent />
                </Suspense>
            </div>
        </main>
    )
}
