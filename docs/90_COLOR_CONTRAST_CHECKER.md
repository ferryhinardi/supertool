# Color Contrast Checker

**Created**: January 6, 2026  
**Last Updated**: January 6, 2026  
**Tool Path**: `/tools/design/color-contrast`  
**Category**: Design Tools  
**Complexity**: Moderate

## Overview

The Color Contrast Checker is a comprehensive accessibility tool that calculates contrast ratios between foreground and background colors according to WCAG 2.1 guidelines. It provides instant compliance checking for AA and AAA levels, intelligent color suggestions, history tracking, favorites management, and export options. Essential for designers, developers, and accessibility specialists ensuring their designs are readable for everyone.

## Key Features

- **WCAG 2.1 Compliance**: Real-time contrast ratio calculation with AA/AAA level detection
- **Visual Color Pickers**: Intuitive color selection with hex input support
- **Smart Suggestions**: AI-powered accessible color recommendations based on your current selection
- **History Tracking**: Automatically saves last 20 color combinations with localStorage persistence
- **Favorites System**: Save and manage your preferred color pairs
- **Live Preview**: See colors in action with text and button previews
- **Quick Presets**: 8 common colors for rapid testing (White, Black, Gray, Blue, Red, Green, Yellow, Purple)
- **Export Options**: Download results as JSON or PNG for documentation
- **Color Swap**: One-click swap between foreground and background colors
- **Random Generation**: Generate random color pairs for exploration
- **Client-Side Processing**: All calculations happen locally - no data sent to servers

## How to Use

### Basic Contrast Check

1. Navigate to the Color Contrast Checker tool
2. Select a **foreground (text) color** using the color picker or enter a hex value
3. Select a **background color** using the color picker or enter a hex value
4. View the contrast ratio and WCAG compliance level instantly

### Using Color Presets

1. Click on any preset color square in the "Quick Presets" section
2. The selected color becomes your foreground color
3. Use the background picker to complete the combination

### Get Accessible Suggestions

1. Choose your foreground color
2. Click **Suggest Colors** button
3. View up to 5 accessible background colors that meet WCAG AA (4.5:1)
4. Click any suggestion to apply it as your background

### Manage History & Favorites

**History:**
1. Click **History** button to view recent color pairs
2. Click any history item to reload that combination
3. History persists across browser sessions (localStorage)

**Favorites:**
1. Click **Add to Favorites** to save current combination
2. Click **Favorites** to view saved pairs
3. Click **Remove** to delete from favorites

### Export Your Results

1. Click **Export JSON** to download structured data with ratio, compliance level, and colors
2. Click **Export PNG** to download a visual preview image with contrast information

## Use Cases

### 1. Web Design Accessibility Audits
Verify that website color schemes meet WCAG requirements before launch.

### 2. Brand Color Validation
Ensure brand colors can be used accessibly for text on various backgrounds.

### 3. UI Component Design
Test button colors, link colors, and other interactive elements for accessibility.

### 4. Document Preparation
Validate colors for PDFs, presentations, and print materials for readability.

### 5. Mobile App Development
Check color combinations for iOS and Android interfaces.

### 6. Email Template Design
Ensure email colors are accessible across different email clients.

## Tips & Tricks

### Understanding WCAG Levels
- **WCAG AA**: Minimum standard for most websites - required by many regulations
- **WCAG AAA**: Enhanced accessibility - recommended for maximum inclusivity
- Large text (18pt+) has lower contrast requirements than normal text

### Choosing Colors Effectively
- Start with your brand's primary color as foreground
- Use the suggestion feature to find compliant backgrounds
- White and black are safe fallbacks for most colors
- Test multiple text sizes in the live preview

### Working with History
- History automatically saves combinations after 1 second of inactivity
- Last 20 combinations are kept
- Use favorites for combinations you'll reuse frequently

### Pro Tips
- Use **Swap Colors** to quickly check reversed combinations
- Export PNG for client presentations or documentation
- The random generator is great for exploring unexpected combinations

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Open tool search |
| `Tab` | Navigate between inputs |
| `Enter` | Apply hex value |

## Troubleshooting

### Color Picker Not Responding
**Cause**: Browser may not support native color picker  
**Solution**: Enter hex value manually in the text input

