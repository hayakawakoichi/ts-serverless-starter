import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
    title: "ts-serverless-starter",
    description: "TypeScript Serverless Starter with Turborepo",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ja">
            <body className="grid-bg">{children}</body>
        </html>
    )
}
