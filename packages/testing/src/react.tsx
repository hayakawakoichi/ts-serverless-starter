/**
 * React Testing Library utilities
 */

import { cleanup, type RenderOptions, type RenderResult, render } from "@testing-library/react"
import userEvent, { type UserEvent } from "@testing-library/user-event"
import type { ReactElement, ReactNode } from "react"
import { afterEach } from "vitest"

// Cleanup after each test
afterEach(() => {
    cleanup()
})

// Re-export everything from @testing-library/react
export * from "@testing-library/react"
export { userEvent }

type CustomRenderOptions = Omit<RenderOptions, "wrapper">

type RenderWithProvidersResult = RenderResult & {
    user: UserEvent
}

/**
 * Custom render function with common providers
 */
export function renderWithProviders(
    ui: ReactElement,
    options?: CustomRenderOptions & {
        providers?: Array<({ children }: { children: ReactNode }) => ReactElement>
    }
): RenderWithProvidersResult {
    const { providers = [], ...renderOptions } = options ?? {}

    // Compose providers from array
    function AllProviders({ children }: { children: ReactNode }): ReactElement {
        return providers.reduceRight<ReactNode>(
            // biome-ignore lint/correctness/useJsxKeyInIterable: Providers don't need keys in this context
            (acc, Provider) => <Provider>{acc}</Provider>,
            children
        ) as ReactElement
    }

    const user = userEvent.setup()

    return {
        user,
        ...render(ui, {
            wrapper: providers.length > 0 ? AllProviders : undefined,
            ...renderOptions,
        }),
    }
}

/**
 * Wait for element to be removed with timeout
 */
export async function waitForElementToBeRemoved(
    callback: () => Element | null,
    options?: { timeout?: number }
): Promise<void> {
    const { timeout = 1000 } = options ?? {}
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
        if (callback() === null) {
            return
        }
        await new Promise((resolve) => setTimeout(resolve, 50))
    }

    throw new Error(`Element was not removed within ${timeout}ms`)
}
