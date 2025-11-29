/**
 * Analyzes PDF content to determine optimal compression strategy
 */
export async function analyzeDocumentContent(
  pdfDoc: Awaited<Awaited<ReturnType<typeof import('pdfjs-dist').getDocument>>['promise']>
): Promise<{
  isTextHeavy: boolean
  hasImages: boolean
  recommendedLevel: 'low' | 'medium' | 'high'
  reason: string
}> {
  try {
    let totalTextLength = 0
    let hasImages = false

    // Sample first 5 pages for analysis
    const pagesToAnalyze = Math.min(5, pdfDoc.numPages)

    for (let i = 1; i <= pagesToAnalyze; i++) {
      const page = await pdfDoc.getPage(i)
      const textContent = await page.getTextContent()

      // Count text characters
      for (const item of textContent.items) {
        if ('str' in item) {
          totalTextLength += item.str.length
        }
      }

      // Check for images using operators
      const operators = await page.getOperatorList()
      for (const op of operators.fnArray) {
        // 85 = OPS.paintImageXObject in pdfjs
        if (op === 85) {
          hasImages = true
          break
        }
      }
    }

    // Average text per page
    const avgTextPerPage = totalTextLength / pagesToAnalyze

    // Decision logic
    if (!hasImages && avgTextPerPage > 500) {
      // Text-heavy document with no images
      return {
        isTextHeavy: true,
        hasImages: false,
        recommendedLevel: 'medium',
        reason: 'Text-heavy document - medium compression preserves readability',
      }
    }

    if (hasImages && avgTextPerPage < 200) {
      // Image-heavy document
      return {
        isTextHeavy: false,
        hasImages: true,
        recommendedLevel: 'high',
        reason: 'Image-heavy document - high compression significantly reduces file size',
      }
    }

    if (hasImages && avgTextPerPage >= 200) {
      // Mixed content
      return {
        isTextHeavy: false,
        hasImages: true,
        recommendedLevel: 'medium',
        reason: 'Mixed content - balanced compression for text and images',
      }
    }

    // Default for minimal content
    return {
      isTextHeavy: true,
      hasImages: false,
      recommendedLevel: 'low',
      reason: 'Minimal content - low compression to preserve quality',
    }
  } catch (error) {
    console.error('Error analyzing document:', error)
    return {
      isTextHeavy: false,
      hasImages: false,
      recommendedLevel: 'medium',
      reason: 'Unable to analyze - using balanced compression',
    }
  }
}

/**
 * Calculate estimated time based on file size and operation
 */
export function estimateProcessingTime(
  fileSizeBytes: number,
  operation: string,
  pageCount: number
): number {
  // Base time in seconds
  const baseTime = {
    compress: 0.5, // per page
    merge: 0.1, // per page
    split: 0.1, // per page
    toImages: 1, // per page
    toWord: 1.5, // per page
    watermark: 0.2, // per page
    extract: 0.1, // per page
    rotate: 0.1, // per page
    grayscale: 0.8, // per page
    edit: 0.3, // per page
  }

  const timePerPage = baseTime[operation as keyof typeof baseTime] || 0.5

  // Adjust for file size (larger files take longer)
  const sizeMultiplier = Math.max(1, fileSizeBytes / (5 * 1024 * 1024)) // 5MB baseline

  return Math.ceil(timePerPage * pageCount * sizeMultiplier)
}
