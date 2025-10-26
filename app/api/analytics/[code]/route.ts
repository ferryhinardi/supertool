import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params

    // Query the url_statistics view for aggregated analytics
    const { data, error } = await supabase
      .from('url_statistics')
      .select('*')
      .eq('short_code', code)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'URL not found' }, { status: 404 })
    }

    return NextResponse.json({
      shortCode: data.short_code,
      originalUrl: data.original_url,
      createdAt: data.created_at,
      isActive: data.is_active,
      totalClicks: data.total_clicks || 0,
      uniqueVisitors: data.unique_visitors || 0,
      lastClicked: data.last_clicked,
      countriesReached: data.countries_reached || 0,
      mobileClicks: data.mobile_clicks || 0,
      desktopClicks: data.desktop_clicks || 0,
      tabletClicks: data.tablet_clicks || 0,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
