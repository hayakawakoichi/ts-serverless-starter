import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { AuthStatus } from "../auth-status"

// Mock next/link
vi.mock("next/link", () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}))

// Mock auth client
const mockSignOut = vi.fn()
const mockUseSession = vi.fn()

vi.mock("@/lib/auth-client", () => ({
    signOut: () => mockSignOut(),
    useSession: () => mockUseSession(),
}))

// Mock PandaCSS
vi.mock("../../../styled-system/css", () => ({
    css: () => "",
}))

describe("AuthStatus", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe("when loading", () => {
        it("shows loading state", () => {
            mockUseSession.mockReturnValue({
                data: null,
                isPending: true,
            })

            render(<AuthStatus />)

            expect(screen.getByText("loading...")).toBeInTheDocument()
        })
    })

    describe("when not authenticated", () => {
        beforeEach(() => {
            mockUseSession.mockReturnValue({
                data: null,
                isPending: false,
            })
        })

        it("shows sign in and sign up links", () => {
            render(<AuthStatus />)

            expect(screen.getByText("Sign In")).toBeInTheDocument()
            expect(screen.getByText("Sign Up")).toBeInTheDocument()
        })

        it("links to correct pages", () => {
            render(<AuthStatus />)

            const signInLink = screen.getByText("Sign In")
            const signUpLink = screen.getByText("Sign Up")

            expect(signInLink.closest("a")).toHaveAttribute("href", "/sign-in")
            expect(signUpLink.closest("a")).toHaveAttribute("href", "/sign-up")
        })
    })

    describe("when authenticated", () => {
        beforeEach(() => {
            mockUseSession.mockReturnValue({
                data: {
                    user: {
                        name: "John Doe",
                        email: "john@example.com",
                    },
                },
                isPending: false,
            })
        })

        it("shows user name", () => {
            render(<AuthStatus />)

            expect(screen.getByText("John Doe")).toBeInTheDocument()
        })

        it("shows first letter of name as avatar", () => {
            render(<AuthStatus />)

            expect(screen.getByText("J")).toBeInTheDocument()
        })

        it("shows sign out button", () => {
            render(<AuthStatus />)

            expect(screen.getByText("Sign Out")).toBeInTheDocument()
        })

        it("calls signOut when clicking sign out button", () => {
            render(<AuthStatus />)

            const signOutButton = screen.getByText("Sign Out")
            fireEvent.click(signOutButton)

            expect(mockSignOut).toHaveBeenCalledTimes(1)
        })
    })

    describe("when authenticated with email only", () => {
        beforeEach(() => {
            mockUseSession.mockReturnValue({
                data: {
                    user: {
                        name: null,
                        email: "user@example.com",
                    },
                },
                isPending: false,
            })
        })

        it("shows email when name is not available", () => {
            render(<AuthStatus />)

            expect(screen.getByText("user@example.com")).toBeInTheDocument()
        })

        it("shows first letter of email as avatar", () => {
            render(<AuthStatus />)

            expect(screen.getByText("u")).toBeInTheDocument()
        })
    })
})
