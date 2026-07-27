'use client'

import { Camera, FileImage, Loader2, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { createWorker, PSM } from 'tesseract.js'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { trackToolEvent } from '@/lib/services/analytics'
import { parseReceiptText } from '@/lib/tools/split-bill/receipt-parser'
import { css } from '@/styled-system/css'
import { type ExtractedItem, ItemPreviewModal } from './ItemPreviewModal'

export interface LineItem {
  name: string
  price: number
  quantity: number
}

interface ReceiptData {
  items?: LineItem[]
  subtotal?: number
  tax?: number
  tip?: number
  total?: number
  merchant?: string
  date?: string
}

interface ReceiptScannerProps {
  onDataExtracted: (data: ReceiptData) => void
}

export function ReceiptScanner({ onDataExtracted }: ReceiptScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showItemPreview, setShowItemPreview] = useState(false)
  const [extractedData, setExtractedData] = useState<ReceiptData | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Preprocess image for better OCR accuracy
  const preprocessImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Failed to get canvas context')
      const img = new Image()

      img.onload = () => {
        // Set canvas size
        canvas.width = img.width
        canvas.height = img.height

        // Draw original image
        ctx.drawImage(img, 0, 0)

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Image enhancement techniques
        // 1. Increase contrast and brightness
        for (let i = 0; i < data.length; i += 4) {
          // Contrast enhancement
          const factor = 1.3 // Contrast factor
          data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128)) // Red
          data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128)) // Green
          data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128)) // Blue

          // Brightness adjustment
          const brightness = 20
          data[i] = Math.min(255, data[i] + brightness)
          data[i + 1] = Math.min(255, data[i + 1] + brightness)
          data[i + 2] = Math.min(255, data[i + 2] + brightness)
        }

        // 2. Convert to grayscale for better OCR
        for (let i = 0; i < data.length; i += 4) {
          const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
          data[i] = gray
          data[i + 1] = gray
          data[i + 2] = gray
        }

        // 3. Apply threshold for better text clarity
        const threshold = 140
        for (let i = 0; i < data.length; i += 4) {
          const value = data[i] > threshold ? 255 : 0
          data[i] = value
          data[i + 1] = value
          data[i + 2] = value
        }

        // Put processed image data back
        ctx.putImageData(imageData, 0, 0)

        // Return as data URL
        resolve(canvas.toDataURL())
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // Handle item preview modal confirmation
  const handleItemsConfirmed = (items: ExtractedItem[]) => {
    if (!extractedData) return

    // Convert ExtractedItems back to LineItems
    const confirmedItems: LineItem[] = items.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }))

    // Update extracted data with confirmed items
    const finalData: ReceiptData = {
      ...extractedData,
      items: confirmedItems,
    }

    // Pass to parent component
    onDataExtracted(finalData)

    // Show success message
    toast.success(`${confirmedItems.length} items imported successfully! 🎉`, {
      description: 'Review and assign items to people',
    })

    // Reset state
    setShowItemPreview(false)
    setExtractedData(null)
    clearPreview()
  }

  const processImage = async (file: File) => {
    try {
      setIsProcessing(true)
      setProgress(0)

      // Create preview
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      // Preprocess image for better OCR accuracy
      setProgress(10)
      const preprocessedImageUrl = await preprocessImage(file)

      // Initialize Tesseract worker with better configuration
      setProgress(20)
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(20 + Math.round(m.progress * 60)) // 20-80%
          }
        },
      })

      // Enhanced OCR parameters for receipts
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK, // Treat as single block of text
        tessedit_char_whitelist:
          '0123456789.$,ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz:()- \n',
        tessedit_ocr_engine_mode: '1', // LSTM only (more accurate for modern receipts)
        preserve_interword_spaces: '1',
        user_defined_dpi: '300', // Higher DPI for better accuracy
        tessedit_do_invert: '0', // Don't invert colors automatically
      })

      setProgress(80)

      // Try multiple OCR approaches for better results
      const ocrResults: string[] = []

      // Approach 1: Standard OCR on preprocessed image
      try {
        const {
          data: { text },
        } = await worker.recognize(preprocessedImageUrl)
        if (text.trim()) ocrResults.push(text)
      } catch (e) {
        console.warn('Standard OCR failed:', e)
      }

      // Approach 2: OCR with different PSM mode for line-by-line processing
      try {
        await worker.setParameters({
          tessedit_pageseg_mode: PSM.SINGLE_COLUMN, // Single column mode
        })
        const {
          data: { text },
        } = await worker.recognize(preprocessedImageUrl)
        if (text.trim()) ocrResults.push(text)
      } catch (e) {
        console.warn('Single column OCR failed:', e)
      }

      // Approach 3: OCR on original image as fallback
      try {
        await worker.setParameters({
          tessedit_pageseg_mode: PSM.AUTO,
        })
        const {
          data: { text },
        } = await worker.recognize(file)
        if (text.trim()) ocrResults.push(text)
      } catch (e) {
        console.warn('Original image OCR failed:', e)
      }

      await worker.terminate()
      setProgress(90)

      // Use enhanced parser for all OCR results
      let bestParsedReceipt = null
      let highestConfidence = 0

      for (const text of ocrResults) {
        const parsedReceipt = parseReceiptText(text)

        // Calculate confidence score (high=3, medium=2, low=1)
        const confidenceScore =
          parsedReceipt.confidence.overall === 'high'
            ? 3
            : parsedReceipt.confidence.overall === 'medium'
              ? 2
              : 1

        if (confidenceScore > highestConfidence) {
          highestConfidence = confidenceScore
          bestParsedReceipt = parsedReceipt
        }
      }

      setProgress(100)

      if (
        !bestParsedReceipt ||
        (bestParsedReceipt.items.length === 0 && !bestParsedReceipt.total)
      ) {
        toast.error('Could not extract data from receipt. Please try again or enter manually.', {
          description: 'Tip: Ensure the receipt is well-lit and text is clearly visible',
        })
        trackToolEvent('split_bill_ocr_error', {
          reason: 'no_data_found',
          ocr_attempts: ocrResults.length,
        })
      } else {
        const { items, subtotal, tax, tip, total, merchant, date, confidence } = bestParsedReceipt
        const itemCount = items.length

        // Store extracted data for modal
        const receiptData: ReceiptData = {
          items: items.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          subtotal,
          tax,
          tip,
          total,
          merchant,
          date,
        }

        // If items were found, show preview modal for review
        if (itemCount > 0) {
          setExtractedData(receiptData)
          setShowItemPreview(true)

          // Show initial success toast
          toast.success(
            `Receipt scanned! Found ${itemCount} items (${confidence.items} confidence) 🎉`,
            {
              description: `${merchant ? `From ${merchant} • ` : ''}Review items before importing`,
              duration: 4000,
            }
          )

          trackToolEvent('split_bill_ocr_success', {
            items_count: itemCount,
            confidence_overall: confidence.overall,
            confidence_items: confidence.items,
            confidence_amounts: confidence.amounts,
            ocr_attempts: ocrResults.length,
            has_merchant: !!merchant,
            has_date: !!date,
          })
        } else {
          // No items, just amounts - apply directly
          const fieldsFound = Object.keys(receiptData).filter(
            (k) => k !== 'merchant' && k !== 'date' && receiptData[k as keyof ReceiptData]
          )

          toast.success(
            `Receipt scanned! Found: ${fieldsFound.join(', ')} (${confidence.amounts} confidence) 🎉`,
            {
              description: 'Review the extracted values and adjust if needed',
            }
          )

          onDataExtracted(receiptData)

          trackToolEvent('split_bill_ocr_success', {
            fields_extracted: fieldsFound.length,
            fields: fieldsFound,
            confidence_overall: confidence.overall,
            confidence_amounts: confidence.amounts,
            ocr_attempts: ocrResults.length,
          })
        }
      }
    } catch (error) {
      console.error('OCR Error:', error)
      toast.error('Failed to process image. Please try again.', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      })
      trackToolEvent('split_bill_ocr_error', {
        reason: error instanceof Error ? error.message : 'unknown',
      })
    } finally {
      setIsProcessing(false)
      setProgress(0)
      // Clean up preprocessed image URL if created
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
          <div
            className={css({
              position: 'relative',
              rounded: 'lg',
              overflow: 'hidden',
            })}
          >
            <img
              src={previewUrl}
              alt="Receipt preview"
              className={css({
                w: 'full',
                h: 'auto',
                maxH: '300px',
                objectFit: 'contain',
              })}
            />
            {!isProcessing && (
              <button
                type="button"
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
            📸 <strong>Best Results:</strong> Good lighting, flat surface, clear text
          </p>
          <p>
            🔍 <strong>Auto-detects:</strong> Line items (name, price, qty) + Subtotal, Tax, Tip,
            Total
          </p>
          <p>
            🎯 <strong>Enhanced OCR:</strong> Multiple recognition passes for higher accuracy
          </p>
          <p>
            ✨ <strong>Privacy-first:</strong> All processing happens locally in your browser
          </p>
          <p>
            ⚡ <strong>Smart Confidence Scoring:</strong> High/Medium/Low ratings for uncertain
            items - review before importing
          </p>
        </div>
      </div>

      {/* Item Preview Modal */}
      {showItemPreview && extractedData?.items && (
        <ItemPreviewModal
          isOpen={showItemPreview}
          onClose={() => {
            setShowItemPreview(false)
            setExtractedData(null)
          }}
          items={
            extractedData.items.map((item, index) => ({
              id: `${Date.now()}_${index}`,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              confidence: 'medium' as const, // Default fallback if confidence not provided
              rawText: item.name, // Use name as rawText fallback
            })) as ExtractedItem[]
          }
          onConfirm={handleItemsConfirmed}
        />
      )}
    </div>
  )
}
