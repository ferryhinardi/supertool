import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(_request: NextRequest) {
  try {
    // Query all shortened URLs with their statistics
    const { data, error } = await supabase
      .from('url_statistics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100) // Limit to 100 most recent URLs

    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json({ error: 'Failed to fetch URLs' }, { status: 500 })
    }

    // Format the response
    const urls =
      data?.map((item) => ({
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
