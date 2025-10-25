import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

// Simple in-memory storage for demo (replace with Supabase in production)
const urlStore = new Map<string, { originalUrl: string; createdAt: string; clicks: number }>()

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

    // Generate or use custom short code
    let shortCode: string

    if (customAlias) {
      // Validate custom alias
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

      // Check if custom alias already exists
      if (urlStore.has(customAlias)) {
        return NextResponse.json(
          { error: 'This custom alias is already taken. Please choose another.' },
          { status: 409 }
        )
      }

      shortCode = customAlias
    } else {
      // Generate random short code (6 characters by default)
      shortCode = nanoid(6)

      // Ensure uniqueness (very unlikely collision with nanoid, but safety check)
      while (urlStore.has(shortCode)) {
        shortCode = nanoid(6)
      }
    }

    // Store the URL mapping
    urlStore.set(shortCode, {
      originalUrl: url,
      createdAt: new Date().toISOString(),
      clicks: 0,
    })

    // Build the short URL
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    const shortUrl = `${protocol}://${host}/s/${shortCode}`

    return NextResponse.json({
      id: shortCode,
      shortCode,
      shortUrl,
      originalUrl: url,
      success: true,
    })
  } catch (error) {
    console.error('Error shortening URL:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get URL info by short code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shortCode = searchParams.get('code')

    if (!shortCode) {
      return NextResponse.json({ error: 'Short code is required' }, { status: 400 })
    }

    const urlData = urlStore.get(shortCode)

    if (!urlData) {
      return NextResponse.json({ error: 'Short URL not found' }, { status: 404 })
    }

    return NextResponse.json({
      shortCode,
      ...urlData,
    })
  } catch (error) {
    console.error('Error fetching URL:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
