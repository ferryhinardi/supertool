import { type NextRequest, NextResponse } from 'next/server'
import type { IssueFilters } from '@/lib/services/github'
import { getGitHubService } from '@/lib/services/github'

/**
 * GET /api/github/repos/[owner]/[repo]/issues
 * List repository issues
 * Query params:
 *   - state: 'open' | 'closed' | 'all' (default: 'open')
 *   - labels: comma-separated list of label names
 *   - sort: 'created' | 'updated' | 'comments' (default: 'created')
 *   - direction: 'asc' | 'desc' (default: 'desc')
 *   - since: ISO 8601 timestamp to filter issues updated since
 *   - per_page: results per page (max 100, default: 30)
 *   - page: page number (default: 1)
 *   - assignee: filter by assignee username, 'none', or '*'
 *   - creator: filter by creator username
 *   - mentioned: filter by mentioned username
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  try {
    const { owner, repo } = await params
    const searchParams = request.nextUrl.searchParams

    const filters: IssueFilters = {}

    const state = searchParams.get('state')
    if (state === 'open' || state === 'closed' || state === 'all') {
      filters.state = state
    }

    const labels = searchParams.get('labels')
    if (labels) filters.labels = labels

    const sort = searchParams.get('sort')
    if (sort === 'created' || sort === 'updated' || sort === 'comments') {
      filters.sort = sort
    }

    const direction = searchParams.get('direction')
    if (direction === 'asc' || direction === 'desc') {
      filters.direction = direction
    }

    const since = searchParams.get('since')
    if (since) filters.since = since

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

    const assignee = searchParams.get('assignee')
    if (assignee) filters.assignee = assignee

    const creator = searchParams.get('creator')
    if (creator) filters.creator = creator

    const mentioned = searchParams.get('mentioned')
    if (mentioned) filters.mentioned = mentioned

    const github = getGitHubService()
    const result = await github.fetchIssues(owner, repo, filters)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to fetch issues' },
        { status: result.error?.status || 500 }
      )
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
