---
name: testing-coverage
description: Guide for writing comprehensive tests and achieving >= 95% coverage. Use this when asked to write tests, fix test coverage, or debug failing tests.
license: MIT
---

# Testing and Coverage Guide

This skill ensures all code meets the **MANDATORY >= 95% test coverage** requirement using Vitest with browser mode.

## Critical Requirements

**MANDATORY**: All code MUST achieve >= 95% coverage for:
- Lines
- Functions  
- Branches
- Statements

**CI/CD will FAIL if coverage drops below 95%**

## Test Environment Setup

### First-Time Setup

```bash
# Install Chromium for browser tests
pnpm exec playwright install chromium
```

### Running Tests

```bash
# Watch mode
CI=true pnpm test

# Single test file
pnpm test -- path/to/test.tsx

# With coverage report
CI=true pnpm test run --coverage

# Visual UI
CI=true pnpm test:ui

# Browser mode (for component tests)
CI=true pnpm test:browser
```

## Test File Locations

```
app/
  tools/
    your-tool/
      __tests__/
        page.test.tsx
        logic.test.ts
  api/
    endpoint/
      __tests__/
        route.test.ts
components/
  ui/
    __tests__/
      button.test.tsx
hooks/
  __tests__/
    useSomeHook.test.ts
lib/
  __tests__/
    utility.test.ts
```

## Test Patterns by File Type

### 1. Component Tests (`*.test.tsx`)

```typescript
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import Component from '../Component'

// Mock dependencies
vi.mock('@/lib/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders initial state correctly', () => {
      render(<Component />)
      expect(screen.getByText('Expected Text')).toBeInTheDocument()
    })

    it('renders with props', () => {
      render(<Component prop="value" />)
      expect(screen.getByText('value')).toBeInTheDocument()
    })

    it('applies correct CSS classes', () => {
      render(<Component />)
      const element = screen.getByRole('button')
      expect(element).toHaveClass('expected-class')
    })
  })

  describe('User Interactions', () => {
    it('handles button clicks', async () => {
      const user = userEvent.setup()
      render(<Component />)
      
      const button = screen.getByRole('button', { name: /click me/i })
      await user.click(button)
      
      expect(screen.getByText('Clicked')).toBeInTheDocument()
    })

    it('handles text input', async () => {
      const user = userEvent.setup()
      render(<Component />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'test input')
      
      expect(input).toHaveValue('test input')
    })

    it('handles file uploads', async () => {
      const user = userEvent.setup()
      render(<Component />)
      
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const input = screen.getByLabelText(/upload/i)
      
      await user.upload(input, file)
      
      expect(screen.getByText('test.txt')).toBeInTheDocument()
    })

    it('handles form submission', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      render(<Component onSubmit={onSubmit} />)
      
      await user.type(screen.getByRole('textbox'), 'value')
      await user.click(screen.getByRole('button', { name: /submit/i }))
      
      expect(onSubmit).toHaveBeenCalledWith({ field: 'value' })
    })
  })

  describe('State Management', () => {
    it('updates state on user action', async () => {
      const user = userEvent.setup()
      render(<Component />)
      
      expect(screen.queryByText('Updated')).not.toBeInTheDocument()
      
      await user.click(screen.getByRole('button'))
      
      expect(screen.getByText('Updated')).toBeInTheDocument()
    })

    it('resets state correctly', async () => {
      const user = userEvent.setup()
      render(<Component />)
      
      await user.type(screen.getByRole('textbox'), 'value')
      await user.click(screen.getByRole('button', { name: /reset/i }))
      
      expect(screen.getByRole('textbox')).toHaveValue('')
    })
  })

  describe('Error Handling', () => {
    it('displays error messages', async () => {
      const user = userEvent.setup()
      render(<Component />)
      
      // Trigger error condition
      await user.click(screen.getByRole('button'))
      
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      })
    })

    it('handles invalid input', async () => {
      const user = userEvent.setup()
      const { toast } = await import('sonner')
      render(<Component />)
      
      await user.type(screen.getByRole('textbox'), 'invalid')
      await user.click(screen.getByRole('button'))
      
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Invalid'))
    })
  })

  describe('Loading States', () => {
    it('shows loading indicator', async () => {
      render(<Component />)
      
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      
      // Trigger async action
      const user = userEvent.setup()
      await user.click(screen.getByRole('button'))
      
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })
  })

  describe('Conditional Rendering', () => {
    it('renders based on state', () => {
      render(<Component showSection={true} />)
      expect(screen.getByText('Section Content')).toBeInTheDocument()
    })

    it('hides content when condition is false', () => {
      render(<Component showSection={false} />)
      expect(screen.queryByText('Section Content')).not.toBeInTheDocument()
    })
  })

  describe('Analytics', () => {
    it('tracks user events', async () => {
      const { trackToolEvent } = await import('@/lib/analytics')
      const user = userEvent.setup()
      render(<Component />)
      
      await user.click(screen.getByRole('button'))
      
      expect(trackToolEvent).toHaveBeenCalledWith(
        'tool-id',
        'action_name',
        expect.any(Object)
      )
    })
  })

  describe('Accessibility', () => {
    it('has accessible labels', () => {
      render(<Component />)
      expect(screen.getByLabelText('Input Label')).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<Component />)
      
      await user.tab()
      expect(screen.getByRole('button')).toHaveFocus()
    })
  })
})
```

