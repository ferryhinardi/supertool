'use client'

import {
  ChevronLeft,
  ChevronRight,
  Circle,
  Download,
  Highlighter,
  Minus,
  MousePointer2,
  Square,
  Type,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import type * as PdfjsTypes from 'pdfjs-dist'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { css } from '@/styled-system/css'

// Tool types for the editor
type EditorTool = 'select' | 'text' | 'highlight' | 'rectangle' | 'circle' | 'line'

// Annotation interface
interface Annotation {
  id: string
  type: EditorTool
  page: number
  x: number
  y: number
  width?: number
  height?: number
  x2?: number
  y2?: number
  text?: string
  color: string
  fontSize?: number
}

interface PDFEditorProps {
  pdfFile: File
  onSave: (annotations: Annotation[]) => Promise<void>
  onClose: () => void
}

// Dynamic import for pdfjs-dist
let pdfjsLib: typeof PdfjsTypes | null = null

const initPdfjs = async () => {
  if (pdfjsLib) return pdfjsLib

  const module = await import('pdfjs-dist')
  pdfjsLib = module
  if (typeof window !== 'undefined') {
    module.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${module.version}/pdf.worker.min.js`
  }
  return module
}

export function PDFEditor({ pdfFile, onSave, onClose }: PDFEditorProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [zoom, setZoom] = useState(1.0)
  const [selectedTool, setSelectedTool] = useState<EditorTool>('select')
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null)
  const [selectedColor, setSelectedColor] = useState('#FF0000')
  const [isSaving, setIsSaving] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const pdfDocRef = useRef<PdfjsTypes.PDFDocumentProxy | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Redraw annotations on overlay canvas
  const redrawAnnotations = useCallback(() => {
    if (!overlayCanvasRef.current) return

    const canvas = overlayCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw all annotations for current page
    annotations
      .filter((ann) => ann.page === currentPage)
      .forEach((ann) => {
        ctx.strokeStyle = ann.color
        ctx.fillStyle = ann.color
        ctx.lineWidth = 2

        switch (ann.type) {
          case 'text':
            ctx.font = `${ann.fontSize || 16}px Arial`
            ctx.fillText(ann.text || '', ann.x, ann.y)
            break
          case 'highlight':
            ctx.globalAlpha = 0.3
            ctx.fillRect(ann.x, ann.y, ann.width || 0, ann.height || 0)
            ctx.globalAlpha = 1.0
            break
          case 'rectangle':
            ctx.strokeRect(ann.x, ann.y, ann.width || 0, ann.height || 0)
            break
          case 'circle': {
            const radius = Math.sqrt((ann.width || 0) ** 2 + (ann.height || 0) ** 2)
            ctx.beginPath()
            ctx.arc(ann.x, ann.y, radius / 2, 0, 2 * Math.PI)
            ctx.stroke()
            break
          }
          case 'line':
            ctx.beginPath()
            ctx.moveTo(ann.x, ann.y)
            ctx.lineTo(ann.x2 || ann.x, ann.y2 || ann.y)
            ctx.stroke()
            break
        }
      })
  }, [annotations, currentPage])

  // Render current page
  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDocRef.current || !canvasRef.current) return

      try {
        const page = await pdfDocRef.current.getPage(pageNum)
        const viewport = page.getViewport({ scale: zoom })

        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        if (!context) return

        canvas.width = viewport.width
        canvas.height = viewport.height

        // Setup overlay canvas
        if (overlayCanvasRef.current) {
          overlayCanvasRef.current.width = viewport.width
          overlayCanvasRef.current.height = viewport.height
        }

        // biome-ignore lint: pdfjs types issue
        const renderContext: any = {
          canvasContext: context,
          viewport: viewport,
        }

        await page.render(renderContext).promise
        redrawAnnotations()
      } catch (error) {
        console.error('Error rendering page:', error)
      }
    },
    [zoom, redrawAnnotations]
  )

  // Load PDF
  useEffect(() => {
    const loadPDF = async () => {
      try {
        const pdfjs = await initPdfjs()
        const arrayBuffer = await pdfFile.arrayBuffer()
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
        const pdf = await loadingTask.promise
        pdfDocRef.current = pdf
        setTotalPages(pdf.numPages)
        renderPage(1)
      } catch (error) {
        console.error('Error loading PDF:', error)
      }
    }

    loadPDF()
  }, [pdfFile, renderPage])

  // Re-render page when page or zoom changes
  useEffect(() => {
    if (pdfDocRef.current) {
      renderPage(currentPage)
    }
  }, [currentPage, renderPage])

  // Redraw annotations when they change
  useEffect(() => {
    redrawAnnotations()
  }, [redrawAnnotations])

  // Handle mouse down - start drawing
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === 'select') return

    const rect = overlayCanvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (selectedTool === 'text') {
      const text = window.prompt('Enter text:')
      if (text) {
        const newAnnotation: Annotation = {
          id: `ann-${Date.now()}`,
          type: 'text',
          page: currentPage,
          x,
          y,
          text,
          color: selectedColor,
          fontSize: 16,
        }
        setAnnotations([...annotations, newAnnotation])
      }
    } else {
      setIsDrawing(true)
      setCurrentAnnotation({
        id: `ann-${Date.now()}`,
        type: selectedTool,
        page: currentPage,
        x,
        y,
        width: 0,
        height: 0,
        color: selectedColor,
      })
    }
  }

  // Handle mouse move - continue drawing
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAnnotation || !overlayCanvasRef.current) return

    const rect = overlayCanvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (currentAnnotation.type === 'line') {
      setCurrentAnnotation({ ...currentAnnotation, x2: x, y2: y })
    } else {
      setCurrentAnnotation({
        ...currentAnnotation,
        width: x - currentAnnotation.x,
        height: y - currentAnnotation.y,
      })
    }

    // Draw preview
    const ctx = overlayCanvasRef.current.getContext('2d')
    if (!ctx) return

    redrawAnnotations()
    ctx.strokeStyle = currentAnnotation.color
    ctx.fillStyle = currentAnnotation.color
    ctx.lineWidth = 2

    switch (currentAnnotation.type) {
      case 'rectangle':
        ctx.strokeRect(
          currentAnnotation.x,
          currentAnnotation.y,
          x - currentAnnotation.x,
          y - currentAnnotation.y
        )
        break
      case 'circle': {
        const radius = Math.sqrt((x - currentAnnotation.x) ** 2 + (y - currentAnnotation.y) ** 2)
        ctx.beginPath()
        ctx.arc(currentAnnotation.x, currentAnnotation.y, radius / 2, 0, 2 * Math.PI)
        ctx.stroke()
        break
      }
      case 'line':
        ctx.beginPath()
        ctx.moveTo(currentAnnotation.x, currentAnnotation.y)
        ctx.lineTo(x, y)
        ctx.stroke()
        break
      case 'highlight':
        ctx.globalAlpha = 0.3
        ctx.fillRect(
          currentAnnotation.x,
          currentAnnotation.y,
          x - currentAnnotation.x,
          y - currentAnnotation.y
        )
        ctx.globalAlpha = 1.0
        break
    }
  }

  // Handle mouse up - finish drawing
  const handleMouseUp = () => {
    if (isDrawing && currentAnnotation) {
      setAnnotations([...annotations, currentAnnotation])
      setCurrentAnnotation(null)
    }
    setIsDrawing(false)
  }

  // Navigation handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Zoom handlers
  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.25, 3.0))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.25, 0.5))
  }

  // Save handler
  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(annotations)
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const tools: { type: EditorTool; icon: typeof MousePointer2; label: string }[] = [
    { type: 'select', icon: MousePointer2, label: 'Select' },
    { type: 'text', icon: Type, label: 'Text' },
    { type: 'highlight', icon: Highlighter, label: 'Highlight' },
    { type: 'rectangle', icon: Square, label: 'Rectangle' },
    { type: 'circle', icon: Circle, label: 'Circle' },
    { type: 'line', icon: Minus, label: 'Line' },
  ]

  const colors = [
    { value: '#FF0000', label: 'Red' },
    { value: '#0000FF', label: 'Blue' },
    { value: '#00FF00', label: 'Green' },
    { value: '#FFFF00', label: 'Yellow' },
    { value: '#000000', label: 'Black' },
  ]

  return (
    <div
      className={css({
        position: 'fixed',
        inset: 0,
        bg: 'black/80',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
      })}
    >
      <Card
        className={css({
          w: 'full',
          maxW: '1200px',
          h: 'full',
          maxH: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        })}
      >
        {/* Toolbar */}
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 4,
            borderBottom: '1px solid',
            borderColor: 'gray.200',
            _dark: { borderColor: 'gray.700' },
          })}
        >
          <div className={css({ display: 'flex', gap: 2, alignItems: 'center' })}>
            <h2 className={css({ fontSize: 'lg', fontWeight: 'semibold' })}>Edit PDF</h2>
          </div>

          {/* Tools */}
          <div className={css({ display: 'flex', gap: 2, alignItems: 'center' })}>
            {tools.map((tool) => (
              <Button
                key={tool.type}
                onClick={() => setSelectedTool(tool.type)}
                variant={selectedTool === tool.type ? 'default' : 'outline'}
                size="sm"
                title={tool.label}
              >
                <tool.icon className={css({ h: 4, w: 4 })} />
              </Button>
            ))}

            <div className={css({ w: 'px', h: 6, bg: 'gray.300', mx: 2 })} />

            {/* Color picker */}
            <div className={css({ display: 'flex', gap: 1 })}>
              {colors.map((color) => (
                <button
                  type="button"
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={css({
                    w: 6,
                    h: 6,
                    rounded: 'full',
                    border: '2px solid',
                    borderColor: selectedColor === color.value ? 'gray.800' : 'gray.300',
                    cursor: 'pointer',
                  })}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className={css({ display: 'flex', gap: 2 })}>
            <Button onClick={handleSave} disabled={isSaving}>
              <Download className={css({ h: 4, w: 4, mr: 2 })} />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={onClose} variant="outline">
              <X className={css({ h: 4, w: 4 })} />
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div
          ref={containerRef}
          className={css({
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bg: 'gray.100',
            _dark: { bg: 'gray.900' },
            position: 'relative',
          })}
        >
          <div className={css({ position: 'relative' })}>
            <canvas ref={canvasRef} className={css({ display: 'block' })} />
            <canvas
              ref={overlayCanvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={css({
                position: 'absolute',
                top: 0,
                left: 0,
                cursor:
                  selectedTool === 'select'
                    ? 'default'
                    : selectedTool === 'text'
                      ? 'text'
                      : 'crosshair',
              })}
            />
          </div>
        </div>

        {/* Bottom Controls */}
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 4,
            borderTop: '1px solid',
            borderColor: 'gray.200',
            _dark: { borderColor: 'gray.700' },
          })}
        >
          {/* Page Navigation */}
          <div className={css({ display: 'flex', gap: 2, alignItems: 'center' })}>
            <Button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className={css({ h: 4, w: 4 })} />
            </Button>
            <span className={css({ fontSize: 'sm' })}>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              <ChevronRight className={css({ h: 4, w: 4 })} />
            </Button>
          </div>

          {/* Zoom Controls */}
          <div className={css({ display: 'flex', gap: 2, alignItems: 'center' })}>
            <Button onClick={handleZoomOut} disabled={zoom <= 0.5} variant="outline" size="sm">
              <ZoomOut className={css({ h: 4, w: 4 })} />
            </Button>
            <span className={css({ fontSize: 'sm', minW: '16' })}>{Math.round(zoom * 100)}%</span>
            <Button onClick={handleZoomIn} disabled={zoom >= 3.0} variant="outline" size="sm">
              <ZoomIn className={css({ h: 4, w: 4 })} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
