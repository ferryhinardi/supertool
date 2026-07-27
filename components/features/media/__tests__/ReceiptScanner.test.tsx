'use client'

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ReceiptScanner } from '../ReceiptScanner'

const {
  mockToastError,
  mockToastSuccess,
  mockTrackToolEvent,
  mockParseReceiptText,
  mockCreateWorker,
  mockSetParameters,
  mockRecognize,
  mockTerminate,
  mockCreateObjectURL,
  mockRevokeObjectURL,
} = vi.hoisted(() => ({
  mockToastError: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockTrackToolEvent: vi.fn(),
  mockParseReceiptText: vi.fn(),
  mockCreateWorker: vi.fn(),
  mockSetParameters: vi.fn(),
  mockRecognize: vi.fn(),
  mockTerminate: vi.fn(),
  mockCreateObjectURL: vi.fn(),
  mockRevokeObjectURL: vi.fn(),
}))

vi.mock('lucide-react', () => {
  const Icon = ({ className }: { className?: string }) => <span className={className}>icon</span>

  return {
    Camera: Icon,
    FileImage: Icon,
    Loader2: Icon,
    Upload: Icon,
    X: Icon,
  }
})

vi.mock('sonner', () => ({
  toast: {
    error: mockToastError,
    success: mockToastSuccess,
  },
}))

vi.mock('tesseract.js', () => ({
  PSM: {
    AUTO: 'AUTO',
    SINGLE_BLOCK: 'SINGLE_BLOCK',
    SINGLE_COLUMN: 'SINGLE_COLUMN',
  },
  createWorker: mockCreateWorker,
}))

vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: mockTrackToolEvent,
}))

vi.mock('@/lib/tools/split-bill/receipt-parser', () => ({
  parseReceiptText: mockParseReceiptText,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    type = 'button',
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type={type} {...props}>
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: { value: number }) => <div data-testid="progress">{value}</div>,
}))

vi.mock('@/styled-system/css', () => ({
  css: () => 'mock-css',
}))

vi.mock('../ItemPreviewModal', () => ({
  ItemPreviewModal: ({
    isOpen,
    items,
    onClose,
    onConfirm,
  }: {
    isOpen: boolean
    items: Array<{ id: string; name: string; confidence: string }>
    onClose: () => void
    onConfirm: (items: Array<{ id: string; name: string; confidence: string }>) => void
  }) =>
    isOpen ? (
      <div data-testid="item-preview-modal">
        <p>Review Scanned Items</p>
        {items.map((item) => (
          <p key={item.id}>{`${item.name}:${item.confidence}`}</p>
        ))}
        <button
          type="button"
          onClick={() => {
            onConfirm(items)
            onClose()
          }}
        >
          Confirm items
        </button>
        <button type="button" onClick={onClose}>
          Close modal
        </button>
      </div>
    ) : null,
}))

const mockCanvasContext = {
  drawImage: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray([120, 130, 140, 255]),
  })),
  putImageData: vi.fn(),
}

class MockImage {
  onload: null | (() => void) = null
  width = 200
  height = 100

  set src(_value: string) {
    queueMicrotask(() => {
      this.onload?.()
    })
  }
}

function createImageFile(type = 'image/png') {
  return new File(['image-content'], 'receipt.png', { type })
}

function setupWorkerRecognizeResults(results: Array<string | Error>) {
  let index = 0
  mockRecognize.mockImplementation(async () => {
    const result = results[index] ?? results[results.length - 1] ?? ''
    index += 1

    if (result instanceof Error) {
      throw result
    }

    return { data: { text: result } }
  })
}

async function triggerFileChange(input: HTMLInputElement, file: File) {
  await act(async () => {
    fireEvent.change(input, { target: { files: [file] } })
  })
}

