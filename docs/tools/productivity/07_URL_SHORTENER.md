# 07 - URL Shortener

**Created:** October 2024  
**Last Updated:** October 2024  
**Category:** Productivity Tools  
**Status:** ✅ Active · 🔥 Popular

## Overview

A modern URL shortener with custom aliases, QR code generation, analytics tracking, and localStorage persistence. Transform long URLs into short, shareable links with built-in click tracking and visual QR codes.

## Purpose

Long URLs are unwieldy in social media, presentations, and print materials. This tool creates short, memorable links while providing analytics on click-through rates and visitor patterns—all without requiring a backend database.

## Key Features

### 1. **Custom Short URLs**

- Auto-generated 6-character codes
- Custom alias support (e.g., `/s/promo2024`)
- Collision detection
- Base URL: `localhost:3000/s/` (configurable)

### 2. **QR Code Generation**

- Automatic QR code for each short URL
- High-quality SVG format
- Downloadable as PNG
- Perfect for print materials

### 3. **Analytics Dashboard**

- Total clicks per URL
- Unique visitors tracking
- Last clicked timestamp
- Historical link management

### 4. **LocalStorage Persistence**

- Client-side storage
- No database required
- Survives page refreshes
- Privacy-focused (no server tracking)

### 5. **Link Management**

- View all shortened URLs
- Delete unwanted links
- Copy short URLs with one click
- Open in new tab

### 6. **API-Driven Architecture**

- RESTful API endpoints
- `/api/shorten` - Create short URLs
- Dual-mode: In-memory Map + Supabase-ready
- Easy migration to production

## How It Works

### URL Shortening Process

```
User Input → Validation → API Call → Short Code → LocalStorage → Display
```

**Frontend:**

```typescript
const handleShorten = async () => {
  const response = await fetch('/api/shorten', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: longUrl,
      customAlias: alias || undefined,
    }),
  })

  const data = await response.json()

  // Store locally
  setShortenedUrls([...shortenedUrls, data])
  localStorage.setItem('shortenedUrls', JSON.stringify(urls))
}
```

**Backend API (`/api/shorten/route.ts`):**

```typescript
// In-memory storage for demo
const urlStore = new Map<string, UrlData>()

export async function POST(request: NextRequest) {
  const { url, customAlias } = await request.json()

  // Validate URL
  if (!isValidUrl(url)) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  // Generate or use custom code
  const shortCode = customAlias || generateShortCode()

  // Check collision
  if (urlStore.has(shortCode)) {
    return NextResponse.json(
      {
        error: 'Alias already taken',
      },
      { status: 409 }
    )
  }

  // Store
  urlStore.set(shortCode, {
    originalUrl: url,
    shortCode,
    createdAt: new Date().toISOString(),
    clicks: 0,
  })

  return NextResponse.json({
    shortUrl: `${baseUrl}/s/${shortCode}`,
    shortCode,
    originalUrl: url,
  })
}
```

### Short Code Generation

```typescript
function generateShortCode(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    code += chars[randomIndex]
  }

  return code
}
```

**Collision Handling:**

- Check if code exists in storage
- Retry with new code if collision
- Custom aliases checked immediately

### Redirection Flow

```typescript
// app/s/[code]/page.tsx
export default function RedirectPage({ params }: { params: { code: string } }) {
  useEffect(() => {
    const fetchUrl = async () => {
      const response = await fetch(`/api/shorten?code=${params.code}`)
      const data = await response.json()

      if (data.originalUrl) {
        // Track click
        await fetch(`/api/shorten/click`, {
          method: 'POST',
          body: JSON.stringify({ code: params.code }),
        })

        // Redirect
        window.location.href = data.originalUrl
      } else {
        // Show 404
        setError('Link not found')
      }
    }

    fetchUrl()
  }, [params.code])

  return <LoadingSpinner />
}
```

### Analytics Tracking

```typescript
interface UrlAnalytics {
  totalClicks: number
  uniqueVisitors: number // Based on localStorage tracking
  lastClicked: string
  clickHistory: Array<{
    timestamp: string
    referrer?: string
  }>
}
```

## Usage Instructions

### Creating Short URLs

1. **Enter Long URL**: Paste URL in input field
   - Must start with `http://` or `https://`
   - Example: `https://example.com/very/long/path?param=value`

2. **Optional: Custom Alias**: Enter memorable name
   - Only alphanumeric and hyphens
   - Example: `summer-sale` → `/s/summer-sale`

3. **Click "Shorten URL"**: Generate link
   - Wait for success toast
   - Short URL appears below

4. **Copy & Share**: Use the short link
   - Click copy icon
   - Share on social media, emails, etc.

### Using QR Codes

1. **Generate Short URL**: Follow steps above
2. **Click QR Code Icon**: View QR code modal
3. **Download**: Right-click and save as PNG
4. **Print**: Use in posters, flyers, business cards

### Managing Links

**View All Links:**

- Scroll through link history
- See creation dates
- Check click counts

**Delete Link:**

- Click trash icon
- Confirm deletion
- Removed from localStorage

**Track Performance:**

- View total clicks
- See last clicked time
- Monitor engagement

## UI Design

