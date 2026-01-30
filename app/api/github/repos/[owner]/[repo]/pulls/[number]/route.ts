import { type NextRequest, NextResponse } from 'next/server'
import { getGitHubService } from '@/lib/services/github'

/**
 * GET /api/github/repos/[owner]/[repo]/pulls/[number]
 * Fetch detailed pull request information including files, reviews, and comments
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string; number: string }> }
) {
  try {
    const { owner, repo, number } = await params
    const prNumber = Number.parseInt(number, 10)

    if (Number.isNaN(prNumber) || prNumber <= 0) {
      return NextResponse.json({ error: 'Invalid pull request number' }, { status: 400 })
    }

    const github = getGitHubService()

    // Fetch PR details and additional data in parallel
    const [prResult, filesResult, reviewsResult, commentsResult] = await Promise.all([
      github.fetchPullRequest(owner, repo, prNumber),
      github.fetchPullRequestFiles(owner, repo, prNumber),
      github.fetchPullRequestReviews(owner, repo, prNumber),
      github.fetchPullRequestComments(owner, repo, prNumber),
    ])

    if (!prResult.success) {
      return NextResponse.json(
        { error: prResult.error?.message || 'Failed to fetch pull request' },
        { status: prResult.error?.status || 500 }
      )
    }

    // Combine all data into a comprehensive response
    const response = {
      ...prResult.data,
      files: filesResult.success ? filesResult.data : [],
      reviews: reviewsResult.success ? reviewsResult.data : [],
      review_comments: commentsResult.success ? commentsResult.data : [],
    }

    return NextResponse.json({ success: true, data: response })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
