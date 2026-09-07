'use client'

import { useCallback, useSyncExternalStore } from 'react'

function subscribeToMediaQuery(query: string, onStoreChange: () => void) {
  if (typeof window.matchMedia !== 'function') {
    return () => {}
  }

  const mediaQuery = window.matchMedia(query)
  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', onStoreChange)
    return () => mediaQuery.removeEventListener('change', onStoreChange)
  }
  if (typeof mediaQuery.addListener === 'function') {
    mediaQuery.addListener(onStoreChange)
    return () => mediaQuery.removeListener(onStoreChange)
  }
  return () => {}
}

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeToMediaQuery(query, onStoreChange),
    [query]
  )
  const getSnapshot = useCallback(() => {
    if (typeof window.matchMedia !== 'function') return false
    return window.matchMedia(query).matches
  }, [query])
  const getServerSnapshot = useCallback(() => false, [])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
