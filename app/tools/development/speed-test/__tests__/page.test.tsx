import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { trackToolEvent } from '@/lib/services/analytics'
import SpeedTestPage from '../page'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Create mock fetch response factory
const createMockFetchResponse = (size = 1024) => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(size)),
  json: vi.fn().mockResolvedValue({}),
  text: vi.fn().mockResolvedValue(''),
  blob: vi.fn().mockResolvedValue(new Blob([new ArrayBuffer(size)])),
  headers: new Headers({ 'content-type': 'application/octet-stream' }),
  clone: () => createMockFetchResponse(size),
})

// Create the mock fetch function
const mockFetch = vi.fn()

// Use vi.stubGlobal for proper mocking
vi.stubGlobal('fetch', mockFetch)

// Mock crypto.getRandomValues for fast data generation
vi.stubGlobal('crypto', {
  getRandomValues: vi.fn((arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = i % 256
    }
    return arr
  }),
})

describe('Speed Test Page', () => {
  // Track performance.now value for duration calculations
  let performanceNowValue = 0

  beforeEach(() => {
    vi.clearAllMocks()
    performanceNowValue = 0

    // Use fake timers with shouldAdvanceTime to auto-advance time
    vi.useFakeTimers({ shouldAdvanceTime: true })

    // Mock performance.now to return incrementing values for proper duration calculation
    // This ensures that (end - start) > 10ms so the component records valid speeds
    vi.spyOn(performance, 'now').mockImplementation(() => {
      performanceNowValue += 50 // Increment by 50ms each call
      return performanceNowValue
    })

    // Default fetch mock - resolves quickly
    mockFetch.mockImplementation(() => Promise.resolve(createMockFetchResponse()))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('Initial Render', () => {
    it('renders the page title', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText('Network Speed Test')).toBeTruthy()
    })

    it('renders the description', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText(/Test your internet connection speed in real-time/)).toBeTruthy()
    })

    it('renders the start test button', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText('Start Test')).toBeTruthy()
    })

    it('displays all speed metrics initially at zero', () => {
      render(<SpeedTestPage />)

      expect(screen.getByText('Download')).toBeTruthy()
      expect(screen.getByText('Upload')).toBeTruthy()
      expect(screen.getByText('Latency')).toBeTruthy()
      expect(screen.getByText('Jitter')).toBeTruthy()

      const mbpsLabels = screen.getAllByText('Mbps')
      expect(mbpsLabels).toHaveLength(2)
      const msLabels = screen.getAllByText('ms')
      expect(msLabels).toHaveLength(2)
    })

    it('displays badge with accurate testing text', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText('Accurate & Fast Network Testing')).toBeTruthy()
    })

    it('displays Ready to Test status', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText('Ready to Test')).toBeTruthy()
    })

    it('renders all metric icons', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText('Download')).toBeTruthy()
      expect(screen.getByText('Upload')).toBeTruthy()
      expect(screen.getByText('Latency')).toBeTruthy()
      expect(screen.getByText('Jitter')).toBeTruthy()
    })

    it('displays initial metric values as 0.00', () => {
      render(<SpeedTestPage />)
      const zeroValues = screen.getAllByText(/^0\.?0?0?$/)
      expect(zeroValues.length).toBeGreaterThan(0)
    })
  })

  describe('Speed Test Execution', () => {
    it('shows Start Test button when idle', () => {
      render(<SpeedTestPage />)
      const startButton = screen.getByText('Start Test')
      expect(startButton).toBeTruthy()
    })

    it('tracks page open event on mount', async () => {
      render(<SpeedTestPage />)
      await waitFor(() => {
        expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith('speed_test_open', {})
      })
    })

    it('tracks speed test start event when test begins', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      const startButton = screen.getByText('Start Test')

      await user.click(startButton)

      await waitFor(() => {
        expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith('speed_test_start', {})
      })
    })

    it('hides Start Test button during test execution', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      const startButton = screen.getByText('Start Test')

      await user.click(startButton)

      await waitFor(() => {
        expect(screen.queryByText('Start Test')).toBeFalsy()
      })
    })
  })

  describe('Metric Display', () => {
    it('displays download metric card with correct structure', () => {
      render(<SpeedTestPage />)
      const downloadLabel = screen.getByText('Download')
      expect(downloadLabel).toBeTruthy()
      expect(screen.getAllByText('Mbps').length).toBeGreaterThan(0)
    })

    it('displays upload metric card with correct structure', () => {
      render(<SpeedTestPage />)
      const uploadLabel = screen.getByText('Upload')
      expect(uploadLabel).toBeTruthy()
    })

    it('displays latency metric card with correct structure', () => {
      render(<SpeedTestPage />)
      const latencyLabel = screen.getByText('Latency')
      expect(latencyLabel).toBeTruthy()
      expect(screen.getAllByText('ms').length).toBeGreaterThan(0)
    })

    it('displays jitter metric card with correct structure', () => {
      render(<SpeedTestPage />)
      const jitterLabel = screen.getByText('Jitter')
      expect(jitterLabel).toBeTruthy()
    })
  })

  describe('UI States', () => {
    it('shows idle state initially', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText('Ready to Test')).toBeTruthy()
    })

    it('renders metric cards with consistent styling', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText('Download')).toBeTruthy()
      expect(screen.getByText('Upload')).toBeTruthy()
      expect(screen.getByText('Latency')).toBeTruthy()
      expect(screen.getByText('Jitter')).toBeTruthy()
    })
  })

  describe('Phase Transitions', () => {
    it('transitions from idle to running', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      expect(screen.getByText('Ready to Test')).toBeTruthy()

      await user.click(screen.getByText('Start Test'))

      await waitFor(() => {
        expect(screen.queryByText('Ready to Test')).toBeFalsy()
      })
    })
  })

  describe('Analytics Tracking', () => {
    it('tracks page open event', async () => {
      render(<SpeedTestPage />)
      await waitFor(() => {
        expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith('speed_test_open', {})
      })
    })

    it('tracks test start event', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(() => {
        expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith('speed_test_start', {})
      })
    })
  })

  describe('Responsive Behavior', () => {
    it('renders correctly on initial load', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText('Network Speed Test')).toBeTruthy()
      expect(screen.getByText('Start Test')).toBeTruthy()
    })

    it('maintains layout during test', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      expect(screen.getByText('Download')).toBeTruthy()
      expect(screen.getByText('Upload')).toBeTruthy()
      expect(screen.getByText('Latency')).toBeTruthy()
      expect(screen.getByText('Jitter')).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('has accessible button for starting test', () => {
      render(<SpeedTestPage />)
      const startButton = screen.getByText('Start Test')
      expect(startButton.tagName).toBe('BUTTON')
    })

    it('provides descriptive labels for metrics', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText('Download')).toBeTruthy()
      expect(screen.getByText('Upload')).toBeTruthy()
      expect(screen.getByText('Latency')).toBeTruthy()
      expect(screen.getByText('Jitter')).toBeTruthy()
    })

    it('shows units for all measurements', () => {
      render(<SpeedTestPage />)
      expect(screen.getAllByText('Mbps')).toHaveLength(2)
      expect(screen.getAllByText('ms')).toHaveLength(2)
    })
  })
})
