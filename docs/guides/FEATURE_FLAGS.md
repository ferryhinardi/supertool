# Feature Flags

A minimal, environment-variable-backed feature flag system for SuperTool.

## Overview

Feature flags enable runtime control of feature availability without code changes or redeployment. SuperTool uses a simple, zero-dependency approach: environment variables.

## API

### `isFeatureEnabled(name: string): boolean`

Checks if a feature is enabled by reading from environment variables.

**Parameters:**
- `name` (string): Feature name (e.g., `"newDashboard"`, `"betaApi"`)

**Returns:**
- `boolean`: `true` if the feature is enabled, `false` otherwise

**Environment Variable Naming:**
- Feature names are converted to uppercase with `FEATURE_` prefix
- Example: `isFeatureEnabled("newDashboard")` reads `process.env.FEATURE_NEWDASHBOARD`

## Usage

### Enable a Feature

Set the environment variable to a truthy value:

```bash
# In .env.local or deployment environment
FEATURE_NEWDASHBOARD=true
FEATURE_BETAAPI=1
FEATURE_EXPERIMENTAL=yes
```

### Use in Code

```typescript
import { isFeatureEnabled } from '@/lib/feature-flags'

export default function MyComponent() {
  if (isFeatureEnabled('newDashboard')) {
    return <NewDashboard />
  }
  return <LegacyDashboard />
}
```

### Disable a Feature

Set the environment variable to a falsy value or omit it entirely:

```bash
# Explicitly disabled
FEATURE_NEWDASHBOARD=false
FEATURE_BETAAPI=0
FEATURE_EXPERIMENTAL=no

# Or simply omit the variable
# (undefined is treated as disabled)
```

## Truthy and Falsy Values

### Truthy Values (Feature Enabled)

The following values are treated as **enabled** (case-insensitive):
- `"true"`
- `"1"`
- `"yes"`

### Falsy Values (Feature Disabled)

All other values are treated as **disabled**, including:
- `undefined` (variable not set)
- `"false"`
- `"0"`
- `"no"`
- Any other string value

### Examples

```typescript
// Enabled
process.env.FEATURE_X = 'true'    // ✓ enabled
process.env.FEATURE_X = 'TRUE'    // ✓ enabled (case-insensitive)
process.env.FEATURE_X = '1'       // ✓ enabled
process.env.FEATURE_X = 'yes'     // ✓ enabled

// Disabled
process.env.FEATURE_X = 'false'   // ✗ disabled
process.env.FEATURE_X = '0'       // ✗ disabled
process.env.FEATURE_X = 'no'      // ✗ disabled
process.env.FEATURE_X = undefined // ✗ disabled (not set)
process.env.FEATURE_X = 'maybe'   // ✗ disabled (unknown value)
```

## Implementation Details

The implementation is minimal and zero-dependency:

```typescript
export function isFeatureEnabled(name: string): boolean {
  const envKey = `FEATURE_${name.toUpperCase()}`
  const value = process.env[envKey]
  return ['true', '1', 'yes'].includes(value?.toLowerCase() ?? '')
}
```

**Key characteristics:**
- **No external dependencies** — uses only Node.js `process.env`
- **Case-insensitive** — feature names and values are normalized to uppercase/lowercase
- **Safe defaults** — missing variables default to `false` (disabled)
- **Strict parsing** — only explicit truthy values enable features

## Testing

Feature flags are tested with comprehensive coverage:

```bash
pnpm test -- lib/__tests__/feature-flags.test.ts
```

Test cases cover:
- Truthy values (`"true"`, `"1"`, `"yes"`)
- Falsy values (`"false"`, `"0"`, `"no"`)
- Missing environment variables
- Case-insensitive parsing for supported truthy values

## Best Practices

1. **Use descriptive names** — `isFeatureEnabled('newDashboard')` is clearer than `isFeatureEnabled('x')`
2. **Document feature flags** — add comments explaining what each flag controls
3. **Clean up old flags** — remove flags once features are fully rolled out
4. **Test with flags** — verify both enabled and disabled code paths work correctly
5. **Use in conditionals** — keep feature flag logic simple and localized

## Example: Gradual Rollout

```typescript
import { isFeatureEnabled } from '@/lib/feature-flags'

export default function Dashboard() {
  const useNewLayout = isFeatureEnabled('newDashboardLayout')
  
  return (
    <main>
      {useNewLayout ? (
        <NewDashboardLayout />
      ) : (
        <LegacyDashboardLayout />
      )}
    </main>
  )
}
```

Enable the new layout in production by setting:
```bash
FEATURE_NEWDASHBOARDLAYOUT=true
```

## Limitations

This implementation is intentionally minimal:
- **No rollout percentages** — flags are all-or-nothing per environment
- **No user targeting** — flags apply globally, not per-user
- **No metadata** — no descriptions, owners, or expiration dates stored
- **No database** — all configuration via environment variables

For more complex feature flag requirements, consider a dedicated service like LaunchDarkly or Unleash.
