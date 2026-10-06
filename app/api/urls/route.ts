import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/auth/supabaseClient'
import { isPublicHttpUrl } from '@/lib/utils/public-url'
import { isShortCode, MAX_SHORT_LINK_HISTORY } from '@/lib/utils/short-link-history'

// Links are created anonymously, so callers only get stats for the codes they
// already hold instead of a listing of everyone's links.
function requestedCodes(request: NextRequest): string[] {
  const raw = request.nextUrl.searchParams.get('codes') ?? ''
  return [...new Set(raw.split(',').filter(isShortCode))].slice(0, MAX_SHORT_LINK_HISTORY)
}

export async function GET(request: NextRequest) {
  try {
    const codes = requestedCodes(request)
    if (codes.length === 0) {
      return NextResponse.json({ urls: [], count: 0 })
    }

    const { data, error } = await supabase
      .from('url_statistics')
      .select('*')
      .in('short_code', codes)
      .order('created_at', { ascending: false })
      .limit(MAX_SHORT_LINK_HISTORY)

    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json({ error: 'Failed to fetch URLs' }, { status: 500 })
    }

    const urls =
      data
        ?.filter((item) => isPublicHttpUrl(item.original_url))
        .map((item) => ({
          shortCode: item.short_code,
          originalUrl: item.original_url,
          createdAt: item.created_at,
          isActive: item.is_active,
          totalClicks: item.total_clicks || 0,
          uniqueVisitors: item.unique_visitors || 0,
          lastClicked: item.last_clicked,
        })) || []

    return NextResponse.json({ urls, count: urls.length })
  } catch (error) {
    console.error('Error fetching URLs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
