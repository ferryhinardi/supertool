'use client'

import {
  Book,
  BookOpen,
  Check,
  Copy,
  FileBarChart,
  FileText,
  Globe,
  GraduationCap,
  Newspaper,
  Plus,
  Trash2,
  Users,
  Video,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import {
  type Author,
  CITATION_STYLES,
  type CitationResult,
  type CitationStyleId,
  createEmptySourceData,
  formatCitationAsPlainText,
  formatCitationWithHtml,
  generateCitation,
  getFieldLabel,
  getFieldPlaceholder,
  isFieldRequired,
  SOURCE_TYPES,
  type SourceData,
  type SourceTypeId,
  validateSourceData,
} from './utils'

// Icon mapping for source types
const SOURCE_TYPE_ICONS: Record<SourceTypeId, typeof Book> = {
  book: Book,
  journal: FileText,
  website: Globe,
  newspaper: Newspaper,
  video: Video,
  conference: Users,
  thesis: GraduationCap,
  report: FileBarChart,
  chapter: BookOpen,
}

export default function CitationGeneratorPage() {
  const [sourceType, setSourceType] = useState<SourceTypeId>('book')
  const [citationStyle, setCitationStyle] = useState<CitationStyleId>('apa')
  const [sourceData, setSourceData] = useState<SourceData>(createEmptySourceData('book'))
  const [citationResult, setCitationResult] = useState<CitationResult | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [copySuccess, setCopySuccess] = useState<'full' | 'intext' | null>(null)
  const [showPlainText, setShowPlainText] = useState(false)

  // Get current source type config
  const sourceTypeConfig = SOURCE_TYPES[sourceType]

  // Handle source type change
  const handleSourceTypeChange = (newType: SourceTypeId) => {
    setSourceType(newType)
    setSourceData(createEmptySourceData(newType))
    setCitationResult(null)
    setErrors([])
    trackToolEvent('citation_source_type_changed', { sourceType: newType })
  }

  // Handle citation style change
  const handleStyleChange = (newStyle: CitationStyleId) => {
    setCitationStyle(newStyle)
    // Regenerate citation if we have valid data
    if (citationResult) {
      const result = generateCitation({ ...sourceData, sourceType }, newStyle)
      setCitationResult(result)
    }
    trackToolEvent('citation_style_changed', { style: newStyle })
  }

  // Handle field change
  const handleFieldChange = (field: keyof SourceData, value: string) => {
    setSourceData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle author change
  const handleAuthorChange = (index: number, field: keyof Author, value: string) => {
    setSourceData((prev) => {
      const newAuthors = [...prev.authors]
      newAuthors[index] = { ...newAuthors[index], [field]: value }
      return { ...prev, authors: newAuthors }
    })
  }

  // Add author
  const handleAddAuthor = () => {
    setSourceData((prev) => ({
      ...prev,
      authors: [...prev.authors, { firstName: '', lastName: '' }],
    }))
  }

  // Remove author
  const handleRemoveAuthor = (index: number) => {
    setSourceData((prev) => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index),
    }))
  }

  // Handle editor change (for book chapters)
  const handleEditorChange = (index: number, field: keyof Author, value: string) => {
    setSourceData((prev) => {
      const newEditors = [...(prev.editors || [])]
      newEditors[index] = { ...newEditors[index], [field]: value }
      return { ...prev, editors: newEditors }
    })
  }

  // Add editor
  const handleAddEditor = () => {
    setSourceData((prev) => ({
      ...prev,
      editors: [...(prev.editors || []), { firstName: '', lastName: '' }],
    }))
  }

  // Remove editor
  const handleRemoveEditor = (index: number) => {
    setSourceData((prev) => ({
      ...prev,
      editors: (prev.editors || []).filter((_, i) => i !== index),
    }))
  }

  // Generate citation
  const handleGenerate = useCallback(() => {
    const data = { ...sourceData, sourceType }
    const validationErrors = validateSourceData(data)

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      setCitationResult(null)
      return
    }

    setErrors([])
    const result = generateCitation(data, citationStyle)
    setCitationResult(result)

    trackToolEvent('citation_generated', {
      style: citationStyle,
      sourceType,
    })
  }, [sourceData, sourceType, citationStyle])

  // Copy citation
  const handleCopy = async (type: 'full' | 'intext') => {
    if (!citationResult) return

    const text =
      type === 'full'
        ? formatCitationAsPlainText(citationResult.fullCitation)
        : citationResult.inTextCitation

    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(type)
      setTimeout(() => setCopySuccess(null), 2000)

      trackToolEvent('citation_copied', {
        type,
        style: citationStyle,
        sourceType,
      })
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Render field based on type
  const renderField = (field: string) => {
    if (field === 'authors') {
      return (
        <div key={field} className={css({ spaceY: 3 })}>
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            })}
          >
            {/* biome-ignore lint/a11y/noLabelWithoutControl: Section header for dynamic author fields */}
            <label className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
              {getFieldLabel(field)}
            </label>
            <button
              type="button"
              onClick={handleAddAuthor}
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                fontSize: 'xs',
                rounded: 'md',
                bg: 'indigo.600',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                _hover: { bg: 'indigo.500' },
              })}
            >
              <Plus className={css({ w: 3, h: 3 })} />
              Add Author
            </button>
          </div>
          {sourceData.authors.length === 0 ? (
            <p className={css({ fontSize: 'sm', color: 'gray.500', fontStyle: 'italic' })}>
              No authors added. Click &quot;Add Author&quot; to add one.
            </p>
          ) : (
            <div className={css({ spaceY: 2 })}>
              {sourceData.authors.map((author, index) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: Authors array uses index as key because items don't have stable unique IDs
                  key={index}
                  className={css({
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    p: 3,
                    bg: 'gray.900',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.800',
                  })}
                >
                  <input
                    type="text"
                    value={author.firstName}
                    onChange={(e) => handleAuthorChange(index, 'firstName', e.target.value)}
                    placeholder="First Name"
                    className={css({
                      flex: 1,
                      p: 2,
                      fontSize: 'sm',
                      bg: 'gray.800',
                      color: 'white',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      rounded: 'md',
                      outline: 'none',
                      _focus: { borderColor: 'indigo.500' },
                      _placeholder: { color: 'gray.500' },
                    })}
                  />
                  <input
                    type="text"
                    value={author.middleName || ''}
                    onChange={(e) => handleAuthorChange(index, 'middleName', e.target.value)}
                    placeholder="Middle (opt.)"
                    className={css({
                      w: '100px',
                      p: 2,
                      fontSize: 'sm',
                      bg: 'gray.800',
                      color: 'white',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      rounded: 'md',
                      outline: 'none',
                      _focus: { borderColor: 'indigo.500' },
                      _placeholder: { color: 'gray.500' },
                    })}
                  />
                  <input
                    type="text"
                    value={author.lastName}
                    onChange={(e) => handleAuthorChange(index, 'lastName', e.target.value)}
                    placeholder="Last Name"
                    className={css({
                      flex: 1,
                      p: 2,
                      fontSize: 'sm',
                      bg: 'gray.800',
                      color: 'white',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      rounded: 'md',
                      outline: 'none',
                      _focus: { borderColor: 'indigo.500' },
                      _placeholder: { color: 'gray.500' },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAuthor(index)}
                    className={css({
                      p: 2,
                      rounded: 'md',
                      bg: 'red.900',
                      color: 'red.300',
                      border: 'none',
                      cursor: 'pointer',
                      _hover: { bg: 'red.800' },
                    })}
                  >
                    <Trash2 className={css({ w: 4, h: 4 })} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (field === 'editors') {
      return (
        <div key={field} className={css({ spaceY: 3 })}>
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            })}
          >
            {/* biome-ignore lint/a11y/noLabelWithoutControl: Section header for dynamic editor fields */}
            <label className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
              {getFieldLabel(field)}
            </label>
            <button
              type="button"
              onClick={handleAddEditor}
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                fontSize: 'xs',
                rounded: 'md',
                bg: 'indigo.600',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                _hover: { bg: 'indigo.500' },
              })}
            >
              <Plus className={css({ w: 3, h: 3 })} />
              Add Editor
            </button>
          </div>
          {!sourceData.editors || sourceData.editors.length === 0 ? (
            <p className={css({ fontSize: 'sm', color: 'gray.500', fontStyle: 'italic' })}>
              No editors added. Click &quot;Add Editor&quot; to add one.
            </p>
          ) : (
            <div className={css({ spaceY: 2 })}>
              {sourceData.editors?.map((editor, index) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: Editors array uses index as key because items don't have stable unique IDs
                  key={index}
                  className={css({
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    p: 3,
                    bg: 'gray.900',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.800',
                  })}
                >
                  <input
                    type="text"
                    value={editor.firstName}
                    onChange={(e) => handleEditorChange(index, 'firstName', e.target.value)}
                    placeholder="First Name"
                    className={css({
                      flex: 1,
                      p: 2,
                      fontSize: 'sm',
                      bg: 'gray.800',
                      color: 'white',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      rounded: 'md',
                      outline: 'none',
                      _focus: { borderColor: 'indigo.500' },
                      _placeholder: { color: 'gray.500' },
                    })}
                  />
                  <input
                    type="text"
                    value={editor.lastName}
                    onChange={(e) => handleEditorChange(index, 'lastName', e.target.value)}
                    placeholder="Last Name"
                    className={css({
                      flex: 1,
                      p: 2,
                      fontSize: 'sm',
                      bg: 'gray.800',
                      color: 'white',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      rounded: 'md',
                      outline: 'none',
                      _focus: { borderColor: 'indigo.500' },
                      _placeholder: { color: 'gray.500' },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveEditor(index)}
                    className={css({
                      p: 2,
                      rounded: 'md',
                      bg: 'red.900',
                      color: 'red.300',
                      border: 'none',
                      cursor: 'pointer',
                      _hover: { bg: 'red.800' },
                    })}
                  >
                    <Trash2 className={css({ w: 4, h: 4 })} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (field === 'thesisType') {
      return (
        <div key={field} className={css({ spaceY: 2 })}>
          <label
            htmlFor="thesis-type-select"
            className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
          >
            {getFieldLabel(field)}
          </label>
          <select
            id="thesis-type-select"
            value={sourceData.thesisType || 'doctoral'}
            onChange={(e) =>
              handleFieldChange(
                'thesisType',
                e.target.value as 'doctoral' | 'masters' | 'bachelors'
              )
            }
            className={css({
              w: 'full',
              p: 3,
              fontSize: 'md',
              bg: 'gray.900',
              color: 'white',
              border: '1px solid',
              borderColor: 'gray.700',
              rounded: 'lg',
              outline: 'none',
              cursor: 'pointer',
              _focus: { borderColor: 'indigo.500' },
            })}
          >
            <option value="doctoral">Doctoral Dissertation</option>
            <option value="masters">Master&apos;s Thesis</option>
            <option value="bachelors">Bachelor&apos;s Thesis</option>
          </select>
        </div>
      )
    }

    // Date fields
    if (field === 'accessDate' || field === 'publishDate') {
      return (
        <div key={field} className={css({ spaceY: 2 })}>
          <label
            htmlFor={`${field}-input`}
            className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
          >
            {getFieldLabel(field)}
            {isFieldRequired(sourceType, field) && (
              <span className={css({ color: 'red.400', ml: 1 })}>*</span>
            )}
          </label>
          <input
            id={`${field}-input`}
            type="date"
            value={(sourceData[field as keyof SourceData] as string) || ''}
            onChange={(e) => handleFieldChange(field as keyof SourceData, e.target.value)}
            className={css({
              w: 'full',
              p: 3,
              fontSize: 'md',
              bg: 'gray.900',
              color: 'white',
              border: '1px solid',
              borderColor: 'gray.700',
              rounded: 'lg',
              outline: 'none',
              _focus: { borderColor: 'indigo.500' },
            })}
          />
        </div>
      )
    }

    // Default text input
    return (
      <div key={field} className={css({ spaceY: 2 })}>
        <label
          htmlFor={`${field}-input`}
          className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
        >
          {getFieldLabel(field)}
          {isFieldRequired(sourceType, field) && (
            <span className={css({ color: 'red.400', ml: 1 })}>*</span>
          )}
        </label>
        <input
          id={`${field}-input`}
          type="text"
          value={(sourceData[field as keyof SourceData] as string) || ''}
          onChange={(e) => handleFieldChange(field as keyof SourceData, e.target.value)}
          placeholder={getFieldPlaceholder(field)}
          className={css({
            w: 'full',
            p: 3,
            fontSize: 'md',
            bg: 'gray.900',
            color: 'white',
            border: '1px solid',
            borderColor: 'gray.700',
            rounded: 'lg',
            outline: 'none',
            _focus: { borderColor: 'indigo.500' },
            _placeholder: { color: 'gray.500' },
          })}
        />
      </div>
    )
  }

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '7xl',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '6', sm: '8', md: '10' },
      })}
    >
      {/* Header */}
      <div className={css({ spaceY: 4, textAlign: 'center' })}>
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
          })}
        >
          <BookOpen className={css({ w: 10, h: 10, color: 'indigo.400' })} />
          <h1
            className={css({
              fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
              fontWeight: 'bold',
              bgGradient: 'to-r',
              gradientFrom: 'indigo.500',
              gradientTo: 'purple.500',
              bgClip: 'text',
              color: 'transparent',
            })}
          >
            Citation Generator
          </h1>
        </div>
        <p
          className={css({
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
            maxW: '3xl',
            mx: 'auto',
          })}
        >
          Generate accurate citations in APA, MLA, Chicago, Harvard, IEEE, and Vancouver formats for
          books, journals, websites, and more.
        </p>
      </div>

      {/* Main Content */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: '1fr 1fr' },
          gap: { base: 6, lg: 8 },
          alignItems: 'start',
        })}
      >
        {/* Left Panel - Input Form */}
        <div className={css({ spaceY: 6 })}>
          {/* Source Type Selector */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'xl',
              p: { base: 4, sm: 6 },
              spaceY: 4,
            })}
          >
            <h2 className={css({ fontSize: 'xl', fontWeight: 'semibold', color: 'white' })}>
              Source Type
            </h2>
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
                gap: 2,
              })}
            >
              {Object.entries(SOURCE_TYPES).map(([key, config]) => {
                const typeId = key as SourceTypeId
                const Icon = SOURCE_TYPE_ICONS[typeId]
                const isSelected = sourceType === typeId

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSourceTypeChange(typeId)}
                    className={css({
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                      p: 3,
                      rounded: 'lg',
                      bg: isSelected ? 'indigo.600' : 'gray.900',
                      color: isSelected ? 'white' : 'gray.300',
                      border: '2px solid',
                      borderColor: isSelected ? 'indigo.500' : 'gray.800',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      _hover: {
                        bg: isSelected ? 'indigo.500' : 'gray.800',
                        borderColor: isSelected ? 'indigo.400' : 'gray.700',
                      },
                    })}
                  >
                    <Icon className={css({ w: 5, h: 5 })} />
                    <span
                      className={css({ fontSize: 'xs', fontWeight: 'medium', textAlign: 'center' })}
                    >
                      {config.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Citation Style Selector */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'xl',
              p: { base: 4, sm: 6 },
              spaceY: 4,
            })}
          >
            <h2 className={css({ fontSize: 'xl', fontWeight: 'semibold', color: 'white' })}>
              Citation Style
            </h2>
            <div className={css({ display: 'flex', gap: 2, flexWrap: 'wrap' })}>
              {Object.entries(CITATION_STYLES).map(([key, config]) => {
                const styleId = key as CitationStyleId
                const isSelected = citationStyle === styleId

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleStyleChange(styleId)}
                    className={css({
                      px: 4,
                      py: 2,
                      rounded: 'lg',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      bg: isSelected ? 'purple.600' : 'gray.900',
                      color: isSelected ? 'white' : 'gray.300',
                      border: '1px solid',
                      borderColor: isSelected ? 'purple.500' : 'gray.700',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      _hover: {
                        bg: isSelected ? 'purple.500' : 'gray.800',
                      },
                    })}
                  >
                    {config.name}
                  </button>
                )
              })}
            </div>
            <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
              {CITATION_STYLES[citationStyle].description}
            </p>
          </div>

          {/* Dynamic Form Fields */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'xl',
              p: { base: 4, sm: 6 },
              spaceY: 4,
            })}
          >
            <h2 className={css({ fontSize: 'xl', fontWeight: 'semibold', color: 'white' })}>
              Source Details
            </h2>
            <div className={css({ spaceY: 4 })}>
              {sourceTypeConfig.fields.map((field) => renderField(field))}
            </div>

            {/* Error Messages */}
            {errors.length > 0 && (
              <div
                className={css({
                  p: 3,
                  bg: 'red.900',
                  border: '1px solid',
                  borderColor: 'red.700',
                  rounded: 'lg',
                })}
              >
                {errors.map((error, index) => (
                  <p
                    // biome-ignore lint/suspicious/noArrayIndexKey: Errors array uses index as key because error messages may not be unique
                    key={index}
                    className={css({ fontSize: 'sm', color: 'red.300' })}
                  >
                    {error}
                  </p>
                ))}
              </div>
            )}

            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGenerate}
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                w: 'full',
                p: 4,
                fontSize: 'lg',
                fontWeight: 'semibold',
                rounded: 'lg',
                bg: 'indigo.600',
                color: 'white',
                border: '1px solid',
                borderColor: 'indigo.500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                _hover: { bg: 'indigo.500' },
              })}
            >
              <BookOpen className={css({ w: 5, h: 5 })} />
              Generate Citation
            </button>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className={css({ spaceY: 6 })}>
          {/* Citation Result */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'xl',
              p: { base: 4, sm: 6 },
              spaceY: 4,
            })}
          >
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              })}
            >
              <h2 className={css({ fontSize: 'xl', fontWeight: 'semibold', color: 'white' })}>
                Full Citation
              </h2>
              {citationResult && (
                <button
                  type="button"
                  onClick={() => setShowPlainText(!showPlainText)}
                  className={css({
                    px: 3,
                    py: 1,
                    fontSize: 'xs',
                    rounded: 'md',
                    bg: 'gray.800',
                    color: 'gray.300',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    cursor: 'pointer',
                    _hover: { bg: 'gray.700' },
                  })}
                >
                  {showPlainText ? 'Show Formatted' : 'Show Plain Text'}
                </button>
              )}
            </div>

            {citationResult ? (
              <>
                <div
                  className={css({
                    p: 4,
                    bg: 'gray.900',
                    border: '1px solid',
                    borderColor: 'gray.800',
                    rounded: 'lg',
                  })}
                >
                  {showPlainText ? (
                    <p
                      className={css({
                        fontSize: 'md',
                        color: 'gray.200',
                        lineHeight: 'relaxed',
                        wordBreak: 'break-word',
                      })}
                    >
                      {formatCitationAsPlainText(citationResult.fullCitation)}
                    </p>
                  ) : (
                    <p
                      className={css({
                        fontSize: 'md',
                        color: 'gray.200',
                        lineHeight: 'relaxed',
                        wordBreak: 'break-word',
                        '& em': { fontStyle: 'italic' },
                      })}
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe - controlled input with only <em> tags for italics
                      dangerouslySetInnerHTML={{
                        __html: formatCitationWithHtml(citationResult.fullCitation),
                      }}
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('full')}
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    w: 'full',
                    p: 3,
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    rounded: 'lg',
                    bg: copySuccess === 'full' ? 'green.600' : 'indigo.600',
                    color: 'white',
                    border: '1px solid',
                    borderColor: copySuccess === 'full' ? 'green.500' : 'indigo.500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    _hover: { bg: copySuccess === 'full' ? 'green.500' : 'indigo.500' },
                  })}
                >
                  {copySuccess === 'full' ? (
                    <Check className={css({ w: 4, h: 4 })} />
                  ) : (
                    <Copy className={css({ w: 4, h: 4 })} />
                  )}
                  {copySuccess === 'full' ? 'Copied!' : 'Copy Full Citation'}
                </button>
              </>
            ) : (
              <p className={css({ fontSize: 'sm', color: 'gray.500', textAlign: 'center', py: 8 })}>
                Fill in the source details and click &quot;Generate Citation&quot; to create your
                citation.
              </p>
            )}
          </div>

          {/* In-Text Citation */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'xl',
              p: { base: 4, sm: 6 },
              spaceY: 4,
            })}
          >
            <h2 className={css({ fontSize: 'xl', fontWeight: 'semibold', color: 'white' })}>
              In-Text Citation
            </h2>

            {citationResult ? (
              <>
                <div
                  className={css({
                    p: 4,
                    bg: 'gray.900',
                    border: '1px solid',
                    borderColor: 'gray.800',
                    rounded: 'lg',
                  })}
                >
                  <p
                    className={css({
                      fontSize: 'md',
                      color: 'gray.200',
                      lineHeight: 'relaxed',
                    })}
                  >
                    {citationResult.inTextCitation || 'N/A for this citation style'}
                  </p>
                </div>
                {citationResult.inTextCitation && (
                  <button
                    type="button"
                    onClick={() => handleCopy('intext')}
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      w: 'full',
                      p: 3,
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      rounded: 'lg',
                      bg: copySuccess === 'intext' ? 'green.600' : 'purple.600',
                      color: 'white',
                      border: '1px solid',
                      borderColor: copySuccess === 'intext' ? 'green.500' : 'purple.500',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      _hover: { bg: copySuccess === 'intext' ? 'green.500' : 'purple.500' },
                    })}
                  >
                    {copySuccess === 'intext' ? (
                      <Check className={css({ w: 4, h: 4 })} />
                    ) : (
                      <Copy className={css({ w: 4, h: 4 })} />
                    )}
                    {copySuccess === 'intext' ? 'Copied!' : 'Copy In-Text Citation'}
                  </button>
                )}
              </>
            ) : (
              <p className={css({ fontSize: 'sm', color: 'gray.500', textAlign: 'center', py: 4 })}>
                Generate a citation to see the in-text format.
              </p>
            )}
          </div>

          {/* Style Guide */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'xl',
              p: { base: 4, sm: 6 },
              spaceY: 3,
            })}
          >
            <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
              {CITATION_STYLES[citationStyle].name} Guide
            </h3>
            <div className={css({ spaceY: 2 })}>
              <StyleGuideItem
                style={citationStyle}
                title="Common Use"
                description={getStyleUsage(citationStyle)}
              />
              <StyleGuideItem
                style={citationStyle}
                title="In-Text Format"
                description={getInTextFormat(citationStyle)}
              />
            </div>
          </div>

          {/* Tips */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'xl',
              p: { base: 4, sm: 6 },
              spaceY: 3,
            })}
          >
            <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
              Pro Tips
            </h3>
            <div className={css({ spaceY: 2 })}>
              <TipItem text="Always verify generated citations against your institution's style guide." />
              <TipItem text="Include DOIs when available - they provide permanent links to sources." />
              <TipItem text="For multiple authors, list them in the order they appear on the source." />
              <TipItem text="Keep access dates for websites as they may change or become unavailable." />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div
        className={css({
          bg: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          rounded: 'xl',
          p: { base: 4, sm: 6 },
          spaceY: 4,
        })}
      >
        <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
          Features
        </h3>
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 4,
          })}
        >
          <FeatureCard
            title="Multiple Styles"
            description="Support for APA, MLA, Chicago, Harvard, IEEE, and Vancouver citation formats."
          />
          <FeatureCard
            title="All Source Types"
            description="Generate citations for books, journals, websites, videos, theses, and more."
          />
          <FeatureCard
            title="Copy to Clipboard"
            description="Easily copy full citations and in-text citations with one click."
          />
          <FeatureCard
            title="Accurate Formatting"
            description="Proper italicization, punctuation, and author formatting for each style."
          />
        </div>
      </div>
    </main>
  )
}

