/**
 * Enhanced Receipt Parser with Confidence Scoring
 * Extracts line items, amounts, and metadata from OCR text
 */

export interface ParsedLineItem {
  name: string
  price: number
  quantity: number
  confidence: 'high' | 'medium' | 'low'
  rawText: string
  matchedPattern: string
}

export interface ParsedReceipt {
  items: ParsedLineItem[]
  subtotal?: number
  tax?: number
  tip?: number
  total?: number
  merchant?: string
  date?: string
  confidence: {
    items: 'high' | 'medium' | 'low'
    amounts: 'high' | 'medium' | 'low'
    overall: 'high' | 'medium' | 'low'
  }
}

interface ItemPattern {
  name: string
  regex: RegExp
  extractors: {
    name: number
    price: number
    quantity?: number
  }
  confidence: 'high' | 'medium' | 'low'
}

// Common receipt line item patterns (ordered by confidence)
const ITEM_PATTERNS: ItemPattern[] = [
  // High confidence: Qty x Item Name @ $Price = $Total
  {
    name: 'qty_item_at_price_total',
    regex:
      /^(\d+)\s*[xX×]\s*([A-Za-z][A-Za-z0-9\s&'-]+?)\s*@\s*\$?\s*(\d{1,6}[.,]\d{2})\s*=\s*\$?\s*\d{1,6}[.,]\d{2}\s*$/,
    extractors: { quantity: 1, name: 2, price: 3 },
    confidence: 'high',
  },
  // High confidence: Qty Item Name $Price
  {
    name: 'qty_item_price',
    regex: /^(\d+)\s+([A-Za-z][A-Za-z0-9\s&'-]{2,40}?)\s{2,}\$?\s*(\d{1,6}[.,]\d{2})\s*$/,
    extractors: { quantity: 1, name: 2, price: 3 },
    confidence: 'high',
  },
  // High confidence: Item Name x2 $Price
  {
    name: 'item_qty_price',
    regex: /^([A-Za-z][A-Za-z0-9\s&'-]{2,40}?)\s+[xX×](\d+)\s+\$?\s*(\d{1,6}[.,]\d{2})\s*$/,
    extractors: { name: 1, quantity: 2, price: 3 },
    confidence: 'high',
  },
  // Medium confidence: Item Name (multiple spaces) $Price
  {
    name: 'item_spaces_price',
    regex: /^([A-Za-z][A-Za-z0-9\s&'-]{2,40}?)\s{3,}\$?\s*(\d{1,6}[.,]\d{2})\s*$/,
    extractors: { name: 1, price: 2 },
    confidence: 'medium',
  },
  // Medium confidence: Item Name ............. $Price
  {
    name: 'item_dots_price',
    regex: /^([A-Za-z][A-Za-z0-9\s&'-]{2,40}?)\s*[.·]{3,}\s*\$?\s*(\d{1,6}[.,]\d{2})\s*$/,
    extractors: { name: 1, price: 2 },
    confidence: 'medium',
  },
  // Low confidence: Item Name $Price (simple end-of-line)
  {
    name: 'item_price_simple',
    regex: /^([A-Za-z][A-Za-z0-9\s&'-]{2,40}?)\s+\$?\s*(\d{1,6}[.,]\d{2})\s*$/,
    extractors: { name: 1, price: 2 },
    confidence: 'low',
  },
]

// Keywords to exclude (not actual items)
const EXCLUDE_KEYWORDS =
  /TOTAL|SUBTOTAL|TAX|TIP|GRATUITY|SERVICE|DISCOUNT|CHANGE|CASH|CARD|PAYMENT|VISA|MASTERCARD|AMEX|DEBIT|CREDIT|BALANCE|DUE|THANK\s*YOU|RECEIPT/i

// Merchant name patterns
const MERCHANT_PATTERNS = [
  /^([A-Z][A-Za-z\s&'-]{3,30})\s*(?:RESTAURANT|CAFE|BAR|GRILL|BISTRO|DINER|KITCHEN)/i,
  /^([A-Z][A-Za-z\s&'-]{3,30})\s*$/i, // First capitalized line
]

// Date patterns
const DATE_PATTERNS = [
  /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/,
  /(\d{4}[/-]\d{1,2}[/-]\d{1,2})/,
  /([A-Z][a-z]{2,8}\s+\d{1,2},?\s+\d{4})/i,
]

/**
 * Calculate confidence score for an extracted item
 */
function calculateItemConfidence(
  item: Omit<ParsedLineItem, 'confidence'>
): 'high' | 'medium' | 'low' {
  let score = 0

  // Name quality checks
  if (item.name.length >= 3 && item.name.length <= 50) score += 2
  if (/^[A-Z]/.test(item.name)) score += 1 // Capitalized
  if (!/\d{3,}/.test(item.name)) score += 1 // No long numbers
  if (item.name.split(' ').length >= 2) score += 1 // Multiple words

  // Price validity checks
  if (item.price >= 0.5 && item.price <= 999) score += 2
  if (item.price % 1 !== 0) score += 1 // Has cents

  // Quantity checks
  if (item.quantity >= 1 && item.quantity <= 10) score += 1
  if (item.quantity === 1) score += 1 // Single items more common

  // Pattern confidence boost
  const patternScore = { high: 3, medium: 1, low: 0 }
  const pattern = ITEM_PATTERNS.find((p) => p.name === item.matchedPattern)
  if (pattern) score += patternScore[pattern.confidence]

  // Convert score to confidence level
  if (score >= 9) return 'high'
  if (score >= 6) return 'medium'
  return 'low'
}

/**
 * Extract line items from OCR text lines
 */
export function extractLineItems(lines: string[]): ParsedLineItem[] {
  const items: ParsedLineItem[] = []

  for (const rawLine of lines) {
    const line = rawLine.trim()

    // Skip empty lines and excluded keywords
    if (!line || EXCLUDE_KEYWORDS.test(line)) continue

    // Skip lines that are too short or too long
    if (line.length < 4 || line.length > 100) continue

    // Try each pattern in order
    for (const pattern of ITEM_PATTERNS) {
      const match = pattern.regex.exec(line)
      if (!match) continue

      const name = match[pattern.extractors.name]?.trim()
      const priceStr = match[pattern.extractors.price]
      const quantityStr = pattern.extractors.quantity ? match[pattern.extractors.quantity] : '1'

      if (!name || !priceStr) continue

      const price = parseFloat(priceStr.replace(',', '.'))
      const quantity = parseInt(quantityStr, 10)

      // Validate extracted values
      if (
        name.length < 2 ||
        name.length > 60 ||
        Number.isNaN(price) ||
        price <= 0 ||
        price > 999999 ||
        Number.isNaN(quantity) ||
        quantity < 1 ||
        quantity > 99
      ) {
        continue
      }

      // Additional name validation
      if (/^\d+$/.test(name)) continue // Only numbers
      if (!/[A-Za-z]{2,}/.test(name)) continue // Must have at least 2 letters

      const item: Omit<ParsedLineItem, 'confidence'> = {
        name,
        price,
        quantity,
        rawText: line,
        matchedPattern: pattern.name,
      }

      const confidence = calculateItemConfidence(item)

      items.push({ ...item, confidence })
      break // Found a match, move to next line
    }
  }

  return items
}

/**
 * Extract merchant name from receipt text
 */
export function extractMerchantName(lines: string[]): string | undefined {
  // Check first 5 lines for merchant name
  const topLines = lines.slice(0, 5)

  for (const line of topLines) {
    for (const pattern of MERCHANT_PATTERNS) {
      const match = pattern.exec(line)
      if (match?.[1]) {
        const merchant = match[1].trim()
        // Validate merchant name
        if (merchant.length >= 3 && merchant.length <= 40 && /[A-Z]/.test(merchant)) {
          return merchant
        }
      }
    }
  }

  return undefined
}

/**
 * Extract date from receipt text
 */
export function extractDate(lines: string[]): string | undefined {
  // Check first 10 lines for date
  const topLines = lines.slice(0, 10)

  for (const line of topLines) {
    for (const pattern of DATE_PATTERNS) {
      const match = pattern.exec(line)
      if (match?.[1]) {
        return match[1].trim()
      }
    }
  }

  return undefined
}

/**
 * Extract amounts (subtotal, tax, tip, total) from receipt text
 */
export function extractAmounts(text: string): {
  subtotal?: number
  tax?: number
  tip?: number
  total?: number
  confidence: 'high' | 'medium' | 'low'
} {
  const cleanText = text
    .replace(/\s+/g, ' ')
    .replace(/[\r\n]+/g, '\n')
    .toUpperCase()

  const amounts: {
    subtotal?: number
    tax?: number
    tip?: number
    total?: number
  } = {}
  let foundFields = 0

  // Amount patterns with specificity ordering
  const patterns = {
    total: [
      /(?:^|\n)(?:TOTAL|GRAND\s*TOTAL|AMOUNT\s*DUE|BALANCE\s*DUE)[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
      /\bTOTAL[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
    ],
    subtotal: [
      /(?:^|\n)(?:SUB\s*TOTAL|SUBTOTAL|SUB-TOTAL)[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
      /\bSUBTOTAL[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
    ],
    tax: [
      /(?:^|\n)(?:TAX|GST|VAT|HST|SALES\s*TAX)[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
      /\bTAX[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
    ],
    tip: [
      /(?:^|\n)(?:TIP|GRATUITY|SERVICE\s*CHARGE)[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
      /\bTIP[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
    ],
  }

  // Extract each field
  for (const [key, patternList] of Object.entries(patterns)) {
    for (const pattern of patternList) {
      const match = cleanText.match(pattern)
      if (match?.[1]) {
        const amount = parseFloat(match[1].replace(',', '.'))
        if (!Number.isNaN(amount) && amount > 0 && amount < 999999) {
          amounts[key as keyof typeof amounts] = amount
          foundFields++
          break
        }
      }
    }
  }

  // Validate relationships
  if (amounts.total && amounts.subtotal && amounts.tax) {
    const calculated = amounts.subtotal + amounts.tax + (amounts.tip || 0)
    const diff = Math.abs(calculated - amounts.total)

    // If amounts don't balance, reduce confidence
    if (diff > 0.5) {
      // Try to fix by removing tip if it exists
      if (amounts.tip) {
        const calculatedWithoutTip = amounts.subtotal + amounts.tax
        if (Math.abs(calculatedWithoutTip - amounts.total) < 0.5) {
          delete amounts.tip
          foundFields--
        }
      }
    }
  }

  // Calculate confidence based on found fields and validation
  let confidence: 'high' | 'medium' | 'low' = 'low'
  if (foundFields >= 3 && amounts.total && amounts.subtotal) confidence = 'high'
  else if (foundFields >= 2 && amounts.total) confidence = 'medium'

  return { ...amounts, confidence }
}

/**
 * Calculate overall confidence for parsed receipt
 */
function calculateOverallConfidence(receipt: Omit<ParsedReceipt, 'confidence'>): {
  items: 'high' | 'medium' | 'low'
  amounts: 'high' | 'medium' | 'low'
  overall: 'high' | 'medium' | 'low'
} {
  // Items confidence
  const highConfidenceItems = receipt.items.filter((item) => item.confidence === 'high').length
  const mediumConfidenceItems = receipt.items.filter((item) => item.confidence === 'medium').length
  const totalItems = receipt.items.length

  let itemsConfidence: 'high' | 'medium' | 'low' = 'low'
  if (totalItems > 0) {
    const highRatio = highConfidenceItems / totalItems
    const mediumRatio = (highConfidenceItems + mediumConfidenceItems) / totalItems
    if (highRatio >= 0.7) itemsConfidence = 'high'
    else if (mediumRatio >= 0.6) itemsConfidence = 'medium'
  }

  // Amounts confidence
  let amountsConfidence: 'high' | 'medium' | 'low' = 'low'
  const amountFields = [receipt.subtotal, receipt.tax, receipt.tip, receipt.total].filter(
    (v) => v !== undefined
  ).length
  if (amountFields >= 3 && receipt.total && receipt.subtotal) amountsConfidence = 'high'
  else if (amountFields >= 2 && receipt.total) amountsConfidence = 'medium'

  // Overall confidence
  const confidenceScores = { high: 3, medium: 2, low: 1 }
  const avgScore = (confidenceScores[itemsConfidence] + confidenceScores[amountsConfidence]) / 2

  let overall: 'high' | 'medium' | 'low' = 'low'
  if (avgScore >= 2.5) overall = 'high'
  else if (avgScore >= 1.5) overall = 'medium'

  return { items: itemsConfidence, amounts: amountsConfidence, overall }
}

/**
 * Main parser function: Extract all data from OCR text
 */
export function parseReceiptText(text: string): ParsedReceipt {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  // Extract all components
  const items = extractLineItems(lines)
  const amounts = extractAmounts(text)
  const merchant = extractMerchantName(lines)
  const date = extractDate(lines)

  // Remove amount confidence from amounts object
  const { confidence: _amountConfidence, ...amountsWithoutConfidence } = amounts

  // Build receipt object
  const receipt: Omit<ParsedReceipt, 'confidence'> = {
    items,
    ...amountsWithoutConfidence,
    merchant,
    date,
  }

  // Calculate confidence
  const confidence = calculateOverallConfidence(receipt)

  return { ...receipt, confidence }
}
