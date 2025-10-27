import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params

    // Query Supabase for the short URL
    const { data, error } = await supabase
      .from('shortened_urls')
      .select('original_url, is_active')
      .eq('short_code', code)
      .single()

    if (error || !data || !data.is_active) {
      // If not found or inactive, redirect to URL shortener page with error
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
      const host = request.headers.get('host') || 'localhost:3000'
      return NextResponse.redirect(`${protocol}://${host}/tools/url-shortener?error=notfound`, 302)
    }

    // Track analytics (fire and forget - don't wait for it to complete)
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''

    // Insert analytics data (async but don't await to avoid slowing down redirect)
    supabase
      .from('url_analytics')
      .insert({
        short_code: code,
        user_agent: userAgent,
        referrer: referer,
        ip_address: ip.split(',')[0].trim(),
      })
      .then((result) => {
        // Analytics tracked successfully
        if (result.error) {
          console.error('Error tracking analytics:', result.error)
        }
      })

    // Redirect to the original URL
    return NextResponse.redirect(data.original_url, 302)
  } catch (error) {
    console.error('Error redirecting short URL:', error)

    // Redirect to URL shortener page on error
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    return NextResponse.redirect(`${protocol}://${host}/tools/url-shortener?error=server`, 302)
  }
}