// Helper functions for style guide
function getStyleUsage(style: CitationStyleId): string {
  const usages: Record<CitationStyleId, string> = {
    apa: 'Psychology, education, social sciences, business',
    mla: 'Literature, humanities, liberal arts',
    chicago: 'History, arts, some social sciences',
    harvard: 'Business, sciences (UK/Australia)',
    ieee: 'Engineering, computer science, electronics',
    vancouver: 'Medicine, health sciences, nursing',
  }
  return usages[style]
}

function getInTextFormat(style: CitationStyleId): string {
  const formats: Record<CitationStyleId, string> = {
    apa: '(Author, Year) or Author (Year)',
    mla: '(Author Page) - no comma, includes page',
    chicago: '(Author Year, Page) with comma',
    harvard: '(Author, Year) or Author (Year)',
    ieee: '[Number] - numbered references',
    vancouver: '(Number) - numbered references',
  }
  return formats[style]
}

// Style Guide Item Component
function StyleGuideItem({
  title,
  description,
}: {
  style: CitationStyleId
  title: string
  description: string
}) {
  return (
    <div
      className={css({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        rounded: 'md',
        bg: 'gray.900',
        border: '1px solid',
        borderColor: 'gray.800',
      })}
    >
      <span className={css({ fontSize: 'sm', color: 'gray.400' })}>{title}</span>
      <span className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'indigo.400' })}>
        {description}
      </span>
    </div>
  )
}

// Tip Item Component
function TipItem({ text }: { text: string }) {
  return (
    <div className={css({ display: 'flex', gap: 2 })}>
      <span className={css({ color: 'indigo.400', flexShrink: 0 })}>•</span>
      <p className={css({ fontSize: 'sm', color: 'gray.400', lineHeight: 'relaxed' })}>{text}</p>
    </div>
  )
}

// Feature Card Component
function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div
      className={css({
        p: 4,
        rounded: 'lg',
        bg: 'gray.900',
        border: '1px solid',
        borderColor: 'gray.800',
        spaceY: 2,
      })}
    >
      <h4 className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'indigo.400' })}>
        {title}
      </h4>
      <p className={css({ fontSize: 'xs', color: 'gray.400', lineHeight: 'relaxed' })}>
        {description}
      </p>
    </div>
  )
}
