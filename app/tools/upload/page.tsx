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
      
      const { error } = await supabase.storage
        .from('uploads')
        .upload(filePath, file)

      setUploadProgress(70)

      if (error) {
        throw error
      }

      const { data } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath)

      setUploadProgress(100)
      setPublicUrl(data.publicUrl)
      toast.success('File uploaded successfully! 🎉')
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`)
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
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <main className="max-w-4xl mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 shadow-lg shadow-blue-500/50 animate-pulse" style={{ animationDuration: '2s' }}>
            <FileUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500 bg-clip-text text-transparent">File Upload</h1>
            <p className="text-gray-400 text-sm">Upload files to cloud storage with instant sharing</p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <Card className="glass-card border-gray-800/50">
        <CardContent className="p-6 space-y-4">
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
                  <div className="glass p-4 rounded-lg flex items-center justify-between">
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
                      <p className="text-sm text-gray-400 text-center">
                        Uploading to cloud storage...
                      </p>
                    </div>
                  )}

                  {/* Upload button */}
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60 transition-all duration-300"
                    size="lg"
                  >
                    {uploading ? (
                      <>
                        <Upload className="w-4 h-4 mr-2 animate-bounce" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
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
              <div className="inline-flex p-4 rounded-full bg-green-500/10 mb-4">
                <Check className="w-12 h-12 text-green-500" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Upload Successful!</h3>
                <p className="text-gray-400">Your file is now available via a public URL</p>
              </div>

              {/* File details */}
              <div className="glass p-4 rounded-lg text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">File name:</span>
                  <span className="text-sm font-medium text-white">{file?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Size:</span>
                  <span className="text-sm font-medium text-white">{file && formatFileSize(file.size)}</span>
                </div>
              </div>

              {/* URL display */}
              <div className="glass p-4 rounded-lg space-y-3">
                <p className="text-sm text-gray-400 text-left">Public URL:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={publicUrl}
                    readOnly
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    className={copied ? 'bg-green-500/20 border-green-500' : ''}
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    asChild
                  >
                    <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Reset button */}
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
