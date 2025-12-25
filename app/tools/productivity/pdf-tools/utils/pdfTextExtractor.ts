/**
 * Utility functions for extracting text from PDFs
 * Uses pdfjs-dist library for text extraction
 */

import type * as PdfjsTypes from 'pdfjs-dist'

// Dynamic import for pdfjs-dist (client-side only)
let pdfjsLib: typeof PdfjsTypes | null = null
let pdfjsInitPromise: Promise<typeof PdfjsTypes> | null = null

const initPdfjs = async () => {
  if (pdfjsLib) return pdfjsLib
  if (pdfjsInitPromise) return pdfjsInitPromise

  pdfjsInitPromise = import('pdfjs-dist').then(async (module) => {
    pdfjsLib = module
    if (typeof window !== 'undefined') {
      // Use local worker file from node_modules
      module.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.mjs',
        import.meta.url
      ).toString()
    }
    return module
  })

  return pdfjsInitPromise
}

/**
 * Extract text from a single PDF page
 */
async function extractPageText(page: PdfjsTypes.PDFPageProxy): Promise<string> {
  try {
    const textContent = await page.getTextContent()
    const textItems = textContent.items
      .map((item) => {
        if ('str' in item) {
          return item.str
        }
        return ''
      })
      .filter((text) => text.trim().length > 0)
    return textItems.join(' ')
  } catch (error) {
    console.error('Error extracting page text:', error)
    return ''
  }
}

export interface ExtractedText {
  text: string
  pageCount: number
  wordCount: number
  charCount: number
}

/**
 * Extract all text from a PDF file
 * @param file - PDF file to extract text from
 * @param options - Extraction options
 * @returns Extracted text with metadata
 */
export async function extractTextFromPDF(
  file: File,
  options?: {
    maxPages?: number // Limit number of pages to extract (for large PDFs)
    onProgress?: (current: number, total: number) => void
  }
): Promise<ExtractedText> {
  try {
    // Initialize pdfjs
    const pdfjs = await initPdfjs()

    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer()

    // Load PDF document
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise

    const pageCount = pdf.numPages
    const maxPages = options?.maxPages || pageCount
    const pagesToExtract = Math.min(maxPages, pageCount)

    // Extract text from all pages
    const textParts: string[] = []

    for (let pageNum = 1; pageNum <= pagesToExtract; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const pageText = await extractPageText(page)
      textParts.push(pageText)

      // Report progress if callback provided
      if (options?.onProgress) {
        options.onProgress(pageNum, pagesToExtract)
      }
    }

    // Combine all text
    const fullText = textParts.join('\n\n')

    // Calculate stats
    const wordCount = fullText.split(/\s+/).filter((word) => word.length > 0).length
    const charCount = fullText.length

    return {
      text: fullText,
      pageCount,
      wordCount,
      charCount,
    }
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw new Error(
      `Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Extract text from specific pages only
 * @param file - PDF file
 * @param pageNumbers - Array of page numbers to extract (1-indexed)
 * @returns Extracted text from specified pages
 */
export async function extractTextFromPages(
  file: File,
  pageNumbers: number[]
): Promise<ExtractedText> {
  try {
    // Initialize pdfjs
    const pdfjs = await initPdfjs()

    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer()

    // Load PDF document
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise

    const pageCount = pdf.numPages

    // Extract text from specified pages only
    const textParts: string[] = []

    for (const pageNum of pageNumbers) {
      if (pageNum < 1 || pageNum > pageCount) {
        console.warn(`Page ${pageNum} is out of range (1-${pageCount})`)
        continue
      }

      const page = await pdf.getPage(pageNum)
      const pageText = await extractPageText(page)
      textParts.push(pageText)
    }

    // Combine all text
    const fullText = textParts.join('\n\n')

    // Calculate stats
    const wordCount = fullText.split(/\s+/).filter((word) => word.length > 0).length
    const charCount = fullText.length

    return {
      text: fullText,
      pageCount: pageNumbers.length,
      wordCount,
      charCount,
    }
  } catch (error) {
    console.error('Error extracting text from pages:', error)
    throw new Error(
      `Failed to extract text from pages: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Check if PDF contains extractable text (not scanned image)
 * @param file - PDF file to check
 * @returns True if PDF contains text, false if it's likely a scanned image
 */
export async function pdfHasText(file: File): Promise<boolean> {
  try {
    // Extract text from first page only
    const result = await extractTextFromPages(file, [1])

    // If first page has at least 50 characters, assume it has text
    return result.charCount > 50
  } catch (error) {
    console.error('Error checking PDF for text:', error)
    return false
  }
}