### 2. API Route Tests (`route.test.ts`)

```typescript
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { POST, GET, PUT, DELETE } from '../route'

// Mock external services
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('POST /api/endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Validation', () => {
    it('returns 400 for missing required fields', async () => {
      const request = new Request('http://localhost/api/endpoint', {
        method: 'POST',
        body: JSON.stringify({}),
      })
      
      const response = await POST(request as any)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toContain('required')
    })

    it('returns 400 for invalid field types', async () => {
      const request = new Request('http://localhost/api/endpoint', {
        method: 'POST',
        body: JSON.stringify({ field: 123 }), // Should be string
      })
      
      const response = await POST(request as any)
      
      expect(response.status).toBe(400)
    })

    it('returns 400 for malformed JSON', async () => {
      const request = new Request('http://localhost/api/endpoint', {
        method: 'POST',
        body: 'invalid json',
      })
      
      const response = await POST(request as any)
      
      expect(response.status).toBe(400)
    })
  })

  describe('Success Cases', () => {
    it('processes valid request successfully', async () => {
      const request = new Request('http://localhost/api/endpoint', {
        method: 'POST',
        body: JSON.stringify({ field: 'value' }),
      })
      
      const response = await POST(request as any)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('result')
    })

    it('returns correct data structure', async () => {
      const request = new Request('http://localhost/api/endpoint', {
        method: 'POST',
        body: JSON.stringify({ field: 'value' }),
      })
      
      const response = await POST(request as any)
      const data = await response.json()
      
      expect(data).toMatchObject({
        success: true,
        data: expect.any(Object),
      })
    })
  })

  describe('Error Handling', () => {
    it('returns 404 for not found resources', async () => {
      const request = new Request('http://localhost/api/endpoint', {
        method: 'POST',
        body: JSON.stringify({ id: 'nonexistent' }),
      })
      
      const response = await POST(request as any)
      
      expect(response.status).toBe(404)
    })

    it('returns 409 for conflicts', async () => {
      // Create duplicate entry
      const request = new Request('http://localhost/api/endpoint', {
        method: 'POST',
        body: JSON.stringify({ slug: 'existing' }),
      })
      
      const response = await POST(request as any)
      
      expect(response.status).toBe(409)
    })

    it('returns 500 for server errors', async () => {
      // Mock database error
      const { supabase } = await import('@/lib/supabaseClient')
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error('Database error')
      })
      
      const request = new Request('http://localhost/api/endpoint', {
        method: 'POST',
        body: JSON.stringify({ field: 'value' }),
      })
      
      const response = await POST(request as any)
      
      expect(response.status).toBe(500)
    })
  })

  describe('Rate Limiting', () => {
    it('returns 429 for too many requests', async () => {
      // Make multiple requests
      const requests = Array(10).fill(null).map(() =>
        new Request('http://localhost/api/endpoint', {
          method: 'POST',
          body: JSON.stringify({ field: 'value' }),
        })
      )
      
      const responses = await Promise.all(
        requests.map(req => POST(req as any))
      )
      
      const tooManyRequests = responses.filter(r => r.status === 429)
      expect(tooManyRequests.length).toBeGreaterThan(0)
    })
  })

  describe('External API Integration', () => {
    it('handles external API success', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: 'success' }),
      })
      
      const request = new Request('http://localhost/api/endpoint', {
        method: 'POST',
        body: JSON.stringify({ field: 'value' }),
      })
      
      const response = await POST(request as any)
      
      expect(response.status).toBe(200)
    })

    it('handles external API failure', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('API Error'))
      
      const request = new Request('http://localhost/api/endpoint', {
        method: 'POST',
        body: JSON.stringify({ field: 'value' }),
      })
      
      const response = await POST(request as any)
      
      expect(response.status).toBe(503)
    })
  })
})
```

