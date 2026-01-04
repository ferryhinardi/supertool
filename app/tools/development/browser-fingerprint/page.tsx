'use client'

import { motion } from 'framer-motion'
import { AlertCircle, Check, Copy, Eye, Fingerprint, Info, Monitor, Shield, X } from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import {
  calculateUniquenessScore,
  collectFingerprint,
  type FingerprintData,
  generateFingerprintHash,
} from './utils'

function BrowserFingerprintContent() {
  const [fingerprint, setFingerprint] = useState<FingerprintData | null>(null)
  const [loading, setLoading] = useState(true)
  const [fingerprintHash, setFingerprintHash] = useState<string>('')
  const [uniquenessScore, setUniquenessScore] = useState<number>(0)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']))

  useEffect(() => {
    trackToolEvent('browser_fingerprint_open', {})

    async function loadFingerprint() {
      try {
        const data = await collectFingerprint()
        setFingerprint(data)
        setFingerprintHash(generateFingerprintHash(data))
        setUniquenessScore(calculateUniquenessScore(data))
      } catch (error) {
        console.error('Failed to collect fingerprint:', error)
        toast.error('Failed to collect fingerprint data')
      } finally {
        setLoading(false)
      }
    }

    loadFingerprint()
  }, [])

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
    trackToolEvent('browser_fingerprint_section_toggle', { section })
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`Copied ${label} to clipboard`)
    trackToolEvent('browser_fingerprint_copy', { field: label })
  }

  const copyAllData = () => {
    if (!fingerprint) return
    const data = JSON.stringify(fingerprint, null, 2)
    navigator.clipboard.writeText(data)
    toast.success('Copied all fingerprint data to clipboard')
    trackToolEvent('browser_fingerprint_copy_all', {})
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'red'
    if (score >= 60) return 'orange'
    if (score >= 40) return 'yellow'
    return 'green'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Highly Trackable'
    if (score >= 60) return 'Very Trackable'
    if (score >= 40) return 'Moderately Trackable'
    return 'Less Trackable'
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={css({ textAlign: 'center', spaceY: '4' })}
      >
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'indigo.500/30',
            bg: 'indigo.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Fingerprint className={css({ h: '5', w: '5', color: 'indigo.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'indigo.300' })}>
            Privacy & Security Tool
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'indigo.400',
            gradientVia: 'purple.400',
            gradientTo: 'pink.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Browser Fingerprint Viewer
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'white',
          })}
        >
          Discover how unique and trackable your browser is. See what information websites can
          collect about your device without using cookies.
        </p>
      </motion.div>

      {/* Uniqueness Score Card */}
      {!loading && fingerprint && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: `${getScoreColor(uniquenessScore)}.500/20`,
              bg: `${getScoreColor(uniquenessScore)}.500/5`,
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardContent withTopPadding className={css({ pt: '8', pb: '8' })}>
              <div className={css({ textAlign: 'center', spaceY: '4' })}>
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '3',
                  })}
                >
                  <Shield
                    className={css({
                      h: '8',
                      w: '8',
                      color: `${getScoreColor(uniquenessScore)}.400`,
                    })}
                  />
                  <div>
                    <div
                      className={css({
                        fontSize: '4xl',
                        fontWeight: 'bold',
                        color: `${getScoreColor(uniquenessScore)}.300`,
                      })}
                    >
                      {uniquenessScore}%
                    </div>
                    <div className={css({ fontSize: 'sm', color: 'white' })}>Uniqueness Score</div>
                  </div>
                </div>
                <Badge
                  className={css({
                    bg: `${getScoreColor(uniquenessScore)}.500/20`,
                    color: `${getScoreColor(uniquenessScore)}.300`,
                    border: '1px solid',
                    borderColor: `${getScoreColor(uniquenessScore)}.500/30`,
                    fontSize: 'base',
                    px: '4',
                    py: '2',
                  })}
                >
                  {getScoreLabel(uniquenessScore)}
                </Badge>
                <p className={css({ fontSize: 'sm', color: 'white', maxW: '2xl', mx: 'auto' })}>
                  Your browser has a {uniquenessScore >= 60 ? 'high' : 'moderate'} level of
                  uniqueness, making it {uniquenessScore >= 60 ? 'easier' : 'somewhat difficult'}{' '}
                  for websites to track you across the web.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Fingerprint Hash */}
      {!loading && fingerprintHash && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'purple.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <CardTitle>Your Unique Fingerprint ID</CardTitle>
              <CardDescription>
                This hash represents your unique browser configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                <div
                  className={css({
                    flex: '1',
                    fontFamily: 'mono',
                    fontSize: 'lg',
                    fontWeight: 'bold',
                    color: 'purple.300',
                    bg: 'purple.500/10',
                    border: '1px solid',
                    borderColor: 'purple.500/30',
                    rounded: 'lg',
                    px: '4',
                    py: '3',
                  })}
                >
                  {fingerprintHash}
                </div>
                <Button
                  onClick={() => copyToClipboard(fingerprintHash, 'Fingerprint ID')}
                  className={css({
                    gap: '2',
                    bg: 'purple.500/20',
                    border: '1px solid',
                    borderColor: 'purple.500/50',
                    color: 'purple.300',
                    _hover: { bg: 'purple.500/30' },
                  })}
                >
                  <Copy className={css({ h: '4', w: '4' })} />
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={css({ textAlign: 'center', py: '12' })}
        >
          <div className={css({ display: 'inline-block', animation: 'spin 1s linear infinite' })}>
            <Fingerprint className={css({ h: '12', w: '12', color: 'indigo.400' })} />
          </div>
          <p className={css({ mt: '4', fontSize: 'lg', color: 'white' })}>
            Collecting fingerprint data...
          </p>
        </motion.div>
      )}

      {/* Fingerprint Details */}
      {!loading && fingerprint && (
        <>
          {/* Basic Browser Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'indigo.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <button
                  type="button"
                  onClick={() => toggleSection('basic')}
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    w: 'full',
                    bg: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    p: '0',
                  })}
                >
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                    <Monitor className={css({ h: '5', w: '5', color: 'indigo.400' })} />
                    <CardTitle>Basic Browser Information</CardTitle>
                  </div>
                  <Eye className={css({ h: '5', w: '5', color: 'white' })} />
                </button>
              </CardHeader>
              {expandedSections.has('basic') && (
                <CardContent className={css({ spaceY: '3' })}>
                  <DataRow label="User Agent" value={fingerprint.userAgent} />
                  <DataRow label="Platform" value={fingerprint.platform} />
                  <DataRow label="Language" value={fingerprint.language} />
                  <DataRow label="Languages" value={fingerprint.languages.join(', ')} />
                  <DataRow
                    label="Cookies Enabled"
                    value={fingerprint.cookieEnabled ? 'Yes' : 'No'}
                  />
                  <DataRow label="Do Not Track" value={fingerprint.doNotTrack || 'Not set'} />
                </CardContent>
              )}
            </Card>
          </motion.div>

          {/* Screen & Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'blue.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <button
                  type="button"
                  onClick={() => toggleSection('screen')}
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    w: 'full',
                    bg: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    p: '0',
                  })}
                >
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                    <Monitor className={css({ h: '5', w: '5', color: 'blue.400' })} />
                    <CardTitle>Screen & Display</CardTitle>
                  </div>
                  <Eye className={css({ h: '5', w: '5', color: 'white' })} />
                </button>
              </CardHeader>
              {expandedSections.has('screen') && (
                <CardContent className={css({ spaceY: '3' })}>
                  <DataRow label="Screen Resolution" value={fingerprint.screenResolution} />
                  <DataRow
                    label="Available Resolution"
                    value={fingerprint.availableScreenResolution}
                  />
                  <DataRow label="Color Depth" value={`${fingerprint.colorDepth} bits`} />
                  <DataRow label="Pixel Ratio" value={fingerprint.pixelRatio.toString()} />
                  <DataRow
                    label="Touch Points"
                    value={fingerprint.touchSupport.maxTouchPoints.toString()}
                  />
                  <DataRow
                    label="Touch Support"
                    value={fingerprint.touchSupport.touchEvent ? 'Yes' : 'No'}
                  />
                </CardContent>
              )}
            </Card>
          </motion.div>

          {/* Hardware */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'cyan.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <button
                  type="button"
                  onClick={() => toggleSection('hardware')}
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    w: 'full',
                    bg: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    p: '0',
                  })}
                >
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                    <Monitor className={css({ h: '5', w: '5', color: 'cyan.400' })} />
                    <CardTitle>Hardware Information</CardTitle>
                  </div>
                  <Eye className={css({ h: '5', w: '5', color: 'white' })} />
                </button>
              </CardHeader>
              {expandedSections.has('hardware') && (
                <CardContent className={css({ spaceY: '3' })}>
                  <DataRow label="CPU Cores" value={fingerprint.hardwareConcurrency.toString()} />
                  <DataRow
                    label="Device Memory"
                    value={
                      fingerprint.deviceMemory ? `${fingerprint.deviceMemory} GB` : 'Not available'
                    }
                  />
                </CardContent>
              )}
            </Card>
          </motion.div>

          {/* Graphics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'green.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <button
                  type="button"
                  onClick={() => toggleSection('graphics')}
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    w: 'full',
                    bg: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    p: '0',
                  })}
                >
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                    <Monitor className={css({ h: '5', w: '5', color: 'green.400' })} />
                    <CardTitle>Graphics & Rendering</CardTitle>
                  </div>
                  <Eye className={css({ h: '5', w: '5', color: 'white' })} />
                </button>
              </CardHeader>
              {expandedSections.has('graphics') && (
                <CardContent className={css({ spaceY: '3' })}>
                  <DataRow label="Canvas Fingerprint" value={fingerprint.canvas} />
                  <DataRow label="Audio Fingerprint" value={fingerprint.audioFingerprint} />
                  {fingerprint.webgl ? (
                    <>
                      <DataRow label="WebGL Vendor" value={fingerprint.webgl.vendor} />
                      <DataRow label="WebGL Renderer" value={fingerprint.webgl.renderer} />
                      <DataRow label="WebGL Version" value={fingerprint.webgl.version} />
                      <DataRow label="Unmasked Vendor" value={fingerprint.webgl.unmaskedVendor} />
                      <DataRow
                        label="Unmasked Renderer"
                        value={fingerprint.webgl.unmaskedRenderer}
                      />
                    </>
                  ) : (
                    <DataRow label="WebGL" value="Not supported" />
                  )}
                </CardContent>
              )}
            </Card>
          </motion.div>

          {/* Fonts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'yellow.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <button
                  type="button"
                  onClick={() => toggleSection('fonts')}
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    w: 'full',
                    bg: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    p: '0',
                  })}
                >
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                    <Monitor className={css({ h: '5', w: '5', color: 'yellow.400' })} />
                    <CardTitle>Installed Fonts</CardTitle>
                    <Badge
                      className={css({
                        bg: 'yellow.500/20',
                        color: 'yellow.300',
                        border: '1px solid',
                        borderColor: 'yellow.500/30',
                      })}
                    >
                      {fingerprint.fonts.length}
                    </Badge>
                  </div>
                  <Eye className={css({ h: '5', w: '5', color: 'white' })} />
                </button>
              </CardHeader>
              {expandedSections.has('fonts') && (
                <CardContent>
                  <div
                    className={css({
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '2',
                    })}
                  >
                    {fingerprint.fonts.map((font) => (
                      <Badge
                        key={font}
                        className={css({
                          bg: 'gray.800',
                          color: 'white',
                          border: '1px solid',
                          borderColor: 'gray.700',
                        })}
                      >
                        {font}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>

          {/* Privacy & Storage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'purple.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <button
                  type="button"
                  onClick={() => toggleSection('privacy')}
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    w: 'full',
                    bg: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    p: '0',
                  })}
                >
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                    <Shield className={css({ h: '5', w: '5', color: 'purple.400' })} />
                    <CardTitle>Privacy & Storage</CardTitle>
                  </div>
                  <Eye className={css({ h: '5', w: '5', color: 'white' })} />
                </button>
              </CardHeader>
              {expandedSections.has('privacy') && (
                <CardContent className={css({ spaceY: '3' })}>
                  <DataRow label="Timezone" value={fingerprint.timezone} />
                  <DataRow
                    label="Timezone Offset"
                    value={`${fingerprint.timezoneOffset} minutes`}
                  />
                  <DataRow
                    label="Local Storage"
                    value={fingerprint.localStorage ? 'Available' : 'Blocked'}
                  />
                  <DataRow
                    label="Session Storage"
                    value={fingerprint.sessionStorage ? 'Available' : 'Blocked'}
                  />
                  <DataRow
                    label="IndexedDB"
                    value={fingerprint.indexedDB ? 'Available' : 'Blocked'}
                  />
                  <DataRow
                    label="Ad Blocker Detected"
                    value={fingerprint.adBlocker ? 'Yes' : 'No'}
                    icon={
                      fingerprint.adBlocker ? (
                        <Check className={css({ h: '4', w: '4', color: 'green.400' })} />
                      ) : (
                        <X className={css({ h: '4', w: '4', color: 'red.400' })} />
                      )
                    }
                  />
                  <DataRow
                    label="Browser Plugins"
                    value={
                      fingerprint.plugins.length > 0
                        ? fingerprint.plugins.join(', ')
                        : 'None detected'
                    }
                  />
                </CardContent>
              )}
            </Card>
          </motion.div>

          {/* Copy All Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className={css({ display: 'flex', justifyContent: 'center' })}
          >
            <Button
              onClick={copyAllData}
              size="lg"
              className={css({
                gap: '2',
                bg: 'indigo.500/20',
                border: '1px solid',
                borderColor: 'indigo.500/50',
                color: 'indigo.300',
                fontSize: 'lg',
                px: '8',
                py: '6',
                _hover: { bg: 'indigo.500/30' },
              })}
            >
              <Copy className={css({ h: '5', w: '5' })} />
              Copy All Fingerprint Data
            </Button>
          </motion.div>
        </>
      )}

      {/* Privacy Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'orange.500/20',
            bg: 'orange.500/5',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardContent withTopPadding className={css({ pt: '6', pb: '6' })}>
            <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
              <AlertCircle
                className={css({ h: '6', w: '6', color: 'orange.400', flexShrink: '0', mt: '1' })}
              />
              <div className={css({ spaceY: '3' })}>
                <h3
                  className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'orange.300' })}
                >
                  Privacy Insights
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'white' })}>
                  <li>• Browser fingerprinting allows websites to identify you without cookies</li>
                  <li>
                    • Your canvas and WebGL fingerprints are highly unique and difficult to change
                  </li>
                  <li>
                    • Using privacy-focused browsers like Brave or Firefox with privacy extensions
                    can help
                  </li>
                  <li>• Consider using a VPN and disabling JavaScript on sensitive sites</li>
                  <li>
                    • Regular browser updates and clearing cache can slightly change your
                    fingerprint
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pro Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'cyan.500/20',
            bg: 'rgba(6, 182, 212, 0.05)',
            p: { base: '4', sm: '5', md: '6' },
            backdropFilter: 'blur(16px)',
          })}
        >
          <h3
            className={css({
              mb: '3',
              fontSize: { base: 'base', sm: 'lg' },
              fontWeight: 'bold',
              color: 'cyan.300',
            })}
          >
            Understanding Your Fingerprint
          </h3>
          <ul className={css({ spaceY: '2', pl: '5', color: 'gray.400', listStyle: 'disc' })}>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              Click on each section to expand and view detailed information
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              The uniqueness score shows how easily you can be tracked online
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              Your fingerprint ID is a unique hash representing your browser configuration
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              All data is collected locally - nothing is sent to any server
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              Use this tool to understand your digital privacy posture
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}

// Data Row Component
interface DataRowProps {
  label: string
  value: string
  icon?: React.ReactNode
}

function DataRow({ label, value, icon }: DataRowProps) {
  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'start',
        justifyContent: 'space-between',
        gap: '4',
        py: '2',
        borderBottom: '1px solid',
        borderColor: 'gray.800',
        _last: { borderBottom: 'none' },
      })}
    >
      <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
        <Info className={css({ h: '4', w: '4', color: 'white', flexShrink: '0' })} />
        <span className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}>
          {label}
        </span>
      </div>
      <div className={css({ display: 'flex', alignItems: 'center', gap: '2', textAlign: 'right' })}>
        {icon}
        <span
          className={css({
            fontSize: 'sm',
            color: 'white',
            fontFamily: label.includes('Fingerprint') ? 'mono' : 'inherit',
            wordBreak: 'break-all',
            maxW: 'md',
          })}
        >
          {value}
        </span>
      </div>
    </div>
  )
}

export default function BrowserFingerprintPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrowserFingerprintContent />
    </Suspense>
  )
}
