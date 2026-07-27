import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { isFeatureEnabled } from '../feature-flags'

describe('FeatureFlags', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should return true when env var is "true"', () => {
    process.env.FEATURE_TEST = 'true'
    expect(isFeatureEnabled('test')).toBe(true)
  })

  it('should return false when env var is "false"', () => {
    process.env.FEATURE_TEST = 'false'
    expect(isFeatureEnabled('test')).toBe(false)
  })

  it('should return false when env var is missing', () => {
    delete process.env.FEATURE_TEST
    expect(isFeatureEnabled('test')).toBe(false)
  })

  it('should handle various truthy values like "1" and "YES"', () => {
    process.env.FEATURE_TEST = '1'
    expect(isFeatureEnabled('test')).toBe(true)
    process.env.FEATURE_TEST = 'YES'
    expect(isFeatureEnabled('test')).toBe(true)
    process.env.FEATURE_TEST = 'yes'
    expect(isFeatureEnabled('test')).toBe(true)
  })

  it('should handle various falsy values like "0" and "no"', () => {
    process.env.FEATURE_TEST = '0'
    expect(isFeatureEnabled('test')).toBe(false)
    process.env.FEATURE_TEST = 'no'
    expect(isFeatureEnabled('test')).toBe(false)
    process.env.FEATURE_TEST = 'NO'
    expect(isFeatureEnabled('test')).toBe(false)
  })
})
