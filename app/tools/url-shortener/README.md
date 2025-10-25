# URL Shortener & Analytics

A modern, feature-rich URL shortening tool with QR code generation and click analytics.

## 🚀 Quick Start

Visit `/tools/url-shortener` to start using the tool immediately!

## ✨ Features

### Core Features

- **URL Shortening**: Convert long URLs into short, shareable links
- **Custom Aliases**: Create memorable custom short links (e.g., `/s/my-link`)
- **QR Code Generation**: Automatic QR code creation for every shortened URL
- **QR Code Download**: Download QR codes as PNG images
- **Click Tracking**: Monitor how many times your links are clicked
- **URL Management**: View, manage, and delete your shortened URLs
- **Local Storage**: URLs persist in your browser (no account needed)

### Validation & Security

- ✅ URL format validation
- ✅ Protocol checking (HTTP/HTTPS only)
- ✅ Custom alias validation (lowercase, numbers, hyphens)
- ✅ Duplicate alias prevention
- ✅ Length restrictions (3-50 characters)

### Analytics Dashboard

- **Total URLs**: Track how many URLs you've shortened
- **Total Clicks**: See aggregate click counts
- **Average Clicks**: Monitor engagement metrics
- **Per-URL Statistics**: Individual click tracking for each link

## 📦 Libraries Used

- **qrcode.react** (v4.2.0): QR code generation
- **nanoid** (v5.1.6): Short code generation
- **lucide-react**: Beautiful icons
- **sonner**: Toast notifications
- **framer-motion**: Smooth animations

## 🎨 UI/UX Highlights

- **Gradient Design**: Beautiful cyan-to-blue gradient theme
- **Real-time Validation**: Instant feedback on URL validity
- **Responsive Layout**: Mobile-friendly design
- **Loading States**: Visual feedback during processing
- **Toast Notifications**: Success/error messages
- **Copy to Clipboard**: One-click copying
- **Interactive Cards**: Hover effects and animations

## 🔧 How to Use

### Basic Usage

1. **Enter URL**: Paste your long URL in the input field
2. **Optional Alias**: Add a custom alias or leave empty for auto-generation
3. **Click "Shorten URL"**: Generate your short link
4. **Copy & Share**: Click copy button or use the short URL directly

### Custom Aliases

Create memorable short links:

- ✅ `my-product-launch`
- ✅ `holiday-sale-2024`
- ✅ `newsletter-signup`
- ❌ `My_Product!` (use lowercase, numbers, hyphens only)

### QR Codes

1. Click the QR code icon on any shortened URL
2. View the QR code preview
3. Click "Download QR Code" to save as PNG
4. Use in print materials, presentations, or social media

### Managing URLs

- **View Details**: Click on any URL to see full details
- **Copy Link**: Use the copy button for quick sharing
- **Delete**: Remove URLs you no longer need
- **Track Clicks**: Monitor engagement for each link

## 🗄️ Storage Options

### Current: Local Storage (Demo Mode)

- URLs stored in browser
- No server required
- Session-based persistence
- Perfect for testing

### Production: Supabase Integration

See `docs/URL_SHORTENER_SETUP.md` for:

- Database schema
- API implementation
- Analytics tracking
- Geographic data
- Device information

## 🧪 Testing

Run tests:

```bash
pnpm test app/tools/url-shortener/__tests__/logic.test.ts
```

Test coverage:

- ✅ URL validation (4 tests)
- ✅ Custom alias validation (7 tests)
- ✅ Short code generation (2 tests)
- ✅ URL format (2 tests)
- ✅ Statistics calculation (4 tests)

**Total: 19 tests passing**

## 📊 Analytics Capabilities

### Current (Local)

- Click count per URL
- Creation date
- Total statistics

### With Supabase

- Geographic data (country, city, region)
- Device type (mobile, tablet, desktop)
- Browser information
- Operating system
- Referrer tracking
- Unique visitors
- Time-based analytics

## 🎯 Use Cases

- **Marketing Campaigns**: Track campaign performance
- **Social Media**: Share clean, professional links
- **Print Materials**: Generate QR codes for offline media
- **Email Marketing**: Shorten newsletter links
- **Event Management**: Create memorable event URLs
- **Product Launches**: Custom branded short links
- **Documentation**: Simplify long documentation URLs

## 🔒 Privacy & Security

- URLs stored locally by default
- No tracking without explicit setup
- HTTPS support
- URL validation
- Malicious URL detection (with Supabase)
- Rate limiting support (with API)

## 🚀 Performance

- Instant URL shortening
- Fast QR code generation
- Optimized for mobile
- Minimal bundle size
- Lazy loading for analytics

## 📱 Mobile Support

- Responsive design
- Touch-friendly buttons
- Mobile-optimized QR codes
- Copy-paste functionality
- Share API integration (future)

## 🔮 Future Enhancements

- [ ] Bulk URL shortening
- [ ] Password-protected links
- [ ] Expiration dates
- [ ] Custom domains
- [ ] Link-in-bio pages
- [ ] Advanced analytics dashboard
- [ ] API access
- [ ] Team collaboration
- [ ] A/B testing
- [ ] Webhook notifications

## 💡 Tips & Tricks

1. **Custom Aliases**: Use descriptive names for better recall
2. **QR Codes**: Set size to L for better scanning
3. **Analytics**: Check click patterns to optimize timing
4. **Organization**: Use consistent naming conventions
5. **Testing**: Always test short URLs before sharing

## 🛠️ Development

### File Structure

```
app/tools/url-shortener/
├── page.tsx                 # Main component
├── __tests__/
│   └── logic.test.ts       # Test suite
app/api/shorten/
└── route.ts                 # API endpoint
app/s/[code]/
└── route.ts                 # Redirect handler
```

### API Endpoints

**POST /api/shorten**

- Creates shortened URL
- Validates input
- Returns short URL and QR code data

**GET /s/[code]**

- Redirects to original URL
- Tracks analytics
- Handles 404 errors

## 📚 Documentation

- **Setup Guide**: `docs/URL_SHORTENER_SETUP.md`
- **Database Schema**: See setup guide
- **API Documentation**: See setup guide
- **Testing Guide**: `__tests__/logic.test.ts`

## 🤝 Contributing

To enhance the URL shortener:

1. Add new features to `page.tsx`
2. Update API routes for backend changes
3. Add tests to `logic.test.ts`
4. Update documentation

## 📝 License

Part of SuperTool collection

---

**Need help?** Check the setup documentation or create an issue!
