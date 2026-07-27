'use client'

import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ButtonHTMLAttributes, HTMLAttributes } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PDFEditor } from '../PDFEditor'

const mockMainCanvasContext = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  stroke: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  fillText: vi.fn(),
  drawImage: vi.fn(),
  fillStyle: '#000000',
  strokeStyle: '#000000',
  lineWidth: 1,
  globalAlpha: 1,
  font: '16px Arial',
}

const mockOverlayCanvasContext = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  stroke: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  fillText: vi.fn(),
  fillStyle: '#000000',
  strokeStyle: '#000000',
  lineWidth: 1,
  globalAlpha: 1,
  font: '16px Arial',
}

const mockRender = vi.fn()
const mockGetPage = vi.fn()
const mockGetDocument = vi.fn()
const mockPrompt = vi.fn()
const mockPdfjsModule = {
  version: '4.0.0',
  GlobalWorkerOptions: {
    workerSrc: '',
  },
  getDocument: mockGetDocument,
}

vi.mock('pdfjs-dist', () => mockPdfjsModule)

vi.mock('lucide-react', () => {
  const Icon = ({ className }: { className?: string }) => <span className={className}>icon</span>

  return {
    ChevronLeft: Icon,
    ChevronRight: Icon,
    Circle: Icon,
    Download: Icon,
    Highlighter: Icon,
    Minus: Icon,
    MousePointer2: Icon,
    Square: Icon,
    Type: Icon,
    X: Icon,
    ZoomIn: Icon,
    ZoomOut: Icon,
  }
})

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type={type} {...props}>
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: HTMLAttributes<HTMLElement>) => (
    <article {...props}>{children}</article>
  ),
}))

vi.mock('@/styled-system/css', () => ({
  css: () => 'mock-css',
}))

function createPdfFile() {
  const file = new File(['pdf-content'], 'sample.pdf', { type: 'application/pdf' })
  Object.defineProperty(file, 'arrayBuffer', {
    value: vi.fn().mockResolvedValue(new ArrayBuffer(16)),
  })
  return file
}

function createMockPdfPage() {
  return {
    getViewport: vi.fn(({ scale }: { scale: number }) => ({
      width: 200 * scale,
      height: 300 * scale,
    })),
    render: vi.fn(() => ({ promise: Promise.resolve() })),
  }
}

function renderEditor(overrides?: {
  onSave?: (annotations: unknown[]) => Promise<void>
  onClose?: () => void
}) {
  const onSave = overrides?.onSave ?? vi.fn().mockResolvedValue(undefined)
  const onClose = overrides?.onClose ?? vi.fn()

  const view = render(<PDFEditor pdfFile={createPdfFile()} onSave={onSave} onClose={onClose} />)
  const canvases = view.container.querySelectorAll('canvas')

  return {
    ...view,
    onSave,
    onClose,
    pdfCanvas: canvases[0] as HTMLCanvasElement,
    overlayCanvas: canvases[1] as HTMLCanvasElement,
  }
}

async function triggerCanvasEvent(
  type: 'mouseDown' | 'mouseMove' | 'mouseUp',
  canvas: HTMLCanvasElement,
  coordinates?: { clientX: number; clientY: number }
) {
  await act(async () => {
    fireEvent[type](canvas, coordinates)
  })
}

