'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner' // ✅ NEW

export default function UploadTool() {
  const [file, setFile] = useState<File | null>(null)
  const [publicUrl, setPublicUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    setFile(selected)
  }

  const handleUpload = async () => {
    if (!file) return

    const filePath = `${Date.now()}-${file.name}`
    const { error } = await supabase.storage
      .from('uploads')
      .upload(filePath, file)

    if (error) {
      toast.error(`Upload failed: ${error.message}`)
      return
    }

    const { data } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath)

    setPublicUrl(data.publicUrl)
    toast.success('File uploaded successfully!')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-4">
      <Card className="w-full max-w-md bg-neutral-900 border border-neutral-800">
        <CardContent className="flex flex-col gap-4 p-6">
          <h1 className="text-2xl font-semibold text-center">Upload File</h1>
          <Input
            type="file"
            onChange={handleFileChange}
            className="bg-neutral-800 text-white border-neutral-700"
          />
          <Button onClick={handleUpload} disabled={!file}>
            Upload
          </Button>

          {publicUrl && (
            <div className="mt-4 text-center">
              <p className="text-sm mb-2">Public URL:</p>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 break-all"
              >
                {publicUrl}
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
