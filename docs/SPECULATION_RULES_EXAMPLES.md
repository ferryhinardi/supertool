# 📖 Speculation Rules API - Usage Examples

> **Practical examples for using the Speculation Rules API in SuperTool**

## Table of Contents

- [Basic Usage](#basic-usage)
- [Opting Out](#opting-out)
- [Dynamic Rules](#dynamic-rules)
- [Conditional Speculation](#conditional-speculation)
- [Multi-step Flows](#multi-step-flows)
- [Analytics Integration](#analytics-integration)
- [Advanced Patterns](#advanced-patterns)

---

## Basic Usage

### ✅ Already Working!

The Speculation Rules API is automatically enabled when you load any page. No code needed!

```tsx
// Your existing Next.js pages automatically benefit from:
// - Prefetching: All internal links
// - Prerendering: Homepage and top 3 tools

export default function ToolPage() {
  return (
    <div>
      <h1>JSON Beautifier</h1>
      {/* Links are automatically prefetched on hover */}
      <Link href="/tools/password-generator">
        Try Password Generator
      </Link>
    </div>
  )
}
```

---

## Opting Out

### Exclude Heavy Pages from Prerendering

```tsx
import Link from 'next/link'

export default function Sidebar() {
  return (
    <nav>
      {/* Normal link - will be prerendered */}
      <Link href="/tools/json-beautify">
        JSON Beautifier
      </Link>

      {/* Heavy tool - opt out of prerendering */}
      <Link href="/tools/upload" className="no-prerender">
        File Upload
      </Link>

      {/* Heavy tool - opt out of prefetching too */}
      <Link href="/tools/file-inspector" className="no-prerender no-prefetch">
        File Inspector
      </Link>
    </nav>
  )
}
```

### Exclude API Calls

```tsx
export default function AdminPanel() {
  return (
    <div>
      <h1>Admin</h1>
      
      {/* Don't prefetch logout - state changing */}
      <Link href="/logout" className="no-prefetch">
        Logout
      </Link>

      {/* Don't prefetch expensive API calls */}
      <Link href="/api/export-all-data" className="no-prefetch">
        Export All Data
      </Link>
    </div>
  )
}
```

---

## Dynamic Rules

### Prerender Based on User Action

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addSpeculationRule } from '@/components/SpeculationRules'

export default function JsonBeautifyPage() {
  const router = useRouter()
  const [json, setJson] = useState('')

  const handleFormat = () => {
    // User is actively using JSON tools
    // Prerender related tools for instant navigation
    addSpeculationRule({
      prerender: [{
        source: 'list',
        urls: [
          '/tools/json-schema',
          '/tools/json-to-csv',
          '/tools/yaml-json'
        ]
      }]
    })

    // Format JSON...
    const formatted = JSON.stringify(JSON.parse(json), null, 2)
    setJson(formatted)
  }

  return (
    <div>
      <textarea value={json} onChange={(e) => setJson(e.target.value)} />
      <button onClick={handleFormat}>Format</button>
    </div>
  )
}
```

### Prerender Next Step on Button Click

```tsx
'use client'

import { addSpeculationRule } from '@/components/SpeculationRules'
import { useRouter } from 'next/navigation'

export default function Step1() {
  const router = useRouter()

  const handleContinue = () => {
    // Prerender step 2 before navigating
    addSpeculationRule({
      prerender: [{
        source: 'list',
        urls: ['/tools/password-generator/step-2']
      }]
    })

    // Small delay to let prerender start
    setTimeout(() => {
      router.push('/tools/password-generator/step-2')
    }, 100)
  }

  return (
    <div>
      <h1>Step 1</h1>
      <button onClick={handleContinue}>
        Continue to Step 2
      </button>
    </div>
  )
}
```

---

## Conditional Speculation

### Category-Based Prerendering

```tsx
'use client'

import { useEffect, useState } from 'react'
import { addSpeculationRule } from '@/components/SpeculationRules'

export default function ToolsPage() {
  const [category, setCategory] = useState<'all' | 'formatters' | 'generators'>('all')

  useEffect(() => {
    // Prerender tools based on selected category
    if (category === 'formatters') {
      addSpeculationRule({
        prerender: [{
          source: 'list',
          urls: [
            '/tools/json-beautify',
            '/tools/yaml-json',
            '/tools/markdown-editor'
          ]
        }]
      })
    } else if (category === 'generators') {
      addSpeculationRule({
        prerender: [{
          source: 'list',
          urls: [
            '/tools/password-generator',
            '/tools/qr-code',
            '/tools/uuid-generator'
          ]
        }]
      })
    }
  }, [category])

  return (
    <div>
      <select value={category} onChange={(e) => setCategory(e.target.value as any)}>
        <option value="all">All Tools</option>
        <option value="formatters">Formatters</option>
        <option value="generators">Generators</option>
      </select>

      {/* Tool list... */}
    </div>
  )
}
```

### User Preference-Based

```tsx
'use client'

import { useEffect } from 'react'
import { addSpeculationRule } from '@/components/SpeculationRules'

export default function HomePage() {
  useEffect(() => {
    // Check if user prefers prerendering (respects Data Saver)
    const prefersReducedData = navigator.connection?.saveData
    
    if (!prefersReducedData) {
      // User has plenty of bandwidth - aggressive prerendering
      addSpeculationRule({
        prerender: [{
          source: 'list',
          urls: [
            '/tools/json-beautify',
            '/tools/password-generator',
            '/tools/qr-code',
            '/tools/markdown-editor',
            '/tools/diff'
          ]
        }]
      })
    }
  }, [])

  return <div>Homepage</div>
}
```

---

## Multi-step Flows

### Wizard with Prerendering

```tsx
'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { addSpeculationRule } from '@/components/SpeculationRules'

export default function PasswordGeneratorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const step = searchParams.get('step') || '1'

  useEffect(() => {
    // Prerender next step
    const nextStep = parseInt(step) + 1
    if (nextStep <= 3) {
      addSpeculationRule({
        prerender: [{
          source: 'list',
          urls: [`/tools/password-generator?step=${nextStep}`]
        }]
      })
    }
  }, [step])

  return (
    <div>
      <h1>Step {step}</h1>
      {step !== '3' && (
        <button onClick={() => router.push(`?step=${parseInt(step) + 1}`)}>
          Next
        </button>
      )}
    </div>
  )
}
```

---

## Analytics Integration

### Track Speculation Effectiveness

```tsx
'use client'

import { useEffect } from 'react'
import { useSpeculationStatus } from '@/components/SpeculationRules'

export default function ToolPage() {
  const { wasPrerendered, wasPrefetched } = useSpeculationStatus()

  useEffect(() => {
    // Track in Google Analytics
    if (wasPrerendered) {
      gtag('event', 'page_load_type', {
        type: 'prerendered',
        page: window.location.pathname
      })
    } else if (wasPrefetched) {
      gtag('event', 'page_load_type', {
        type: 'prefetched',
        page: window.location.pathname
      })
    } else {
      gtag('event', 'page_load_type', {
        type: 'normal',
        page: window.location.pathname
      })
    }
  }, [wasPrerendered, wasPrefetched])

  return <div>Tool Content</div>
}
```

### Performance Monitoring

```tsx
'use client'

import { useEffect } from 'react'
import { useSpeculationStatus } from '@/components/SpeculationRules'

export default function PerformanceMonitor() {
  const { wasPrerendered } = useSpeculationStatus()

  useEffect(() => {
    if (typeof window !== 'undefined' && window.performance) {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

      console.log({
        wasPrerendered,
        loadTime: perfData.loadEventEnd - perfData.loadEventStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        ttfb: perfData.responseStart - perfData.requestStart
      })

      // Send to analytics
      gtag('event', 'page_performance', {
        wasPrerendered,
        loadTime: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
        ttfb: Math.round(perfData.responseStart - perfData.requestStart)
      })
    }
  }, [wasPrerendered])

  return null
}
```

---

## Advanced Patterns

### Smart Prerendering Based on Time of Day

```tsx
'use client'

import { useEffect } from 'react'
import { addSpeculationRule } from '@/components/SpeculationRules'

export default function SmartPrerender() {
  useEffect(() => {
    const hour = new Date().getHours()
    
    if (hour >= 9 && hour <= 17) {
      // Business hours - prerender work tools
      addSpeculationRule({
        prerender: [{
          source: 'list',
          urls: [
            '/tools/json-beautify',
            '/tools/api-tester',
            '/tools/markdown-editor'
          ]
        }]
      })
    } else {
      // After hours - prerender personal tools
      addSpeculationRule({
        prerender: [{
          source: 'list',
          urls: [
            '/tools/password-generator',
            '/tools/qr-code',
            '/tools/unit-converter'
          ]
        }]
      })
    }
  }, [])

  return null
}
```

### A/B Testing Speculation Rules

```tsx
'use client'

import { useEffect } from 'react'
import { addSpeculationRule } from '@/components/SpeculationRules'

export default function ABTestSpeculation() {
  useEffect(() => {
    // 50% of users get aggressive prerendering
    const variant = Math.random() > 0.5 ? 'aggressive' : 'conservative'
    
    if (variant === 'aggressive') {
      addSpeculationRule({
        prerender: [{
          source: 'list',
          urls: [
            '/tools/json-beautify',
            '/tools/password-generator',
            '/tools/qr-code',
            '/tools/markdown-editor',
            '/tools/diff'
          ]
        }]
      })
      
      // Track variant
      gtag('event', 'speculation_variant', { variant: 'aggressive' })
    } else {
      // Only prerender homepage
      addSpeculationRule({
        prerender: [{
          source: 'list',
          urls: ['/']
        }]
      })
      
      gtag('event', 'speculation_variant', { variant: 'conservative' })
    }
  }, [])

  return null
}
```

### Prerender on Search

```tsx
'use client'

import { useState, useEffect } from 'react'
import { addSpeculationRule } from '@/components/SpeculationRules'

export default function ToolSearch() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<string[]>([])

  useEffect(() => {
    if (search) {
      // Search for tools
      const matched = [
        '/tools/json-beautify',
        '/tools/password-generator',
        '/tools/qr-code'
      ].filter(url => url.includes(search.toLowerCase()))

      setResults(matched)

      // Prerender top 3 search results
      if (matched.length > 0) {
        addSpeculationRule({
          prerender: [{
            source: 'list',
            urls: matched.slice(0, 3)
          }]
        })
      }
    }
  }, [search])

  return (
    <div>
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search tools..."
      />
      <ul>
        {results.map(url => (
          <li key={url}>
            <Link href={url}>{url}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

## Real-World Example: Complete Tool Page

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { addSpeculationRule, useSpeculationStatus } from '@/components/SpeculationRules'

export default function JsonBeautifyPage() {
  const router = useRouter()
  const [json, setJson] = useState('')
  const { wasPrerendered, wasPrefetched } = useSpeculationStatus()

  // Track page load performance
  useEffect(() => {
    if (wasPrerendered) {
      console.log('⚡ Page was prerendered - instant load!')
      gtag('event', 'prerender_success', {
        page: '/tools/json-beautify'
      })
    }
  }, [wasPrerendered])

  // Prerender related tools when user starts using this tool
  const handleInput = (value: string) => {
    setJson(value)

    // User is actively using JSON tools
    // Prerender related tools for instant navigation
    if (value.length > 10) {
      addSpeculationRule({
        prerender: [{
          source: 'list',
          urls: [
            '/tools/json-schema',
            '/tools/json-to-csv',
            '/tools/yaml-json'
          ]
        }]
      })
    }
  }

  return (
    <main>
      <h1>JSON Beautifier</h1>
      
      {/* Performance badge */}
      {wasPrerendered && (
        <span style={{ color: 'green' }}>⚡ Instant Load</span>
      )}

      <textarea
        value={json}
        onChange={(e) => handleInput(e.target.value)}
        placeholder="Paste JSON here..."
      />

      {/* Related tools - will be prerendered on hover */}
      <aside>
        <h2>Related Tools</h2>
        <Link href="/tools/json-schema">JSON Schema</Link>
        <Link href="/tools/json-to-csv">JSON to CSV</Link>
        <Link href="/tools/yaml-json">YAML ↔ JSON</Link>
      </aside>

      {/* Heavy tool - opt out of prerendering */}
      <Link href="/tools/upload" className="no-prerender">
        Upload File (Not Prerendered)
      </Link>
    </main>
  )
}
```

---

## Tips & Best Practices

### ✅ DO:

```tsx
// ✅ Prerender high-traffic pages
addSpeculationRule({
  prerender: [{ source: 'list', urls: ['/', '/tools/json-beautify'] }]
})

// ✅ Prefetch related pages based on user behavior
if (userIsActivelyUsing('json-tools')) {
  addSpeculationRule({
    prefetch: [{ source: 'list', urls: ['/tools/json-schema'] }]
  })
}

// ✅ Opt-out heavy pages
<Link href="/tools/upload" className="no-prerender">Upload</Link>

// ✅ Track speculation effectiveness
const { wasPrerendered } = useSpeculationStatus()
gtag('event', 'prerender', { success: wasPrerendered })
```

### ❌ DON'T:

```tsx
// ❌ Don't prerender everything
addSpeculationRule({
  prerender: [{ source: 'list', urls: allPages }] // Too many!
})

// ❌ Don't prerender state-changing pages
addSpeculationRule({
  prerender: [{ source: 'list', urls: ['/logout', '/delete-account'] }]
})

// ❌ Don't prerender without checking support
addSpeculationRule({ ... }) // Should check HTMLScriptElement.supports first

// ❌ Don't ignore user preferences
if (navigator.connection?.saveData) {
  // User wants to save data - don't prerender aggressively!
}
```

---

## Need More Help?

- 📖 [Complete Documentation](./SPECULATION_RULES.md)
- 🚀 [Quick Start Guide](./SPECULATION_RULES_QUICKSTART.md)
- 🔗 [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API)

---

**Last Updated:** November 27, 2025  
**Component:** `components/SpeculationRules.tsx`
