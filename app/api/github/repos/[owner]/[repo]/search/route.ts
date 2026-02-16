import { type NextRequest, NextResponse } from 'next/server'
import type { SearchFilters } from '@/lib/services/github'
import { getGitHubService } from '@/lib/services/github'

/**
 * GET /api/github/repos/[owner]/[repo]/search
 * Search code in repository
 * Query params:
 *   - q: search query (required)
 *   - sort: 'indexed' (default: best match)
 *   - order: 'asc' | 'desc' (default: 'desc')
 *   - per_page: results per page (max 100, default: 30)
 *   - page: page number (default: 1)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  try {
    const { owner, repo } = await params
    const searchParams = request.nextUrl.searchParams

    const query = searchParams.get('q')
    if (!query) {
      return NextResponse.json({ error: 'Search query (q) is required' }, { status: 400 })
    }

    const filters: Omit<SearchFilters, 'q'> = {}

    const sort = searchParams.get('sort')
    if (sort === 'indexed') {
      filters.sort = sort
    }

    const order = searchParams.get('order')
    if (order === 'asc' || order === 'desc') {
      filters.order = order
    }

    const perPage = searchParams.get('per_page')
    if (perPage) {
      const num = Number.parseInt(perPage, 10)
      if (!Number.isNaN(num) && num > 0 && num <= 100) {
        filters.per_page = num
      }
    }

    const page = searchParams.get('page')
    if (page) {
      const num = Number.parseInt(page, 10)
      if (!Number.isNaN(num) && num > 0) {
        filters.page = num
      }
    }

    const github = getGitHubService()
    const result = await github.searchCode(owner, repo, query, filters)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to search code' },
        { status: result.error?.status || 500 }
      )
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
