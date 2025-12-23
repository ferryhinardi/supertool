/**
 * Accessibility utilities for Split Bill Calculator
 * Provides screen reader announcements and focus management
 */

/**
 * Announce message to screen readers using ARIA live region
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) {
  // Find or create live region
  let liveRegion = document.getElementById('split-bill-sr-announcer')

  if (!liveRegion) {
    liveRegion = document.createElement('div')
    liveRegion.id = 'split-bill-sr-announcer'
    liveRegion.setAttribute('role', 'status')
    liveRegion.setAttribute('aria-live', priority)
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.className = 'sr-only'
    liveRegion.style.cssText =
      'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;'
    document.body.appendChild(liveRegion)
  }

  // Update aria-live priority if different
  if (liveRegion.getAttribute('aria-live') !== priority) {
    liveRegion.setAttribute('aria-live', priority)
  }

  // Clear and set new message with slight delay for screen reader detection
  liveRegion.textContent = ''
  setTimeout(() => {
    if (liveRegion) {
      liveRegion.textContent = message
    }
  }, 100)
}

/**
 * Focus management for modal dialogs
 */
export function trapFocusInModal(modalElement: HTMLElement) {
  const focusableElements = modalElement.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  if (focusableElements.length === 0) return

  const firstFocusable = focusableElements[0]
  const lastFocusable = focusableElements[focusableElements.length - 1]

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault()
        lastFocusable.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault()
        firstFocusable.focus()
      }
    }
  }

  modalElement.addEventListener('keydown', handleTabKey)

  // Focus first element
  firstFocusable.focus()

  // Return cleanup function
  return () => {
    modalElement.removeEventListener('keydown', handleTabKey)
  }
}

/**
 * Generate accessible label for currency amount
 */
export function formatCurrencyForScreenReader(
  amount: number,
  currencyCode: string,
  _currencySymbol: string
): string {
  const formattedAmount = amount.toFixed(2)
  return `${formattedAmount} ${currencyCode}`
}

/**
 * Generate accessible description for split type
 */
export function getSplitTypeDescription(splitType: 'equal' | 'percentage' | 'items'): string {
  switch (splitType) {
    case 'equal':
      return 'Split bill equally among all participants'
    case 'percentage':
      return 'Split bill by custom percentage for each person'
    case 'items':
      return 'Split bill by assigning items to specific people'
  }
}

/**
 * Generate accessible status message for payment tracking
 */
export function getPaymentStatusMessage(hasPaid: boolean, name: string): string {
  return hasPaid ? `${name} has paid their share` : `${name} has not paid yet`
}

/**
 * Generate accessible summary for bill calculations
 */
export function generateAccessibleSummary(data: {
  total: number
  peopleCount: number
  paidCount: number
  splitType: string
  currency: string
}): string {
  const { total, peopleCount, paidCount, splitType, currency } = data
  const unpaidCount = peopleCount - paidCount

  return `
    Bill summary: 
    Total amount: ${total.toFixed(2)} ${currency}.
    Split among ${peopleCount} ${peopleCount === 1 ? 'person' : 'people'}.
    Split type: ${splitType}.
    ${paidCount} ${paidCount === 1 ? 'person has' : 'people have'} paid.
    ${unpaidCount} ${unpaidCount === 1 ? 'person' : 'people'} still ${
      unpaidCount === 1 ? 'owes' : 'owe'
    } money.
  `
    .replace(/\s+/g, ' ')
    .trim()
}
