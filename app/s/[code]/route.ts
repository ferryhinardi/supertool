import { NextRequest, NextResponse } from 'next/server'

// This would be replaced with actual database in production
// For now, we'll try to fetch from the API
export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params

    // In a real implementation, query database here
    // For demo, we'll redirect to a not found page since we're using in-memory storage
    // that doesn't persist across API routes

    // Try to fetch from the shorten API
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    const apiUrl = `${protocol}://${host}/api/shorten?code=${code}`

    const response = await fetch(apiUrl)

    if (response.ok) {
      const data = await response.json()

      // Track analytics (in production, this would update database)
      // For now, just redirect
      return NextResponse.redirect(data.originalUrl, 302)
    }

    // If not found, redirect to homepage with error
    return NextResponse.redirect(`${protocol}://${host}/tools/url-shortener?error=notfound`, 302)
  } catch (error) {
    console.error('Error redirecting short URL:', error)

    // Redirect to homepage on error
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    return NextResponse.redirect(`${protocol}://${host}/tools/url-shortener?error=server`, 302)
  }
}
