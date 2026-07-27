/**
 * Minimal environment-backed feature flag helper.
 */
export function isFeatureEnabled(name: string): boolean {
  const envKey = `FEATURE_${name.toUpperCase()}`
  const value = process.env[envKey]

  return ['true', '1', 'yes'].includes(value?.toLowerCase() ?? '')
}
