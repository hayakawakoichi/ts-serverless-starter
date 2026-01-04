"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { type ResetPasswordFormData, resetPasswordSchema } from "@repo/core"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { useForm } from "react-hook-form"
import { resetPassword } from "@/lib/auth-client"
import { css } from "../../../../styled-system/css"

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const error = searchParams.get("error")

    const [isSuccess, setIsSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    })

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) {
            setError("root", { message: "Invalid or missing reset token" })
            return
        }

        try {
            const result = await resetPassword({
                newPassword: data.password,
                token,
            })

            if (result.error) {
                setError("root", {
                    message: result.error.message || "Failed to reset password",
                })
            } else {
                setIsSuccess(true)
                setTimeout(() => {
                    router.push("/sign-in")
                }, 2000)
            }
        } catch {
            setError("root", {
                message: "An unexpected error occurred",
            })
        }
    }

    // Show error if token is invalid
    if (error === "INVALID_TOKEN") {
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
                    Link Expired
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
                    This password reset link has expired or is invalid.
                </p>
                <Link
                    href="/forgot-password"
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
                    Request New Link
                </Link>
            </div>
        )
    }

    // Show error if no token
    if (!token) {
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
                    This password reset link is invalid.
                </p>
                <Link
                    href="/forgot-password"
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
                    Request Password Reset
                </Link>
            </div>
        )
    }

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
                Reset Password
            </h1>
            <p
                className={css({
                    fontFamily: "mono",
                    fontSize: "0.875rem",
                    color: "subtle",
                    textAlign: "center",
                    marginBottom: "2rem",
                })}
            >
                {isSuccess ? "Password reset successful!" : "Enter your new password"}
            </p>

            {isSuccess ? (
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
                    })}
                >
                    Your password has been reset. Redirecting to sign in...
                </div>
            ) : (
                <>
                    {errors.root && (
                        <div
                            className={css({
                                padding: "0.75rem 1rem",
                                background: "rgba(255, 0, 127, 0.1)",
                                border: "1px solid rgba(255, 0, 127, 0.3)",
                                borderRadius: "8px",
                                color: "neonPink",
                                fontSize: "0.875rem",
                                fontFamily: "mono",
                                marginBottom: "1.5rem",
                            })}
                        >
                            {errors.root.message}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className={css({
                            display: "flex",
                            flexDirection: "column",
                            gap: "1.25rem",
                        })}
                    >
                        <div>
                            <label
                                htmlFor="password"
                                className={css({
                                    display: "block",
                                    fontFamily: "mono",
                                    fontSize: "0.75rem",
                                    color: "subtle",
                                    marginBottom: "0.5rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                })}
                            >
                                New Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                {...register("password")}
                                className={css({
                                    width: "100%",
                                    padding: "0.875rem 1rem",
                                    background: "rgba(10, 10, 15, 0.8)",
                                    border: errors.password
                                        ? "1px solid rgba(255, 0, 127, 0.5)"
                                        : "1px solid rgba(255, 255, 255, 0.1)",
                                    borderRadius: "8px",
                                    color: "text",
                                    fontFamily: "mono",
                                    fontSize: "0.875rem",
                                    outline: "none",
                                    transition: "all 0.2s ease",
                                    _focus: {
                                        borderColor: "neonCyan",
                                        boxShadow: "0 0 0 2px rgba(0, 255, 255, 0.1)",
                                    },
                                })}
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p
                                    className={css({
                                        marginTop: "0.5rem",
                                        fontSize: "0.75rem",
                                        color: "neonPink",
                                        fontFamily: "mono",
                                    })}
                                >
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className={css({
                                    display: "block",
                                    fontFamily: "mono",
                                    fontSize: "0.75rem",
                                    color: "subtle",
                                    marginBottom: "0.5rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                })}
                            >
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                {...register("confirmPassword")}
                                className={css({
                                    width: "100%",
                                    padding: "0.875rem 1rem",
                                    background: "rgba(10, 10, 15, 0.8)",
                                    border: errors.confirmPassword
                                        ? "1px solid rgba(255, 0, 127, 0.5)"
                                        : "1px solid rgba(255, 255, 255, 0.1)",
                                    borderRadius: "8px",
                                    color: "text",
                                    fontFamily: "mono",
                                    fontSize: "0.875rem",
                                    outline: "none",
                                    transition: "all 0.2s ease",
                                    _focus: {
                                        borderColor: "neonCyan",
                                        boxShadow: "0 0 0 2px rgba(0, 255, 255, 0.1)",
                                    },
                                })}
                                placeholder="••••••••"
                            />
                            {errors.confirmPassword && (
                                <p
                                    className={css({
                                        marginTop: "0.5rem",
                                        fontSize: "0.75rem",
                                        color: "neonPink",
                                        fontFamily: "mono",
                                    })}
                                >
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={css({
                                width: "100%",
                                padding: "0.875rem",
                                background: isSubmitting
                                    ? "rgba(0, 255, 255, 0.3)"
                                    : "linear-gradient(135deg, #00ffff 0%, #39ff14 100%)",
                                color: "#0a0a0f",
                                fontFamily: "mono",
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                borderRadius: "8px",
                                border: "none",
                                cursor: isSubmitting ? "not-allowed" : "pointer",
                                transition: "all 0.2s ease",
                                _hover: {
                                    transform: isSubmitting ? "none" : "translateY(-1px)",
                                    boxShadow: isSubmitting
                                        ? "none"
                                        : "0 10px 30px rgba(0, 255, 255, 0.3)",
                                },
                            })}
                        >
                            {isSubmitting ? (
                                <span
                                    className={css({
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "0.5rem",
                                    })}
                                >
                                    <span
                                        className={css({
                                            width: "16px",
                                            height: "16px",
                                            border: "2px solid transparent",
                                            borderTopColor: "#0a0a0f",
                                            borderRadius: "50%",
                                            animation: "spin 0.6s linear infinite",
                                        })}
                                    />
                                    Resetting...
                                </span>
                            ) : (
                                "Reset Password"
                            )}
                        </button>
                    </form>
                </>
            )}
        </div>
    )
}

export default function ResetPasswordPage() {
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
                    <ResetPasswordForm />
                </Suspense>

                <p
                    className={css({
                        marginTop: "1.5rem",
                        textAlign: "center",
                        fontFamily: "mono",
                        fontSize: "0.875rem",
                        color: "subtle",
                    })}
                >
                    Remember your password?{" "}
                    <Link
                        href="/sign-in"
                        className={css({
                            color: "neonCyan",
                            textDecoration: "none",
                            _hover: {
                                textDecoration: "underline",
                            },
                        })}
                    >
                        Sign In
                    </Link>
                </p>
            </div>
        </main>
    )
}
