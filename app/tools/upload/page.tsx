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
    <main className="mx-auto max-w-4xl space-y-6 py-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div
            className="animate-pulse rounded-xl bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 p-3 shadow-lg shadow-blue-500/50"
            style={{ animationDuration: '2s' }}
          >
            <FileUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500 bg-clip-text text-3xl font-bold text-transparent">
              File Upload
            </h1>
            <p className="text-sm text-gray-400">
              Upload files to cloud storage with instant sharing
            </p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <Card className="glass-card border-gray-800/50">
        <CardContent className="space-y-4 p-6">
          {!publicUrl ? (
            <>
              <DragDropZone
                onFilesSelected={handleFilesSelected}
                disabled={uploading}
                maxSize={10 * 1024 * 1024} // 10MB
              />

              {file && (
                <div className="space-y-4">
                  {/* File info */}
                  <div className="glass flex items-center justify-between rounded-lg p-4">
                    <div>
                      <p className="font-medium text-white">{file.name}</p>
                      <p className="text-sm text-gray-400">
                        {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                      </p>
                    </div>
                    <Badge variant="info">{file.type ? 'Valid' : 'No type'}</Badge>
                  </div>

                  {/* Upload progress */}
                  {uploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} showPercentage gradient />
                      <p className="text-center text-sm text-gray-400">
                        Uploading to cloud storage...
                      </p>
                    </div>
                  )}

                  {/* Upload button */}
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 shadow-lg shadow-blue-500/50 transition-all duration-300 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 hover:shadow-xl hover:shadow-blue-500/60"
                    size="lg"
                  >
                    {uploading ? (
                      <>
                        <Upload className="mr-2 h-4 w-4 animate-bounce" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload to Cloud
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            // Success state
            <div className="space-y-4 text-center">
              <div className="mb-4 inline-flex rounded-full bg-green-500/10 p-4">
                <Check className="h-12 w-12 text-green-500" />
              </div>

              <div>
                <h3 className="mb-1 text-xl font-bold text-white">Upload Successful!</h3>
                <p className="text-gray-400">Your file is now available via a public URL</p>
              </div>

              {/* File details */}
              <div className="glass rounded-lg p-4 text-left">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-gray-400">File name:</span>
                  <span className="text-sm font-medium text-white">{file?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Size:</span>
                  <span className="text-sm font-medium text-white">
                    {file && formatFileSize(file.size)}
                  </span>
                </div>
              </div>

              {/* URL display */}
              <div className="glass space-y-3 rounded-lg p-4">
                <p className="text-left text-sm text-gray-400">Public URL:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={publicUrl}
                    readOnly
                    className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 font-mono text-sm text-white"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    className={copied ? 'border-green-500 bg-green-500/20' : ''}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Reset button */}
              <Button onClick={handleReset} variant="outline" className="w-full">
                <RotateCcw className="mr-2 h-4 w-4" />
                Upload Another File
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="glass-card border-gray-800/50">
        <CardHeader>
          <CardTitle className="text-lg">Upload Information</CardTitle>
          <CardDescription>
            Files are stored securely in cloud storage with instant CDN delivery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            <div>
              <p className="text-gray-400">Max file size</p>
              <p className="font-medium text-white">10 MB</p>
            </div>
            <div>
              <p className="text-gray-400">Storage</p>
              <p className="font-medium text-white">Supabase Cloud</p>
            </div>
            <div>
              <p className="text-gray-400">URL Type</p>
              <p className="font-medium text-white">Public CDN</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
