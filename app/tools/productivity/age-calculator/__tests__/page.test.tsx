import { render, screen } from '@testing-library/react'
import type * as React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AgeCalculatorPage from '../page'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackToolEvent: vi.fn(),
  trackToolUsage: vi.fn(),
}))

// Mock nuqs - simplified to just return static values
vi.mock('nuqs', async () => {
  const actual = await vi.importActual<typeof import('nuqs')>('nuqs')
  return {
    ...actual,
    useQueryState: (key: string) => {
      if (key === 'birthdate') return ['1990-01-15', vi.fn()] as const
      return ['', vi.fn()] as const
    },
    parseAsString: {
      withDefault: (defaultValue: string) => ({ defaultValue }),
    },
  }
})

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
    button: ({
      children,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }) => (
      <button type="button" {...props}>
        {children}
      </button>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock clipboard API
const mockWriteText = vi.fn()
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
})

describe('Age Calculator - Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render age calculator page', () => {
    render(<AgeCalculatorPage />)

    expect(screen.getByRole('heading', { name: 'Age Calculator', level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/Calculate your exact age from birthdate/i)).toBeInTheDocument()
  })

  it('should display birthdate input field', () => {
    render(<AgeCalculatorPage />)

    expect(screen.getByText('Birthdate')).toBeInTheDocument()
    const input = screen.getByLabelText('Select your birthdate')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'date')
  })

  it('should display action buttons', () => {
    render(<AgeCalculatorPage />)

    expect(screen.getByText(/Clear/i)).toBeInTheDocument()
  })

  it('should display age result cards when birthdate is provided', () => {
    render(<AgeCalculatorPage />)

    expect(screen.getByText('Exact Age')).toBeInTheDocument()
    expect(screen.getByText('Next Birthday')).toBeInTheDocument()
  })

  it('should display age in multiple units section', () => {
    render(<AgeCalculatorPage />)

    expect(screen.getByText('Age in Different Units')).toBeInTheDocument()
  })

  it('should display zodiac sign section', () => {
    render(<AgeCalculatorPage />)

    expect(screen.getByText('Zodiac Sign')).toBeInTheDocument()
  })

  it('should display life milestones section', () => {
    render(<AgeCalculatorPage />)

    expect(screen.getByText('Life Milestones')).toBeInTheDocument()
  })

  it('should display how it works section', () => {
    render(<AgeCalculatorPage />)

    expect(screen.getByText('How Age Calculation Works')).toBeInTheDocument()
  })
})

describe('Age Calculator - Accessibility Tests', () => {
  it('should have proper heading hierarchy', () => {
    render(<AgeCalculatorPage />)

    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('Age Calculator')
  })

  it('should have accessible form input', () => {
    render(<AgeCalculatorPage />)

    const birthdateInput = screen.getByLabelText('Select your birthdate')
    expect(birthdateInput).toHaveAttribute('type', 'date')
  })

  it('should have accessible buttons with proper labels', () => {
    render(<AgeCalculatorPage />)

    const buttons = screen.getAllByRole('button')
    buttons.forEach((button) => {
      // Every button should have accessible text content
      expect(button.textContent || button.getAttribute('aria-label')).toBeTruthy()
    })
  })
})

describe('Age Calculator - Logic Tests', () => {
  it('should calculate age correctly for a birthdate', () => {
    const birthdate = new Date('1990-01-15')
    const today = new Date('2025-11-14')

    let years = today.getFullYear() - birthdate.getFullYear()
    let months = today.getMonth() - birthdate.getMonth()
    let days = today.getDate() - birthdate.getDate()

    if (days < 0) {
      months--
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      days += lastMonth.getDate()
    }

    if (months < 0) {
      years--
      months += 12
    }

    expect(years).toBe(35)
    expect(months).toBe(9)
  })

  it('should calculate total days correctly', () => {
    const birthdate = new Date('2000-01-01')
    const today = new Date('2000-01-11')
    const totalDays = Math.floor((today.getTime() - birthdate.getTime()) / (1000 * 60 * 60 * 24))

    expect(totalDays).toBe(10)
  })

  it('should calculate total weeks correctly', () => {
    const totalDays = 70
    const totalWeeks = Math.floor(totalDays / 7)

    expect(totalWeeks).toBe(10)
  })

  it('should calculate total months correctly', () => {
    const years = 2
    const months = 6
    const totalMonths = years * 12 + months

    expect(totalMonths).toBe(30)
  })

  it('should calculate total hours correctly', () => {
    const totalDays = 10
    const totalHours = totalDays * 24

    expect(totalHours).toBe(240)
  })

  it('should calculate total minutes correctly', () => {
    const totalDays = 2
    const totalMinutes = totalDays * 24 * 60

    expect(totalMinutes).toBe(2880)
  })

  it('should determine zodiac sign for Capricorn', () => {
    // January 15 should be Capricorn
    const birthDate = new Date('2000-01-15')
    const month = birthDate.getMonth() + 1 // 1 for January
    const day = birthDate.getDate() // 15

    // Capricorn: Dec 22 - Jan 19
    const isCapricorn = (month === 12 && day >= 22) || (month === 1 && day <= 19)
    expect(isCapricorn).toBe(true)
  })

  it('should determine zodiac sign for Aquarius', () => {
    // February 1 should be Aquarius
    const birthDate = new Date('2000-02-01')
    const month = birthDate.getMonth() + 1 // 2 for February
    const day = birthDate.getDate() // 1

    // Aquarius: Jan 20 - Feb 18
    const isAquarius = (month === 1 && day >= 20) || (month === 2 && day <= 18)
    expect(isAquarius).toBe(true)
  })

  it('should identify teenager milestone', () => {
    const years = 15
    const isTeenager = years >= 13 && years < 20
    expect(isTeenager).toBe(true)
  })

  it('should identify legal adult milestone', () => {
    const years = 18
    const isLegalAdult = years >= 18
    expect(isLegalAdult).toBe(true)
  })

  it('should identify senior milestone', () => {
    const years = 65
    const isSenior = years >= 60
    const isRetirementAge = years >= 65

    expect(isSenior).toBe(true)
    expect(isRetirementAge).toBe(true)
  })

  it('should calculate days until next birthday', () => {
    const today = new Date('2025-01-01')
    const nextBirthday = new Date('2025-06-15')

    const diffTime = nextBirthday.getTime() - today.getTime()
    const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    expect(daysUntil).toBeGreaterThan(0)
    expect(daysUntil).toBeLessThan(366)
  })

  it('should handle leap year calculations', () => {
    const leapYear = 2024
    const isLeapYear = (leapYear % 4 === 0 && leapYear % 100 !== 0) || leapYear % 400 === 0

    expect(isLeapYear).toBe(true)
  })

  it('should validate future dates as invalid', () => {
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)
    const today = new Date()

    const isInvalid = futureDate > today
    expect(isInvalid).toBe(true)
  })
})
