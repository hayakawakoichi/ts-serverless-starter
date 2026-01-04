"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { type SignInFormData, signInSchema } from "@repo/core"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { signIn } from "@/lib/auth-client"
import { css } from "../../../../styled-system/css"

export default function SignInPage() {
    const router = useRouter()

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
    })

    const onSubmit = async (data: SignInFormData) => {
        try {
            const result = await signIn.email({
                email: data.email,
                password: data.password,
            })

            if (result.error) {
                setError("root", {
                    message: result.error.message || "Sign in failed",
                })
            } else {
                router.push("/")
                router.refresh()
            }
        } catch {
            setError("root", {
                message: "An unexpected error occurred",
            })
        }
    }

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

                {/* Card */}
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
                        Welcome back
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
                        Sign in to your account
                    </p>

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
                                htmlFor="email"
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
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                {...register("email")}
                                className={css({
                                    width: "100%",
                                    padding: "0.875rem 1rem",
                                    background: "rgba(10, 10, 15, 0.8)",
                                    border: errors.email
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
                                    _placeholder: {
                                        color: "muted",
                                    },
                                })}
                                placeholder="you@example.com"
                            />
                            {errors.email && (
                                <p
                                    className={css({
                                        marginTop: "0.5rem",
                                        fontSize: "0.75rem",
                                        color: "neonPink",
                                        fontFamily: "mono",
                                    })}
                                >
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

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
                                Password
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
                            <Link
                                href="/forgot-password"
                                className={css({
                                    display: "block",
                                    marginTop: "0.5rem",
                                    fontSize: "0.75rem",
                                    color: "subtle",
                                    fontFamily: "mono",
                                    textDecoration: "none",
                                    textAlign: "right",
                                    _hover: {
                                        color: "neonCyan",
                                    },
                                })}
                            >
                                Forgot password?
                            </Link>
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
                                    Signing in...
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                </div>

                <p
                    className={css({
                        marginTop: "1.5rem",
                        textAlign: "center",
                        fontFamily: "mono",
                        fontSize: "0.875rem",
                        color: "subtle",
                    })}
                >
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/sign-up"
                        className={css({
                            color: "neonCyan",
                            textDecoration: "none",
                            _hover: {
                                textDecoration: "underline",
                            },
                        })}
                    >
                        Sign Up
                    </Link>
                </p>
            </div>
        </main>
    )
}
