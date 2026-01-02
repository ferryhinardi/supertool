'use client'

import { AlertCircle, Check, Copy, Database, Maximize2, Minimize2, RotateCcw } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import { formatSQL, minifySQL, SQL_DIALECTS, SQL_EXAMPLES, type SQLDialect } from './templates'

export default function SQLFormatterPage() {
  const [inputSQL, setInputSQL] = useState('')
  const [formattedSQL, setFormattedSQL] = useState('')
  const [dialect, setDialect] = useState<SQLDialect>('standard')
  const [indentSize, setIndentSize] = useState(2)
  const [uppercaseKeywords, setUppercaseKeywords] = useState(true)
  const [isFormatted, setIsFormatted] = useState(false)
  const [copiedFormatted, setCopiedFormatted] = useState(false)
  const [error, setError] = useState('')

  const handleFormat = useCallback(() => {
    if (!inputSQL.trim()) {
      setError('Please enter SQL query to format')
      toast.error('Please enter SQL query')
      return
    }

    try {
      setError('')
      const formatted = formatSQL(inputSQL, {
        dialect,
        indentSize,
        uppercaseKeywords,
      })
      setFormattedSQL(formatted)
      setIsFormatted(true)

      trackToolEvent('sql_formatter_formatted', {
        dialect,
        input_length: inputSQL.length,
        output_length: formatted.length,
      })

      toast.success('SQL formatted successfully!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to format SQL'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }, [inputSQL, dialect, indentSize, uppercaseKeywords])

  const handleMinify = useCallback(() => {
    if (!inputSQL.trim()) {
      setError('Please enter SQL query to minify')
      toast.error('Please enter SQL query')
      return
    }

    try {
      setError('')
      const minified = minifySQL(inputSQL)
      setFormattedSQL(minified)
      setIsFormatted(true)

      trackToolEvent('sql_formatter_minified', {
        input_length: inputSQL.length,
        output_length: minified.length,
      })

      toast.success('SQL minified successfully!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to minify SQL'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }, [inputSQL])

  const handleClear = useCallback(() => {
    setInputSQL('')
    setFormattedSQL('')
    setIsFormatted(false)
    setError('')
    setCopiedFormatted(false)

    trackToolEvent('sql_formatter_cleared', {})
    toast.success('Cleared')
  }, [])

  const handleCopyFormatted = useCallback(async () => {
    if (!formattedSQL) {
      toast.error('No formatted SQL to copy')
      return
    }

    try {
      await navigator.clipboard.writeText(formattedSQL)
      setCopiedFormatted(true)
      toast.success('Formatted SQL copied!')

      trackToolEvent('sql_formatter_copied', {
        sql_length: formattedSQL.length,
      })

      setTimeout(() => setCopiedFormatted(false), 2000)
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }, [formattedSQL])

  const handleLoadExample = useCallback((example: string) => {
    setInputSQL(example)
    setFormattedSQL('')
    setIsFormatted(false)
    setError('')

    trackToolEvent('sql_formatter_example_loaded', {})
    toast.success('Example loaded')
  }, [])

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
      <div className={css({ spaceY: { base: '3', sm: '4' }, textAlign: 'center' })}>
        <div className={css({ display: 'inline-flex', alignItems: 'center', gap: 3 })}>
          <Database
            className={css({
              w: { base: '8', sm: '10' },
              h: { base: '8', sm: '10' },
              color: 'blue.400',
            })}
          />
          <h1
            className={css({
              fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
              fontWeight: 'extrabold',
              bgGradient: 'to-r',
              gradientFrom: 'blue.400',
              gradientTo: 'cyan.400',
              bgClip: 'text',
              color: 'transparent',
            })}
          >
            SQL Formatter
          </h1>
        </div>
        <p
          className={css({
            fontSize: { base: 'base', sm: 'lg' },
            color: 'gray.400',
            maxW: '2xl',
            mx: 'auto',
          })}
        >
          Format, beautify, and minify SQL queries with syntax highlighting. Supports multiple SQL
          dialects including MySQL, PostgreSQL, SQLite, and SQL Server.
        </p>
      </div>

      {/* Settings */}
      <div
        className={css({
          rounded: 'xl',
          border: '1px solid',
          borderColor: 'gray.800',
          bg: 'rgba(17, 24, 39, 0.5)',
          backdropFilter: 'blur(8px)',
          p: { base: '4', sm: '6' },
          spaceY: 4,
        })}
      >
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 4,
          })}
        >
          {/* SQL Dialect */}
          <div className={css({ spaceY: 2 })}>
            <label
              htmlFor="dialect"
              className={css({
                display: 'block',
                fontSize: 'sm',
                fontWeight: 'medium',
                color: 'gray.300',
              })}
            >
              SQL Dialect
            </label>
            <select
              id="dialect"
              value={dialect}
              onChange={(e) => setDialect(e.target.value as SQLDialect)}
              className={css({
                w: 'full',
                rounded: 'lg',
                border: '1px solid',
                borderColor: 'gray.700',
                bg: 'gray.900',
                px: 3,
                py: 2.5,
                fontSize: 'sm',
                color: 'gray.100',
                transition: 'all 0.2s',
                cursor: 'pointer',
                _hover: { borderColor: 'gray.600' },
                _focus: {
                  outline: 'none',
                  borderColor: 'blue.500',
                  ring: '2px',
                  ringColor: 'rgba(59, 130, 246, 0.3)',
                },
              })}
            >
              {SQL_DIALECTS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Indent Size */}
          <div className={css({ spaceY: 2 })}>
            <label
              htmlFor="indent"
              className={css({
                display: 'block',
                fontSize: 'sm',
                fontWeight: 'medium',
                color: 'gray.300',
              })}
            >
              Indent Size
            </label>
            <select
              id="indent"
              value={indentSize}
              onChange={(e) => setIndentSize(Number(e.target.value))}
              className={css({
                w: 'full',
                rounded: 'lg',
                border: '1px solid',
                borderColor: 'gray.700',
                bg: 'gray.900',
                px: 3,
                py: 2.5,
                fontSize: 'sm',
                color: 'gray.100',
                transition: 'all 0.2s',
                cursor: 'pointer',
                _hover: { borderColor: 'gray.600' },
                _focus: {
                  outline: 'none',
                  borderColor: 'blue.500',
                  ring: '2px',
                  ringColor: 'rgba(59, 130, 246, 0.3)',
                },
              })}
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={8}>8 spaces</option>
            </select>
          </div>

          {/* Uppercase Keywords */}
          <div className={css({ spaceY: 2 })}>
            <label
              htmlFor="uppercase"
              className={css({
                display: 'block',
                fontSize: 'sm',
                fontWeight: 'medium',
                color: 'gray.300',
              })}
            >
              Keyword Case
            </label>
            <select
              id="uppercase"
              value={uppercaseKeywords ? 'upper' : 'lower'}
              onChange={(e) => setUppercaseKeywords(e.target.value === 'upper')}
              className={css({
                w: 'full',
                rounded: 'lg',
                border: '1px solid',
                borderColor: 'gray.700',
                bg: 'gray.900',
                px: 3,
                py: 2.5,
                fontSize: 'sm',
                color: 'gray.100',
                transition: 'all 0.2s',
                cursor: 'pointer',
                _hover: { borderColor: 'gray.600' },
                _focus: {
                  outline: 'none',
                  borderColor: 'blue.500',
                  ring: '2px',
                  ringColor: 'rgba(59, 130, 246, 0.3)',
                },
              })}
            >
              <option value="upper">UPPERCASE</option>
              <option value="lower">lowercase</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className={css({ display: 'flex', gap: 2, alignItems: 'flex-end' })}>
            <button
              type="button"
              onClick={handleFormat}
              className={css({
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                px: 4,
                py: 2.5,
                rounded: 'lg',
                bg: 'blue.600',
                fontSize: 'sm',
                fontWeight: 'semibold',
                color: 'white',
                transition: 'all 0.2s',
                cursor: 'pointer',
                _hover: { bg: 'blue.700', transform: 'translateY(-1px)' },
                _active: { transform: 'translateY(0)' },
              })}
            >
              <Maximize2 className={css({ w: 4, h: 4 })} />
              Format
            </button>
            <button
              type="button"
              onClick={handleMinify}
              className={css({
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                px: 4,
                py: 2.5,
                rounded: 'lg',
                bg: 'gray.700',
                fontSize: 'sm',
                fontWeight: 'semibold',
                color: 'white',
                transition: 'all 0.2s',
                cursor: 'pointer',
                _hover: { bg: 'gray.600', transform: 'translateY(-1px)' },
                _active: { transform: 'translateY(0)' },
              })}
            >
              <Minimize2 className={css({ w: 4, h: 4 })} />
              Minify
            </button>
          </div>
        </div>

        {/* Example Buttons */}
        <div className={css({ display: 'flex', flexWrap: 'wrap', gap: 2 })}>
          <span className={css({ fontSize: 'sm', color: 'gray.400', alignSelf: 'center' })}>
            Quick examples:
          </span>
          {SQL_EXAMPLES.map((example) => (
            <button
              key={example.name}
              type="button"
              onClick={() => handleLoadExample(example.sql)}
              className={css({
                px: 3,
                py: 1.5,
                rounded: 'md',
                border: '1px solid',
                borderColor: 'gray.700',
                bg: 'gray.800',
                fontSize: 'xs',
                fontWeight: 'medium',
                color: 'gray.300',
                transition: 'all 0.2s',
                cursor: 'pointer',
                _hover: { borderColor: 'blue.500', color: 'blue.400' },
              })}
            >
              {example.name}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: 'repeat(2, 1fr)' },
          gap: { base: '4', sm: '6' },
        })}
      >
        {/* Input */}
        <div className={css({ spaceY: 3 })}>
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            })}
          >
            <label
              htmlFor="input-sql"
              className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'gray.300' })}
            >
              Input SQL
            </label>
            <button
              type="button"
              onClick={handleClear}
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 3,
                py: 1.5,
                rounded: 'md',
                fontSize: 'xs',
                fontWeight: 'medium',
                color: 'gray.400',
                transition: 'all 0.2s',
                cursor: 'pointer',
                _hover: { color: 'red.400', bg: 'rgba(239, 68, 68, 0.1)' },
              })}
            >
              <RotateCcw className={css({ w: 3.5, h: 3.5 })} />
              Clear
            </button>
          </div>
          <textarea
            id="input-sql"
            value={inputSQL}
            onChange={(e) => setInputSQL(e.target.value)}
            placeholder="Paste your SQL query here..."
            className={css({
              w: 'full',
              h: '96',
              rounded: 'lg',
              border: '1px solid',
              borderColor: 'gray.700',
              bg: 'gray.900',
              px: 4,
              py: 3,
              fontSize: 'sm',
              fontFamily: 'mono',
              color: 'gray.100',
              resize: 'vertical',
              transition: 'all 0.2s',
              _placeholder: { color: 'gray.500' },
              _hover: { borderColor: 'gray.600' },
              _focus: {
                outline: 'none',
                borderColor: 'blue.500',
                ring: '2px',
                ringColor: 'rgba(59, 130, 246, 0.3)',
              },
            })}
          />
          <div
            className={css({
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 'xs',
              color: 'gray.500',
            })}
          >
            <span>{inputSQL.length} characters</span>
            <span>{inputSQL.split('\n').length} lines</span>
          </div>
        </div>

        {/* Output */}
        <div className={css({ spaceY: 3 })}>
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            })}
          >
            <div className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'gray.300' })}>
              Formatted SQL
            </div>
            {formattedSQL && (
              <button
                type="button"
                onClick={handleCopyFormatted}
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 3,
                  py: 1.5,
                  rounded: 'md',
                  fontSize: 'xs',
                  fontWeight: 'medium',
                  color: copiedFormatted ? 'green.400' : 'gray.400',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  _hover: {
                    color: copiedFormatted ? 'green.400' : 'blue.400',
                    bg: copiedFormatted ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                  },
                })}
              >
                {copiedFormatted ? (
                  <>
                    <Check className={css({ w: 3.5, h: 3.5 })} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className={css({ w: 3.5, h: 3.5 })} />
                    Copy
                  </>
                )}
              </button>
            )}
          </div>
          <div
            className={css({
              w: 'full',
              h: '96',
              rounded: 'lg',
              border: '1px solid',
              borderColor: isFormatted ? 'green.800' : 'gray.700',
              bg: 'gray.900',
              p: 4,
              fontSize: 'sm',
              fontFamily: 'mono',
              color: 'gray.100',
              overflowY: 'auto',
              whiteSpace: 'pre',
              transition: 'all 0.2s',
            })}
          >
            {error ? (
              <div
                className={css({ display: 'flex', alignItems: 'center', gap: 2, color: 'red.400' })}
              >
                <AlertCircle className={css({ w: 5, h: 5 })} />
                <span>{error}</span>
              </div>
            ) : formattedSQL ? (
              formattedSQL
            ) : (
              <span className={css({ color: 'gray.500' })}>Formatted SQL will appear here...</span>
            )}
          </div>
          {formattedSQL && (
            <div
              className={css({
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 'xs',
                color: 'gray.500',
              })}
            >
              <span>{formattedSQL.length} characters</span>
              <span>{formattedSQL.split('\n').length} lines</span>
            </div>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div
        className={css({
          rounded: 'xl',
          border: '1px solid',
          borderColor: 'blue.900',
          bg: 'rgba(30, 58, 138, 0.1)',
          p: { base: '4', sm: '6' },
          spaceY: 3,
        })}
      >
        <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'blue.400' })}>
          Tips for Better SQL Formatting
        </h3>
        <ul
          className={css({
            spaceY: 2,
            pl: 5,
            listStyleType: 'disc',
            fontSize: 'sm',
            color: 'gray.400',
          })}
        >
          <li>Choose the correct SQL dialect for better formatting results</li>
          <li>Use Format for readable code, Minify for production/transmission</li>
          <li>UPPERCASE keywords improve readability in most SQL style guides</li>
          <li>2-space indentation is standard for SQL, but adjust to your preference</li>
          <li>Format regularly to maintain consistent code style across your team</li>
          <li>Test formatted queries in your database to ensure correctness</li>
        </ul>
      </div>
    </main>
  )
}
