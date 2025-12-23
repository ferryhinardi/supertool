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

  const _extractAmountsFromText = (text: string): ReceiptData => {
    const data: ReceiptData = {}

    // Clean up text: remove extra spaces, normalize line breaks
    const cleanText = text
      .replace(/\s+/g, ' ')
      .replace(/[\r\n]+/g, '\n')
      .toUpperCase()

    const lines = cleanText.split('\n').filter((line) => line.trim())

    // First, try to extract line items
    // TODO: Implement extractLineItems function if needed
    // const extractedItems = extractLineItems(lines)
    // if (extractedItems.length > 0) {
    //   data.items = extractedItems
    // }

    // Enhanced amount patterns with more variations
    const amountPatterns = [
      /\$?\s*(\d{1,6}[.,]\d{2})/g, // Standard: $12.34, 12.34
      /(\d{1,6})\s*[.,]\s*(\d{2})/g, // Separated: 12 . 34
      /\$?\s*(\d{1,6})\s+(\d{2})/g, // Space separated: $12 34
    ]

    // Comprehensive patterns for different receipt formats
    const patterns = {
      // Total patterns (most specific first)
      total: [
        /(?:^|\n|\s)(?:TOTAL|GRAND\s*TOTAL|AMOUNT\s*DUE|BALANCE\s*DUE|FINAL\s*TOTAL)[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
        /(?:^|\n)TOTAL[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
        /AMOUNT\s*DUE[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
        /BALANCE[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
      ],
      // Subtotal patterns
      subtotal: [
        /(?:^|\n|\s)(?:SUB\s*TOTAL|SUBTOTAL|SUB-TOTAL|AMOUNT)[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
        /(?:^|\n)SUBTOTAL[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
        /SUB\s*TOTAL[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
      ],
      // Tax patterns
      tax: [
        /(?:^|\n|\s)(?:TAX|GST|VAT|HST|SALES\s*TAX|STATE\s*TAX|LOCAL\s*TAX)[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
        /(?:^|\n)TAX[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
        /SALES\s*TAX[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
      ],
      // Tip patterns
      tip: [
        /(?:^|\n|\s)(?:TIP|GRATUITY|SERVICE\s*CHARGE|SERVICE)[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
        /(?:^|\n)TIP[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
        /GRATUITY[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
      ],
    }

    // Extract each field using multiple patterns
    for (const [key, patternList] of Object.entries(patterns)) {
      let found = false
      for (const pattern of patternList) {
        if (found) break

        const match = cleanText.match(pattern)
        if (match?.[1]) {
          const amount = parseFloat(match[1].replace(',', '.'))
          if (!Number.isNaN(amount) && amount > 0 && amount < 999999) {
            if (key === 'subtotal' || key === 'tax' || key === 'tip' || key === 'total') {
              data[key] = amount
            }
            found = true
          }
        }
      }
    }

    // Strategy 1: Line-by-line analysis for context (reuse lines variable)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Look for amounts at end of lines (common receipt format)
      const amountAtEndMatch = line.match(/(\d{1,6}[.,]\d{2})\s*$/)
      if (amountAtEndMatch) {
        const amount = parseFloat(amountAtEndMatch[1].replace(',', '.'))
        if (!Number.isNaN(amount) && amount > 0) {
          // Check if this line contains total keywords
          if (/TOTAL|AMOUNT.*DUE|BALANCE/i.test(line) && !data.total) {
            data.total = amount
          }
          // Check for subtotal
          else if (/SUB.*TOTAL|SUBTOTAL/i.test(line) && !data.subtotal) {
            data.subtotal = amount
          }
          // Check for tax
          else if (/TAX|GST|VAT/i.test(line) && !data.tax) {
            data.tax = amount
          }
          // Check for tip
          else if (/TIP|GRATUITY|SERVICE/i.test(line) && !data.tip) {
            data.tip = amount
          }
        }
      }
    }

    // Strategy 2: Amount validation and correction
    if (data.total && data.subtotal && data.tax && !data.tip) {
      // Check if total = subtotal + tax (common case)
      const calculated = data.subtotal + data.tax
      if (Math.abs(calculated - data.total) < 0.02) {
        // Values are consistent
      } else {
        // Try to find tip that makes it balance
        const possibleTip = data.total - data.subtotal - data.tax
        if (possibleTip > 0 && possibleTip < data.subtotal * 0.3) {
          data.tip = possibleTip
        }
      }
    }

    // Strategy 3: Fallback amount extraction
    if (Object.keys(data).length === 0) {
      const allAmounts: { amount: number; line: string }[] = []

      for (const pattern of amountPatterns) {
        let match = pattern.exec(cleanText)
        while (match !== null) {
          const amount = parseFloat(match[1].replace(',', '.'))
          if (!Number.isNaN(amount) && amount > 0 && amount < 999999) {
            allAmounts.push({
              amount,
              line: lines.find((line) => line.includes(match?.[0] ?? '')) || '',
            })
          }
          match = pattern.exec(cleanText)
        }
      }

      // Sort by amount (largest first) and try to assign
      allAmounts.sort((a, b) => b.amount - a.amount)

      if (allAmounts.length > 0) {
        data.total = allAmounts[0].amount
        if (allAmounts.length > 1) {
          data.subtotal = allAmounts[1].amount
        }
        if (allAmounts.length > 2) {
          // Look for smaller amounts that might be tax
          for (let i = 2; i < Math.min(allAmounts.length, 5); i++) {
            const ratio = allAmounts[i].amount / allAmounts[0].amount
            if (ratio < 0.2 && ratio > 0.02) {
              // Likely tax (2-20% of total)
              data.tax = allAmounts[i].amount
              break
            }
          }
        }
      }
    }

    // Final validation: ensure subtotal exists
    if (!data.subtotal && data.total) {
      if (data.tax && data.tip) {
        data.subtotal = data.total - data.tax - data.tip
      } else if (data.tax) {
        data.subtotal = data.total - data.tax
      } else if (data.tip) {
        data.subtotal = data.total - data.tip
      } else {
        data.subtotal = data.total
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

  // Validate and correct extracted data
  const _validateAndCorrectData = (data: ReceiptData): ReceiptData => {
    const validated = { ...data } // Remove obviously incorrect values (too large or negative)
    for (const [key, value] of Object.entries(validated)) {
      if (typeof value === 'number' && (value <= 0 || value > 999999 || !Number.isFinite(value))) {
        delete validated[key as keyof ReceiptData]
      }
    }

    // Mathematical validation and correction
    const { subtotal, tax, tip, total } = validated

    if (total && subtotal && tax && tip) {
      const calculated = subtotal + tax + tip
      if (Math.abs(calculated - total) > 0.1) {
        // Values don't add up, try to correct
        if (Math.abs(subtotal + tax - total) < 0.1) {
          // Total matches subtotal + tax, remove tip
          delete validated.tip
        } else if (Math.abs(subtotal + tip - total) < 0.1) {
          // Total matches subtotal + tip, remove tax
          delete validated.tax
        }
      }
    }

    // Ensure reasonable ratios
    if (total && tax && tax > total * 0.5) {
      // Tax is more than 50% of total, likely misidentified
      delete validated.tax
    }

    if (total && tip && tip > total * 0.4) {
      // Tip is more than 40% of total, likely misidentified
      delete validated.tip
    }

    // Ensure subtotal makes sense
    if (total && subtotal && subtotal > total) {
      // Subtotal can't be larger than total
      if (tax || tip) {
        delete validated.subtotal
      } else {
        validated.subtotal = total
      }
    }

    return validated
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
