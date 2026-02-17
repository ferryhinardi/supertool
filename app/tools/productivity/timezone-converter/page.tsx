'use client'

import { setHours, setMinutes } from 'date-fns'
import { format, toZonedTime } from 'date-fns-tz'
import { Clock, Globe, MapPin, Plus, Star, Trash2, X } from 'lucide-react'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface TimezoneItem {
  id: string
  timezone: string
  label?: string
}

interface Favorite {
  id: string
  timezones: string[]
  name?: string
}

// Popular timezones with labels
const POPULAR_TIMEZONES = [
  { value: 'America/New_York', label: 'New York (EST)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST)' },
  { value: 'America/Chicago', label: 'Chicago (CST)' },
  { value: 'America/Denver', label: 'Denver (MST)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZDT)' },
  { value: 'UTC', label: 'UTC' },
]

// All available timezones (subset for common use)
const ALL_TIMEZONES = [
  ...POPULAR_TIMEZONES,
  { value: 'America/Toronto', label: 'Toronto' },
  { value: 'America/Vancouver', label: 'Vancouver' },
  { value: 'America/Mexico_City', label: 'Mexico City' },
  { value: 'America/Sao_Paulo', label: 'São Paulo' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires' },
  { value: 'Europe/Moscow', label: 'Moscow' },
  { value: 'Europe/Istanbul', label: 'Istanbul' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam' },
  { value: 'Africa/Cairo', label: 'Cairo' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg' },
  { value: 'Asia/Seoul', label: 'Seoul' },
  { value: 'Asia/Bangkok', label: 'Bangkok' },
  { value: 'Asia/Jakarta', label: 'Jakarta' },
  { value: 'Asia/Manila', label: 'Manila' },
  { value: 'Australia/Melbourne', label: 'Melbourne' },
  { value: 'Pacific/Fiji', label: 'Fiji' },
  { value: 'Pacific/Honolulu', label: 'Honolulu' },
]

function TimezoneConverterContent() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [timezones, setTimezones] = useState<TimezoneItem[]>(() => [
    { id: '1', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, label: 'Local Time' },
    { id: '2', timezone: 'UTC', label: 'UTC' },
  ])
  const [searchQuery, setSearchQuery] = useState('')
  const [favorites, setFavorites] = useState<Favorite[]>(() => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('timezoneConverterFavorites')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.error('Failed to load favorites:', error)
        return []
      }
    }
    return []
  })

  // Save favorites to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (favorites.length > 0) {
        localStorage.setItem('timezoneConverterFavorites', JSON.stringify(favorites))
      } else {
        localStorage.removeItem('timezoneConverterFavorites')
      }
    }
  }, [favorites])

  // Track page visit
  useEffect(() => {
    trackToolEvent('timezone_converter_open', {})
  }, [])

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setSelectedDate(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  const handleAddTimezone = (timezone: string) => {
    const tzData = ALL_TIMEZONES.find((tz) => tz.value === timezone)
    const newTimezone: TimezoneItem = {
      id: Date.now().toString(),
      timezone,
      label: tzData?.label,
    }
    setTimezones([...timezones, newTimezone])
    setSearchQuery('')
    toast.success(`Added ${tzData?.label || timezone}`)
    trackToolEvent('timezone_converter_add', { timezone })
  }

  const handleRemoveTimezone = (id: string) => {
    setTimezones(timezones.filter((tz) => tz.id !== id))
    toast.success('Timezone removed')
    trackToolEvent('timezone_converter_remove', {})
  }

  const handleTimeChange = (hours: number, minutes: number) => {
    const newDate = setMinutes(setHours(selectedDate, hours), minutes)
    setSelectedDate(newDate)
    trackToolEvent('timezone_converter_time_change', {})
  }

  const handleAddFavorite = () => {
    const newFavorite: Favorite = {
      id: Date.now().toString(),
      timezones: timezones.map((tz) => tz.timezone),
    }
    setFavorites([...favorites, newFavorite])
    toast.success('Added to favorites! ⭐')
    trackToolEvent('timezone_converter_favorite_add', {})
  }

  const handleRemoveFavorite = (id: string) => {
    setFavorites(favorites.filter((f) => f.id !== id))
    toast.success('Removed from favorites')
    trackToolEvent('timezone_converter_favorite_remove', {})
  }

  const handleLoadFavorite = (favorite: Favorite) => {
    const newTimezones: TimezoneItem[] = favorite.timezones.map((tz, index) => {
      const tzData = ALL_TIMEZONES.find((t) => t.value === tz)
      return {
        id: `${Date.now()}_${index}`,
        timezone: tz,
        label: tzData?.label,
      }
    })
    setTimezones(newTimezones)
    toast.success('Loaded favorite configuration')
    trackToolEvent('timezone_converter_favorite_load', {})
  }

  const filteredTimezones = useMemo(() => {
    if (!searchQuery) return POPULAR_TIMEZONES
    const query = searchQuery.toLowerCase()
    return ALL_TIMEZONES.filter(
      (tz) => tz.label.toLowerCase().includes(query) || tz.value.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const getTimeForTimezone = (timezone: string) => {
    try {
      const zonedDate = toZonedTime(selectedDate, timezone)
      const timeString = format(zonedDate, 'HH:mm', { timeZone: timezone })
      const dateString = format(zonedDate, 'EEE, MMM d, yyyy', { timeZone: timezone })
      const offsetString = format(zonedDate, 'XXX', { timeZone: timezone })
      return { timeString, dateString, offsetString }
    } catch (error) {
      console.error('Error converting timezone:', error)
      return { timeString: '--:--', dateString: 'Invalid timezone', offsetString: '+00:00' }
    }
  }

  const isDaytime = (timezone: string) => {
    try {
      const zonedDate = toZonedTime(selectedDate, timezone)
      const hour = zonedDate.getHours()
      return hour >= 6 && hour < 18
    } catch {
      return true
    }
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
          <Globe className={css({ h: '5', w: '5', color: 'indigo.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'indigo.300' })}>
            DST Aware • Real-time Updates
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'indigo.400',
            gradientVia: 'blue.400',
            gradientTo: 'cyan.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Timezone Converter
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'white',
          })}
        >
          Convert time across multiple timezones with DST awareness. Perfect for scheduling
          international meetings and coordinating with remote teams.
        </p>
      </div>

      {/* Time Slider */}
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
            borderColor: 'indigo.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <Clock className={css({ h: '5', w: '5' })} />
              Meeting Time Planner
            </CardTitle>
            <CardDescription>Adjust time to see how it converts across timezones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={css({ spaceY: '4' })}>
              <div className={css({ display: 'flex', gap: '4', alignItems: 'center' })}>
                <Input
                  type="time"
                  value={format(selectedDate, 'HH:mm')}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':').map(Number)
                    handleTimeChange(hours, minutes)
                  }}
                  className={css({
                    maxW: '40',
                    fontSize: 'lg',
                    fontWeight: 'bold',
                  })}
                />
                <Button
                  onClick={() => setSelectedDate(new Date())}
                  variant="outline"
                  className={css({ gap: '2' })}
                >
                  <Clock className={css({ h: '4', w: '4' })} />
                  Now
                </Button>
              </div>
              <div className={css({ fontSize: 'sm', color: 'white' })}>
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timezone Cards */}
      <div
        className={css({
          spaceY: '4',
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.2s',
          opacity: 0,
        })}
      >
        <div
          className={css({
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          })}
        >
          <h2 className={css({ fontSize: '2xl', fontWeight: 'bold' })}>Timezones</h2>
          <Button
            onClick={handleAddFavorite}
            variant="outline"
            className={css({ gap: '2' })}
            disabled={timezones.length === 0}
          >
            <Star className={css({ h: '4', w: '4' })} />
            Save Configuration
          </Button>
        </div>

        <div className={css({ spaceY: '3' })}>
          {timezones.map((tz) => {
            const { timeString, dateString, offsetString } = getTimeForTimezone(tz.timezone)
            const isDay = isDaytime(tz.timezone)

            return (
              <Card
                key={tz.id}
                className={css({
                  border: '1px solid',
                  borderColor: isDay ? 'blue.500/20' : 'purple.500/20',
                  bg: isDay ? 'blue.900/20' : 'purple.900/20',
                  backdropFilter: 'blur(16px)',
                  transition: 'all 0.2s',
                  _hover: {
                    borderColor: isDay ? 'blue.500/40' : 'purple.500/40',
                    transform: 'translateY(-2px)',
                  },
                })}
              >
                <CardContent withTopPadding className={css({ pt: '4', pb: '4' })}>
                  <div
                    className={css({
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    })}
                  >
                    <div className={css({ spaceY: '1' })}>
                      <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                        <MapPin className={css({ h: '4', w: '4', color: 'white' })} />
                        <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold' })}>
                          {tz.label || tz.timezone}
                        </h3>
                        <Badge variant="outline">{offsetString}</Badge>
                      </div>
                      <p className={css({ fontSize: 'sm', color: 'white' })}>{dateString}</p>
                    </div>
                    <div className={css({ display: 'flex', alignItems: 'center', gap: '4' })}>
                      <div className={css({ textAlign: 'right' })}>
                        <div
                          className={css({
                            fontSize: '3xl',
                            fontWeight: 'bold',
                            color: isDay ? 'blue.300' : 'purple.300',
                          })}
                        >
                          {timeString}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleRemoveTimezone(tz.id)}
                        variant="ghost"
                        size="sm"
                        className={css({ color: 'red.400', _hover: { color: 'red.300' } })}
                      >
                        <Trash2 className={css({ h: '4', w: '4' })} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Add Timezone */}
      <div
        className={css({
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.3s',
          opacity: 0,
        })}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'gray.700/50',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <Plus className={css({ h: '5', w: '5' })} />
              Add Timezone
            </CardTitle>
            <CardDescription>Search and add timezones to compare</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={css({ spaceY: '4' })}>
              <Input
                type="text"
                placeholder="Search timezones (e.g., Tokyo, London, PST)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: {
                    base: 'repeat(2, 1fr)',
                    sm: 'repeat(3, 1fr)',
                    md: 'repeat(4, 1fr)',
                  },
                  gap: '2',
                  maxH: '64',
                  overflowY: 'auto',
                  w: 'full',
                })}
              >
                {filteredTimezones.map((tz) => {
                  const isAdded = timezones.some((t) => t.timezone === tz.value)
                  return (
                    <Button
                      key={tz.value}
                      onClick={() => !isAdded && handleAddTimezone(tz.value)}
                      disabled={isAdded}
                      variant="outline"
                      size="sm"
                      className={css({
                        justifyContent: 'start',
                        opacity: isAdded ? 0.5 : 1,
                        cursor: isAdded ? 'not-allowed' : 'pointer',
                      })}
                    >
                      {tz.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <div
          className={css({
            animation: 'slideUp 0.5s ease-out forwards',
            animationDelay: '0.4s',
            opacity: 0,
          })}
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
              <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Star className={css({ h: '5', w: '5', color: 'yellow.400' })} />
                Saved Configurations
              </CardTitle>
              <CardDescription>Quick access to your favorite timezone sets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={css({ spaceY: '2' })}>
                {favorites.map((fav) => (
                  <div
                    key={fav.id}
                    className={css({
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: '3',
                      rounded: 'lg',
                      bg: 'gray.800/50',
                      border: '1px solid',
                      borderColor: 'gray.700/50',
                      _hover: {
                        bg: 'gray.800',
                        borderColor: 'gray.600',
                      },
                    })}
                  >
                    <div className={css({ spaceY: '1' })}>
                      <div className={css({ fontSize: 'sm', fontWeight: 'medium' })}>
                        {fav.timezones.length} timezones
                      </div>
                      <div className={css({ fontSize: 'xs', color: 'white' })}>
                        {fav.timezones.slice(0, 3).join(', ')}
                        {fav.timezones.length > 3 && '...'}
                      </div>
                    </div>
                    <div className={css({ display: 'flex', gap: '2' })}>
                      <Button onClick={() => handleLoadFavorite(fav)} variant="outline" size="sm">
                        Load
                      </Button>
                      <Button
                        onClick={() => handleRemoveFavorite(fav.id)}
                        variant="ghost"
                        size="sm"
                        className={css({ color: 'red.400', _hover: { color: 'red.300' } })}
                      >
                        <X className={css({ h: '4', w: '4' })} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}

export default function TimezoneConverterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TimezoneConverterContent />
    </Suspense>
  )
}
