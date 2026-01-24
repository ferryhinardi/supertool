import { type NextRequest, NextResponse } from 'next/server'
import type { PRFilters } from '@/lib/services/github'
import { getGitHubService } from '@/lib/services/github'

/**
 * GET /api/github/repos/[owner]/[repo]/pulls
 * List pull requests
 * Query params:
 *   - state: 'open' | 'closed' | 'all' (default: 'open')
 *   - head: filter by head user/branch (e.g., 'user:branch')
 *   - base: filter by base branch name
 *   - sort: 'created' | 'updated' | 'popularity' | 'long-running' (default: 'created')
 *   - direction: 'asc' | 'desc' (default: 'desc')
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

    const filters: PRFilters = {}

    const state = searchParams.get('state')
    if (state === 'open' || state === 'closed' || state === 'all') {
      filters.state = state
    }

    const head = searchParams.get('head')
    if (head) filters.head = head

    const base = searchParams.get('base')
    if (base) filters.base = base

    const sort = searchParams.get('sort')
    if (
      sort === 'created' ||
      sort === 'updated' ||
      sort === 'popularity' ||
      sort === 'long-running'
    ) {
      filters.sort = sort
    }

    const direction = searchParams.get('direction')
    if (direction === 'asc' || direction === 'desc') {
      filters.direction = direction
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
    const result = await github.fetchPullRequests(owner, repo, filters)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to fetch pull requests' },
        { status: result.error?.status || 500 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
