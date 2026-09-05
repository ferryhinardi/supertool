# nuqs Integration Guide

## Overview

SuperTool has been integrated with [nuqs](https://nuqs.47ng.com/) to enable URL-based state management. This allows users to share URLs with pre-populated tool states, making tools more shareable and bookmarkable.

## What is nuqs?

nuqs is a type-safe URL query state management library for Next.js that:
- Syncs React state with URL query parameters
- Provides type-safe parsers for different data types
- Works seamlessly with Next.js App Router (SSR/SSG)
- Enables shareable URLs with persistent state

## Setup

### 1. Installation

```bash
pnpm add nuqs@2.7.2
```

### 2. Root Layout Configuration

In `app/layout.tsx`, wrap the app content with `NuqsAdapter`:

```tsx
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <NuqsAdapter>
          {children}
        </NuqsAdapter>
      </body>
    </html>
  )
}
```

### 3. Page Component Structure

Each page using nuqs must follow this pattern:

```tsx
'use client'

import { useQueryState, parseAsBoolean } from 'nuqs'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

function ToolContent() {
  // Use nuqs hooks here
  const [value, setValue] = useQueryState('param', { defaultValue: 'default' })
  
  return (
    // Your component JSX
  )
}

export default function ToolPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ToolContent />
    </Suspense>
  )
}
```

**Important**: The Suspense boundary is required for SSG/SSR compatibility when using nuqs hooks.

## Common Patterns

### String Parameters

```tsx
const [text, setText] = useQueryState('text', { defaultValue: '' })
```

URL: `?text=hello`

### Boolean Parameters

```tsx
import { parseAsBoolean } from 'nuqs'

const [enabled, setEnabled] = useQueryState(
  'enabled', 
  parseAsBoolean.withDefault(false)
)
```

URL: `?enabled=true`

### Integer Parameters

```tsx
import { parseAsInteger } from 'nuqs'

const [length, setLength] = useQueryState(
  'length', 
  parseAsInteger.withDefault(16)
)
```

URL: `?length=20`

### Enum Parameters

```tsx
import { parseAsStringEnum } from 'nuqs'

type Mode = 'encode' | 'decode'

const [mode, setMode] = useQueryState(
  'mode',
  parseAsStringEnum<Mode>(['encode', 'decode']).withDefault('encode')
)
```

URL: `?mode=decode`

## Integrated Tools

The following tools have been updated with nuqs integration:

### 1. Base64 Tool (`app/tools/base64/page.tsx`)
- **Query Params**:
  - `mode`: 'encode' | 'decode' (default: 'encode')
  - `input`: text input (default: '')
- **Example URL**: `/tools/base64?mode=decode&input=SGVsbG8gV29ybGQ=`

### 2. JSON Beautify Tool (`app/tools/json-beautify/page.tsx`)
- **Query Params**:
  - `json`: JSON content (default: sample JSON)
- **Example URL**: `/tools/json-beautify?json={"name":"John"}`

### 3. Text Transformer Tool (`app/tools/text-transformer/page.tsx`)
- **Query Params**:
  - `text`: input text (default: '')
  - `find`: search text (default: '')
  - `replace`: replacement text (default: '')
  - `regex`: use regex (default: false)
  - `case`: case sensitive (default: false)
  - `category`: transformation category (default: 'all')
- **Example URL**: `/tools/text-transformer?text=hello&case=true&category=case`

### 4. Unit Converter Tool (`app/tools/unit-converter/page.tsx`)
- **Query Params**:
  - `category`: unit category enum (default: 'length')
  - `from`: source unit (default: 'm')
  - `to`: target unit (default: 'ft')
  - `value`: value to convert (default: '1')
- **Example URL**: `/tools/unit-converter?category=temperature&from=c&to=f&value=100`

### 5. Password Generator Tool (`app/tools/password-generator/page.tsx`)
- **Query Params**:
  - `length`: password length (default: 16)
  - `uppercase`: include uppercase (default: true)
  - `lowercase`: include lowercase (default: true)
  - `numbers`: include numbers (default: true)
  - `symbols`: include symbols (default: true)
- **Example URL**: `/tools/password-generator?length=20&symbols=false`
- **Note**: Generated passwords are NOT stored in URL for security

## Best Practices

### 1. Security Considerations
- **DO NOT** store sensitive data in URL parameters (passwords, API keys, etc.)
- Generated passwords, API keys, and sensitive outputs should remain in local state
- Large file contents should not be in URLs (use local state or localStorage)

### 2. Performance
- Keep URL parameter values reasonably small
- For large data (images, files), use local state or file uploads
- Use `defaultValue` to provide sensible defaults

### 3. User Experience
- Provide meaningful default values
- Use the `?` syntax for optional parameters
- Keep parameter names short but descriptive

### 4. Type Safety
- Always use appropriate parsers (`parseAsBoolean`, `parseAsInteger`, etc.)
- Define enums for restricted value sets
- Use `.withDefault()` to ensure values are never null/undefined

## Testing

To test nuqs integration:

1. Start dev server: `pnpm dev`
2. Navigate to a tool (e.g., `/tools/base64`)
3. Interact with the tool and observe URL changes
4. Copy the URL and open in a new tab - state should persist
5. Share the URL with others - they should see the same state

## Common Issues

### Issue: "useSearchParams() should be wrapped in a suspense boundary"
**Solution**: Wrap the component using nuqs hooks in a `<Suspense>` boundary as shown in the pattern above.

### Issue: State not syncing to URL
**Solution**: Ensure `NuqsAdapter` is properly configured in the root layout.

### Issue: TypeScript errors with parsers
**Solution**: Import the correct parser from 'nuqs' and use `.withDefault()` to provide type-safe defaults.

## Future Enhancements

Potential tools to add nuqs integration:
- QR Code Generator (text, size, error correction)
- Hash Generator (input text, algorithm)
- Markdown Editor (markdown content)
- Gradient Generator (color stops, direction)
- IP Lookup (IP address)

## References

- [nuqs Documentation](https://nuqs.47ng.com/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Suspense for Data Fetching](https://react.dev/reference/react/Suspense)
