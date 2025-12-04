/**
 * Chunked upload utility for handling large files
 * Splits files into smaller chunks and uploads them sequentially
 */

export interface ChunkedUploadOptions {
  chunkSize?: number // Size of each chunk in bytes (default: 5MB)
  onProgress?: (progress: number, bytesUploaded: number, totalBytes: number) => void
  onChunkComplete?: (chunkIndex: number, totalChunks: number) => void
  retryAttempts?: number
  retryDelay?: number // milliseconds
}

export interface ChunkMetadata {
  fileId: string
  fileName: string
  totalChunks: number
  chunkIndex: number
  fileSize: number
}

/**
 * Upload a large file in chunks
 */
export async function uploadFileInChunks(
  file: File,
  uploadUrl: string,
  options: ChunkedUploadOptions = {}
): Promise<string> {
  const {
    chunkSize = 5 * 1024 * 1024, // 5MB chunks
    onProgress = () => {},
    onChunkComplete = () => {},
    retryAttempts = 3,
    retryDelay = 1000,
  } = options

  const totalChunks = Math.ceil(file.size / chunkSize)
  const fileId = `${Date.now()}-${Math.random().toString(36).slice(2)}`

  console.log(`📤 Starting chunked upload: ${file.name}`)
  console.log(`   File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
  console.log(`   Total chunks: ${totalChunks}`)

  let bytesUploaded = 0

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const chunk = file.slice(start, end)

    const metadata: ChunkMetadata = {
      fileId,
      fileName: file.name,
      totalChunks,
      chunkIndex,
      fileSize: file.size,
    }

    // Upload chunk with retry logic
    let success = false
    let lastError: Error | null = null

    for (let attempt = 0; attempt < retryAttempts; attempt++) {
      try {
        await uploadChunk(uploadUrl, chunk, metadata)
        success = true
        break
      } catch (error) {
        lastError = error as Error
        console.error(
          `Chunk ${chunkIndex + 1}/${totalChunks} failed (attempt ${attempt + 1}/${retryAttempts}):`,
          error
        )

        if (attempt < retryAttempts - 1) {
          await delay(retryDelay * (attempt + 1)) // Exponential backoff
        }
      }
    }

    if (!success) {
      throw new Error(
        `Failed to upload chunk ${chunkIndex + 1}/${totalChunks} after ${retryAttempts} attempts: ${lastError?.message}`
      )
    }

    // Update progress
    bytesUploaded += chunk.size
    const progress = Math.round((bytesUploaded / file.size) * 100)
    onProgress(progress, bytesUploaded, file.size)
    onChunkComplete(chunkIndex, totalChunks)

    console.log(`✅ Chunk ${chunkIndex + 1}/${totalChunks} uploaded (${progress}%)`)
  }

  console.log(`✅ Upload complete: ${fileId}`)
  return fileId
}

/**
 * Upload a single chunk
 */
async function uploadChunk(uploadUrl: string, chunk: Blob, metadata: ChunkMetadata): Promise<void> {
  const formData = new FormData()
  formData.append('chunk', chunk)
  formData.append('metadata', JSON.stringify(metadata))

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new Error(`HTTP ${response.status}: ${errorText}`)
  }
}

/**
 * Helper to delay execution
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Calculate optimal chunk size based on file size and connection speed
 */
export function calculateOptimalChunkSize(
  fileSizeMB: number,
  _connectionSpeedMbps?: number
): number {
  // Default chunk sizes based on file size
  if (fileSizeMB < 10) return 1 * 1024 * 1024 // 1MB for small files
  if (fileSizeMB < 50) return 5 * 1024 * 1024 // 5MB for medium files
  if (fileSizeMB < 200) return 10 * 1024 * 1024 // 10MB for large files
  return 20 * 1024 * 1024 // 20MB for very large files

  // Could be enhanced with connection speed detection:
  // if (connectionSpeedMbps && connectionSpeedMbps < 1) {
  //   return 1 * 1024 * 1024 // 1MB for slow connections
  // }
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`
}

/**
 * Estimate upload time based on file size and connection speed
 */
export function estimateUploadTime(fileSizeMB: number, connectionSpeedMbps: number): number {
  // Convert Mbps to MB/s
  const speedMBps = connectionSpeedMbps / 8
  // Add 30% overhead for HTTP and processing
  const timeSeconds = (fileSizeMB / speedMBps) * 1.3
  return Math.ceil(timeSeconds)
}
