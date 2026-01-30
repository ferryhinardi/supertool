import { type NextRequest, NextResponse } from 'next/server'
import type { CreateFileParams, DeleteFileParams, UpdateFileParams } from '@/lib/services/github'
import { getGitHubService } from '@/lib/services/github'

/**
 * GET /api/github/repos/[owner]/[repo]/contents/[...path]
 * Fetch file content at a specific path
 * Query params:
 *   - ref: branch, tag, or commit SHA (optional, defaults to default branch)
 *   - raw: if 'true', returns raw file content as text
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string; path: string[] }> }
) {
  try {
    const { owner, repo, path } = await params
    const filePath = path.join('/')
    const searchParams = request.nextUrl.searchParams
    const ref = searchParams.get('ref') || undefined
    const raw = searchParams.get('raw') === 'true'

    const github = getGitHubService()

    if (raw) {
      const result = await github.fetchRawContent(owner, repo, filePath, ref)

      if (!result.success) {
        return NextResponse.json(
          { error: result.error?.message || 'Failed to fetch raw content' },
          { status: result.error?.status || 500 }
        )
      }

      return new NextResponse(result.data, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }

    const result = await github.fetchFileContent(owner, repo, filePath, ref)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to fetch file content' },
        { status: result.error?.status || 500 }
      )
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * PUT /api/github/repos/[owner]/[repo]/contents/[...path]
 * Create or update a file at a specific path
 * Body:
 *   - message: Commit message (required)
 *   - content: Base64 encoded file content (required)
 *   - sha: Blob SHA of the file being replaced (required for updates)
 *   - branch: Branch name (optional, defaults to default branch)
 *   - committer: { name, email } (optional)
 *   - author: { name, email } (optional)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string; path: string[] }> }
) {
  try {
    const { owner, repo, path } = await params
    const filePath = path.join('/')
    const body = (await request.json()) as CreateFileParams | UpdateFileParams

    if (!body.message) {
      return NextResponse.json({ error: 'Commit message is required' }, { status: 400 })
    }

    if (!body.content) {
      return NextResponse.json({ error: 'File content is required' }, { status: 400 })
    }

    const github = getGitHubService()
    const result = await github.createOrUpdateFile(owner, repo, filePath, body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to create/update file' },
        { status: result.error?.status || 500 }
      )
    }

    return NextResponse.json({ success: true, data: result.data }, { status: body.sha ? 200 : 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * DELETE /api/github/repos/[owner]/[repo]/contents/[...path]
 * Delete a file at a specific path
 * Body:
 *   - message: Commit message (required)
 *   - sha: Blob SHA of the file being deleted (required)
 *   - branch: Branch name (optional, defaults to default branch)
 *   - committer: { name, email } (optional)
 *   - author: { name, email } (optional)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string; path: string[] }> }
) {
  try {
    const { owner, repo, path } = await params
    const filePath = path.join('/')
    const body = (await request.json()) as DeleteFileParams

    if (!body.message) {
      return NextResponse.json({ error: 'Commit message is required' }, { status: 400 })
    }

    if (!body.sha) {
      return NextResponse.json({ error: 'File SHA is required for deletion' }, { status: 400 })
    }

    const github = getGitHubService()
    const result = await github.deleteFile(owner, repo, filePath, body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to delete file' },
        { status: result.error?.status || 500 }
      )
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
