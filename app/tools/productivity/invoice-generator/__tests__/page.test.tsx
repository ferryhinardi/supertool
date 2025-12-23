import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import InvoiceGeneratorPage from '../page'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <div {...props}>{children}</div>
    ),
  },
}))

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

// Mock @react-pdf/renderer for tests (it requires Node.js APIs)
vi.mock('@react-pdf/renderer', () => ({
  pdf: vi.fn(() => ({
    toBlob: vi.fn().mockResolvedValue(new Blob()),
  })),
  Document: vi.fn(({ children }: { children: React.ReactNode }) => children),
  Page: vi.fn(({ children }: { children: React.ReactNode }) => children),
  Text: vi.fn(({ children }: { children: React.ReactNode }) => children),
  View: vi.fn(({ children }: { children: React.ReactNode }) => children),
  StyleSheet: {
    create: vi.fn((styles) => styles),
  },
}))

describe('InvoiceGeneratorPage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders invoice generator page', () => {
    render(<InvoiceGeneratorPage />)
    expect(screen.getByText('Invoice Generator')).toBeInTheDocument()
    expect(screen.getByText(/Create professional invoices/i)).toBeInTheDocument()
  })

  it('displays action buttons', () => {
    render(<InvoiceGeneratorPage />)
    expect(screen.getByRole('button', { name: /New Invoice/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Save Draft/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Download PDF/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Print/i })).toBeInTheDocument()
  })

  it('initializes with default invoice data', () => {
    render(<InvoiceGeneratorPage />)
    const invoiceNumberInput = screen.getByLabelText('Invoice Number') as HTMLInputElement
    expect(invoiceNumberInput.value).toContain('INV-')
  })

  it('allows updating company information', () => {
    render(<InvoiceGeneratorPage />)
    const companyInput = screen.getByLabelText('Company Name *')
    fireEvent.change(companyInput, { target: { value: 'Acme Corp' } })
    expect(companyInput).toHaveValue('Acme Corp')
  })

  it('allows updating client information', () => {
    render(<InvoiceGeneratorPage />)
    const clientInput = screen.getByLabelText('Client Name *')
    fireEvent.change(clientInput, { target: { value: 'Client Inc' } })
    expect(clientInput).toHaveValue('Client Inc')
  })

  it('displays one line item by default', () => {
    render(<InvoiceGeneratorPage />)
    expect(screen.getByText('Item #1')).toBeInTheDocument()
  })

  it('allows adding line items', async () => {
    render(<InvoiceGeneratorPage />)
    const addButton = screen.getByRole('button', { name: /Add Item/i })
    fireEvent.click(addButton)
    await waitFor(() => {
      expect(screen.getByText('Item #2')).toBeInTheDocument()
    })
  })

  it('calculates subtotal correctly', async () => {
    render(<InvoiceGeneratorPage />)

    // Find the first quantity and rate inputs
    const quantityInput = screen.getAllByLabelText('Quantity')[0]
    const rateInput = screen.getAllByLabelText(/Rate/)[0]

    // Set quantity to 2 and rate to 100
    fireEvent.change(quantityInput, { target: { value: '2' } })
    fireEvent.change(rateInput, { target: { value: '100' } })

    // Check that subtotal is displayed correctly - wait for calculation
    await waitFor(() => {
      expect(screen.getByText(/Subtotal:/i)).toBeInTheDocument()
      // Check that Rp200.00 appears somewhere in the document (default currency is IDR)
      const body = document.body.textContent || ''
      expect(body).toContain('Rp200.00')
    })
  })

  it('calculates tax correctly', async () => {
    render(<InvoiceGeneratorPage />)

    // Set line item values
    const quantityInput = screen.getAllByLabelText('Quantity')[0]
    const rateInput = screen.getAllByLabelText(/Rate/)[0]
    fireEvent.change(quantityInput, { target: { value: '1' } })
    fireEvent.change(rateInput, { target: { value: '100' } })

    // Set tax rate to 10%
    const taxInput = screen.getByLabelText('Tax Rate (%)')
    fireEvent.change(taxInput, { target: { value: '10' } })

    // Check that tax is calculated correctly - wait for calculation
    await waitFor(() => {
      expect(screen.getByText(/Tax \(10%\):/)).toBeInTheDocument()
      // Check that Rp10.00 appears somewhere in the document (default currency is IDR)
      const body = document.body.textContent || ''
      expect(body).toContain('Rp10.00')
    })
  })

  it('applies discount correctly', async () => {
    render(<InvoiceGeneratorPage />)

    // Set line item values
    const quantityInput = screen.getAllByLabelText('Quantity')[0]
    const rateInput = screen.getAllByLabelText(/Rate/)[0]
    fireEvent.change(quantityInput, { target: { value: '1' } })
    fireEvent.change(rateInput, { target: { value: '100' } })

    // Set discount
    const discountInput = screen.getByLabelText(/Discount/)
    fireEvent.change(discountInput, { target: { value: '20' } })

    // Check that discount is displayed - wait for calculation
    await waitFor(() => {
      expect(screen.getByText(/Discount:/)).toBeInTheDocument()
      // Check that -Rp20.00 appears somewhere in the document (default currency is IDR)
      const body = document.body.textContent || ''
      expect(body).toContain('-Rp20.00')
    })
  })

  it('calculates total correctly with tax and discount', async () => {
    render(<InvoiceGeneratorPage />)

    // Set line item: 1 × $100 = $100
    const quantityInput = screen.getAllByLabelText('Quantity')[0]
    const rateInput = screen.getAllByLabelText(/Rate/)[0]
    fireEvent.change(quantityInput, { target: { value: '1' } })
    fireEvent.change(rateInput, { target: { value: '100' } })

    // Set tax: 10% of $100 = $10
    const taxInput = screen.getByLabelText('Tax Rate (%)')
    fireEvent.change(taxInput, { target: { value: '10' } })

    // Set discount: $20
    const discountInput = screen.getByLabelText(/Discount/)
    fireEvent.change(discountInput, { target: { value: '20' } })

    // Total should be: $100 + $10 - $20 = $90 - wait for calculation
    await waitFor(() => {
      // Check that Rp90.00 appears somewhere in the document (default currency is IDR)
      const body = document.body.textContent || ''
      expect(body).toContain('Rp90.00')
    })
  })

  it('allows selecting different currencies', () => {
    render(<InvoiceGeneratorPage />)
    const currencySelect = screen.getByLabelText('Currency')
    fireEvent.change(currencySelect, { target: { value: 'EUR' } })
    expect(currencySelect).toHaveValue('EUR')
  })

  it('allows adding notes', () => {
    render(<InvoiceGeneratorPage />)
    const notesTextarea = screen.getByPlaceholderText(/Thank you for your business/)
    fireEvent.change(notesTextarea, { target: { value: 'Payment due in 30 days' } })
    expect(notesTextarea).toHaveValue('Payment due in 30 days')
  })

  it('saves invoice to localStorage', () => {
    render(<InvoiceGeneratorPage />)

    // Fill in some data
    const companyInput = screen.getByLabelText('Company Name *')
    fireEvent.change(companyInput, { target: { value: 'Test Company' } })

    // Click save
    const saveButton = screen.getByRole('button', { name: /Save Draft/i })
    fireEvent.click(saveButton)

    // Check localStorage
    const saved = localStorage.getItem('invoiceGenerator')
    expect(saved).toBeTruthy()
    if (saved) {
      const invoices = JSON.parse(saved)
      expect(invoices).toHaveLength(1)
      expect(invoices[0].fromCompany).toBe('Test Company')
    }
  })

  it('loads saved invoices from localStorage', () => {
    // Pre-populate localStorage
    const mockInvoice = {
      id: '123',
      invoiceNumber: 'INV-123',
      invoiceDate: '2025-01-01',
      dueDate: '2025-01-31',
      fromCompany: 'Saved Company',
      fromEmail: '',
      fromAddress: '',
      fromPhone: '',
      toCompany: 'Client Company',
      toEmail: '',
      toAddress: '',
      toPhone: '',
      lineItems: [{ id: '1', description: 'Service', quantity: 1, rate: 100 }],
      taxRate: 0,
      discountAmount: 0,
      notes: '',
      currency: 'USD',
    }
    localStorage.setItem('invoiceGenerator', JSON.stringify([mockInvoice]))

    render(<InvoiceGeneratorPage />)

    // Check that saved invoice appears in the list
    expect(screen.getByText('Saved Drafts (1)')).toBeInTheDocument()
    expect(screen.getByText('INV-123')).toBeInTheDocument()
    expect(screen.getByText('Client Company')).toBeInTheDocument()
  })

  it('prevents removing the last line item', async () => {
    const { toast } = await import('sonner')
    render(<InvoiceGeneratorPage />)

    // Try to remove the only line item
    const removeButtons = screen.queryAllByRole('button')
    const removeButton = removeButtons.find((btn) => {
      const svg = btn.querySelector('svg')
      return svg && btn.textContent === ''
    })

    if (removeButton) {
      fireEvent.click(removeButton)
      expect(toast.error).toHaveBeenCalledWith('Invoice must have at least one line item')
    }
  })

  it('creates new invoice with new number', () => {
    render(<InvoiceGeneratorPage />)

    // Fill in some data
    const companyInput = screen.getByLabelText('Company Name *')
    fireEvent.change(companyInput, { target: { value: 'Old Company' } })

    // Click new invoice
    const newButton = screen.getByRole('button', { name: /New Invoice/i })
    fireEvent.click(newButton)

    // Company name should be cleared
    expect(companyInput).toHaveValue('')
  })

  it('displays summary section', () => {
    render(<InvoiceGeneratorPage />)
    expect(screen.getByText('Summary')).toBeInTheDocument()
    expect(screen.getByText(/Subtotal:/)).toBeInTheDocument()
    expect(screen.getByText(/Total:/)).toBeInTheDocument()
  })

  it('tracks analytics events', async () => {
    const { trackToolEvent } = await import('@/lib/analytics')
    render(<InvoiceGeneratorPage />)

    // Check that page open event was tracked
    expect(trackToolEvent).toHaveBeenCalledWith('invoice_generator_open', {})
  })
})
