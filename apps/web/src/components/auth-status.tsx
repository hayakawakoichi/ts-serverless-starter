"use client"

import Link from "next/link"
import { signOut, useSession } from "@/lib/auth-client"
import { css } from "../../styled-system/css"

export function AuthStatus() {
    const { data: session, isPending } = useSession()

    if (isPending) {
        return (
            <div
                className={css({
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontFamily: "mono",
                    fontSize: "0.875rem",
                    color: "subtle",
                })}
            >
                <span
                    className={css({
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "muted",
                        animation: "pulse 1s infinite",
                    })}
                />
                loading...
            </div>
        )
    }

    if (!session) {
        return (
            <div
                className={css({
                    display: "flex",
                    gap: "0.75rem",
                })}
            >
                <Link
                    href="/sign-in"
                    className={css({
                        padding: "0.5rem 1rem",
                        fontFamily: "mono",
                        fontSize: "0.875rem",
                        color: "text",
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                        _hover: {
                            color: "neonCyan",
                            background: "rgba(0, 255, 255, 0.1)",
                        },
                    })}
                >
                    Sign In
                </Link>
                <Link
                    href="/sign-up"
                    className={css({
                        padding: "0.5rem 1rem",
                        fontFamily: "mono",
                        fontSize: "0.875rem",
                        color: "#0a0a0f",
                        background: "neonCyan",
                        borderRadius: "8px",
                        fontWeight: "500",
                        transition: "all 0.2s ease",
                        _hover: {
                            boxShadow: "0 0 20px rgba(0, 255, 255, 0.4)",
                        },
                    })}
                >
                    Sign Up
                </Link>
            </div>
        )
    }

    return (
        <div
            className={css({
                display: "flex",
                gap: "1rem",
                alignItems: "center",
            })}
        >
            <div
                className={css({
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                })}
            >
                <div
                    className={css({
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #bf00ff 0%, #ff007f 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "mono",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        color: "white",
                        textTransform: "uppercase",
                    })}
                >
                    {session.user.name?.[0] || session.user.email?.[0] || "U"}
                </div>
                <span
                    className={css({
                        fontFamily: "mono",
                        fontSize: "0.875rem",
                        color: "text",
                        maxWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    })}
                >
                    {session.user.name || session.user.email}
                </span>
            </div>
            <button
                type="button"
                onClick={() => signOut()}
                className={css({
                    padding: "0.5rem 1rem",
                    fontFamily: "mono",
                    fontSize: "0.75rem",
                    color: "subtle",
                    background: "transparent",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    _hover: {
                        color: "neonPink",
                        borderColor: "rgba(255, 0, 127, 0.3)",
                        background: "rgba(255, 0, 127, 0.1)",
                    },
                })}
            >
                Sign Out
            </button>
        </div>
    )
}
