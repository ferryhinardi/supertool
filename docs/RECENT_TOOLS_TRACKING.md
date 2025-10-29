# Recent Tools Tracking - Usage Guide

## Overview
This guide explains how to add recent tools tracking to tool pages. The tracking system automatically stores tools users visit in IndexedDB and displays them on the homepage.

## How to Add Tracking to a Tool Page

### Step 1: Import the Hook
Add the following import to your tool page:

```typescript
import { useTrackToolView } from '@/hooks/useRecentTools'
import { tools } from '@/lib/tools'
```

### Step 2: Find Your Tool Data
At the top of your component, find your tool in the tools array:

```typescript
function YourToolPage() {
  // Find your tool in the tools array
  const toolData = tools.find((t) => t.href === '/tools/your-tool-name')
  
  // ... rest of component
}
```

### Step 3: Call the Hook
Call `useTrackToolView` with your tool data:

```typescript
function YourToolPage() {
  // Find your tool in the tools array
  const toolData = tools.find((t) => t.href === '/tools/your-tool-name')
  
  // Track tool view
  useTrackToolView({
    toolId: toolData?.href || '/tools/your-tool-name',
    title: toolData?.title || 'Your Tool Name',
    href: toolData?.href || '/tools/your-tool-name',
    iconName: 'FileJson', // Icon name as string
    gradient: toolData?.gradient || 'from-purple-500 to-pink-500',
  })
  
  // ... rest of component
}
```

## Complete Example

Here's a complete example for the JSON Beautifier tool:

```typescript
'use client'

import { useState } from 'react'
import { useTrackToolView } from '@/hooks/useRecentTools'
import { tools } from '@/lib/tools'

function JSONBeautifyContent() {
  // Find tool data
  const toolData = tools.find((t) => t.href === '/tools/json-beautify')
  
  // Track this tool view
  useTrackToolView({
    toolId: toolData?.href || '/tools/json-beautify',
    title: toolData?.title || 'JSON Beautifier',
    href: toolData?.href || '/tools/json-beautify',
    iconName: 'FileJson', // Icon name for reference
    gradient: toolData?.gradient || 'from-purple-500 to-pink-500',
  })
  
  // ... rest of your component code
  const [value, setValue] = useState('')
  
  return (
    <main>
      {/* Your tool UI */}
    </main>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JSONBeautifyContent />
    </Suspense>
  )
}
```

## Important Notes

1. **No Server Components**: The hook must be used in a client component (pages with `'use client'` directive)

2. **Tool ID Uniqueness**: The `toolId` should be the tool's href to ensure uniqueness

3. **Fallback Values**: Always provide fallback values in case the tool is not found in the tools array

4. **Performance**: The hook only tracks once when the component mounts (tracked by toolId), so it won't cause performance issues

5. **Privacy**: No user data or input is tracked - only the tool metadata

## What Gets Tracked?

The following data is stored in IndexedDB for each tool view:

- `toolId`: Unique identifier (usually the href)
- `title`: Tool name
- `href`: Tool URL path
- `iconName`: Icon name as string (for reference)
- `gradient`: Gradient colors (for visual styling)
- `timestamp`: When the tool was viewed (auto-generated)

## Testing

To test the tracking:

1. Visit a tool page with tracking enabled
2. Go back to the homepage
3. You should see a "Recently Viewed" section with the tool you just visited
4. Visit more tools to see the list grow (max 10 tools)
5. Use the "Clear History" button to reset

## Browser Support

The tracking feature requires IndexedDB support. The hook automatically checks for browser support and gracefully handles cases where IndexedDB is not available (e.g., private browsing mode in some browsers).