### History Not Saving
**Cause**: localStorage may be disabled or full  
**Solution**: Check browser privacy settings, clear storage if needed

### Suggestions Not Appearing
**Cause**: Current foreground color may already be highly contrasting  
**Solution**: Try a mid-tone color to see more varied suggestions

### Invalid Hex Format
**Cause**: Hex value must be 6 characters after #  
**Solution**: Use format `#RRGGBB` (e.g., `#FF5500`)

### Export Not Working
**Cause**: Browser popup blocker or download restrictions  
**Solution**: Allow downloads from the site in browser settings

## Technical Details

### Libraries Used
- **Framer Motion**: Smooth animations for UI elements
- **Sonner**: Toast notifications for user feedback
- **Lucide React**: Icon components

### WCAG Algorithm
- Uses relative luminance calculation per WCAG 2.1 specification
- Formula: `L = 0.2126 * R + 0.7152 * G + 0.0722 * B`
- Contrast ratio: `(L1 + 0.05) / (L2 + 0.05)` where L1 > L2

### Contrast Requirements
| Level | Normal Text | Large Text |
|-------|-------------|------------|
| AA | 4.5:1 | 3:1 |
| AAA | 7:1 | 4.5:1 |

### Large Text Definition
- 18pt (24px) regular weight or larger
- 14pt (18.5px) bold weight or larger

### Browser Compatibility
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- All modern browsers with ES2020 support

### Privacy & Security
- All calculations performed client-side
- Color history stored in localStorage only
- No data transmitted to external servers
- Safe for proprietary design work

## Analytics Events

| Event | Description | Parameters |
|-------|-------------|------------|
| `color_contrast_open` | Tool page opened | - |
| `color_contrast_swap` | Colors swapped | - |
| `color_contrast_copy` | Color copied to clipboard | `type` (foreground/background) |
| `color_contrast_random` | Random colors generated | - |
| `color_contrast_change_foreground` | Foreground color changed | - |
| `color_contrast_change_background` | Background color changed | - |

## Related Tools

- **[Color Palette Generator](/tools/design/color-palette)** - Generate harmonious color palettes
- **[Gradient Generator](/tools/design/gradient-generator)** - Create CSS gradients
- **[Tailwind Color Finder](/tools/design/tailwind-colors)** - Find Tailwind CSS color matches
- **[CSS Box Shadow](/tools/design/box-shadow)** - Design box shadows with accessibility in mind

## FAQ

**Q: What's the minimum contrast ratio for body text?**  
A: WCAG AA requires 4.5:1 for normal text (under 18pt). For large text (18pt+ or 14pt bold), it's 3:1.

**Q: Does this tool support RGB or HSL input?**  
A: Currently only hex values are supported. Convert your RGB/HSL values to hex first.

**Q: Why does my color pair fail even though it looks readable to me?**  
A: WCAG standards account for users with various visual impairments, including color blindness and low vision. What appears readable to you may not be for others.

**Q: Can I check contrast for non-text elements?**  
A: WCAG 2.1 also requires 3:1 contrast for UI components and graphical objects. Use this tool's large text threshold (3:1) as a guide for these elements.

**Q: Is WCAG AA good enough?**  
A: WCAG AA is the legal minimum in many jurisdictions. AAA provides better accessibility but may limit your color choices. AA is generally acceptable for most websites.

**Q: How accurate is the contrast calculation?**  
A: The tool uses the exact WCAG 2.1 relative luminance formula, providing precise contrast ratios matching official W3C specifications.

## Best Practices

1. Always aim for WCAG AA compliance at minimum
2. Test both light and dark mode combinations
3. Check hover and focus states for interactive elements
4. Don't rely solely on color to convey information
5. Consider color blindness - test with various color vision types
6. Save your brand's accessible combinations as favorites
7. Document color accessibility in your design system
8. Re-test when updating brand colors

## Changelog

### v1.0.0 (January 2026)
- Initial release
- WCAG 2.1 contrast ratio calculation
- AA and AAA compliance detection
- Color picker with hex input
- History tracking (last 20 combinations)
- Favorites management
- Smart color suggestions
- Live text and button preview
- Export as JSON and PNG
- Color swap and random generation
- Quick preset colors