### 3. Utility Function Tests (`*.test.ts`)

```typescript
import { describe, expect, it } from 'vitest'
import { utilityFunction } from '../utility'

describe('utilityFunction', () => {
  describe('Valid Inputs', () => {
    it('handles normal case', () => {
      expect(utilityFunction('input')).toBe('expected')
    })

    it('handles edge case: empty string', () => {
      expect(utilityFunction('')).toBe('')
    })

    it('handles edge case: special characters', () => {
      expect(utilityFunction('!@#$')).toBe('!@#$')
    })
  })

  describe('Invalid Inputs', () => {
    it('throws error for null', () => {
      expect(() => utilityFunction(null as any)).toThrow()
    })

    it('throws error for undefined', () => {
      expect(() => utilityFunction(undefined as any)).toThrow()
    })
  })

  describe('Type Handling', () => {
    it('handles numbers', () => {
      expect(utilityFunction(123)).toBe('123')
    })

    it('handles arrays', () => {
      expect(utilityFunction(['a', 'b'])).toEqual(['a', 'b'])
    })

    it('handles objects', () => {
      expect(utilityFunction({ key: 'value' })).toEqual({ key: 'value' })
    })
  })

  describe('Async Operations', () => {
    it('resolves with correct value', async () => {
      const result = await asyncUtilityFunction('input')
      expect(result).toBe('expected')
    })

    it('rejects with error', async () => {
      await expect(asyncUtilityFunction('invalid')).rejects.toThrow()
    })
  })
})
```

### 4. Hook Tests (`*.test.ts`)

```typescript
import { describe, expect, it, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useCustomHook } from '../useCustomHook'

describe('useCustomHook', () => {
  beforeEach(() => {
    // Reset state between tests
  })

  it('initializes with default values', () => {
    const { result } = renderHook(() => useCustomHook())
    
    expect(result.current.value).toBe(null)
    expect(result.current.loading).toBe(false)
  })

  it('updates value on action', () => {
    const { result } = renderHook(() => useCustomHook())
    
    act(() => {
      result.current.setValue('new value')
    })
    
    expect(result.current.value).toBe('new value')
  })

  it('handles async operations', async () => {
    const { result } = renderHook(() => useCustomHook())
    
    act(() => {
      result.current.fetchData()
    })
    
    expect(result.current.loading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.value).toBeDefined()
    })
  })

  it('cleans up on unmount', () => {
    const { unmount } = renderHook(() => useCustomHook())
    
    unmount()
    
    // Verify cleanup happened
  })
})
```

## Coverage Troubleshooting

### Check Current Coverage

```bash
CI=true pnpm test run --coverage
```

### Find Uncovered Lines

1. Open `coverage/index.html` in browser
2. Navigate to file with < 95% coverage
3. Red/yellow lines indicate uncovered code

### Common Coverage Issues

**Issue**: Uncovered branches
```typescript
// Before (uncovered else branch)
if (condition) {
  doSomething()
}

// Test both branches
it('handles true condition', () => {
  // Test with condition = true
})

it('handles false condition', () => {
  // Test with condition = false
})
```

**Issue**: Uncovered error handlers
```typescript
// Test the catch block
it('handles errors', async () => {
  // Mock to throw error
  vi.mocked(someFunction).mockRejectedValue(new Error('Test error'))
  
  // Verify error handling
})
```

**Issue**: Uncovered async callbacks
```typescript
// Test async state updates
it('updates after async operation', async () => {
  // Trigger async operation
  
  await waitFor(() => {
    expect(result).toBeDefined()
  })
})
```

## Test Quality Checklist

- [ ] All user interactions tested
- [ ] All error scenarios tested
- [ ] All conditional branches tested
- [ ] All async operations tested
- [ ] Loading states tested
- [ ] Analytics tracking verified
- [ ] Accessibility features tested
- [ ] Mocks cleared between tests (`beforeEach`)
- [ ] Tests are isolated (no shared state)
- [ ] >= 95% coverage achieved
- [ ] Coverage report reviewed

## References

- Test examples: `app/tools/split-bill/__tests__/`
- API test examples: `app/api/shorten/__tests__/`
- Setup file: `vitest.setup.ts`
- Configuration: `vitest.config.mts`
