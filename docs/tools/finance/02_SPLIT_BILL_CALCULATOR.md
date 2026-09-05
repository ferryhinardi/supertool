# 02 - Split Bill Calculator

**Created:** October 2024  
**Last Updated:** October 2024  
**Category:** Finance Tools  
**Status:** ✅ Active · 🌟 Popular

## Overview

The Split Bill Calculator is an intelligent expense-sharing tool that simplifies the process of dividing bills among groups. With built-in tip calculation, tax handling, multi-currency support, and AI-powered receipt scanning, it's the perfect companion for dining out, group trips, or shared expenses.

## Purpose

Splitting bills fairly can be mathematically challenging, especially when adding tips, taxes, and tracking who has paid. This tool eliminates confusion and ensures everyone pays their fair share, making group outings stress-free.

## Key Features

### 1. **Smart Bill Splitting**

- Divide any amount among unlimited participants
- Automatic per-person calculation
- Real-time updates as you modify values

### 2. **Tip & Tax Calculation**

- Preset tip percentages (10%, 15%, 18%, 20%)
- Custom tip percentage input
- Separate tax percentage field
- Shows subtotal, tip, tax, and grand total breakdown

### 3. **Multi-Currency Support**

- 150+ world currencies
- Currency-specific formatting
- Automatic locale detection
- Icons for major currencies (USD, EUR, GBP, JPY, etc.)

### 4. **Payment Tracking**

- Mark individuals as "paid" with checkmark
- Visual indicators (green for paid, gray for unpaid)
- Track outstanding balances in real-time

### 5. **AI Receipt Scanner** 🤖

- Upload receipt images
- OCR extraction of bill amount
- Automatic form population
- Supports JPG, PNG, HEIC formats

### 6. **Share & Export**

- Generate shareable summary
- Copy breakdown to clipboard
- Includes all calculations and per-person amount
- Formatted for easy sharing in messages

## How It Works

### Technical Architecture

#### State Management

```typescript
interface Person {
  id: string
  name: string
  hasPaid: boolean
}

const [billAmount, setBillAmount] = useState('100000')
const [tipPercent, setTipPercent] = useState('15')
const [taxPercent, setTaxPercent] = useState('10')
const [currency, setCurrency] = useState<Currency>('USD')
const [people, setPeople] = useState<Person[]>([...])
```

#### Calculation Logic

```typescript
const calculations = useMemo(() => {
  const bill = parseFloat(billAmount) || 0
  const tip = bill * (parseFloat(tipPercent) / 100)
  const tax = bill * (parseFloat(taxPercent) / 100)
  const total = bill + tip + tax
  const perPerson = total / people.length
  const unpaidCount = people.filter((p) => !p.hasPaid).length
  const stillOwed = perPerson * unpaidCount

  return { bill, tip, tax, total, perPerson, unpaidCount, stillOwed }
}, [billAmount, tipPercent, taxPercent, people])
```

#### Currency Formatting

Uses the `lib/currency.ts` utility:

```typescript
formatCurrency(amount, currency) // Returns "Rp 100.000" for IDR
```

### Receipt Scanner Integration

The tool integrates with the `ReceiptScanner` feature component:

1. User uploads receipt image
2. Image sent to OCR service (Vision API)
3. Amount extracted from text
4. Bill amount automatically populated
5. Analytics event tracked

```typescript
const handleReceiptScan = (amount: string) => {
  setBillAmount(amount)
  trackToolEvent('split_bill_upload_receipt', { success: true })
}
```

## Usage Instructions

### Basic Bill Split

1. **Enter bill amount** (e.g., 100000)
2. **Add people** using the "+" button
3. **Name each person** (click to edit)
4. **Set tip percentage** (or use presets)
5. **Add tax if applicable**
6. **View per-person amount** in the summary card

### With Receipt Scanning

1. Click **"Scan Receipt"** button
2. Upload receipt photo
3. Wait for OCR processing
4. Bill amount auto-fills
5. Adjust tip/tax as needed
6. Continue with normal flow

### Payment Tracking

1. Click checkmark icon next to person's name when they pay
2. Person turns green to indicate paid status
3. "Still Owed" amount updates automatically
4. Track progress at a glance

### Sharing Results

1. Click **"Share Summary"** button
2. Formatted text copied to clipboard
3. Paste in WhatsApp, Telegram, email, etc.

Example output:

```
💰 Bill Split Summary

Bill Amount: Rp 100.000
Tip (15%): Rp 15.000
Tax (10%): Rp 10.000
Total: Rp 125.000

👥 Split between 4 people:
Each person pays: Rp 31.250

✅ Paid: John, Mary
⏳ Unpaid: Mike, Sarah
Still owed: Rp 62.500
```

