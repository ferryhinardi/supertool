import { execFile } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const BASE_URL = (process.env.LIGHTHOUSE_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '')
const OUTPUT_PATH = resolve('.sisyphus/evidence/perf-baseline-2026-04.json')

const TOP_TOOLS = [
  {
    name: 'unit-converter',
    path: '/tools/productivity/unit-converter',
  },
  {
    name: 'json-formatter',
    path: '/tools/data/json-beautify',
  },
  {
    name: 'base64',
    path: '/tools/security/base64',
  },
  {
    name: 'url-encoder',
    path: '/tools/development/url-encoder',
  },
  {
    name: 'qr-generator',
    path: '/tools/productivity/qr-code',
  },
  {
    name: 'password-strength-checker',
    path: '/tools/security/password-strength',
  },
  {
    name: 'color-picker',
    path: '/tools/design/color-picker',
  },
  {
    name: 'regex-tester',
    path: '/tools/development/regex-tester',
  },
  {
    name: 'markdown-preview',
    path: '/tools/productivity/markdown-editor',
  },
  {
    name: 'jwt-decoder',
    path: '/tools/development/jwt-decoder',
  },
]

const getNumericAuditValue = (audits, key) => {
  const value = audits[key]?.numericValue
  return typeof value === 'number' ? value : null
}

const getTtfbValue = (audits) => {
  const metricsItem = audits.metrics?.details?.items?.[0]
  const observedTimeToFirstByte = metricsItem?.observedTimeToFirstByte

  if (typeof observedTimeToFirstByte === 'number') {
    return observedTimeToFirstByte
  }

  return getNumericAuditValue(audits, 'server-response-time')
}

const runLighthouse = async (url) => {
  const { stdout } = await execFileAsync(
    'npx',
    [
      'lighthouse',
      url,
      '--output=json',
      '--output-path=stdout',
      '--quiet',
      '--chrome-flags=--headless --no-sandbox',
      '--only-categories=performance',
      '--preset=desktop',
    ],
    {
      maxBuffer: 20 * 1024 * 1024,
    },
  )

  return JSON.parse(stdout)
}

const ensureBaseUrlIsReachable = async () => {
  const response = await fetch(BASE_URL, {
    redirect: 'follow',
  }).catch(() => null)

  if (!response?.ok) {
    throw new Error(
      `Unable to reach ${BASE_URL}. Start the production server first, then rerun pnpm perf:baseline.`,
    )
  }
}

const collectBaseline = async () => {
  await ensureBaseUrlIsReachable()

  const results = []

  for (const tool of TOP_TOOLS) {
    const url = `${BASE_URL}${tool.path}`
    process.stdout.write(`Measuring ${tool.name} (${url})...\n`)

    const lighthouseResult = await runLighthouse(url)
    const audits = lighthouseResult.audits ?? {}

    results.push({
      tool: tool.name,
      path: tool.path,
      url,
      lcp: getNumericAuditValue(audits, 'largest-contentful-paint'),
      inp: getNumericAuditValue(audits, 'interaction-to-next-paint'),
      cls: getNumericAuditValue(audits, 'cumulative-layout-shift'),
      ttfb: getTtfbValue(audits),
      fcp: getNumericAuditValue(audits, 'first-contentful-paint'),
      performanceScore: lighthouseResult.categories?.performance?.score ?? null,
      capturedAt: new Date().toISOString(),
    })
  }

  await mkdir(dirname(OUTPUT_PATH), { recursive: true })
  await writeFile(OUTPUT_PATH, `${JSON.stringify(results, null, 2)}\n`, 'utf8')

  process.stdout.write(`Saved baseline to ${OUTPUT_PATH}\n`)
}

collectBaseline().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
