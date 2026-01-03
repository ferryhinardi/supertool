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

// Re-export userEvent for convenience
export { userEvent }
export default userEvent