## Analytics Events

Comprehensive tracking of user actions:

- `split_bill_add_person` - New person added
- `split_bill_remove_person` - Person removed
- `split_bill_share` - Summary shared
- `split_bill_copy` - Amount copied
- `split_bill_reset` - Calculator reset
- `split_bill_currency_change` - Currency changed
- `split_bill_scan_receipt` - Receipt scan initiated
- `split_bill_upload_receipt` - Receipt uploaded
- `split_bill_ocr_success` - OCR extraction successful
- `split_bill_ocr_error` - OCR failed

## UI/UX Design

### Layout Structure

1. **Header Section**
   - Tool title with Users icon
   - Description and currency selector

2. **Input Card**
   - Bill amount (large input)
   - Tip percentage (quick presets + custom)
   - Tax percentage
   - Receipt scanner button

3. **People Manager**
   - List of participants
   - Editable names
   - Payment status checkboxes
   - Add/remove buttons

4. **Summary Card**
   - Breakdown visualization
   - Per-person amount (highlighted)
   - Payment tracking
   - Action buttons (Share, Reset)

### Visual Design

- **Gradient**: Green to emerald (finance theme)
- **Glassmorphism**: Backdrop-blur cards
- **Icons**: Lucide icons for all actions
- **Responsive**: Mobile-optimized grid layout
- **Badges**: "NEW" and "Popular" indicators

### Accessibility

- Large, tappable buttons for mobile
- Clear visual feedback for interactions
- High contrast for amount displays
- Keyboard navigation support
- Screen reader compatible

## Currency System

Supports 150+ currencies via `lib/currency.ts`:

```typescript
export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  USD: { symbol: '$', name: 'US Dollar', format: 'en-US' },
  EUR: { symbol: '€', name: 'Euro', format: 'de-DE' },
  IDR: { symbol: 'Rp', name: 'Indonesian Rupiah', format: 'id-ID' },
  // ... 147 more currencies
}
```

Auto-detects user's locale to set default currency.

## Performance Considerations

1. **Memoized Calculations**: `useMemo` prevents unnecessary recalculations
2. **Debounced Inputs**: Input changes batched for performance
3. **Optimized Re-renders**: React Compiler handles optimization
4. **Lazy Loading**: Receipt scanner loaded only when needed

## Error Handling

- Invalid numbers default to 0
- Negative amounts prevented
- Division by zero handled (when no people)
- Receipt scan errors show toast notification
- Graceful OCR failure fallback

## Security & Privacy

- All calculations done client-side
- Receipt images processed via secure API
- No financial data stored or transmitted
- Images deleted after processing
- No tracking of actual amounts (only anonymized metrics)

## Dependencies

- `sonner` - Toast notifications
- `lucide-react` - Icon components
- `@/lib/currency` - Currency formatting utilities
- `@/components/features/ReceiptScanner` - OCR functionality

## File Structure

```
app/tools/split-bill/
├── page.tsx                         # Main component (847 lines)
└── __tests__/
    ├── logic.test.ts                # Calculation tests
    └── receipt-scanner.test.ts      # OCR tests
```

## Future Enhancements

- [ ] Unequal split (some pay more/less)
- [ ] Item-level splitting (line items)
- [ ] Save split history
- [ ] Export to PDF/image
- [ ] Venmo/PayPal integration
- [ ] QR code for payment requests
- [ ] Multi-currency support in single bill
- [ ] Recurring split templates

## Real-World Use Cases

1. **Restaurant Outings**: Split dinner bills with tip
2. **Group Trips**: Divide accommodation/transport costs
3. **Office Lunches**: Quick team meal calculations
4. **Roommate Expenses**: Monthly utility splits
5. **Event Planning**: Shared party expenses

## Tips for Users

💡 **Quick Tip Setting**: Use preset buttons (10%, 15%, 18%, 20%) for instant calculations

💡 **Receipt Scanning**: Works best with clear, well-lit photos in portrait orientation

💡 **Currency Selection**: Tool remembers your last-used currency

💡 **Payment Tracking**: Mark people as paid immediately to avoid confusion later

💡 **Sharing**: Use "Share Summary" to send breakdown to group chat instantly

## Related Tools

- **Tip Calculator** _(Coming Soon)_ - Focused tip calculations
- **Currency Converter** _(Coming Soon)_ - Real-time exchange rates
- **Percentage Calculator** _(Coming Soon)_ - General percentage math

---

**Route:** `/tools/split-bill`  
**Component:** `app/tools/split-bill/page.tsx`  
**Tests:** `app/tools/split-bill/__tests__/logic.test.ts`, `receipt-scanner.test.ts`  
**Feature:** `components/features/ReceiptScanner.tsx`
