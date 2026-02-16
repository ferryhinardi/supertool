'use client'

import {
  CheckCircle,
  Copy,
  Globe,
  MapPin,
  Network,
  Search,
  Server,
  Shield,
  Wifi,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ToolSearch } from '@/components/ui/tool-search'
import { css } from '@/styled-system/css'

interface IPInfo {
  ip: string
  version: string
  city: string
  region: string
  country: string
  country_code: string
  postal: string
  latitude: number
  longitude: number
  timezone: string
  org: string
  isp: string
  as: string
  asname: string
  mobile: boolean
  proxy: boolean
  hosting: boolean
}

export default function IPLookupPage() {
  const [ipAddress, setIpAddress] = useState('')
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [autoLoaded, setAutoLoaded] = useState(false)

  const lookupIP = useCallback(
    async (ip?: string) => {
      const targetIP = ip || ipAddress
      if (!targetIP) {
        toast.error('Please enter an IP address')
        return
      }

      // Basic IP validation
      const ipv4Pattern =
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      const ipv6Pattern = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::1|::)$/

      if (!ipv4Pattern.test(targetIP) && !ipv6Pattern.test(targetIP)) {
        toast.error('Please enter a valid IP address')
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`https://ipapi.co/${targetIP}/json/`)
        const data = await response.json()

        if (data.error) {
          toast.error(data.reason || 'Failed to lookup IP address')
          return
        }

        setIpInfo({
          ip: data.ip,
          version: data.version,
          city: data.city || 'Unknown',
          region: data.region || 'Unknown',
          country: data.country_name || 'Unknown',
          country_code: data.country_code || '',
          postal: data.postal || 'Unknown',
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
          timezone: data.timezone || 'Unknown',
          org: data.org || 'Unknown',
          isp: data.org || 'Unknown',
          as: data.asn || 'Unknown',
          asname: data.org || 'Unknown',
          mobile: false,
          proxy: false,
          hosting: false,
        })

        toast.success('IP information retrieved successfully')
      } catch (error) {
        toast.error('Failed to lookup IP address')
        console.error(error)
      } finally {
        setLoading(false)
      }
    },
    [ipAddress]
  )

  const fetchMyIP = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()

      if (data.error) {
        toast.error('Failed to fetch your IP address')
        return
      }

      setIpAddress(data.ip)
      await lookupIP(data.ip)
    } catch (error) {
      toast.error('Failed to fetch your IP address')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [lookupIP])

  // Automatically fetch user's IP on component mount
  useEffect(() => {
    if (!autoLoaded) {
      fetchMyIP()
      setAutoLoaded(true)
    }
  }, [autoLoaded, fetchMyIP])

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const openMap = () => {
    if (ipInfo) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${ipInfo.latitude},${ipInfo.longitude}`,
        '_blank'
      )
    }
  }

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '1400px',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '6', sm: '8', md: '10' },
      })}
    >
      {/* Header */}
      <div
        className={css({
          textAlign: 'center',
          spaceY: '4',
          animation: 'slideUp 0.5s ease-out forwards',
          opacity: 0,
        })}
      >
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'blue.500/20',
            bg: 'blue.500/10',
            px: '4',
            py: '2',
          })}
        >
          <Network className={css({ h: '5', w: '5', color: 'blue.400' })} />
          <span
            className={css({
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'blue.300',
            })}
          >
            IP Geolocation
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'bold',
            bgGradient: 'to-r',
            gradientFrom: 'blue.400',
            gradientVia: 'cyan.400',
            gradientTo: 'teal.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          IP Address Lookup
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '2xl',
            fontSize: 'lg',
            color: 'white',
          })}
        >
          Discover detailed information about any IP address including location, ISP, timezone, and
          more.
        </p>
      </div>

      {/* Lookup Section */}
      <div
        className={css({
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.1s',
          opacity: 0,
        })}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'gray.800',
            bg: 'gray.900/50',
          })}
        >
          <CardHeader>
            <CardTitle>IP Address Lookup</CardTitle>
            <CardDescription>Enter an IP address to get detailed information</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <div
              className={css({
                display: 'flex',
                flexDirection: { base: 'column', sm: 'row' },
                gap: '4',
              })}
            >
              <div className={css({ flex: '1' })}>
                <Input
                  placeholder="Enter IP address (e.g., 8.8.8.8)"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      lookupIP()
                    }
                  }}
                  className={css({ fontFamily: 'mono' })}
                />
              </div>
              <div className={css({ display: 'flex', gap: '2' })}>
                <Button
                  onClick={() => lookupIP()}
                  className={css({ gap: '2' })}
                  disabled={loading || !ipAddress}
                >
                  <Search className={css({ h: '4', w: '4' })} />
                  {loading ? 'Looking up...' : 'Lookup'}
                </Button>
                <Button
                  onClick={fetchMyIP}
                  variant="outline"
                  className={css({ gap: '2' })}
                  disabled={loading}
                >
                  <Wifi className={css({ h: '4', w: '4' })} />
                  My IP
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {ipInfo && (
        <>
          {/* Main Info Card */}
          <div
            className={css({
              animation: 'slideUp 0.5s ease-out forwards',
              animationDelay: '0.2s',
              opacity: 0,
            })}
          >
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'gray.800',
                bg: 'gray.900/50',
              })}
            >
              <CardHeader>
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'start',
                    justifyContent: 'space-between',
                  })}
                >
                  <div>
                    <CardTitle
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2',
                      })}
                    >
                      <Globe className={css({ h: '5', w: '5', color: 'blue.400' })} />
                      IP Address Information
                    </CardTitle>
                    <CardDescription>Complete details for {ipInfo.ip}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(ipInfo.ip, 'IP Address')}
                  >
                    <Copy className={css({ h: '4', w: '4' })} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className={css({ spaceY: '6' })}>
                {/* IP & Version */}
                <div
                  className={css({
                    display: 'grid',
                    gap: '6',
                    gridTemplateColumns: { base: '1', sm: 'repeat(2, 1fr)' },
                  })}
                >
                  <div className={css({ spaceY: '2' })}>
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2',
                        fontSize: 'sm',
                        color: 'white',
                      })}
                    >
                      <Network className={css({ h: '4', w: '4' })} />
                      IP Address
                    </div>
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.800',
                        bg: 'gray.900/50',
                        p: '3',
                      })}
                    >
                      <code
                        className={css({
                          fontSize: 'lg',
                          fontWeight: 'semibold',
                          color: 'blue.400',
                        })}
                      >
                        {ipInfo.ip}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(ipInfo.ip, 'IP Address')}
                      >
                        <Copy className={css({ h: '4', w: '4' })} />
                      </Button>
                    </div>
                  </div>

                  <div className={css({ spaceY: '2' })}>
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2',
                        fontSize: 'sm',
                        color: 'white',
                      })}
                    >
                      <CheckCircle className={css({ h: '4', w: '4' })} />
                      IP Version
                    </div>
                    <div
                      className={css({
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.800',
                        bg: 'gray.900/50',
                        p: '3',
                      })}
                    >
                      <span
                        className={css({
                          fontSize: 'lg',
                          fontWeight: 'semibold',
                          color: 'gray.200',
                        })}
                      >
                        IPv{ipInfo.version}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location Info */}
                <div className={css({ spaceY: '3' })}>
                  <h3
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      fontSize: 'lg',
                      fontWeight: 'semibold',
                      color: 'gray.200',
                    })}
                  >
                    <MapPin className={css({ h: '5', w: '5', color: 'red.400' })} />
                    Location
                  </h3>
                  <div
                    className={css({
                      display: 'grid',
                      gap: '4',
                      gridTemplateColumns: {
                        base: '1',
                        sm: 'repeat(2, 1fr)',
                        lg: 'repeat(3, 1fr)',
                      },
                    })}
                  >
                    <InfoItem label="Country" value={ipInfo.country} emoji={ipInfo.country_code} />
                    <InfoItem label="Region" value={ipInfo.region} />
                    <InfoItem label="City" value={ipInfo.city} />
                    <InfoItem label="Postal Code" value={ipInfo.postal} />
                    <InfoItem
                      label="Coordinates"
                      value={`${ipInfo.latitude.toFixed(4)}, ${ipInfo.longitude.toFixed(4)}`}
                    />
                    <InfoItem label="Timezone" value={ipInfo.timezone} />
                  </div>
                  <Button
                    onClick={openMap}
                    variant="outline"
                    className={css({ w: 'full', gap: '2' })}
                  >
                    <MapPin className={css({ h: '4', w: '4' })} />
                    View on Map
                  </Button>
                </div>

                {/* Network Info */}
                <div className={css({ spaceY: '3' })}>
                  <h3
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      fontSize: 'lg',
                      fontWeight: 'semibold',
                      color: 'gray.200',
                    })}
                  >
                    <Server className={css({ h: '5', w: '5', color: 'green.400' })} />
                    Network Information
                  </h3>
                  <div
                    className={css({
                      display: 'grid',
                      gap: '4',
                      gridTemplateColumns: { base: '1', sm: 'repeat(2, 1fr)' },
                    })}
                  >
                    <InfoItem label="ISP / Organization" value={ipInfo.isp} />
                    <InfoItem label="AS Number" value={ipInfo.as} />
                  </div>
                </div>

                {/* Security Info */}
                <div className={css({ spaceY: '3' })}>
                  <h3
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      fontSize: 'lg',
                      fontWeight: 'semibold',
                      color: 'gray.200',
                    })}
                  >
                    <Shield className={css({ h: '5', w: '5', color: 'purple.400' })} />
                    Security Indicators
                  </h3>
                  <div
                    className={css({
                      display: 'grid',
                      gap: '4',
                      gridTemplateColumns: { base: '1', sm: 'repeat(3, 1fr)' },
                    })}
                  >
                    <SecurityBadge label="Mobile" value={ipInfo.mobile} />
                    <SecurityBadge label="Proxy/VPN" value={ipInfo.proxy} />
                    <SecurityBadge label="Hosting" value={ipInfo.hosting} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Features */}
      <div
        className={css({
          display: 'grid',
          gap: '4',
          gridTemplateColumns: { base: '1', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.3s',
          opacity: 0,
        })}
      >
        {[
          {
            icon: Globe,
            title: 'Geolocation',
            desc: 'Country, city, region, and coordinates',
          },
          {
            icon: Server,
            title: 'ISP Information',
            desc: 'Internet Service Provider details',
          },
          {
            icon: MapPin,
            title: 'Map Integration',
            desc: 'View location on Google Maps',
          },
          {
            icon: Network,
            title: 'IPv4 & IPv6',
            desc: 'Support for both IP versions',
          },
        ].map((feature) => (
          <Card
            key={feature.title}
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/30',
            })}
          >
            <CardContent withTopPadding className={css({ p: '6' })}>
              <feature.icon className={css({ mb: '3', h: '8', w: '8', color: 'blue.400' })} />
              <h3
                className={css({
                  mb: '2',
                  fontWeight: 'semibold',
                  color: 'gray.200',
                })}
              >
                {feature.title}
              </h3>
              <p className={css({ fontSize: 'sm', color: 'white' })}>{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}

// Helper Components
function InfoItem({ label, value, emoji }: { label: string; value: string; emoji?: string }) {
  return (
    <div
      className={css({
        rounded: 'lg',
        border: '1px solid',
        borderColor: 'gray.800',
        bg: 'gray.900/30',
        p: '3',
      })}
    >
      <div
        className={css({
          mb: '1',
          fontSize: 'xs',
          fontWeight: 'medium',
          color: 'white',
        })}
      >
        {label}
      </div>
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '2',
          fontSize: 'sm',
          fontWeight: 'semibold',
          color: 'gray.200',
        })}
      >
        {emoji && (
          <span className={css({ fontSize: 'lg' })}>
            {String.fromCodePoint(
              ...emoji
                .toUpperCase()
                .split('')
                .map((char) => 127397 + char.charCodeAt(0))
            )}
          </span>
        )}
        <span>{value}</span>
      </div>
    </div>
  )
}

function SecurityBadge({ label, value }: { label: string; value: boolean }) {
  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        rounded: 'lg',
        border: '1px solid',
        borderColor: value ? 'yellow.500/20' : 'green.500/20',
        bg: value ? 'yellow.500/10' : 'green.500/10',
        p: '3',
      })}
    >
      <span
        className={css({
          fontSize: 'sm',
          fontWeight: 'medium',
          color: 'gray.200',
        })}
      >
        {label}
      </span>
      <span
        className={css({
          fontSize: 'xs',
          fontWeight: 'semibold',
          color: value ? 'yellow.400' : 'green.400',
        })}
      >
        {value ? 'Yes' : 'No'}
      </span>
    </div>
  )
}
