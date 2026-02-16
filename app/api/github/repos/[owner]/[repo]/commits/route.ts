import { type NextRequest, NextResponse } from 'next/server'
import type { CommitFilters } from '@/lib/services/github'
import { getGitHubService } from '@/lib/services/github'

/**
 * GET /api/github/repos/[owner]/[repo]/commits
 * List repository commits
 * Query params:
 *   - sha: SHA or branch to start listing commits from (default: default branch)
 *   - path: only commits containing this file path
 *   - author: GitHub login or email to filter by
 *   - since: ISO 8601 timestamp - only commits after this date
 *   - until: ISO 8601 timestamp - only commits before this date
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

    const filters: CommitFilters = {}

    const sha = searchParams.get('sha')
    if (sha) filters.sha = sha

    const path = searchParams.get('path')
    if (path) filters.path = path

    const author = searchParams.get('author')
    if (author) filters.author = author

    const since = searchParams.get('since')
    if (since) filters.since = since

    const until = searchParams.get('until')
    if (until) filters.until = until

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
    const result = await github.fetchCommits(owner, repo, filters)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to fetch commits' },
        { status: result.error?.status || 500 }
      )
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
