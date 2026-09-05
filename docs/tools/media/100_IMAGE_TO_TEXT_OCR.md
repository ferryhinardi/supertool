# Image to Text (OCR) Converter

**Created**: January 6, 2026
**Last Updated**: January 6, 2026
**Tool Path**: `/tools/media/image-to-text`
**Category**: Media Tools
**Complexity**: Moderate (876 lines)

## Overview

The Image to Text Converter is a powerful OCR (Optical Character Recognition) tool that extracts text from images. Powered by Tesseract.js, it supports multiple languages and image formats, processing everything locally in your browser for maximum privacy.

## Key Features

### 1. Multi-Language Support (12+ Languages)

| Language | Code | Region |
|----------|------|--------|
| English | eng | Global |
| Spanish | spa | Spain/Latin America |
| French | fra | France |
| German | deu | Germany |
| Chinese (Simplified) | chi_sim | China |
| Chinese (Traditional) | chi_tra | Taiwan/Hong Kong |
| Japanese | jpn | Japan |
| Korean | kor | Korea |
| Russian | rus | Russia |
| Arabic | ara | Middle East |
| Portuguese | por | Portugal/Brazil |
| Italian | ita | Italy |

### 2. Supported Image Formats

- **PNG** - Lossless images
- **JPEG/JPG** - Compressed photos
- **WEBP** - Modern web format

### 3. Real-Time Progress Tracking

- Visual progress bar during processing
- Percentage display of OCR completion
- Status updates throughout extraction

### 4. Output Options

- **Copy to Clipboard**: One-click copy
- **Download as TXT**: Save extracted text as file
- **Character/Word Count**: Statistics displayed

### 5. Privacy-First Processing

- All processing happens locally in browser
- Uses Tesseract.js (WebAssembly)
- No data sent to external servers

## How to Use

### Basic Workflow

1. **Select Language**: Choose the language of text in your image
2. **Upload Image**: Click "Upload Image" button
3. **Wait for Processing**: Watch progress bar fill
4. **Review Results**: View extracted text on the right
5. **Export**: Copy or download the text

### Supported Scenarios

- Scanned documents
- Screenshots with text
- Photos of printed text
- Whiteboard/blackboard photos
- Receipts and invoices
- Business cards
- Handwritten notes (limited accuracy)

## Use Cases

### Document Digitization

- Convert paper documents to digital text
- Archive old printed materials
- Make scanned PDFs searchable

### Data Entry Automation

- Extract data from receipts
- Copy text from screenshots
- Digitize printed forms

### Research & Learning

- Extract quotes from book photos
- Capture text from presentations
- Digitize handwritten notes

### Business Applications

- Extract contact info from business cards
- Copy product information from labels
- Digitize paper contracts

### Accessibility

- Convert image text to readable format
- Enable text-to-speech on images
- Create accessible document versions

## Tips & Tricks

1. **Image Quality Matters**: Higher resolution images yield better results
2. **Good Lighting**: Ensure even lighting without shadows
3. **Straight Alignment**: Aligned text extracts more accurately
4. **Contrast**: High contrast between text and background helps
5. **Single Language**: Match the language setting to your image
6. **Clean Images**: Remove noise and distortion when possible

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Invalid image file" | Wrong file type | Use PNG, JPEG, or WEBP |
| "File size > 10MB" | Image too large | Compress or resize image |
| Poor accuracy | Low quality image | Use higher resolution image |
| Wrong characters | Wrong language selected | Select correct language |
| Missing text | Text too small/blurry | Enlarge or enhance image |
| Slow processing | Large/complex image | Wait for completion; use smaller image |

### Improving OCR Accuracy

1. **Pre-process images**: Increase contrast, sharpen text
2. **Crop to text area**: Remove unnecessary background
3. **Straighten images**: Use image editor to align text
4. **Use proper lighting**: Avoid glare and shadows
5. **Select correct language**: Match image text language

## Technical Details

### Architecture

- **Frontend**: React 19 with Panda CSS
- **OCR Engine**: Tesseract.js (WebAssembly)
- **Processing**: Client-side only
- **Language Models**: Downloaded on-demand

### How Tesseract.js Works

1. **Worker Creation**: Creates WebAssembly worker for selected language
2. **Image Loading**: Converts uploaded image to processable format
3. **Recognition**: Runs OCR algorithms on image data
4. **Progress Events**: Emits progress updates during processing
5. **Result Extraction**: Returns recognized text with confidence scores

### Input Constraints

```typescript
// File validation
const maxFileSize = 10 * 1024 * 1024  // 10MB
const validTypes = ['image/png', 'image/jpeg', 'image/webp']
```

### State Management

```typescript
// Core state
extractedText: string        // Recognized text
isProcessing: boolean        // Processing status
progress: number             // 0-100 completion
selectedLanguage: string     // Language code (e.g., 'eng')
uploadedImage: string        // Image preview URL
error: string                // Error message
```

### Progress Tracking

```typescript
// Tesseract.js logger callback
logger: (m) => {
  if (m.status === 'recognizing text') {
    setProgress(Math.round(m.progress * 100))
  }
}
```

## Analytics Events

| Event | Description | Properties |
|-------|-------------|------------|
| `image_to_text_upload` | Image uploaded | `fileType`, `fileSize`, `language` |
| `image_to_text_success` | OCR completed | `textLength`, `language` |
| `image_to_text_copy` | Text copied | None |
| `image_to_text_download` | Text downloaded | None |
| `image_to_text_clear` | Session cleared | None |
| `image_to_text_error` | OCR failed | `language` |

## Related Tools

- [Image Optimizer](/tools/media/image-optimizer) - Compress images before OCR
- [PDF Tools](/tools/productivity/pdf-tools) - Extract text from PDFs
- [Text Transformer](/tools/productivity/text-transformer) - Format extracted text
- [Grammar Checker](/tools/productivity/grammar-checker) - Polish extracted text

## FAQ

### Q: Is my image data stored?

A: No, all processing happens locally in your browser using Tesseract.js. Images are not uploaded to any server.

### Q: Why is the first extraction slow?

A: The first OCR operation downloads the language model (Tesseract trained data). Subsequent operations are faster.

### Q: Can I extract text from PDFs?

A: This tool is for images only. Use the PDF Tools for PDF text extraction.

### Q: Does it work with handwritten text?

A: OCR accuracy varies significantly for handwritten text. Best results are with clean, printed text.

### Q: What about multi-language images?

A: Select the primary language for best results. Multi-language images may require multiple passes.

### Q: Why are some characters wrong?

A: OCR accuracy depends on image quality, font type, and language model. Verify and correct extracted text manually.

### Q: Can I process multiple images at once?

A: Currently one image at a time. Process images sequentially for batch needs.

## Best Practices

1. **Optimize Images First**: Use Image Optimizer to enhance quality
2. **Match Language Setting**: Always select the correct language
3. **Review Output**: OCR isn't perfect - verify important text
4. **Keep Original Files**: Don't discard originals after extraction
5. **Clean Up Results**: Use Text Transformer or manual editing

## Performance Considerations

- **First Load**: ~2-5 seconds to load language model
- **Processing Time**: Varies with image size/complexity
- **Memory Usage**: Large images may use significant RAM
- **Browser Support**: Modern browsers with WebAssembly support

## Changelog

- **January 2026**: Initial release with 12 language support, Tesseract.js integration
