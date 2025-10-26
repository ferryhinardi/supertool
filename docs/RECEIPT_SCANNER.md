# Receipt Scanner Feature - Split Bill Tool

## Overview

The Split Bill tool now includes AI-powered receipt scanning using **Tesseract.js** OCR (Optical Character Recognition). This feature allows users to:

- 📸 **Take photos** of receipts using their mobile camera
- 📤 **Upload receipt images** from their device
- 🔍 **Automatically extract** bill amounts (subtotal, tax, tip, total)
- ✨ **Works completely offline** - all processing happens in the browser

## Implementation Details

### Technology Stack

- **Tesseract.js v6.0.1** - Browser-based OCR engine
- **React 19** - Component architecture
- **Panda CSS** - Glassmorphic styling
- **Next.js Image Optimization** (disabled for preview to use blob URLs)

### Component Architecture

**`ReceiptScanner.tsx`** (`components/features/ReceiptScanner.tsx`)

- Handles camera capture and file upload
- Processes images with Tesseract.js OCR
- Extracts amounts using regex patterns
- Provides progress feedback during processing
- Emits extracted data via `onDataExtracted` callback

### How It Works

1. **Image Capture/Upload**
   - Mobile: Uses `<input capture="environment">` to access camera
   - Desktop: Standard file upload dialog
   - Accepts all image formats (jpg, png, webp, etc.)

2. **OCR Processing**
   - Initializes Tesseract worker with English language
   - Configures for dense text recognition (receipts)
   - Whitelists: numbers, dollar signs, letters, colons, spaces
   - Reports progress percentage during recognition

3. **Data Extraction**
   - Uses regex patterns to identify:
     - **Subtotal**: `SUB TOTAL`, `SUBTOTAL`, `AMOUNT`
     - **Tax**: `TAX`, `GST`, `VAT`, `SALES TAX`
     - **Tip**: `TIP`, `GRATUITY`, `SERVICE CHARGE`
     - **Total**: `TOTAL`, `AMOUNT DUE`, `BALANCE DUE`
   - Handles various formats: `$12.34`, `12.34`, `12,34`
   - Fallback: Uses largest amount as total if not explicitly found

4. **Data Application**
   - Populates bill amount field with subtotal
   - Calculates tax percentage from extracted tax amount
   - Calculates tip percentage from extracted tip amount
   - Shows success toast with 4-second duration

## Usage

### For Users

1. Navigate to `/tools/split-bill`
2. Look for the **"Scan Receipt"** section (purple gradient card)
3. Choose an option:
   - **Take Photo** (mobile) - Opens camera to capture receipt
   - **Upload Image** - Select receipt image from device
4. Wait for OCR processing (progress bar shows status)
5. Review extracted data and adjust if needed
6. Continue with split calculation as normal

### For Developers

#### Integrating the ReceiptScanner

```tsx
import { ReceiptScanner } from '@/components/features/ReceiptScanner'

// In your component
const handleReceiptData = (data: {
  subtotal?: number
  tax?: number
  tip?: number
  total?: number
}) => {
  // Apply extracted data to your form fields
  if (data.subtotal) setBillAmount(String(data.subtotal))
  if (data.tax) {
    const taxPercent = (data.tax / data.subtotal!) * 100
    setTaxPercent(String(taxPercent.toFixed(1)))
  }
}

return <ReceiptScanner onDataExtracted={handleReceiptData} />
```

#### Customizing Extraction Patterns

Edit `extractAmountsFromText()` in `ReceiptScanner.tsx`:

```tsx
const patterns = {
  subtotal: /(?:YOUR_PATTERN)[:\s]*\$?\s*(\d{1,6}(?:[.,]\d{2}))/i,
  // Add more patterns as needed
}
```

## Analytics Tracking

All user interactions are tracked with GA4:

- `split_bill_scan_receipt` - Camera capture initiated
- `split_bill_upload_receipt` - File upload initiated
- `split_bill_ocr_success` - OCR completed successfully (includes `fields_extracted` count)
- `split_bill_ocr_error` - OCR failed (includes `reason`)

## Performance Considerations

### Initial Load

- Tesseract.js core (~11MB) downloads on first use
- Worker initialization takes 1-2 seconds
- Subsequent uses are faster (cached)

### Processing Time

- Typical receipt: 5-15 seconds
- Depends on image size and complexity
- Progress bar keeps user informed

### Optimization Tips

- Use clear, well-lit photos
- Avoid blurry or angled shots
- Crop to just the receipt area for faster processing
- Supported formats: JPG, PNG, WebP (all work equally well)

## Browser Compatibility

- ✅ **Chrome/Edge** (v90+) - Full support
- ✅ **Safari** (v14+) - Full support (iOS camera works)
- ✅ **Firefox** (v88+) - Full support
- ⚠️ **Older browsers** - May lack camera API support

## Testing Checklist

- [x] Camera capture on mobile (iOS/Android)
- [x] File upload on desktop
- [x] Progress bar shows during processing
- [x] Image preview displays correctly
- [x] Clear/remove image button works
- [x] Successful extraction shows toast
- [x] Failed extraction shows error toast
- [x] Extracted data populates form fields
- [x] Analytics events fire correctly

## Troubleshooting

### OCR Not Extracting Data

**Common Issues:**

- Receipt text is too small/blurry
- Non-English receipts (only English supported currently)
- Handwritten amounts (OCR works best with printed text)

**Solutions:**

- Take higher resolution photos
- Ensure good lighting
- Hold camera steady (avoid motion blur)
- Manually enter amounts if OCR fails

### Camera Not Working

**iOS Safari:**

- Ensure camera permissions are granted
- Use HTTPS (required for camera API)
- Check Settings > Safari > Camera

**Android Chrome:**

- Grant camera permissions when prompted
- Check site settings in browser menu

### Slow Processing

- Reduce image size before upload
- Close other browser tabs (frees memory)
- Use JPG instead of PNG (smaller file size)

## Future Enhancements

### Potential Improvements

- [ ] Multi-language support (Spanish, French, etc.)
- [ ] Item-level extraction (detect individual menu items)
- [ ] Multi-currency support (€, £, ¥)
- [ ] Image preprocessing (auto-rotate, enhance contrast)
- [ ] Support for PDF receipts
- [ ] Save/load previous receipts
- [ ] Integration with expense tracking apps

### ML Model Alternatives

- **TensorFlow.js** - Custom trained model for receipts
- **Google Vision API** - Cloud-based OCR (requires backend)
- **AWS Textract** - Advanced receipt parsing (requires backend)

## Resources

- [Tesseract.js Documentation](https://tesseract.projectnaptha.com/)
- [Web Camera API Guide](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [Receipt OCR Best Practices](https://github.com/tesseract-ocr/tesseract/wiki/ImproveQuality)

## Credits

- **OCR Engine**: Tesseract.js (open source)
- **Icon**: Lucide React (FileImage, Camera, Upload)
- **Design**: Panda CSS + Ark UI components

---

**Last Updated**: January 2025  
**Maintainer**: SuperTool Team
