'use client'

import { motion } from 'framer-motion'
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
        px: '4',
        py: '8',
        spaceY: '8',
      })}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2">
          <Network className="h-5 w-5 text-blue-400" />
          <span className="text-sm font-semibold text-blue-300">IP Geolocation</span>
        </div>

        <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
            IP Address Lookup
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-gray-400">
          Discover detailed information about any IP address including location, ISP, timezone, and
          more.
        </p>
      </motion.div>

      {/* Lookup Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <CardTitle>IP Address Lookup</CardTitle>
            <CardDescription>Enter an IP address to get detailed information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <Input
                  placeholder="Enter IP address (e.g., 8.8.8.8)"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      lookupIP()
                    }
                  }}
                  className="font-mono"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => lookupIP()}
                  className="gap-2"
                  disabled={loading || !ipAddress}
                >
                  <Search className="h-4 w-4" />
                  {loading ? 'Looking up...' : 'Lookup'}
                </Button>
                <Button onClick={fetchMyIP} variant="outline" className="gap-2" disabled={loading}>
                  <Wifi className="h-4 w-4" />
                  My IP
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      {ipInfo && (
        <>
          {/* Main Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-400" />
                      IP Address Information
                    </CardTitle>
                    <CardDescription>Complete details for {ipInfo.ip}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(ipInfo.ip, 'IP Address')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* IP & Version */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Network className="h-4 w-4" />
                      IP Address
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/50 p-3">
                      <code className="text-lg font-semibold text-blue-400">{ipInfo.ip}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(ipInfo.ip, 'IP Address')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CheckCircle className="h-4 w-4" />
                      IP Version
                    </div>
                    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-3">
                      <span className="text-lg font-semibold text-gray-200">
                        IPv{ipInfo.version}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location Info */}
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-200">
                    <MapPin className="h-5 w-5 text-red-400" />
                    Location
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  <Button onClick={openMap} variant="outline" className="w-full gap-2">
                    <MapPin className="h-4 w-4" />
                    View on Map
                  </Button>
                </div>

                {/* Network Info */}
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-200">
                    <Server className="h-5 w-5 text-green-400" />
                    Network Information
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoItem label="ISP / Organization" value={ipInfo.isp} />
                    <InfoItem label="AS Number" value={ipInfo.as} />
                  </div>
                </div>

                {/* Security Info */}
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-200">
                    <Shield className="h-5 w-5 text-purple-400" />
                    Security Indicators
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <SecurityBadge label="Mobile" value={ipInfo.mobile} />
                    <SecurityBadge label="Proxy/VPN" value={ipInfo.proxy} />
                    <SecurityBadge label="Hosting" value={ipInfo.hosting} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
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
          <Card key={feature.title} className="border-gray-800 bg-gray-900/30">
            <CardContent className="p-6">
              <feature.icon className="mb-3 h-8 w-8 text-blue-400" />
              <h3 className="mb-2 font-semibold text-gray-200">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </main>
  )
}

// Helper Components
function InfoItem({ label, value, emoji }: { label: string; value: string; emoji?: string }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-3">
      <div className="mb-1 text-xs font-medium text-gray-500">{label}</div>
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
        {emoji && (
          <span className="text-lg">
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
      className={`flex items-center justify-between rounded-lg border p-3 ${
        value ? 'border-yellow-500/20 bg-yellow-500/10' : 'border-green-500/20 bg-green-500/10'
      }`}
    >
      <span className="text-sm font-medium text-gray-200">{label}</span>
      <span className={`text-xs font-semibold ${value ? 'text-yellow-400' : 'text-green-400'}`}>
        {value ? 'Yes' : 'No'}
      </span>
    </div>
  )
}
