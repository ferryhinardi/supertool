import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/auth/supabaseClient'
import { isPublicHttpUrl } from '@/lib/utils/public-url'

function shortenerErrorRedirect(request: NextRequest, error: 'notfound' | 'server') {
  // Prefer configured base URL / request origin over the Host header to avoid open redirects
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '')
  const fromRequest = request.nextUrl?.origin
  const origin = configured || fromRequest || 'http://localhost:3000'
  return NextResponse.redirect(`${origin}/tools/url-shortener?error=${error}`, 302)
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params

    // Query Supabase for the short URL
    const { data, error } = await supabase
      .from('shortened_urls')
      .select('original_url, is_active')
      .eq('short_code', code)
      .single()

    if (error || !data || !data.is_active || !isPublicHttpUrl(data.original_url)) {
      return shortenerErrorRedirect(request, 'notfound')
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
    return shortenerErrorRedirect(request, 'server')
  }
}
