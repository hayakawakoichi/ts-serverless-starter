import { defineConfig } from "@pandacss/dev"

export default defineConfig({
    preflight: true,
    include: ["./src/**/*.{js,jsx,ts,tsx}"],
    exclude: [],
    theme: {
        extend: {
            tokens: {
                colors: {
                    // Terminal-inspired dark palette
                    void: { value: "#0a0a0f" },
                    abyss: { value: "#12121a" },
                    slate: { value: "#1a1a24" },
                    muted: { value: "#3a3a4a" },
                    subtle: { value: "#6a6a7a" },
                    text: { value: "#e0e0e8" },
                    // Neon accents
                    neonCyan: { value: "#00ffff" },
                    neonGreen: { value: "#39ff14" },
                    neonPurple: { value: "#bf00ff" },
                    neonPink: { value: "#ff007f" },
                    // Glow versions (for shadows)
                    glowCyan: { value: "rgba(0, 255, 255, 0.5)" },
                    glowGreen: { value: "rgba(57, 255, 20, 0.4)" },
                    glowPurple: { value: "rgba(191, 0, 255, 0.4)" },
                },
                fonts: {
                    mono: { value: "'JetBrains Mono', 'Fira Code', monospace" },
                    display: { value: "'Space Grotesk', system-ui, sans-serif" },
                    body: { value: "'Inter', system-ui, sans-serif" },
                },
                animations: {
                    pulse: { value: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" },
                    glow: { value: "glow 2s ease-in-out infinite alternate" },
                    float: { value: "float 6s ease-in-out infinite" },
                    shimmer: { value: "shimmer 2s linear infinite" },
                    fadeIn: { value: "fadeIn 0.6s ease-out forwards" },
                    slideUp: { value: "slideUp 0.6s ease-out forwards" },
                },
            },
            keyframes: {
                pulse: {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.5" },
                },
                glow: {
                    "0%": { filter: "brightness(1)" },
                    "100%": { filter: "brightness(1.3)" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
        },
    },
    globalCss: {
        html: {
            scrollBehavior: "smooth",
        },
        body: {
            bg: "void",
            color: "text",
            fontFamily: "body",
            lineHeight: "1.6",
            overflowX: "hidden",
        },
        "*, *::before, *::after": {
            boxSizing: "border-box",
        },
        a: {
            color: "neonCyan",
            textDecoration: "none",
            transition: "all 0.2s ease",
            _hover: {
                textShadow: "0 0 10px token(colors.glowCyan)",
            },
        },
    },
    outdir: "styled-system",
})
