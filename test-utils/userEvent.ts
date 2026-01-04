import { fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * Setup userEvent with proper configuration for testing.
 * This fixes timing issues where only the first character is typed in jsdom.
 *
 * @param options - Optional userEvent setup options
 * @returns Configured userEvent instance
 *
 * @example
 * const user = setupUserEvent()
 * await user.type(input, 'Hello World')
 * await user.click(button)
 */
export function setupUserEvent(options?: Parameters<typeof userEvent.setup>[0]) {
  return userEvent.setup({
    // Important: delay must be set explicitly
    // - undefined or omitted: Uses default delay (can be slow in tests)
    // - null: No delay, but may cause timing issues in jsdom
    // - 0: Explicitly set to 0ms, should work better in jsdom
    delay: 0,
    ...options,
  })
}

/**
 * Type text into an input element, working around Framer Motion event handling issues.
 *
 * This function uses fireEvent.change instead of userEvent.type to avoid character
 * duplication bugs that occur when Framer Motion wraps input elements.
 *
 * @param element - The input element to type into
 * @param text - The text to type
 *
 * @example
 * const input = screen.getByRole('textbox')
 * await typeIntoInput(input, '8.8.8.8')
 */
export async function typeIntoInput(element: Element, text: string) {
  // Clear the input first
  fireEvent.change(element, { target: { value: '' } })
  // Set the new value
  fireEvent.change(element, { target: { value: text } })
  // Trigger input event for React controlled components
  fireEvent.input(element, { target: { value: text } })
}

// Re-export userEvent for convenience
export { userEvent }
export default userEvent
