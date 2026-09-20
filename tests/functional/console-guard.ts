import type { Page } from '@playwright/test'

const IGNORED_CONSOLE_ERROR = [
  /ResizeObserver loop/i,
  /Failed to load resource.*favicon/i,
  /Failed to load resource.*analytics/i,
  /Failed to load resource.*vitals/i,
  /Failed to load resource.*speed-insights/i,
  /Failed to load resource.*406/i,
  /the server responded with a status of 406/i,
  /Minified React error #418/i,
  /Content Security Policy/i,
  /Third-party cookie/i,
]

export interface ConsoleGuard {
  errors: string[]
  dispose: () => void
}

export function attachConsoleGuard(page: Page): ConsoleGuard {
  const errors: string[] = []

  const onConsole = (message: { type: () => string; text: () => string }) => {
    if (message.type() !== 'error') {
      return
    }

    const text = message.text()
    if (IGNORED_CONSOLE_ERROR.some((pattern) => pattern.test(text))) {
      return
    }

    errors.push(text)
  }

  const onPageError = (error: Error) => {
    if (IGNORED_CONSOLE_ERROR.some((pattern) => pattern.test(error.message))) {
      return
    }

    errors.push(error.message)
  }

  page.on('console', onConsole)
  page.on('pageerror', onPageError)

  return {
    errors,
    dispose: () => {
      page.off('console', onConsole)
      page.off('pageerror', onPageError)
    },
  }
}