describe('ReceiptScanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockCreateObjectURL
      .mockReturnValueOnce('blob:preview-url')
      .mockReturnValueOnce('blob:preprocess-url')

    Object.defineProperty(URL, 'createObjectURL', {
      value: mockCreateObjectURL,
      configurable: true,
      writable: true,
    })

    Object.defineProperty(URL, 'revokeObjectURL', {
      value: mockRevokeObjectURL,
      configurable: true,
      writable: true,
    })

    Object.defineProperty(globalThis, 'Image', {
      value: MockImage,
      configurable: true,
      writable: true,
    })

    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: vi.fn(() => mockCanvasContext),
      configurable: true,
      writable: true,
    })

    Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
      value: vi.fn(() => 'data:image/png;base64,processed'),
      configurable: true,
      writable: true,
    })

    mockSetParameters.mockResolvedValue(undefined)
    mockTerminate.mockResolvedValue(undefined)
    mockCreateWorker.mockResolvedValue({
      setParameters: mockSetParameters,
      recognize: mockRecognize,
      terminate: mockTerminate,
    })
  })

  it('rejects non-image uploads before OCR starts', async () => {
    const onDataExtracted = vi.fn()
    const { container } = render(<ReceiptScanner onDataExtracted={onDataExtracted} />)
    const uploadInput = container.querySelectorAll('input[type="file"]')[1] as HTMLInputElement

    await triggerFileChange(uploadInput, new File(['text'], 'receipt.txt', { type: 'text/plain' }))

    expect(mockToastError).toHaveBeenCalledWith('Please select an image file')
    expect(mockTrackToolEvent).not.toHaveBeenCalled()
    expect(mockCreateWorker).not.toHaveBeenCalled()
    expect(onDataExtracted).not.toHaveBeenCalled()
  })

  it('shows the item preview modal and imports confirmed OCR items', async () => {
    const user = userEvent.setup()
    const onDataExtracted = vi.fn()
    const { container } = render(<ReceiptScanner onDataExtracted={onDataExtracted} />)
    const uploadInput = container.querySelectorAll('input[type="file"]')[1] as HTMLInputElement

    mockCreateObjectURL
      .mockReset()
      .mockReturnValueOnce('blob:preview-url')
      .mockReturnValueOnce('blob:preprocess-url')
    setupWorkerRecognizeResults(['OCR TEXT 1', 'OCR TEXT 2', ''])
    mockParseReceiptText
      .mockReturnValueOnce({
        items: [
          { name: 'Latte', price: 5.5, quantity: 1 },
          { name: 'Bagel', price: 4, quantity: 2 },
        ],
        subtotal: 13.5,
        tax: 1.35,
        tip: 2,
        total: 16.85,
        merchant: 'Cafe Central',
        date: '2026-04-25',
        confidence: { overall: 'high', items: 'high', amounts: 'medium' },
      })
      .mockReturnValueOnce({
        items: [],
        total: undefined,
        confidence: { overall: 'low', items: 'low', amounts: 'low' },
      })

    await triggerFileChange(uploadInput, createImageFile())

    expect(await screen.findByTestId('item-preview-modal')).toBeInTheDocument()
    expect(screen.getByText('Latte:medium')).toBeInTheDocument()
    expect(screen.getByText('Bagel:medium')).toBeInTheDocument()
    expect(screen.getByAltText('Receipt preview')).toBeInTheDocument()

    expect(mockToastSuccess).toHaveBeenCalledWith(
      'Receipt scanned! Found 2 items (high confidence) 🎉',
      expect.objectContaining({
        description: 'From Cafe Central • Review items before importing',
      })
    )
    expect(mockTrackToolEvent).toHaveBeenCalledWith('split_bill_upload_receipt', {
      file_type: 'image/png',
    })
    expect(mockTrackToolEvent).toHaveBeenCalledWith(
      'split_bill_ocr_success',
      expect.objectContaining({
        items_count: 2,
        confidence_overall: 'high',
        has_merchant: true,
        has_date: true,
      })
    )

    await user.click(screen.getByRole('button', { name: 'Confirm items' }))

    await waitFor(() => {
      expect(onDataExtracted).toHaveBeenCalledWith({
        items: [
          { name: 'Latte', price: 5.5, quantity: 1 },
          { name: 'Bagel', price: 4, quantity: 2 },
        ],
        subtotal: 13.5,
        tax: 1.35,
        tip: 2,
        total: 16.85,
        merchant: 'Cafe Central',
        date: '2026-04-25',
      })
    })

    expect(mockToastSuccess).toHaveBeenCalledWith('2 items imported successfully! 🎉', {
      description: 'Review and assign items to people',
    })
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:preview-url')
    expect(screen.queryByTestId('item-preview-modal')).not.toBeInTheDocument()
    expect(screen.queryByAltText('Receipt preview')).not.toBeInTheDocument()
  })

  it('applies amount-only OCR results directly without opening the preview modal', async () => {
    const onDataExtracted = vi.fn()
    const { container } = render(<ReceiptScanner onDataExtracted={onDataExtracted} />)
    const uploadInput = container.querySelectorAll('input[type="file"]')[1] as HTMLInputElement

    mockCreateObjectURL
      .mockReset()
      .mockReturnValueOnce('blob:preview-amounts')
      .mockReturnValueOnce('blob:preprocess-amounts')
    setupWorkerRecognizeResults(['OCR TEXT ONLY AMOUNTS', '', ''])
    mockParseReceiptText.mockReturnValue({
      items: [],
      subtotal: 18,
      tax: 1.8,
      tip: 3,
      total: 22.8,
      merchant: 'Amounts Only Cafe',
      date: '2026-04-25',
      confidence: { overall: 'medium', items: 'low', amounts: 'high' },
    })

    await triggerFileChange(uploadInput, createImageFile())

    await waitFor(() => {
      expect(onDataExtracted).toHaveBeenCalledWith({
        items: [],
        subtotal: 18,
        tax: 1.8,
        tip: 3,
        total: 22.8,
        merchant: 'Amounts Only Cafe',
        date: '2026-04-25',
      })
    })

    expect(screen.queryByTestId('item-preview-modal')).not.toBeInTheDocument()
    expect(mockToastSuccess).toHaveBeenCalledWith(
      'Receipt scanned! Found: items, subtotal, tax, tip, total (high confidence) 🎉',
      expect.objectContaining({
        description: 'Review the extracted values and adjust if needed',
      })
    )
    expect(mockTrackToolEvent).toHaveBeenCalledWith(
      'split_bill_ocr_success',
      expect.objectContaining({
        fields_extracted: 5,
        fields: ['items', 'subtotal', 'tax', 'tip', 'total'],
        confidence_amounts: 'high',
      })
    )
  })

  it('shows a no-data toast when OCR parsing finds nothing useful', async () => {
    const onDataExtracted = vi.fn()
    const { container } = render(<ReceiptScanner onDataExtracted={onDataExtracted} />)
    const uploadInput = container.querySelectorAll('input[type="file"]')[1] as HTMLInputElement

    mockCreateObjectURL
      .mockReset()
      .mockReturnValueOnce('blob:preview-empty')
      .mockReturnValueOnce('blob:preprocess-empty')
    setupWorkerRecognizeResults(['UNREADABLE', 'ALSO BAD', ''])
    mockParseReceiptText.mockReturnValue({
      items: [],
      total: undefined,
      confidence: { overall: 'low', items: 'low', amounts: 'low' },
    })

    await triggerFileChange(uploadInput, createImageFile())

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        'Could not extract data from receipt. Please try again or enter manually.',
        expect.objectContaining({
          description: 'Tip: Ensure the receipt is well-lit and text is clearly visible',
        })
      )
    })

    expect(mockTrackToolEvent).toHaveBeenCalledWith('split_bill_ocr_error', {
      reason: 'no_data_found',
      ocr_attempts: 2,
    })
    expect(onDataExtracted).not.toHaveBeenCalled()
  })

  it('handles camera capture errors and reports the OCR failure', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const onDataExtracted = vi.fn()
    const { container } = render(<ReceiptScanner onDataExtracted={onDataExtracted} />)
    const cameraInput = container.querySelectorAll('input[type="file"]')[0] as HTMLInputElement

    mockCreateObjectURL
      .mockReset()
      .mockReturnValueOnce('blob:preview-camera')
      .mockReturnValueOnce('blob:preprocess-camera')
    mockCreateWorker.mockRejectedValue(new Error('OCR engine offline'))

    await triggerFileChange(cameraInput, createImageFile('image/jpeg'))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        'Failed to process image. Please try again.',
        expect.objectContaining({
          description: 'OCR engine offline',
        })
      )
    })

    expect(mockTrackToolEvent).toHaveBeenCalledWith('split_bill_scan_receipt', {
      file_type: 'image/jpeg',
    })
    expect(mockTrackToolEvent).toHaveBeenCalledWith('split_bill_ocr_error', {
      reason: 'OCR engine offline',
    })
    expect(consoleError).toHaveBeenCalledWith('OCR Error:', expect.any(Error))
    expect(onDataExtracted).not.toHaveBeenCalled()
  })
})
