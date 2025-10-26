'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Camera, Upload, X, Loader2, FileImage } from 'lucide-react'
import { trackToolEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'
import { createWorker, PSM } from 'tesseract.js'

interface ReceiptData {
  subtotal?: number
  tax?: number
  tip?: number
  total?: number
}

interface ReceiptScannerProps {
  onDataExtracted: (data: ReceiptData) => void
}

export function ReceiptScanner({ onDataExtracted }: ReceiptScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const extractAmountsFromText = (text: string): ReceiptData => {
    const data: ReceiptData = {}

    // Common patterns for amounts (e.g., $12.34, 12.34, $12,34)
    const amountPattern = /\$?\s*(\d{1,6}(?:[.,]\d{2}))/g

    // Pattern matchers for different line items
    // Order matters: Check for more specific patterns first (TOTAL before SUBTOTAL)
    const patterns = {
      total: /(?:^|\s)(?:TOTAL|AMOUNT\s*DUE|BALANCE\s*DUE)[:\s]*\$?\s*(\d{1,6}(?:[.,]\d{2}))/i,
      subtotal:
        /(?:^|\s)(?:SUB\s*TOTAL|SUBTOTAL|SUB-TOTAL|(?<!AMOUNT\s)AMOUNT(?!\s*DUE))[:\s]*\$?\s*(\d{1,6}(?:[.,]\d{2}))/i,
      tax: /(?:^|\s)(?:TAX|GST|VAT|SALES\s*TAX)[:\s]*\$?\s*(\d{1,6}(?:[.,]\d{2}))/i,
      tip: /(?:^|\s)(?:TIP|GRATUITY|SERVICE\s*CHARGE)[:\s]*\$?\s*(\d{1,6}(?:[.,]\d{2}))/i,
    }

    // Extract each field
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern)
      if (match && match[1]) {
        const amount = parseFloat(match[1].replace(',', '.'))
        if (!isNaN(amount) && amount > 0) {
          data[key as keyof ReceiptData] = amount
        }
      }
    }

    // Fallback: if no subtotal but we have total, use total as subtotal
    if (!data.subtotal && data.total) {
      data.subtotal = data.total
    }

    // Fallback: find all amounts and take the largest as total if not found
    if (!data.total) {
      const amounts: number[] = []
      let match
      while ((match = amountPattern.exec(text)) !== null) {
        const amount = parseFloat(match[1].replace(',', '.'))
        if (!isNaN(amount) && amount > 0) {
          amounts.push(amount)
        }
      }
      if (amounts.length > 0) {
        data.total = Math.max(...amounts)
        if (!data.subtotal) {
          data.subtotal = data.total
        }
      }
    }

    return data
  }

  const processImage = async (file: File) => {
    try {
      setIsProcessing(true)
      setProgress(0)

      // Create preview
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      // Initialize Tesseract worker
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
          }
        },
      })

      // Configure for receipt OCR (dense text, numbers important)
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
        tessedit_char_whitelist: '0123456789.$,ABCDEFGHIJKLMNOPQRSTUVWXYZ: ',
      })

      // Perform OCR
      const {
        data: { text },
      } = await worker.recognize(file)

      await worker.terminate()

      // Extract amounts from recognized text
      const extractedData = extractAmountsFromText(text)

      if (Object.keys(extractedData).length === 0) {
        toast.error('Could not extract amounts from receipt. Please try again or enter manually.')
        trackToolEvent('split_bill_ocr_error', { reason: 'no_amounts_found' })
      } else {
        toast.success('Receipt scanned successfully! 🎉')
        onDataExtracted(extractedData)
        trackToolEvent('split_bill_ocr_success', {
          fields_extracted: Object.keys(extractedData).length,
        })
      }
    } catch (error) {
      console.error('OCR Error:', error)
      toast.error('Failed to process image. Please try again.')
      trackToolEvent('split_bill_ocr_error', {
        reason: error instanceof Error ? error.message : 'unknown',
      })
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    trackToolEvent('split_bill_upload_receipt', { file_type: file.type })
    processImage(file)
  }

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    trackToolEvent('split_bill_scan_receipt', { file_type: file.type })
    processImage(file)
  }

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  return (
    <div
      className={css({
        rounded: { base: 'xl', sm: '2xl' },
        border: '2px solid',
        borderColor: 'purple.500/30',
        bg: 'rgba(168, 85, 247, 0.05)',
        p: { base: '4', sm: '5', md: '6' },
        backdropFilter: 'blur(16px)',
        spaceY: '4',
      })}
    >
      <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
        <div
          className="rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 p-2.5 shadow-lg"
          style={{ animationDuration: '2s' }}
        >
          <FileImage className="h-5 w-5 text-white sm:h-6 sm:w-6" />
        </div>
        <div>
          <h3
            className={css({
              fontSize: { base: 'base', sm: 'lg' },
              fontWeight: 'bold',
              color: 'purple.300',
            })}
          >
            Scan Receipt
          </h3>
          <p className="text-xs text-gray-400 sm:text-sm">
            Upload or capture a photo of your receipt
          </p>
        </div>
      </div>

      {!previewUrl && !isProcessing && (
        <div>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            className={css({ display: 'none' })}
          />
          <Button
            onClick={() => cameraInputRef.current?.click()}
            size="lg"
            variant="default"
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '2',
              w: 'full',
              h: '2/6',
              color: 'white',
            })}
          >
            <Camera className="h-5 w-5" />
            Take Photo
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className={css({ display: 'none' })}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="lg"
            variant="outline"
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '2',
              w: 'full',
            })}
          >
            <Upload className="h-5 w-5" />
            Upload Image
          </Button>
        </div>
      )}

      {previewUrl && (
        <div className={css({ spaceY: '3' })}>
          <div className={css({ position: 'relative', rounded: 'lg', overflow: 'hidden' })}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Receipt preview"
              className={css({ w: 'full', h: 'auto', maxH: '300px', objectFit: 'contain' })}
            />
            {!isProcessing && (
              <button
                onClick={clearPreview}
                className={css({
                  position: 'absolute',
                  top: '2',
                  right: '2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  h: '8',
                  w: '8',
                  rounded: 'full',
                  bg: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  transition: 'all 0.2s',
                  _hover: { bg: 'rgba(239, 68, 68, 0.8)' },
                })}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {isProcessing && (
        <div className={css({ spaceY: '3' })}>
          <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
            <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
            <span className="text-sm text-gray-300">
              Processing receipt... {progress > 0 ? `${progress}%` : ''}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <div
        className={css({
          rounded: 'lg',
          border: '1px solid',
          borderColor: 'purple.500/30',
          bg: 'rgba(168, 85, 247, 0.1)',
          p: '3',
        })}
      >
        <div className="text-xs text-gray-400 space-y-1">
          <p>
            📸 <strong>Tip:</strong> Ensure the receipt is well-lit and text is clear
          </p>
          <p>
            🔍 <strong>OCR will detect:</strong> Subtotal, Tax, Tip, and Total amounts
          </p>
          <p>
            ✨ <strong>Works offline:</strong> All processing happens in your browser
          </p>
        </div>
      </div>
    </div>
  )
}
