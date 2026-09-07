# SVG to PNG Converter

> **Category**: Media  
> **Path**: `/tools/media/svg-to-png`  
> **Status**: Active  
> **Processing**: 100% Client-side

## Overview

The SVG to PNG Converter transforms SVG (Scalable Vector Graphics) files into high-quality PNG images with customizable dimensions, background colors, and quality settings. All conversion happens directly in your browser using HTML5 Canvas.

## Features

### Core Features

- **SVG to PNG Conversion**: Convert any SVG file to PNG format
- **Custom Dimensions**: Set exact width and height up to 4096px
- **Background Color Options**: Transparent, white, black, gray, or custom colors
- **Quality Control**: Adjust PNG quality from 10% to 100%

### Additional Features

- **Aspect Ratio Preservation**: Maintain or stretch original proportions
- **Live SVG Preview**: See your SVG before conversion
- **Instant Download**: Download converted PNG immediately
- **Copy to Clipboard**: Copy PNG image directly to clipboard
- **Auto-Dimension Detection**: Extracts dimensions from SVG viewBox or attributes

## How to Use

1. **Upload SVG File**: Click the upload area or drag-and-drop an SVG file (max 10MB)
2. **Preview**: The SVG will display in the preview panel
3. **Adjust Settings**:
   - Set **Width** and **Height** (1-4096 pixels)
   - Toggle **Maintain aspect ratio** on/off
   - Select **Background Color** (transparent, white, black, gray, or custom)
   - Adjust **Quality** slider (10-100%)
4. **Convert**: Click "Convert to PNG" button
5. **Export**: Download the PNG or copy it to clipboard

## Conversion Settings

### Dimensions

| Setting | Range | Default |
|---------|-------|---------|
| Width | 1 - 4096 px | Extracted from SVG |
| Height | 1 - 4096 px | Extracted from SVG |
| Maintain Aspect Ratio | On/Off | On |

### Background Colors

| Option | Value | Preview |
|--------|-------|---------|
| Transparent | `transparent` | Checkerboard pattern |
| White | `#FFFFFF` | Solid white |
| Black | `#000000` | Solid black |
| Light Gray | `#F3F4F6` | Solid gray |
| Custom | Color picker | User selected |

### Quality

| Level | Value | Use Case |
|-------|-------|----------|
| Low | 10-30% | Small file size, web thumbnails |
| Medium | 40-70% | Balanced quality and size |
| High | 80-100% | Maximum quality, print/display |

## Use Cases

- **Web Development**: Convert SVG icons to PNG for broader compatibility
- **Design Export**: Export vector designs as raster images
- **Social Media**: Create PNG versions of logos for platforms that don't support SVG
- **Documentation**: Include rasterized graphics in documents
- **App Development**: Generate PNG assets from SVG source files
- **Print Preparation**: Convert vectors to high-resolution PNGs

## Technical Details

### Processing

| Aspect | Details |
|--------|---------|
| Processing Location | 100% client-side (browser) |
| Conversion Method | HTML5 Canvas API |
| Max File Size | 10 MB |
| Output Format | PNG (image/png) |
| Privacy | No files uploaded to server |

### Supported SVG Features

- Viewbox dimensions
- Width/height attributes
- Embedded styles
- Inline styles
- Paths and shapes
- Text elements
- Gradients and patterns

### Dimension Extraction Logic

1. First checks for `viewBox` attribute (extracts width/height from viewBox)
2. Falls back to `width` and `height` attributes
3. Defaults to 800x600 if no dimensions found

## Browser Support

| Feature | Support |
|---------|---------|
| SVG Upload | All modern browsers |
| Canvas Conversion | Chrome, Firefox, Safari, Edge |
| Clipboard API | Chrome, Firefox, Safari (recent) |
| Download | All modern browsers |

## Limitations

- Maximum file size: 10 MB
- Maximum dimensions: 4096 x 4096 pixels
- Complex SVG filters may not render perfectly
- External resources (images, fonts) must be embedded

## Related Tools

- [Image Optimizer](/tools/media/image-optimizer) - Compress and optimize images
- [Image Format Converter](/tools/media/image-format-converter) - Convert between image formats
- [SVG Optimizer](/tools/design/svg-optimizer) - Optimize SVG files
- [Favicon Generator](/tools/design/favicon-generator) - Create favicons from images

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025 | Initial release with dimension control, background options, and quality settings |