describe('PDFEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(Date, 'now')
      .mockReturnValueOnce(1001)
      .mockReturnValueOnce(1002)
      .mockReturnValueOnce(1003)
      .mockReturnValueOnce(1004)
      .mockReturnValueOnce(1005)

    mockPrompt.mockReset()
    mockPdfjsModule.GlobalWorkerOptions.workerSrc = ''

    const firstPage = createMockPdfPage()
    const secondPage = createMockPdfPage()

    mockGetPage.mockImplementation(async (pageNumber: number) =>
      pageNumber === 2 ? secondPage : firstPage
    )
    mockRender.mockResolvedValue({ promise: Promise.resolve() })
    mockGetDocument.mockReturnValue({
      promise: Promise.resolve({
        numPages: 2,
        getPage: mockGetPage,
      }),
    })

    Object.defineProperty(window, 'prompt', {
      value: mockPrompt,
      writable: true,
      configurable: true,
    })

    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: vi.fn(function getContext(this: HTMLCanvasElement, contextId: string) {
        if (contextId !== '2d') return null
        return this === document.querySelectorAll('canvas')[0]
          ? (mockMainCanvasContext as unknown as CanvasRenderingContext2D)
          : (mockOverlayCanvasContext as unknown as CanvasRenderingContext2D)
      }),
      configurable: true,
      writable: true,
    })

    Object.defineProperty(HTMLCanvasElement.prototype, 'getBoundingClientRect', {
      value: vi.fn(() => ({
        left: 0,
        top: 0,
        right: 200,
        bottom: 300,
        width: 200,
        height: 300,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      })),
      configurable: true,
      writable: true,
    })
  })

  it('loads the PDF, configures the worker, and renders the editor controls', async () => {
    renderEditor()

    expect(await screen.findByText('Edit PDF')).toBeInTheDocument()

    await waitFor(() => {
      expect(mockGetDocument).toHaveBeenCalledTimes(1)
      expect(mockGetPage).toHaveBeenCalledWith(1)
    })

    expect(mockPdfjsModule.GlobalWorkerOptions.workerSrc).toBe(
      '//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.0/pdf.worker.min.js'
    )
    expect(screen.getByTitle('Select')).toBeInTheDocument()
    expect(screen.getByTitle('Text')).toBeInTheDocument()
    expect(screen.getByTitle('Rectangle')).toBeInTheDocument()
    expect(screen.getByTitle('Red')).toBeInTheDocument()
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('creates text, rectangle, circle, line, and highlight annotations then saves them', async () => {
    const user = userEvent.setup()
    mockPrompt.mockReturnValue('Receipt total')
    const { overlayCanvas, onSave } = renderEditor()

    await screen.findByText('Edit PDF')
    await user.click(screen.getByTitle('Blue'))
    await user.click(screen.getByTitle('Text'))
    await triggerCanvasEvent('mouseDown', overlayCanvas, { clientX: 20, clientY: 30 })

    await user.click(screen.getByTitle('Rectangle'))
    await triggerCanvasEvent('mouseDown', overlayCanvas, { clientX: 10, clientY: 15 })
    await triggerCanvasEvent('mouseMove', overlayCanvas, { clientX: 60, clientY: 70 })
    await triggerCanvasEvent('mouseUp', overlayCanvas)

    await user.click(screen.getByTitle('Circle'))
    await triggerCanvasEvent('mouseDown', overlayCanvas, { clientX: 30, clientY: 35 })
    await triggerCanvasEvent('mouseMove', overlayCanvas, { clientX: 90, clientY: 95 })
    await triggerCanvasEvent('mouseUp', overlayCanvas)

    await user.click(screen.getByTitle('Line'))
    await triggerCanvasEvent('mouseDown', overlayCanvas, { clientX: 40, clientY: 45 })
    await triggerCanvasEvent('mouseMove', overlayCanvas, { clientX: 120, clientY: 125 })
    await triggerCanvasEvent('mouseUp', overlayCanvas)

    await user.click(screen.getByTitle('Highlight'))
    await triggerCanvasEvent('mouseDown', overlayCanvas, { clientX: 50, clientY: 55 })
    await triggerCanvasEvent('mouseMove', overlayCanvas, { clientX: 130, clientY: 135 })
    await triggerCanvasEvent('mouseUp', overlayCanvas)

    const saveButton = screen.getByText('Save').closest('button') as HTMLButtonElement
    await user.click(saveButton)

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1)
    })

    expect(mockPrompt).toHaveBeenCalledWith('Enter text:')
    expect(mockOverlayCanvasContext.fillText).toHaveBeenCalledWith('Receipt total', 20, 30)
    expect(mockOverlayCanvasContext.strokeRect).toHaveBeenCalled()
    expect(mockOverlayCanvasContext.arc).toHaveBeenCalled()
    expect(mockOverlayCanvasContext.moveTo).toHaveBeenCalled()
    expect(mockOverlayCanvasContext.lineTo).toHaveBeenCalled()
    expect(mockOverlayCanvasContext.fillRect).toHaveBeenCalled()
    expect(onSave).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.stringMatching(/^ann-/),
          type: 'text',
          page: 1,
          x: 20,
          y: 30,
          text: 'Receipt total',
          color: '#0000FF',
          fontSize: 16,
        }),
        expect.objectContaining({
          id: expect.stringMatching(/^ann-/),
          type: 'rectangle',
          page: 1,
          x: 10,
          y: 15,
          width: 50,
          height: 55,
          color: '#0000FF',
        }),
        expect.objectContaining({
          id: expect.stringMatching(/^ann-/),
          type: 'circle',
          page: 1,
          x: 30,
          y: 35,
          width: 60,
          height: 60,
          color: '#0000FF',
        }),
        expect.objectContaining({
          id: expect.stringMatching(/^ann-/),
          type: 'line',
          page: 1,
          x: 40,
          y: 45,
          x2: 120,
          y2: 125,
          color: '#0000FF',
        }),
        expect.objectContaining({
          id: expect.stringMatching(/^ann-/),
          type: 'highlight',
          page: 1,
          x: 50,
          y: 55,
          width: 80,
          height: 80,
          color: '#0000FF',
        }),
      ])
    )
  })

  it('navigates pages, enforces zoom bounds, and closes the editor', async () => {
    const user = userEvent.setup()
    const { onClose } = renderEditor()

    await screen.findByText('Edit PDF')

    const pageControls = screen.getByText('Page 1 of 2').parentElement as HTMLElement
    const zoomControls = screen.getByText('100%').parentElement as HTMLElement
    const actionControls = screen.getByText('Save').closest('button')?.parentElement as HTMLElement
    const [prevButton, nextButton] = within(pageControls).getAllByRole('button')
    const [zoomOutButton, zoomInButton] = within(zoomControls).getAllByRole('button')
    const closeButton = within(actionControls).getAllByRole('button')[1]

    expect(prevButton).toBeDisabled()
    expect(nextButton).not.toBeDisabled()

    await user.click(nextButton)
    expect(await screen.findByText('Page 2 of 2')).toBeInTheDocument()
    expect(nextButton).toBeDisabled()

    await user.click(prevButton)
    expect(await screen.findByText('Page 1 of 2')).toBeInTheDocument()

    for (let index = 0; index < 8; index += 1) {
      await user.click(zoomInButton)
    }
    expect(screen.getByText('300%')).toBeInTheDocument()
    expect(zoomInButton).toBeDisabled()

    for (let index = 0; index < 10; index += 1) {
      await user.click(zoomOutButton)
    }
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(zoomOutButton).toBeDisabled()

    await user.click(closeButton)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('skips empty text annotations and recovers after save failures', async () => {
    const user = userEvent.setup()
    const saveError = new Error('save failed')
    const onSave = vi.fn().mockRejectedValue(saveError)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockPrompt.mockReturnValue('')

    const { overlayCanvas } = renderEditor({ onSave })

    await screen.findByText('Edit PDF')
    await user.click(screen.getByTitle('Text'))
    await triggerCanvasEvent('mouseDown', overlayCanvas, { clientX: 15, clientY: 25 })

    const saveButton = screen.getByText('Save').closest('button') as HTMLButtonElement
    await user.click(saveButton)

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith([])
    })

    expect(consoleError).toHaveBeenCalledWith('Error saving:', saveError)
    expect(await screen.findByText('Save')).toBeInTheDocument()
  })
})
