/**
 * Generate a unique id without reading Date.now() during render.
 * `crypto.randomUUID()` is preferred; the fallback is for older test environments.
 */
export function createId(prefix?: string): string {
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `id-${Math.random().toString(36).slice(2, 11)}`
  return prefix ? `${prefix}-${id}` : id
}
