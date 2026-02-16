import { type NextRequest, NextResponse } from 'next/server'
import { getGitHubService } from '@/lib/services/github'

/**
 * GET /api/github/repos/[owner]/[repo]
 * Fetch repository metadata
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  try {
    const { owner, repo } = await params
    const github = getGitHubService()
    const result = await github.fetchRepository(owner, repo)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to fetch repository' },
        { status: result.error?.status || 500 }
      )
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