### Layout Structure

```
┌─────────────────────────────────────┐
│  Header (Link Icon + Title)        │
├─────────────────────────────────────┤
│  URL Input Field                    │
│  Custom Alias Input (Optional)      │
│  [Shorten URL Button]               │
├─────────────────────────────────────┤
│  Result Card (if shortened)         │
│  ├─ Original URL                    │
│  ├─ Short URL (with copy)           │
│  └─ QR Code (with view/download)    │
├─────────────────────────────────────┤
│  Link History                       │
│  ├─ Link 1 (clicks, date, actions) │
│  ├─ Link 2                          │
│  └─ Link 3                          │
└─────────────────────────────────────┘
```

### Visual Styling

- **Gradient**: Blue to cyan (link/connectivity theme)
- **Glass Cards**: Semi-transparent with blur
- **Icons**: Lucide icons for actions
- **Badges**: Click count and status indicators
- **QR Codes**: High-contrast SVG

### Responsive Design

- **Desktop**: 2-column grid for history
- **Tablet**: Single column with wide cards
- **Mobile**: Stacked layout, full-width inputs

## Analytics Events

```typescript
trackToolEvent('url_shorten', {
  has_custom_alias: true,
  url_length: 120,
})

trackToolEvent('url_copy', {
  short_code: 'abc123',
})

trackToolEvent('url_qr_download', {
  format: 'png',
})

trackToolEvent('url_redirect', {
  short_code: 'abc123',
  referrer: 'twitter.com',
})
```

## API Endpoints

### POST `/api/shorten`

**Request:**

```json
{
  "url": "https://example.com/long/path",
  "customAlias": "mylink" // optional
}
```

**Response (Success):**

```json
{
  "success": true,
  "shortUrl": "http://localhost:3000/s/mylink",
  "shortCode": "mylink",
  "originalUrl": "https://example.com/long/path",
  "createdAt": "2024-10-26T10:30:00Z"
}
```

**Response (Error):**

```json
{
  "error": "Alias already taken"
}
```

### GET `/api/shorten?code=abc123`

**Response:**

```json
{
  "originalUrl": "https://example.com",
  "shortCode": "abc123",
  "clicks": 42,
  "createdAt": "2024-10-26T10:30:00Z"
}
```

### POST `/api/shorten/click`

**Request:**

```json
{
  "code": "abc123"
}
```

**Response:**

```json
{
  "success": true,
  "clicks": 43
}
```

## Security Considerations

### URL Validation

✅ **Implemented:**

- Protocol check (http/https only)
- URL parsing validation
- XSS prevention (no javascript: URLs)

❌ **Not Implemented (Future):**

- Malware URL scanning
- Phishing detection
- Rate limiting per IP

### Custom Aliases

- Alphanumeric only
- No special characters (except hyphens)
- Case-sensitive
- Length limits (3-50 characters)

### Privacy

- No server-side logging of user IPs
- localStorage only (client-side)
- No cookies or tracking pixels
- GDPR compliant (no PII collected)

## Production Migration

**Current:** In-memory Map (development)  
**Production:** Supabase database

```typescript
// Migration steps:
1. Create Supabase table:
   CREATE TABLE shortened_urls (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     short_code TEXT UNIQUE NOT NULL,
     original_url TEXT NOT NULL,
     clicks INTEGER DEFAULT 0,
     created_at TIMESTAMP DEFAULT NOW()
   );

2. Replace Map with Supabase queries in API routes
3. Update environment variables
4. Deploy
```

## Performance

- **Client-Side Generation**: Instant feedback
- **LocalStorage**: No network latency
- **QR Code**: SVG for scalability
- **API Response**: <50ms (in-memory)

## Browser Support

✅ All modern browsers with localStorage support  
⚠️ Private/Incognito mode: Links lost on session end

## Limitations

- **Client-Side Only**: Links not shared across devices
- **No Persistence**: Clearing browser data loses links
- **No Analytics Backup**: Click data lost if localStorage cleared
- **Single User**: No multi-user collaboration

## Future Enhancements

- [ ] Backend database integration (Supabase)
- [ ] User accounts and authentication
- [ ] Link expiration dates
- [ ] Password-protected links
- [ ] Advanced analytics (geo, device, referrer)
- [ ] Custom QR code styling
- [ ] Bulk URL shortening
- [ ] API key system for external use
- [ ] Link preview cards
- [ ] UTM parameter tracking

## Related Tools

- **QR Code Generator** - Standalone QR creation
- **Text Transformer** - Clean URLs before shortening
- **Base64 Encoder** - Encode URLs for embedding

## Use Cases

### Marketing Campaigns

- Track click-through rates
- A/B test different URLs
- Monitor campaign performance

### Social Media

- Fit links in character limits
- Clean, professional appearance
- Track engagement

### Print Materials

- QR codes for business cards
- Posters and flyers
- Event materials

### Presentations

- Memorable URLs for slides
- Easy audience access
- Post-event tracking

---

**Route:** `/tools/url-shortener`  
**Component:** `app/tools/url-shortener/page.tsx`  
**API:** `app/api/shorten/route.ts`  
**Redirect:** `app/s/[code]/page.tsx`
