'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { type Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'
import { reportWebVitals, trackToolEvent } from '@/lib/services/analytics'

const normalizeMetricValue = (metric: Metric): number =>
  Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value)

const getToolSlug = (pathname: string | null): string => {
  if (!pathname?.startsWith('/tools/')) {
    return 'site'
  }

  const segments = pathname
    .replace(/^\/tools\//, '')
    .split('/')
    .filter(Boolean)

  return segments.length > 0 ? segments.join('-') : 'site'
}

const createMetricHandler = (pathnameRef: React.MutableRefObject<string | null>) => {
  return (metric: Metric) => {
    reportWebVitals({
      id: metric.id,
      name: metric.name,
      label: 'web-vital',
      value: metric.value,
    })

    const toolSlug = getToolSlug(pathnameRef.current)

    trackToolEvent('web_vitals', {
      metric: metric.name,
      tool_slug: toolSlug,
      value: normalizeMetricValue(metric),
    })
  }
}

export default function WebVitalsReporter() {
  const pathname = usePathname()
  const pathnameRef = useRef<string | null>(pathname)

  useEffect(() => {
    pathnameRef.current = pathname
  }, [pathname])

  useEffect(() => {
    const handleMetric = createMetricHandler(pathnameRef)

    onCLS(handleMetric)
    onINP(handleMetric)
    onLCP(handleMetric)
    onFCP(handleMetric)
    onTTFB(handleMetric)
  }, [])

  return null
}
