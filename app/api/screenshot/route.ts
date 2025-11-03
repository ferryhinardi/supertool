import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, width, height, fullPage } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Get API key from environment variables
    const apiKey = process.env.SCREENSHOTONE_ACCESS_KEY

    if (!apiKey) {
      console.error('SCREENSHOTONE_ACCESS_KEY is not configured')
      return NextResponse.json({ error: 'Screenshot service is not configured' }, { status: 500 })
    }

    // Use ScreenshotOne API with access key
    const screenshotUrl = new URL('https://api.screenshotone.com/take')
    screenshotUrl.searchParams.set('access_key', apiKey)
    screenshotUrl.searchParams.set('url', url)
    screenshotUrl.searchParams.set('viewport_width', width?.toString() || '1920')
    screenshotUrl.searchParams.set('viewport_height', height?.toString() || '1080')
    screenshotUrl.searchParams.set('device_scale_factor', '2')
    screenshotUrl.searchParams.set('format', 'png')
    screenshotUrl.searchParams.set('block_ads', 'true')
    screenshotUrl.searchParams.set('block_cookie_banners', 'true')
    screenshotUrl.searchParams.set('block_trackers', 'true')
    screenshotUrl.searchParams.set('cache', 'false')

    if (fullPage) {
      screenshotUrl.searchParams.set('full_page', 'true')
    }

    // Make the request from the server-side
    const response = await fetch(screenshotUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SuperTool/1.0)',
      },
    })

    if (!response.ok) {
      console.error('Screenshot service error:', response.status, response.statusText)
      return NextResponse.json(
        { error: `Screenshot service returned ${response.status}` },
        { status: response.status }
      )
    }

    // Get the image data
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Return the image with proper headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Screenshot API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to capture screenshot' },
      { status: 500 }
    )
  }
}
