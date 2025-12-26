'use client'

import { Check, Copy, ExternalLink, FileUp, RotateCcw, Upload } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { AffiliateSuggestion } from '@/components/features/ads/AffiliateSuggestion'
import { DragDropZone } from '@/components/features/media/DragDropZone'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ToolSearch } from '@/components/ui/tool-search'
import { supabase } from '@/lib/auth/supabaseClient'
import { css } from '@/styled-system/css'

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
    return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
  }

  return (
    <main
      className={css({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
      })}
    >
      <div
        className={css({
          w: 'full',
          maxW: '1200px',
          spaceY: { base: '6', sm: '8' },
        })}
      >
        {/* Header */}
        <div
          className={css({
            spaceY: { base: '3', sm: '4' },
          })}
        >
          <div
            className={css({
              display: 'flex',
              flexDirection: { base: 'column', sm: 'row' },
              alignItems: { base: 'start', sm: 'center' },
              gap: { base: '3', sm: '4' },
            })}
          >
            <div
              className={css({
                animation: 'pulse 2s infinite',
                rounded: '2xl',
                bg: 'linear-gradient(to bottom right, #2563eb, #0891b2, #1d4ed8)',
                p: { base: '3', sm: '4' },
                shadow: '2xl',
                boxShadow: '0 25px 50px -12px rgba(37, 99, 235, 0.6)',
              })}
            >
              <FileUp
                className={css({
                  h: { base: '7', sm: '8' },
                  w: { base: '7', sm: '8' },
                  color: 'white',
                })}
              />
            </div>
            <div className={css({ spaceY: { base: '1', sm: '2' } })}>
              <h1
                className={css({
                  bgGradient: 'to-r',
                  gradientFrom: 'blue.300',
                  gradientVia: 'cyan.400',
                  gradientTo: 'teal.300',
                  bgClip: 'text',
                  fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
                  fontWeight: 'extrabold',
                  lineHeight: 'tight',
                  color: 'transparent',
                  textShadow: '0 10px 15px rgba(0, 0, 0, 0.3)',
                })}
                style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                File Upload
              </h1>
              <p
                className={css({
                  fontSize: { base: 'sm', sm: 'base', md: 'lg' },
                  color: 'gray.300',
                  lineHeight: 'relaxed',
                })}
              >
                Upload files to cloud storage with instant sharing
              </p>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <Card className="glass-card border-2 border-blue-500/30 shadow-2xl shadow-blue-500/20">
          <CardContent withTopPadding>
            <div
              className={css({
                spaceY: { base: '5', sm: '6' },
                p: { base: '5', sm: '6', md: '8' },
              })}
            >
              {!publicUrl ? (
                <>
                  <DragDropZone
                    onFilesSelected={handleFilesSelected}
                    disabled={uploading}
                    maxSize={10 * 1024 * 1024} // 10MB
                  />

                  {file && (
                    <div
                      className={css({
                        spaceY: { base: '5', sm: '6' },
                      })}
                    >
                      {/* File info */}
                      <div
                        className={css({
                          display: 'flex',
                          flexDirection: { base: 'column', sm: 'row' },
                          alignItems: { base: 'start', sm: 'center' },
                          justifyContent: 'space-between',
                          gap: { base: '4', sm: '0' },
                          rounded: 'xl',
                          border: '2px solid',
                          borderColor: 'cyan.500/30',
                          bg: 'rgba(6, 182, 212, 0.05)',
                          p: { base: '5', sm: '6' },
                          shadow: 'lg',
                          boxShadow: '0 10px 15px rgba(6, 182, 212, 0.2)',
                          backdropFilter: 'blur(16px)',
                        })}
                      >
                        <div className={css({ spaceY: '2', minW: 0, flex: 1 })}>
                          <p
                            className={css({
                              fontSize: { base: 'base', sm: 'lg' },
                              fontWeight: 'semibold',
                              color: 'white',
                              wordBreak: 'break-word',
                            })}
                          >
                            {file.name}
                          </p>
                          <p
                            className={css({
                              fontSize: { base: 'xs', sm: 'sm' },
                              color: 'gray.300',
                            })}
                          >
                            {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                          </p>
                        </div>
                        <Badge
                          variant="info"
                          className={css({
                            flexShrink: 0,
                            bgGradient: 'to-r',
                            gradientFrom: 'blue.500',
                            gradientTo: 'cyan.500',
                            px: { base: '3', sm: '4' },
                            py: { base: '1.5', sm: '2' },
                            fontSize: { base: 'xs', sm: 'sm' },
                            fontWeight: 'semibold',
                            shadow: 'lg',
                          })}
                        >
                          {file.type ? 'Valid' : 'No type'}
                        </Badge>
                      </div>

                      {/* Upload progress */}
                      {uploading && (
                        <div
                          className={css({
                            spaceY: { base: '2', sm: '3' },
                          })}
                        >
                          <Progress value={uploadProgress} showPercentage gradient />
                          <p
                            className={css({
                              textAlign: 'center',
                              fontSize: { base: 'sm', sm: 'base' },
                              fontWeight: 'medium',
                              color: 'cyan.300',
                            })}
                          >
                            Uploading to cloud storage...
                          </p>
                        </div>
                      )}

                      {/* Upload button */}
                      <Button
                        onClick={handleUpload}
                        disabled={uploading}
                        className={css({
                          position: 'relative',
                          w: 'full',
                          overflow: 'hidden',
                          bgGradient: 'to-r',
                          gradientFrom: 'blue.600',
                          gradientVia: 'cyan.600',
                          gradientTo: 'teal.600',
                          px: { base: '6', sm: '8' },
                          py: { base: '6', sm: '7' },
                          fontSize: { base: 'base', sm: 'lg' },
                          fontWeight: 'semibold',
                          shadow: '2xl',
                          boxShadow: '0 25px 50px -12px rgba(37, 99, 235, 0.5)',
                          transition: 'all 0.3s',
                          _hover: {
                            transform: 'scale(1.02)',
                            bgGradient: 'to-r',
                            gradientFrom: 'blue.700',
                            gradientVia: 'cyan.700',
                            gradientTo: 'teal.700',
                            boxShadow: '0 25px 50px -12px rgba(6, 182, 212, 0.6)',
                          },
                          _active: {
                            transform: 'scale(0.98)',
                          },
                        })}
                        size="lg"
                      >
                        {uploading ? (
                          <>
                            <Upload
                              className={css({
                                mr: '2',
                                h: { base: '5', sm: '6' },
                                w: { base: '5', sm: '6' },
                                animation: 'bounce 1s infinite',
                              })}
                            />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload
                              className={css({
                                mr: '2',
                                h: { base: '5', sm: '6' },
                                w: { base: '5', sm: '6' },
                              })}
                            />
                            Upload to Cloud
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                // Success state
                <div
                  className={css({
                    spaceY: { base: '5', sm: '6' },
                    textAlign: 'center',
                  })}
                >
                  <div
                    className={css({
                      mb: { base: '5', sm: '6' },
                      display: 'inline-flex',
                      rounded: 'full',
                      bgGradient: 'to-r',
                      gradientFrom: 'green.500/20',
                      gradientTo: 'emerald.500/20',
                      p: { base: '5', sm: '6' },
                      shadow: '2xl',
                      boxShadow: '0 25px 50px -12px rgba(34, 197, 94, 0.5)',
                    })}
                  >
                    <Check
                      className={css({
                        h: { base: '14', sm: '16' },
                        w: { base: '14', sm: '16' },
                        color: 'green.400',
                      })}
                    />
                  </div>

                  <div className={css({ spaceY: { base: '2', sm: '3' } })}>
                    <h3
                      className={css({
                        bgGradient: 'to-r',
                        gradientFrom: 'green.300',
                        gradientTo: 'emerald.300',
                        bgClip: 'text',
                        fontSize: { base: 'xl', sm: '2xl' },
                        fontWeight: 'bold',
                        color: 'transparent',
                        textShadow: '0 10px 15px rgba(0, 0, 0, 0.3)',
                      })}
                      style={{
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Upload Successful!
                    </h3>
                    <p
                      className={css({
                        fontSize: { base: 'base', sm: 'lg' },
                        color: 'gray.300',
                      })}
                    >
                      Your file is now available via a public URL
                    </p>
                  </div>

                  {/* File details */}
                  <div
                    className={css({
                      rounded: 'xl',
                      border: '2px solid',
                      borderColor: 'green.500/30',
                      bg: 'rgba(34, 197, 94, 0.05)',
                      p: { base: '5', sm: '6' },
                      textAlign: 'left',
                      shadow: 'lg',
                      boxShadow: '0 10px 15px rgba(34, 197, 94, 0.2)',
                      backdropFilter: 'blur(16px)',
                      spaceY: { base: '3', sm: '4' },
                    })}
                  >
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: { base: 'start', sm: 'center' },
                        flexDirection: { base: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        gap: { base: '1', sm: '0' },
                      })}
                    >
                      <span
                        className={css({
                          fontSize: { base: 'xs', sm: 'sm' },
                          fontWeight: 'medium',
                          color: 'gray.300',
                        })}
                      >
                        File name:
                      </span>
                      <span
                        className={css({
                          fontSize: { base: 'xs', sm: 'sm' },
                          fontWeight: 'semibold',
                          color: 'white',
                          wordBreak: 'break-word',
                        })}
                      >
                        {file?.name}
                      </span>
                    </div>
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: { base: 'start', sm: 'center' },
                        flexDirection: { base: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        gap: { base: '1', sm: '0' },
                      })}
                    >
                      <span
                        className={css({
                          fontSize: { base: 'xs', sm: 'sm' },
                          fontWeight: 'medium',
                          color: 'gray.300',
                        })}
                      >
                        Size:
                      </span>
                      <span
                        className={css({
                          fontSize: { base: 'xs', sm: 'sm' },
                          fontWeight: 'semibold',
                          color: 'white',
                        })}
                      >
                        {file && formatFileSize(file.size)}
                      </span>
                    </div>
                  </div>

                  {/* URL display */}
                  <div
                    className={css({
                      spaceY: { base: '3', sm: '4' },
                      rounded: 'xl',
                      border: '2px solid',
                      borderColor: 'blue.500/30',
                      bg: 'rgba(37, 99, 235, 0.05)',
                      p: { base: '5', sm: '6' },
                      shadow: 'lg',
                      boxShadow: '0 10px 15px rgba(37, 99, 235, 0.2)',
                      backdropFilter: 'blur(16px)',
                    })}
                  >
                    <p
                      className={css({
                        textAlign: 'left',
                        fontSize: { base: 'sm', sm: 'base' },
                        fontWeight: 'semibold',
                        color: 'gray.300',
                      })}
                    >
                      Public URL:
                    </p>
                    <div
                      className={css({
                        display: 'flex',
                        flexDirection: { base: 'column', sm: 'row' },
                        alignItems: { base: 'stretch', sm: 'center' },
                        gap: { base: '3', sm: '3' },
                      })}
                    >
                      <input
                        type="text"
                        value={publicUrl}
                        readOnly
                        className={css({
                          flex: 1,
                          rounded: 'xl',
                          border: '2px solid',
                          borderColor: 'cyan.500/50',
                          bg: 'gray.900/80',
                          px: { base: '3', sm: '4' },
                          py: { base: '3', sm: '3' },
                          fontFamily: 'mono',
                          fontSize: { base: 'xs', sm: 'sm' },
                          color: 'white',
                          shadow: 'inner',
                          minH: { base: '12', sm: 'auto' },
                          _focus: {
                            outline: 'none',
                            borderColor: 'cyan.500',
                            ring: '2px',
                            ringColor: 'cyan.500/50',
                          },
                        })}
                      />
                      <div
                        className={css({
                          display: 'flex',
                          gap: '3',
                        })}
                      >
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleCopy}
                          className={css({
                            h: { base: '12', sm: '12' },
                            w: { base: '12', sm: '12' },
                            flexShrink: 0,
                            transition: 'all 0.2s',
                            ...(copied
                              ? {
                                  border: '2px solid',
                                  borderColor: 'green.500',
                                  bg: 'green.500/30',
                                  shadow: 'lg',
                                  boxShadow: '0 10px 15px rgba(34, 197, 94, 0.5)',
                                }
                              : {
                                  border: '2px solid',
                                  borderColor: 'cyan.500/50',
                                  _hover: {
                                    borderColor: 'cyan.500',
                                    bg: 'cyan.500/20',
                                  },
                                }),
                          })}
                        >
                          {copied ? (
                            <Check
                              className={css({
                                h: { base: '5', sm: '5' },
                                w: { base: '5', sm: '5' },
                                color: 'green.400',
                              })}
                            />
                          ) : (
                            <Copy
                              className={css({
                                h: { base: '5', sm: '5' },
                                w: { base: '5', sm: '5' },
                              })}
                            />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                          className={css({
                            h: { base: '12', sm: '12' },
                            w: { base: '12', sm: '12' },
                            flexShrink: 0,
                            border: '2px solid',
                            borderColor: 'blue.500/50',
                            _hover: {
                              borderColor: 'blue.500',
                              bg: 'blue.500/20',
                            },
                          })}
                        >
                          <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink
                              className={css({
                                h: { base: '5', sm: '5' },
                                w: { base: '5', sm: '5' },
                              })}
                            />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Reset button */}
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className={css({
                      w: 'full',
                      border: '2px solid',
                      borderColor: 'purple.500/50',
                      bg: 'purple.500/10',
                      py: { base: '5', sm: '6' },
                      fontSize: { base: 'sm', sm: 'base' },
                      fontWeight: 'semibold',
                      _hover: {
                        borderColor: 'purple.500',
                        bg: 'purple.500/20',
                      },
                    })}
                  >
                    <RotateCcw
                      className={css({
                        mr: '2',
                        h: { base: '4', sm: '5' },
                        w: { base: '4', sm: '5' },
                      })}
                    />
                    Upload Another File
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="glass-card border-2 border-cyan-500/30 shadow-xl shadow-cyan-500/20">
          <CardHeader>
            <div
              className={css({
                spaceY: { base: '2', sm: '3' },
                p: { base: '5', sm: '6' },
              })}
            >
              <CardTitle
                className={css({
                  bgGradient: 'to-r',
                  gradientFrom: 'cyan.300',
                  gradientTo: 'blue.300',
                  bgClip: 'text',
                  fontSize: { base: 'xl', sm: '2xl' },
                  fontWeight: 'bold',
                  color: 'transparent',
                  textShadow: '0 10px 15px rgba(0, 0, 0, 0.3)',
                })}
                style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Upload Information
              </CardTitle>
              <CardDescription
                className={css({
                  fontSize: { base: 'sm', sm: 'base' },
                  color: 'gray.300',
                  lineHeight: 'relaxed',
                })}
              >
                Files are stored securely in cloud storage with instant CDN delivery
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={css({
                p: { base: '5', sm: '6' },
                display: 'grid',
                gridTemplateColumns: { base: '1', sm: 'repeat(3, 1fr)' },
                gap: { base: '4', sm: '5', md: '6' },
                fontSize: { base: 'sm', sm: 'base' },
              })}
            >
              <div
                className={css({
                  rounded: 'lg',
                  border: '2px solid',
                  borderColor: 'purple.500/30',
                  bg: 'purple.500/10',
                  p: { base: '4', sm: '5' },
                  spaceY: { base: '1', sm: '2' },
                  transition: 'all 0.2s',
                  _hover: {
                    borderColor: 'purple.500/50',
                    bg: 'purple.500/15',
                    transform: 'translateY(-2px)',
                  },
                })}
              >
                <p
                  className={css({
                    fontWeight: 'medium',
                    color: 'purple.300',
                    fontSize: { base: 'xs', sm: 'sm' },
                  })}
                >
                  Max file size
                </p>
                <p
                  className={css({
                    fontSize: { base: 'lg', sm: 'xl' },
                    fontWeight: 'bold',
                    color: 'white',
                  })}
                >
                  10 MB
                </p>
              </div>
              <div
                className={css({
                  rounded: 'lg',
                  border: '2px solid',
                  borderColor: 'blue.500/30',
                  bg: 'blue.500/10',
                  p: { base: '4', sm: '5' },
                  spaceY: { base: '1', sm: '2' },
                  transition: 'all 0.2s',
                  _hover: {
                    borderColor: 'blue.500/50',
                    bg: 'blue.500/15',
                    transform: 'translateY(-2px)',
                  },
                })}
              >
                <p
                  className={css({
                    fontWeight: 'medium',
                    color: 'blue.300',
                    fontSize: { base: 'xs', sm: 'sm' },
                  })}
                >
                  Storage
                </p>
                <p
                  className={css({
                    fontSize: { base: 'lg', sm: 'xl' },
                    fontWeight: 'bold',
                    color: 'white',
                  })}
                >
                  Supabase Cloud
                </p>
              </div>
              <div
                className={css({
                  rounded: 'lg',
                  border: '2px solid',
                  borderColor: 'cyan.500/30',
                  bg: 'cyan.500/10',
                  p: { base: '4', sm: '5' },
                  spaceY: { base: '1', sm: '2' },
                  transition: 'all 0.2s',
                  _hover: {
                    borderColor: 'cyan.500/50',
                    bg: 'cyan.500/15',
                    transform: 'translateY(-2px)',
                  },
                })}
              >
                <p
                  className={css({
                    fontWeight: 'medium',
                    color: 'cyan.300',
                    fontSize: { base: 'xs', sm: 'sm' },
                  })}
                >
                  URL Type
                </p>
                <p
                  className={css({
                    fontSize: { base: 'lg', sm: 'xl' },
                    fontWeight: 'bold',
                    color: 'white',
                  })}
                >
                  Public CDN
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Affiliate Suggestions */}
        <AffiliateSuggestion tool="upload" variant="banner" />
      </div>

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}
