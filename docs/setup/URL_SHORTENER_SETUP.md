# URL Shortener & Analytics - Setup Guide

## Overview

The URL Shortener tool creates short, memorable links with custom aliases, QR code generation, and click tracking analytics. This guide covers setup for both local storage (demo mode) and Supabase integration (production mode).

## Features

- ✅ Custom short URLs with aliases
- ✅ Automatic short code generation (6 characters)
- ✅ QR code generation and download
- ✅ Click tracking and analytics
- ✅ Local storage fallback
- ✅ URL validation
- ✅ Duplicate alias prevention
- ✅ Mobile-responsive design

## Current Implementation (Demo Mode)

The tool currently works with:

1. **Client-side storage**: URLs stored in browser localStorage
2. **In-memory API**: API routes use Map for temporary storage
3. **Session-based**: Data persists only during browser session

This is perfect for testing and demonstration, but URLs won't be shared across devices or persist after server restart.

## Production Setup with Supabase

### Step 1: Create Supabase Tables

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Create the shortened_urls table
CREATE TABLE shortened_urls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  short_code VARCHAR(50) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  custom_alias BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,

  -- Indexes for fast lookups
  CONSTRAINT short_code_length CHECK (length(short_code) >= 3 AND length(short_code) <= 50)
);

-- Create the url_analytics table for click tracking
CREATE TABLE url_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  short_code VARCHAR(50) REFERENCES shortened_urls(short_code) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- User Agent Information
  user_agent TEXT,
  device_type VARCHAR(50), -- mobile, tablet, desktop
  browser VARCHAR(100),
  operating_system VARCHAR(100),

  -- Geographic Information
  ip_address VARCHAR(45), -- supports IPv6
  country VARCHAR(2),
  country_name VARCHAR(100),
  region VARCHAR(100),
  city VARCHAR(100),

  -- Referrer Information
  referrer TEXT,
  referrer_domain VARCHAR(255),

  -- Additional Metadata
  language VARCHAR(10),
  is_bot BOOLEAN DEFAULT false
);

-- Create indexes for analytics queries
CREATE INDEX idx_url_analytics_short_code ON url_analytics(short_code);
CREATE INDEX idx_url_analytics_clicked_at ON url_analytics(clicked_at DESC);
CREATE INDEX idx_shortened_urls_short_code ON shortened_urls(short_code);
CREATE INDEX idx_shortened_urls_created_at ON shortened_urls(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shortened_urls_updated_at
  BEFORE UPDATE ON shortened_urls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a view for URL statistics
CREATE OR REPLACE VIEW url_statistics AS
SELECT
  su.short_code,
  su.original_url,
  su.created_at,
  su.is_active,
  COUNT(ua.id) as total_clicks,
  COUNT(DISTINCT ua.ip_address) as unique_visitors,
  MAX(ua.clicked_at) as last_clicked,
  COUNT(DISTINCT ua.country) as countries_reached,
  COUNT(CASE WHEN ua.device_type = 'mobile' THEN 1 END) as mobile_clicks,
  COUNT(CASE WHEN ua.device_type = 'desktop' THEN 1 END) as desktop_clicks,
  COUNT(CASE WHEN ua.device_type = 'tablet' THEN 1 END) as tablet_clicks
FROM shortened_urls su
LEFT JOIN url_analytics ua ON su.short_code = ua.short_code
GROUP BY su.short_code, su.original_url, su.created_at, su.is_active;
```

### Step 2: Set up Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE shortened_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE url_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can create shortened URLs
CREATE POLICY "Anyone can create shortened URLs"
  ON shortened_urls
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view their own URLs (if authenticated)
CREATE POLICY "Users can view their own URLs"
  ON shortened_urls
  FOR SELECT
  USING (auth.uid() = created_by OR created_by IS NULL);

-- Policy: Users can update their own URLs
CREATE POLICY "Users can update their own URLs"
  ON shortened_urls
  FOR UPDATE
  USING (auth.uid() = created_by);

-- Policy: Users can delete their own URLs
CREATE POLICY "Users can delete their own URLs"
  ON shortened_urls
  FOR DELETE
  USING (auth.uid() = created_by);

-- Policy: Anyone can read analytics (for public URLs)
CREATE POLICY "Anyone can read analytics"
  ON url_analytics
  FOR SELECT
  USING (true);

-- Policy: System can insert analytics
CREATE POLICY "System can insert analytics"
  ON url_analytics
  FOR INSERT
  WITH CHECK (true);
```

### Step 3: Update API Routes

Replace `/app/api/shorten/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { supabase } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, customAlias } = body

    // Validate URL
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    try {
      const urlObj = new URL(url)
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return NextResponse.json({ error: 'Invalid URL protocol' }, { status: 400 })
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    let shortCode: string
    let customAliasUsed = false

    if (customAlias) {
      if (!/^[a-z0-9-]+$/.test(customAlias)) {
        return NextResponse.json(
          { error: 'Custom alias can only contain lowercase letters, numbers, and hyphens' },
          { status: 400 }
        )
      }

      if (customAlias.length < 3 || customAlias.length > 50) {
        return NextResponse.json(
          { error: 'Custom alias must be between 3 and 50 characters' },
          { status: 400 }
        )
      }

      const { data: existing } = await supabase
        .from('shortened_urls')
        .select('short_code')
        .eq('short_code', customAlias)
        .single()

      if (existing) {
        return NextResponse.json({ error: 'This custom alias is already taken' }, { status: 409 })
      }

      shortCode = customAlias
      customAliasUsed = true
    } else {
      shortCode = nanoid(6)
    }

    const { data, error } = await supabase
      .from('shortened_urls')
      .insert({
        short_code: shortCode,
        original_url: url,
        custom_alias: customAliasUsed,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    const shortUrl = `${protocol}://${host}/s/${shortCode}`

    return NextResponse.json({
      id: data.id,
      shortCode: data.short_code,
      shortUrl,
      originalUrl: url,
      success: true,
    })
  } catch (error) {
    console.error('Error shortening URL:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

Replace `/app/s/[code]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params

    const { data, error } = await supabase
      .from('shortened_urls')
      .select('original_url, is_active')
      .eq('short_code', code)
      .single()

    if (error || !data || !data.is_active) {
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
      const host = request.headers.get('host') || 'localhost:3000'
      return NextResponse.redirect(`${protocol}://${host}/tools/url-shortener?error=notfound`, 302)
    }

    // Track analytics
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''

    await supabase.from('url_analytics').insert({
      short_code: code,
      user_agent: userAgent,
      referrer: referer,
      ip_address: ip.split(',')[0].trim(),
    })

    return NextResponse.redirect(data.original_url, 302)
  } catch (error) {
    console.error('Error redirecting:', error)
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    return NextResponse.redirect(`${protocol}://${host}/tools/url-shortener?error=server`, 302)
  }
}
```

### Step 4: Add Analytics API

Create `/app/api/analytics/[code]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params

    const { data, error } = await supabase
      .from('url_statistics')
      .select('*')
      .eq('short_code', code)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'URL not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

## Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Optional Enhancements

### 1. Add IP Geolocation

Use a service like ipapi.co or ipgeolocation.io:

```typescript
async function getGeolocation(ip: string) {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`)
    return await response.json()
  } catch {
    return null
  }
}
```

### 2. Add User Agent Parsing

Install `ua-parser-js`:

```bash
pnpm add ua-parser-js
pnpm add -D @types/ua-parser-js
```

```typescript
import UAParser from 'ua-parser-js'

const parser = new UAParser(userAgent)
const device = parser.getDevice()
const browser = parser.getBrowser()
const os = parser.getOS()
```

### 3. Add URL Expiration

Create a cron job to deactivate expired URLs:

```sql
-- Add to Supabase Edge Functions or use a cron service
UPDATE shortened_urls
SET is_active = false
WHERE expires_at < NOW() AND is_active = true;
```

### 4. Add QR Code Customization

Modify QR code generation to include:

- Logo overlay
- Custom colors
- Different sizes
- Error correction levels

## Testing

1. **Create a short URL**: Enter a URL and click "Shorten URL"
2. **Test custom alias**: Enter a custom alias and verify uniqueness
3. **Generate QR code**: Click QR code button and download
4. **Test redirect**: Visit the short URL and verify redirect
5. **Check analytics**: View click counts and statistics

## Troubleshooting

### Issue: "Failed to shorten URL"

- Check Supabase connection
- Verify API keys in `.env.local`
- Check browser console for errors

### Issue: "Custom alias already taken"

- Try a different alias
- Check database for existing aliases

### Issue: Short URL not redirecting

- Verify URL exists in database
- Check `is_active` status
- Ensure redirect route is properly configured

## Security Considerations

1. **Rate Limiting**: Add rate limiting to prevent abuse
2. **URL Validation**: Validate and sanitize all URLs
3. **Malicious URL Detection**: Integrate with URL safety APIs
4. **CAPTCHA**: Add CAPTCHA for public submissions
5. **Authentication**: Require auth for sensitive operations

## Performance Optimization

1. **Caching**: Cache frequently accessed URLs
2. **CDN**: Use CDN for static assets
3. **Database Indexes**: Ensure proper indexing
4. **Connection Pooling**: Use Supabase connection pooling

## Future Features

- [ ] Bulk URL shortening
- [ ] URL password protection
- [ ] URL expiration dates
- [ ] Custom domains
- [ ] A/B testing with multiple URLs
- [ ] Link-in-bio pages
- [ ] Advanced analytics dashboard
- [ ] Team collaboration
- [ ] API access for developers
- [ ] Webhook notifications

## Support

For issues or questions:

- Check the Supabase documentation
- Review the database schema
- Test with demo data
- Check browser console for errors
