import { mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type NextRequest, NextResponse } from 'next/server'

interface ChunkMetadata {
  fileId: string
  fileName: string
  totalChunks: number
  chunkIndex: number
  fileSize: number
}

// Store for tracking upload progress
const uploadState = new Map<
  string,
  {
    chunks: Map<number, Buffer>
    metadata: ChunkMetadata
    lastActivity: number
  }
>()

// Clean up old uploads every 5 minutes
setInterval(
  () => {
    const now = Date.now()
    const timeout = 30 * 60 * 1000 // 30 minutes

    for (const [fileId, state] of uploadState.entries()) {
      if (now - state.lastActivity > timeout) {
        console.log(`🧹 Cleaning up stale upload: ${fileId}`)
        uploadState.delete(fileId)
      }
    }
  },
  5 * 60 * 1000
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const chunk = formData.get('chunk') as File
    const metadataJson = formData.get('metadata') as string

    if (!chunk || !metadataJson) {
      return NextResponse.json({ error: 'Missing chunk or metadata' }, { status: 400 })
    }

    const metadata: ChunkMetadata = JSON.parse(metadataJson)
    const { fileId, totalChunks, chunkIndex } = metadata

    console.log(`📦 Received chunk ${chunkIndex + 1}/${totalChunks} for file ${fileId}`)

    // Get or create upload state
    let state = uploadState.get(fileId)
    if (!state) {
      state = {
        chunks: new Map(),
        metadata,
        lastActivity: Date.now(),
      }
      uploadState.set(fileId, state)
    }

    // Store chunk
    const chunkBuffer = Buffer.from(await chunk.arrayBuffer())
    state.chunks.set(chunkIndex, chunkBuffer)
    state.lastActivity = Date.now()

    // Check if all chunks are received
    if (state.chunks.size === totalChunks) {
      console.log(`✅ All chunks received for ${fileId}. Assembling file...`)

      // Assemble file
      const chunks: Buffer[] = []
      for (let i = 0; i < totalChunks; i++) {
        const chunkData = state.chunks.get(i)
        if (!chunkData) {
          return NextResponse.json({ error: `Missing chunk ${i} during assembly` }, { status: 500 })
        }
        chunks.push(chunkData)
      }

      const completeFile = Buffer.concat(chunks)

      // Save to temp directory
      const tempDir = join(tmpdir(), 'video-uploads')
      await mkdir(tempDir, { recursive: true })
      const filePath = join(tempDir, `${fileId}-${metadata.fileName}`)
      await writeFile(filePath, completeFile)

      console.log(`✅ File assembled and saved: ${filePath}`)

      // Clean up upload state
      uploadState.delete(fileId)

      return NextResponse.json({
        status: 'complete',
        fileId,
        filePath,
        size: completeFile.length,
      })
    }

    // Return progress
    return NextResponse.json({
      status: 'in_progress',
      fileId,
      chunksReceived: state.chunks.size,
      totalChunks,
      progress: Math.round((state.chunks.size / totalChunks) * 100),
    })
  } catch (error) {
    console.error('❌ Error handling chunk upload:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process chunk' },
      { status: 500 }
    )
  }
}

// GET endpoint to check upload status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('fileId')

  if (!fileId) {
    return NextResponse.json({ error: 'Missing fileId parameter' }, { status: 400 })
  }

  const state = uploadState.get(fileId)
  if (!state) {
    return NextResponse.json({ error: 'Upload not found' }, { status: 404 })
  }

  return NextResponse.json({
    status: 'in_progress',
    fileId,
    chunksReceived: state.chunks.size,
    totalChunks: state.metadata.totalChunks,
    progress: Math.round((state.chunks.size / state.metadata.totalChunks) * 100),
  })
}

// DELETE endpoint to cancel upload
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('fileId')

  if (!fileId) {
    return NextResponse.json({ error: 'Missing fileId parameter' }, { status: 400 })
  }

  const deleted = uploadState.delete(fileId)

  if (deleted) {
    console.log(`🗑️  Cancelled upload: ${fileId}`)
    return NextResponse.json({ status: 'cancelled', fileId })
  }

  return NextResponse.json({ error: 'Upload not found' }, { status: 404 })
}
