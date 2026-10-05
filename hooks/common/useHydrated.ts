import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/**
 * False during the server render and hydration, true afterwards. Use it to defer
 * output that depends on the visitor's clock, timezone, or storage so the server
 * HTML and the first client render match.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
