'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DragDropZone } from '@/components/features/DragDropZone'
import { toast } from 'sonner'
import { Upload, Check, Copy, ExternalLink, RotateCcw, FileUp } from 'lucide-react'

export default function UploadTool() {
  const [file, setFile] = useState<File | null>(null)
  const [publicUrl, setPublicUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [copied, setCopied] = useState(false)

  const handleFilesSelected = (files: FileList) => {
    const selectedFile = files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPublicUrl(null)
      setUploadProgress(0)
      toast.info(`Selected: ${selectedFile.name}`)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setUploadProgress(20)

    const filePath = `${Date.now()}-${file.name}`

    try {
      setUploadProgress(40)

      const { error } = await supabase.storage.from('uploads').upload(filePath, file)

      setUploadProgress(70)

      if (error) {
        throw error
      }

      const { data } = supabase.storage.from('uploads').getPublicUrl(filePath)

      setUploadProgress(100)
      setPublicUrl(data.publicUrl)
      toast.success('File uploaded successfully! 🎉')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Upload failed: ${errorMessage}`)
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleCopy = async () => {
    if (!publicUrl) return

    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    toast.success('URL copied to clipboard! 📋')

    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    setFile(null)
    setPublicUrl(null)
    setUploadProgress(0)
    setCopied(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 md:px-6 lg:px-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <div
            className="animate-pulse rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 p-4 shadow-2xl shadow-blue-500/60"
            style={{ animationDuration: '2s' }}
          >
            <FileUp className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-blue-300 via-cyan-400 to-teal-300 bg-clip-text text-4xl font-extrabold text-transparent drop-shadow-lg md:text-5xl">
              File Upload
            </h1>
            <p className="text-base text-gray-300 md:text-lg">
              Upload files to cloud storage with instant sharing
            </p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <Card className="glass-card border-2 border-blue-500/30 shadow-2xl shadow-blue-500/20">
        <CardContent className="space-y-6 p-8">
          {!publicUrl ? (
            <>
              <DragDropZone
                onFilesSelected={handleFilesSelected}
                disabled={uploading}
                maxSize={10 * 1024 * 1024} // 10MB
              />

              {file && (
                <div className="space-y-6">
                  {/* File info */}
                  <div className="glass flex items-center justify-between rounded-xl border-2 border-cyan-500/30 p-6 shadow-lg shadow-cyan-500/20">
                    <div>
                      <p className="text-lg font-semibold text-white">{file.name}</p>
                      <p className="text-sm text-gray-300">
                        {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                      </p>
                    </div>
                    <Badge
                      variant="info"
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-semibold shadow-lg"
                    >
                      {file.type ? 'Valid' : 'No type'}
                    </Badge>
                  </div>

                  {/* Upload progress */}
                  {uploading && (
                    <div className="space-y-3">
                      <Progress value={uploadProgress} showPercentage gradient />
                      <p className="text-center text-base font-medium text-cyan-300">
                        Uploading to cloud storage...
                      </p>
                    </div>
                  )}

                  {/* Upload button */}
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="group relative w-full overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 px-8 py-7 text-lg font-semibold shadow-2xl shadow-blue-500/50 transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 hover:shadow-2xl hover:shadow-cyan-500/60"
                    size="lg"
                  >
                    {uploading ? (
                      <>
                        <Upload className="mr-2 h-6 w-6 animate-bounce" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-6 w-6" />
                        Upload to Cloud
                      </>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            // Success state
            <div className="space-y-6 text-center">
              <div className="mb-6 inline-flex rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-6 shadow-2xl shadow-green-500/50">
                <Check className="h-16 w-16 text-green-400" />
              </div>

              <div>
                <h3 className="mb-2 bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-2xl font-bold text-transparent drop-shadow-lg">
                  Upload Successful!
                </h3>
                <p className="text-lg text-gray-300">Your file is now available via a public URL</p>
              </div>

              {/* File details */}
              <div className="glass rounded-xl border-2 border-green-500/30 p-6 text-left shadow-lg shadow-green-500/20">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">File name:</span>
                  <span className="text-sm font-semibold text-white">{file?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">Size:</span>
                  <span className="text-sm font-semibold text-white">
                    {file && formatFileSize(file.size)}
                  </span>
                </div>
              </div>

              {/* URL display */}
              <div className="glass space-y-4 rounded-xl border-2 border-blue-500/30 p-6 shadow-lg shadow-blue-500/20">
                <p className="text-left text-base font-semibold text-gray-300">Public URL:</p>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={publicUrl}
                    readOnly
                    className="flex-1 rounded-xl border-2 border-cyan-500/50 bg-gray-900/80 px-4 py-3 font-mono text-sm text-white shadow-inner"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    className={`h-12 w-12 transition-all ${
                      copied
                        ? 'border-2 border-green-500 bg-green-500/30 shadow-lg shadow-green-500/50'
                        : 'border-2 border-cyan-500/50 hover:border-cyan-500 hover:bg-cyan-500/20'
                    }`}
                  >
                    {copied ? (
                      <Check className="h-5 w-5 text-green-400" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    asChild
                    className="h-12 w-12 border-2 border-blue-500/50 hover:border-blue-500 hover:bg-blue-500/20"
                  >
                    <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Reset button */}
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full border-2 border-purple-500/50 bg-purple-500/10 py-6 text-base font-semibold hover:border-purple-500 hover:bg-purple-500/20"
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Upload Another File
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="glass-card border-2 border-cyan-500/30 shadow-xl shadow-cyan-500/20">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-2xl font-bold text-transparent drop-shadow-lg">
            Upload Information
          </CardTitle>
          <CardDescription className="text-base text-gray-300">
            Files are stored securely in cloud storage with instant CDN delivery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 text-base md:grid-cols-3">
            <div className="rounded-lg border-2 border-purple-500/30 bg-purple-500/10 p-4">
              <p className="font-medium text-purple-300">Max file size</p>
              <p className="text-lg font-bold text-white">10 MB</p>
            </div>
            <div className="rounded-lg border-2 border-blue-500/30 bg-blue-500/10 p-4">
              <p className="font-medium text-blue-300">Storage</p>
              <p className="text-lg font-bold text-white">Supabase Cloud</p>
            </div>
            <div className="rounded-lg border-2 border-cyan-500/30 bg-cyan-500/10 p-4">
              <p className="font-medium text-cyan-300">URL Type</p>
              <p className="text-lg font-bold text-white">Public CDN</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
