import { type NextRequest, NextResponse } from 'next/server'
import { getGitHubService } from '@/lib/services/github'

/**
 * GET /api/github/repos/[owner]/[repo]/issues/[number]
 * Fetch detailed issue information including comments
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string; number: string }> }
) {
  try {
    const { owner, repo, number } = await params
    const issueNumber = Number.parseInt(number, 10)

    if (Number.isNaN(issueNumber) || issueNumber <= 0) {
      return NextResponse.json({ error: 'Invalid issue number' }, { status: 400 })
    }

    const github = getGitHubService()

    // Fetch issue details and comments in parallel
    const [issueResult, commentsResult] = await Promise.all([
      github.fetchIssue(owner, repo, issueNumber),
      github.fetchIssueComments(owner, repo, issueNumber),
    ])

    if (!issueResult.success) {
      return NextResponse.json(
        { error: issueResult.error?.message || 'Failed to fetch issue' },
        { status: issueResult.error?.status || 500 }
      )
    }

    // Combine issue data with comments
    const response = {
      ...issueResult.data,
      comments_data: commentsResult.success ? commentsResult.data : [],
    }

    return NextResponse.json({ success: true, data: response })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
