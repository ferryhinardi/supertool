'use client'

import { useState, useCallback } from 'react'
import {
  Shield,
  Lock,
  Unlock,
  Copy,
  Download,
  Upload,
  Link as LinkIcon,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react'
import { css } from '@/styled-system/css'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldLabel } from '@/components/ui/field'
import { Progress } from '@/components/ui/progress'
import { DragDropZone } from '@/components/features/DragDropZone'
import {
  encryptText,
  decryptText,
  encryptFile,
  decryptFile,
  calculatePasswordStrength,
  createEncryptedLink,
  parseEncryptedLink,
  formatFileSize,
  type EncryptionResult,
} from './utils'

type Mode = 'text' | 'file' | 'link'
type Action = 'encrypt' | 'decrypt'

export default function EncryptionToolPage() {
  const [mode, setMode] = useState<Mode>('text')
  const [action, setAction] = useState<Action>('encrypt')

  // Text encryption state
  const [inputText, setInputText] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [encryptedData, setEncryptedData] = useState<EncryptionResult | null>(null)
  const [decryptedText, setDecryptedText] = useState('')

  // File encryption state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [encryptedFileData, setEncryptedFileData] = useState<EncryptionResult | null>(null)
  const [decryptedFileData, setDecryptedFileData] = useState<ArrayBuffer | null>(null)
  const [originalFileName, setOriginalFileName] = useState('')

  // Link decryption state
  const [encryptedLink, setEncryptedLink] = useState('')

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const passwordStrength = calculatePasswordStrength(password)

  // Handle text encryption
  const handleEncryptText = async () => {
    setError('')
    if (!inputText) {
      setError('Please enter text to encrypt')
      return
    }
    if (!password) {
      setError('Please enter a password')
      return
    }

    setLoading(true)
    try {
      const result = await encryptText(inputText, password)
      setEncryptedData(result)
      setInputText('')
      setDecryptedText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Encryption failed')
    } finally {
      setLoading(false)
    }
  }

  // Handle text decryption
  const handleDecryptText = async () => {
    setError('')
    if (!encryptedData) {
      setError('No encrypted data available')
      return
    }
    if (!password) {
      setError('Please enter the password')
      return
    }

    setLoading(true)
    try {
      const result = await decryptText(
        encryptedData.encrypted,
        encryptedData.iv,
        encryptedData.salt,
        password
      )
      setDecryptedText(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Decryption failed')
    } finally {
      setLoading(false)
    }
  }

  // Handle file encryption
  const handleEncryptFile = async () => {
    setError('')
    if (!selectedFile) {
      setError('Please select a file')
      return
    }
    if (!password) {
      setError('Please enter a password')
      return
    }

    setLoading(true)
    try {
      const arrayBuffer = await selectedFile.arrayBuffer()
      const result = await encryptFile(arrayBuffer, password)
      setEncryptedFileData(result)
      setOriginalFileName(selectedFile.name)
      setDecryptedFileData(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'File encryption failed')
    } finally {
      setLoading(false)
    }
  }

  // Handle file decryption
  const handleDecryptFile = async () => {
    setError('')
    if (!encryptedFileData) {
      setError('No encrypted file data available')
      return
    }
    if (!password) {
      setError('Please enter the password')
      return
    }

    setLoading(true)
    try {
      const result = await decryptFile(
        encryptedFileData.encrypted,
        encryptedFileData.iv,
        encryptedFileData.salt,
        password
      )
      setDecryptedFileData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'File decryption failed')
    } finally {
      setLoading(false)
    }
  }

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList) => {
    if (files.length > 0) {
      setSelectedFile(files[0])
      setError('')
      setEncryptedFileData(null)
      setDecryptedFileData(null)
    }
  }, [])

  // Handle link decryption
  const handleDecryptFromLink = async () => {
    setError('')
    const parsedData = parseEncryptedLink(encryptedLink)
    if (!parsedData) {
      setError('Invalid encrypted link')
      return
    }
    if (!password) {
      setError('Please enter the password')
      return
    }

    setLoading(true)
    try {
      const result = await decryptText(
        parsedData.encrypted,
        parsedData.iv,
        parsedData.salt,
        password
      )
      setDecryptedText(result)
      setEncryptedData(parsedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Decryption failed')
    } finally {
      setLoading(false)
    }
  }

  // Copy to clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Download encrypted file
  const handleDownloadEncrypted = () => {
    if (!encryptedFileData) return

    const data = JSON.stringify(encryptedFileData)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${originalFileName}.encrypted.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Download decrypted file
  const handleDownloadDecrypted = () => {
    if (!decryptedFileData) return

    const blob = new Blob([decryptedFileData])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = originalFileName
    a.click()
    URL.revokeObjectURL(url)
  }

  // Reset all state
  const handleReset = () => {
    setInputText('')
    setPassword('')
    setEncryptedData(null)
    setDecryptedText('')
    setSelectedFile(null)
    setEncryptedFileData(null)
    setDecryptedFileData(null)
    setOriginalFileName('')
    setEncryptedLink('')
    setError('')
    setCopied(false)
  }

  return (
    <div className={css({ maxW: '6xl', mx: 'auto', py: { base: 8, md: 12 }, px: 4 })}>
      <div className={css({ display: 'flex', flexDir: 'column', gap: 8 })}>
        {/* Header */}
        <div className={css({ textAlign: 'center' })}>
          <div className={css({ display: 'flex', justifyContent: 'center', mb: 4 })}>
            <Shield className={css({ w: 10, h: 10, color: 'indigo.500' })} />
          </div>
          <h1 className={css({ fontSize: '3xl', fontWeight: 'bold', mb: 2 })}>
            Encryption & Decryption Tool
          </h1>
          <p className={css({ color: 'gray.600', maxW: '2xl', mx: 'auto' })}>
            Secure your data with AES-256-GCM encryption. All encryption happens in your browser -
            nothing is sent to any server.
          </p>
        </div>

        {/* Mode Selection */}
        <Card>
          <CardContent className={css({ pt: 6 })}>
            <div
              className={css({
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
                flexWrap: 'wrap',
              })}
            >
              <Button
                variant={mode === 'text' ? 'default' : 'outline'}
                onClick={() => {
                  setMode('text')
                  handleReset()
                }}
              >
                <Lock className={css({ w: 4, h: 4, mr: 2 })} />
                Text
              </Button>
              <Button
                variant={mode === 'file' ? 'default' : 'outline'}
                onClick={() => {
                  setMode('file')
                  handleReset()
                }}
              >
                <Upload className={css({ w: 4, h: 4, mr: 2 })} />
                File
              </Button>
              <Button
                variant={mode === 'link' ? 'default' : 'outline'}
                onClick={() => {
                  setMode('link')
                  handleReset()
                }}
              >
                <LinkIcon className={css({ w: 4, h: 4, mr: 2 })} />
                Decrypt Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Text Mode */}
        {mode === 'text' && (
          <Card>
            <CardContent className={css({ pt: 6 })}>
              <div className={css({ display: 'flex', flexDir: 'column', gap: 4 })}>
                {/* Action Selection */}
                <div className={css({ display: 'flex', gap: 2, justifyContent: 'center' })}>
                  <Button
                    size="sm"
                    variant={action === 'encrypt' ? 'default' : 'ghost'}
                    onClick={() => setAction('encrypt')}
                  >
                    Encrypt
                  </Button>
                  <Button
                    size="sm"
                    variant={action === 'decrypt' ? 'default' : 'ghost'}
                    onClick={() => setAction('decrypt')}
                    disabled={!encryptedData}
                  >
                    Decrypt
                  </Button>
                </div>

                {/* Input Text */}
                {action === 'encrypt' && (
                  <Field>
                    <FieldLabel>Text to Encrypt</FieldLabel>
                    <Textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Enter text to encrypt..."
                      rows={6}
                    />
                  </Field>
                )}

                {/* Password Input */}
                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <div className={css({ position: 'relative' })}>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter a strong password"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className={css({
                        position: 'absolute',
                        right: 2,
                        top: '50%',
                        transform: 'translateY(-50%)',
                      })}
                    >
                      {showPassword ? (
                        <EyeOff className={css({ w: 4, h: 4 })} />
                      ) : (
                        <Eye className={css({ w: 4, h: 4 })} />
                      )}
                    </Button>
                  </div>
                </Field>

                {/* Password Strength */}
                {password && (
                  <div>
                    <div
                      className={css({ display: 'flex', justifyContent: 'space-between', mb: 2 })}
                    >
                      <span className={css({ fontSize: 'sm', fontWeight: 'medium' })}>
                        Password Strength:
                      </span>
                      <span
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'bold',
                          color: passwordStrength.color,
                        })}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <Progress value={passwordStrength.score * 25} />
                    {passwordStrength.suggestions.length > 0 && (
                      <div className={css({ mt: 2 })}>
                        {passwordStrength.suggestions.map((suggestion, i) => (
                          <p key={i} className={css({ fontSize: 'xs', color: 'gray.600' })}>
                            • {suggestion}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div
                    className={css({
                      p: 3,
                      borderRadius: 'md',
                      bg: 'red.50',
                      borderWidth: 1,
                      borderColor: 'red.200',
                    })}
                  >
                    <div className={css({ display: 'flex', gap: 2, alignItems: 'center' })}>
                      <AlertCircle className={css({ w: 4, h: 4, color: 'red.500' })} />
                      <span className={css({ fontSize: 'sm', color: 'red.700' })}>{error}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className={css({ display: 'flex', gap: 2, justifyContent: 'center' })}>
                  {action === 'encrypt' ? (
                    <Button onClick={handleEncryptText} disabled={loading}>
                      <Lock className={css({ w: 4, h: 4, mr: 2 })} />
                      Encrypt Text
                    </Button>
                  ) : (
                    <Button onClick={handleDecryptText} disabled={loading}>
                      <Unlock className={css({ w: 4, h: 4, mr: 2 })} />
                      Decrypt Text
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                </div>

                {/* Encrypted Result */}
                {encryptedData && (
                  <div
                    className={css({
                      p: 4,
                      borderRadius: 'md',
                      bg: 'green.50',
                      borderWidth: 1,
                      borderColor: 'green.200',
                    })}
                  >
                    <p className={css({ fontWeight: 'bold', mb: 2, color: 'green.700' })}>
                      ✓ Text Encrypted Successfully
                    </p>
                    <p className={css({ fontSize: 'sm', color: 'gray.600', mb: 3 })}>
                      Keep this password safe. You&apos;ll need it to decrypt your data.
                    </p>
                    <div className={css({ display: 'flex', gap: 2, flexWrap: 'wrap' })}>
                      <Button size="sm" onClick={() => handleCopy(JSON.stringify(encryptedData))}>
                        <Copy className={css({ w: 3, h: 3, mr: 2 })} />
                        {copied ? 'Copied!' : 'Copy Encrypted Data'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(createEncryptedLink(encryptedData))}
                      >
                        <LinkIcon className={css({ w: 3, h: 3, mr: 2 })} />
                        Copy Shareable Link
                      </Button>
                    </div>
                  </div>
                )}

                {/* Decrypted Result */}
                {decryptedText && (
                  <div
                    className={css({
                      p: 4,
                      borderRadius: 'md',
                      bg: 'blue.50',
                      borderWidth: 1,
                      borderColor: 'blue.200',
                    })}
                  >
                    <p className={css({ fontWeight: 'bold', mb: 2, color: 'blue.700' })}>
                      ✓ Text Decrypted Successfully
                    </p>
                    <Textarea value={decryptedText} rows={6} readOnly />
                    <Button
                      size="sm"
                      onClick={() => handleCopy(decryptedText)}
                      className={css({ mt: 2 })}
                    >
                      <Copy className={css({ w: 3, h: 3, mr: 2 })} />
                      Copy Decrypted Text
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* File Mode */}
        {mode === 'file' && (
          <Card>
            <CardContent className={css({ pt: 6 })}>
              <div className={css({ display: 'flex', flexDir: 'column', gap: 4 })}>
                {/* Action Selection */}
                <div className={css({ display: 'flex', gap: 2, justifyContent: 'center' })}>
                  <Button
                    size="sm"
                    variant={action === 'encrypt' ? 'default' : 'ghost'}
                    onClick={() => setAction('encrypt')}
                  >
                    Encrypt
                  </Button>
                  <Button
                    size="sm"
                    variant={action === 'decrypt' ? 'default' : 'ghost'}
                    onClick={() => setAction('decrypt')}
                    disabled={!encryptedFileData}
                  >
                    Decrypt
                  </Button>
                </div>

                {/* File Upload */}
                {action === 'encrypt' && !selectedFile && (
                  <DragDropZone onFilesSelected={handleFileSelect} multiple={false} />
                )}

                {/* Selected File Info */}
                {selectedFile && action === 'encrypt' && (
                  <div
                    className={css({
                      p: 4,
                      borderRadius: 'md',
                      bg: 'gray.50',
                      borderWidth: 1,
                      borderColor: 'gray.200',
                    })}
                  >
                    <p className={css({ fontWeight: 'medium', mb: 1 })}>{selectedFile.name}</p>
                    <p className={css({ fontSize: 'sm', color: 'gray.600' })}>
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                )}

                {/* Password Input */}
                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <div className={css({ position: 'relative' })}>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter a strong password"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className={css({
                        position: 'absolute',
                        right: 2,
                        top: '50%',
                        transform: 'translateY(-50%)',
                      })}
                    >
                      {showPassword ? (
                        <EyeOff className={css({ w: 4, h: 4 })} />
                      ) : (
                        <Eye className={css({ w: 4, h: 4 })} />
                      )}
                    </Button>
                  </div>
                </Field>

                {/* Password Strength */}
                {password && (
                  <div>
                    <div
                      className={css({ display: 'flex', justifyContent: 'space-between', mb: 2 })}
                    >
                      <span className={css({ fontSize: 'sm', fontWeight: 'medium' })}>
                        Password Strength:
                      </span>
                      <span
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'bold',
                          color: passwordStrength.color,
                        })}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <Progress value={passwordStrength.score * 25} />
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div
                    className={css({
                      p: 3,
                      borderRadius: 'md',
                      bg: 'red.50',
                      borderWidth: 1,
                      borderColor: 'red.200',
                    })}
                  >
                    <div className={css({ display: 'flex', gap: 2, alignItems: 'center' })}>
                      <AlertCircle className={css({ w: 4, h: 4, color: 'red.500' })} />
                      <span className={css({ fontSize: 'sm', color: 'red.700' })}>{error}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className={css({ display: 'flex', gap: 2, justifyContent: 'center' })}>
                  {action === 'encrypt' ? (
                    <Button onClick={handleEncryptFile} disabled={loading}>
                      <Lock className={css({ w: 4, h: 4, mr: 2 })} />
                      Encrypt File
                    </Button>
                  ) : (
                    <Button onClick={handleDecryptFile} disabled={loading}>
                      <Unlock className={css({ w: 4, h: 4, mr: 2 })} />
                      Decrypt File
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                </div>

                {/* Encrypted File Result */}
                {encryptedFileData && (
                  <div
                    className={css({
                      p: 4,
                      borderRadius: 'md',
                      bg: 'green.50',
                      borderWidth: 1,
                      borderColor: 'green.200',
                    })}
                  >
                    <p className={css({ fontWeight: 'bold', mb: 2, color: 'green.700' })}>
                      ✓ File Encrypted Successfully
                    </p>
                    <p className={css({ fontSize: 'sm', color: 'gray.600', mb: 3 })}>
                      Download the encrypted file and keep your password safe.
                    </p>
                    <Button size="sm" onClick={handleDownloadEncrypted}>
                      <Download className={css({ w: 3, h: 3, mr: 2 })} />
                      Download Encrypted File
                    </Button>
                  </div>
                )}

                {/* Decrypted File Result */}
                {decryptedFileData && (
                  <div
                    className={css({
                      p: 4,
                      borderRadius: 'md',
                      bg: 'blue.50',
                      borderWidth: 1,
                      borderColor: 'blue.200',
                    })}
                  >
                    <p className={css({ fontWeight: 'bold', mb: 2, color: 'blue.700' })}>
                      ✓ File Decrypted Successfully
                    </p>
                    <Button size="sm" onClick={handleDownloadDecrypted}>
                      <Download className={css({ w: 3, h: 3, mr: 2 })} />
                      Download Decrypted File
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Link Decryption Mode */}
        {mode === 'link' && (
          <Card>
            <CardContent className={css({ pt: 6 })}>
              <div className={css({ display: 'flex', flexDir: 'column', gap: 4 })}>
                <Field>
                  <FieldLabel>Encrypted Link</FieldLabel>
                  <Textarea
                    value={encryptedLink}
                    onChange={(e) => setEncryptedLink(e.target.value)}
                    placeholder="Paste the encrypted link here..."
                    rows={3}
                  />
                </Field>

                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <div className={css({ position: 'relative' })}>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter the password"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className={css({
                        position: 'absolute',
                        right: 2,
                        top: '50%',
                        transform: 'translateY(-50%)',
                      })}
                    >
                      {showPassword ? (
                        <EyeOff className={css({ w: 4, h: 4 })} />
                      ) : (
                        <Eye className={css({ w: 4, h: 4 })} />
                      )}
                    </Button>
                  </div>
                </Field>

                {/* Error Display */}
                {error && (
                  <div
                    className={css({
                      p: 3,
                      borderRadius: 'md',
                      bg: 'red.50',
                      borderWidth: 1,
                      borderColor: 'red.200',
                    })}
                  >
                    <div className={css({ display: 'flex', gap: 2, alignItems: 'center' })}>
                      <AlertCircle className={css({ w: 4, h: 4, color: 'red.500' })} />
                      <span className={css({ fontSize: 'sm', color: 'red.700' })}>{error}</span>
                    </div>
                  </div>
                )}

                <div className={css({ display: 'flex', gap: 2, justifyContent: 'center' })}>
                  <Button onClick={handleDecryptFromLink} disabled={loading}>
                    <Unlock className={css({ w: 4, h: 4, mr: 2 })} />
                    Decrypt Link
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                </div>

                {/* Decrypted Result */}
                {decryptedText && (
                  <div
                    className={css({
                      p: 4,
                      borderRadius: 'md',
                      bg: 'blue.50',
                      borderWidth: 1,
                      borderColor: 'blue.200',
                    })}
                  >
                    <p className={css({ fontWeight: 'bold', mb: 2, color: 'blue.700' })}>
                      ✓ Link Decrypted Successfully
                    </p>
                    <Textarea value={decryptedText} rows={6} readOnly />
                    <Button
                      size="sm"
                      onClick={() => handleCopy(decryptedText)}
                      className={css({ mt: 2 })}
                    >
                      <Copy className={css({ w: 3, h: 3, mr: 2 })} />
                      Copy Decrypted Text
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card>
          <CardHeader>
            <CardTitle>Security Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul
              className={css({
                fontSize: 'sm',
                color: 'gray.600',
                pl: 5,
                display: 'flex',
                flexDir: 'column',
                gap: 2,
              })}
            >
              <li>AES-256-GCM encryption (military-grade)</li>
              <li>PBKDF2 key derivation with 100,000 iterations</li>
              <li>Client-side only - nothing sent to servers</li>
              <li>Random initialization vectors for each encryption</li>
              <li>Password strength meter with recommendations</li>
              <li>Shareable encrypted links for secure messaging</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
