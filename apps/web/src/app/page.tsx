import { AuthStatus } from "@/components/auth-status"
import { EmailVerificationBanner } from "@/components/email-verification-banner"
import { css } from "../../styled-system/css"

const techStack = [
    {
        name: "Next.js 16",
        description: "App Router + React 19",
        icon: "N",
        color: "#00ffff",
    },
    {
        name: "Hono",
        description: "Lambdalith API",
        icon: "H",
        color: "#39ff14",
    },
    {
        name: "Neon",
        description: "PostgreSQL + Drizzle",
        icon: "D",
        color: "#bf00ff",
    },
    {
        name: "AWS CDK",
        description: "Infrastructure as Code",
        icon: "A",
        color: "#ff007f",
    },
    {
        name: "Turborepo",
        description: "pnpm Monorepo",
        icon: "T",
        color: "#00ffff",
    },
    {
        name: "Better Auth",
        description: "Authentication",
        icon: "B",
        color: "#39ff14",
    },
]

export default function Home() {
    return (
        <main
            className={css({
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
            })}
        >
            {/* Background decoration */}
            <div
                className={css({
                    position: "absolute",
                    top: "-50%",
                    right: "-20%",
                    width: "800px",
                    height: "800px",
                    background:
                        "radial-gradient(circle, rgba(0, 255, 255, 0.08) 0%, transparent 70%)",
                    pointerEvents: "none",
                    zIndex: 0,
                })}
            />
            <div
                className={css({
                    position: "absolute",
                    bottom: "-30%",
                    left: "-10%",
                    width: "600px",
                    height: "600px",
                    background:
                        "radial-gradient(circle, rgba(191, 0, 255, 0.06) 0%, transparent 70%)",
                    pointerEvents: "none",
                    zIndex: 0,
                })}
            />

            {/* Header */}
            <header
                className={css({
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1.5rem 2rem",
                    borderBottom: "1px solid rgba(0, 255, 255, 0.1)",
                    position: "relative",
                    zIndex: 10,
                })}
            >
                <div
                    className={css({
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                    })}
                >
                    <div
                        className={css({
                            width: "32px",
                            height: "32px",
                            background: "linear-gradient(135deg, #00ffff 0%, #39ff14 100%)",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "700",
                            fontSize: "14px",
                            color: "#0a0a0f",
                            fontFamily: "mono",
                        })}
                    >
                        TS
                    </div>
                    <span
                        className={css({
                            fontFamily: "mono",
                            fontSize: "1rem",
                            fontWeight: "500",
                            color: "text",
                        })}
                    >
                        ts-serverless-starter
                    </span>
                </div>
                <AuthStatus />
            </header>

            {/* Email Verification Banner */}
            <div className={css({ padding: "0 2rem", position: "relative", zIndex: 10 })}>
                <EmailVerificationBanner />
            </div>

            {/* Hero Section */}
            <section
                className={css({
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4rem 2rem",
                    textAlign: "center",
                    position: "relative",
                    zIndex: 10,
                })}
            >
                {/* Terminal-style badge */}
                <div
                    className={css({
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 1rem",
                        background: "rgba(0, 255, 255, 0.1)",
                        border: "1px solid rgba(0, 255, 255, 0.2)",
                        borderRadius: "9999px",
                        marginBottom: "2rem",
                        fontFamily: "mono",
                        fontSize: "0.875rem",
                    })}
                >
                    <span
                        className={css({
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#39ff14",
                            animation: "pulse 2s infinite",
                        })}
                    />
                    <span className={css({ color: "subtle" })}>$</span>
                    <span className={css({ color: "neonCyan" })}>
                        npx degit hayakawakoichi/ts-serverless-starter my-app
                    </span>
                </div>

                {/* Main heading */}
                <h1
                    className={css({
                        fontFamily: "display",
                        fontSize: "clamp(2.5rem, 8vw, 5rem)",
                        fontWeight: "700",
                        lineHeight: "1.1",
                        marginBottom: "1.5rem",
                        maxWidth: "900px",
                    })}
                >
                    <span className={css({ color: "text" })}>Build </span>
                    <span className="gradient-text">Serverless</span>
                    <br />
                    <span className={css({ color: "text" })}>TypeScript Apps</span>
                </h1>

                {/* Subtitle */}
                <p
                    className={css({
                        fontSize: "1.25rem",
                        color: "subtle",
                        maxWidth: "600px",
                        marginBottom: "3rem",
                        lineHeight: "1.7",
                    })}
                >
                    Production-ready monorepo with Next.js, Hono API, Neon PostgreSQL, and AWS CDK.
                    <br />
                    <span className={css({ color: "neonCyan" })}>
                        Deploy to AWS Lambda in minutes.
                    </span>
                </p>

                {/* CTA buttons */}
                <div
                    className={css({
                        display: "flex",
                        gap: "1rem",
                        flexWrap: "wrap",
                        justifyContent: "center",
                    })}
                >
                    <a
                        href="https://github.com/hayakawakoichi/ts-serverless-starter"
                        className={css({
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.875rem 1.75rem",
                            background: "linear-gradient(135deg, #00ffff 0%, #39ff14 100%)",
                            color: "#0a0a0f",
                            fontWeight: "600",
                            borderRadius: "12px",
                            transition: "all 0.2s ease",
                            textDecoration: "none",
                            _hover: {
                                transform: "translateY(-2px)",
                                boxShadow: "0 10px 40px rgba(0, 255, 255, 0.3)",
                            },
                        })}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        Get Started
                    </a>
                    <a
                        href="/api/v1/docs"
                        className={css({
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.875rem 1.75rem",
                            background: "transparent",
                            color: "neonCyan",
                            fontWeight: "600",
                            borderRadius: "12px",
                            border: "1px solid rgba(0, 255, 255, 0.3)",
                            transition: "all 0.2s ease",
                            textDecoration: "none",
                            _hover: {
                                background: "rgba(0, 255, 255, 0.1)",
                                borderColor: "neonCyan",
                            },
                        })}
                    >
                        API Docs
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                        >
                            <path d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                    </a>
                </div>
            </section>

            {/* Tech Stack Section */}
            <section
                className={css({
                    padding: "4rem 2rem",
                    position: "relative",
                    zIndex: 10,
                })}
            >
                <h2
                    className={css({
                        fontFamily: "mono",
                        fontSize: "0.875rem",
                        color: "subtle",
                        textAlign: "center",
                        marginBottom: "2rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.2em",
                    })}
                >
                    {"// Tech Stack"}
                </h2>

                <div
                    className={css({
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "1rem",
                        maxWidth: "1200px",
                        margin: "0 auto",
                    })}
                >
                    {techStack.map((tech, index) => (
                        <div
                            key={tech.name}
                            className="glass-card"
                            style={{
                                padding: "1.5rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                transition: "all 0.3s ease",
                                animationDelay: `${index * 0.1}s`,
                            }}
                        >
                            <div
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    background: `linear-gradient(135deg, ${tech.color}20 0%, ${tech.color}10 100%)`,
                                    border: `1px solid ${tech.color}40`,
                                    borderRadius: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontWeight: "600",
                                    fontSize: "1.25rem",
                                    color: tech.color,
                                }}
                            >
                                {tech.icon}
                            </div>
                            <div>
                                <h3
                                    className={css({
                                        fontWeight: "600",
                                        fontSize: "1rem",
                                        color: "text",
                                        marginBottom: "0.25rem",
                                    })}
                                >
                                    {tech.name}
                                </h3>
                                <p
                                    className={css({
                                        fontSize: "0.875rem",
                                        color: "subtle",
                                    })}
                                >
                                    {tech.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer
                className={css({
                    padding: "2rem",
                    borderTop: "1px solid rgba(0, 255, 255, 0.1)",
                    textAlign: "center",
                    position: "relative",
                    zIndex: 10,
                })}
            >
                <p
                    className={css({
                        fontFamily: "mono",
                        fontSize: "0.875rem",
                        color: "subtle",
                    })}
                >
                    <span className={css({ color: "muted" })}>{"/* "}</span>
                    Made with <span className={css({ color: "neonPink" })}>{"<3"}</span> using
                    TypeScript
                    <span className={css({ color: "muted" })}>{" */"}</span>
                </p>
            </footer>
        </main>
    )
}
