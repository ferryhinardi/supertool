import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const BASE_URL = (process.env.SEO_AUDIT_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '')
const EVIDENCE_PATH = resolve('.sisyphus/evidence/seo-audit-2026-04.json')
const BACKLOG_PATH = resolve('docs/SEO_BACKLOG.md')
const TOOL_ROOT = resolve('app/tools')
const TITLE_LIMIT = 60
const DESCRIPTION_LIMIT = 160

const decodeHtml = (value) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()

const escapePipes = (value) => value.replace(/\|/g, '\\|').replace(/\n/g, ' ')

const normalizePathname = (value) => {
  if (!value) {
    return null
  }

  try {
    const url = value.startsWith('http://') || value.startsWith('https://')
      ? new URL(value)
      : new URL(value, BASE_URL)
    const pathname = url.pathname.replace(/\/$/, '')
    return pathname || '/'
  } catch {
    return value.replace(/\/$/, '') || '/'
  }
}

const getPriority = (code) => {
  switch (code) {
    case 'sitemap_missing_route':
    case 'robots_missing_api_disallow':
    case 'missing_title':
    case 'missing_description':
    case 'missing_canonical':
    case 'canonical_mismatch':
    case 'invalid_jsonld':
      return 'high'
    case 'missing_og_image':
    case 'missing_softwareapplication_schema':
      return 'medium'
    case 'title_too_long':
    case 'description_too_long':
      return 'low'
    default:
      return 'medium'
  }
}

const getMetaContent = (html, name, attribute = 'name') => {
  const pattern = new RegExp(
    `<meta[^>]*${attribute}=["']${name}["'][^>]*content=["']([^"']*)["'][^>]*>`,
    'i'
  )
  const reversePattern = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*${attribute}=["']${name}["'][^>]*>`,
    'i'
  )

  const match = html.match(pattern) || html.match(reversePattern)
  return match ? decodeHtml(match[1]) : null
}

const getCanonical = (html) => {
  const match = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)
  const reverseMatch =
    match ||
    html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i)

  return reverseMatch ? decodeHtml(reverseMatch[1]) : null
}

const getTitle = (html) => {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  return match ? decodeHtml(match[1]) : null
}

const collectTypes = (value, collectedTypes) => {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectTypes(item, collectedTypes)
    }
    return
  }

  if (!value || typeof value !== 'object') {
    return
  }

  const typeValue = value['@type']
  if (typeof typeValue === 'string') {
    collectedTypes.add(typeValue)
  } else if (Array.isArray(typeValue)) {
    for (const type of typeValue) {
      if (typeof type === 'string') {
        collectedTypes.add(type)
      }
    }
  }

  if (Array.isArray(value['@graph'])) {
    collectTypes(value['@graph'], collectedTypes)
  }

  for (const nestedValue of Object.values(value)) {
    if (nestedValue && typeof nestedValue === 'object') {
      collectTypes(nestedValue, collectedTypes)
    }
  }
}

const getJsonLdScripts = (html) => {
  const matches = html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )

  return Array.from(matches, (match) => match[1].trim()).filter(Boolean)
}

const parseJsonLd = (scripts) => {
  const parsed = []
  const invalid = []

  for (const content of scripts) {
    try {
      parsed.push(JSON.parse(content))
    } catch (error) {
      invalid.push({
        contentSnippet: content.slice(0, 200),
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const types = new Set()
  for (const item of parsed) {
    collectTypes(item, types)
  }

  return {
    count: scripts.length,
    invalid,
    parsedCount: parsed.length,
    types: Array.from(types).sort(),
  }
}

const getSourceFile = (href) => {
  const layoutPath = resolve(`app${href}/layout.tsx`)
  if (existsSync(layoutPath)) {
    return `app${href}/layout.tsx`
  }

  return `app${href}/page.tsx`
}

const getToolRoutes = async () => {
  const categories = await readdir(TOOL_ROOT, { withFileTypes: true })
  const toolRoutes = []

  for (const categoryEntry of categories) {
    if (!categoryEntry.isDirectory()) {
      continue
    }

    const categoryPath = resolve(TOOL_ROOT, categoryEntry.name)
    const toolEntries = await readdir(categoryPath, { withFileTypes: true })

    for (const toolEntry of toolEntries) {
      if (!toolEntry.isDirectory()) {
        continue
      }

      const href = `/tools/${categoryEntry.name}/${toolEntry.name}`
      const pagePath = resolve(`app${href}/page.tsx`)
      if (!existsSync(pagePath)) {
        continue
      }

      toolRoutes.push({
        href,
        pageFile: `app${href}/page.tsx`,
        sourceFile: getSourceFile(href),
      })
    }
  }

  return toolRoutes.sort((a, b) => a.href.localeCompare(b.href))
}

const createIssue = (code, details) => ({
  code,
  priority: getPriority(code),
  ...details,
})

const auditTool = async (toolRoute) => {
  const url = `${BASE_URL}${toolRoute.href}`
  const response = await fetch(url, { redirect: 'follow' })

  if (!response.ok) {
    return {
      ...toolRoute,
      url,
      status: response.status,
      title: null,
      titleLength: 0,
      description: null,
      descriptionLength: 0,
      canonical: null,
      ogImage: null,
      jsonLd: { count: 0, parsedCount: 0, invalid: [], types: [] },
      issues: [
        createIssue('fetch_failed', {
          message: `Received HTTP ${response.status} while fetching route`,
        }),
      ],
    }
  }

  const html = await response.text()
  const title = getTitle(html)
  const description = getMetaContent(html, 'description')
  const canonical = getCanonical(html)
  const ogImage = getMetaContent(html, 'og:image', 'property')
  const jsonLd = parseJsonLd(getJsonLdScripts(html))
  const expectedCanonical = `${BASE_URL}${toolRoute.href}`
  const canonicalPathname = normalizePathname(canonical)
  const expectedPathname = normalizePathname(toolRoute.href)

  const issues = []
  if (!title) {
    issues.push(createIssue('missing_title', { message: 'Missing <title> element' }))
  } else if (title.length > TITLE_LIMIT) {
    issues.push(
      createIssue('title_too_long', {
        message: `Title length ${title.length} exceeds ${TITLE_LIMIT} characters`,
      })
    )
  }

  if (!description) {
    issues.push(createIssue('missing_description', { message: 'Missing meta description' }))
  } else if (description.length > DESCRIPTION_LIMIT) {
    issues.push(
      createIssue('description_too_long', {
        message: `Description length ${description.length} exceeds ${DESCRIPTION_LIMIT} characters`,
      })
    )
  }

  if (!canonical) {
    issues.push(createIssue('missing_canonical', { message: 'Missing canonical link' }))
  } else if (canonicalPathname !== expectedPathname) {
    issues.push(
      createIssue('canonical_mismatch', {
        message: `Canonical path ${canonicalPathname} does not match expected ${expectedPathname}`,
      })
    )
  }

  if (!ogImage) {
    issues.push(createIssue('missing_og_image', { message: 'Missing og:image meta tag' }))
  }

  if (jsonLd.invalid.length > 0) {
    issues.push(
      createIssue('invalid_jsonld', {
        message: `${jsonLd.invalid.length} JSON-LD block(s) failed to parse`,
        details: jsonLd.invalid,
      })
    )
  }

  if (!jsonLd.types.includes('SoftwareApplication')) {
    issues.push(
      createIssue('missing_softwareapplication_schema', {
        message: 'Missing SoftwareApplication JSON-LD schema',
        detectedTypes: jsonLd.types,
      })
    )
  }

  return {
    ...toolRoute,
    url,
    status: response.status,
    title,
    titleLength: title?.length ?? 0,
    description,
    descriptionLength: description?.length ?? 0,
    canonical,
    expectedCanonical,
    ogImage,
    jsonLd,
    issues,
  }
}

const auditSitewide = async (toolRoutes) => {
  const [sitemapResponse, robotsResponse] = await Promise.all([
    fetch(`${BASE_URL}/sitemap.xml`, { redirect: 'follow' }),
    fetch(`${BASE_URL}/robots.txt`, { redirect: 'follow' }),
  ])

  const sitemapXml = sitemapResponse.ok ? await sitemapResponse.text() : ''
  const robotsTxt = robotsResponse.ok ? await robotsResponse.text() : ''
  const locMatches = Array.from(sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1])
  const toolUrlsInSitemap = locMatches.filter((loc) => loc.includes('/tools/'))
  const toolPathsInSitemap = toolUrlsInSitemap.map((loc) => normalizePathname(loc))
  const expectedToolUrls = toolRoutes.map((route) => `${BASE_URL}${route.href}`)
  const expectedToolPaths = toolRoutes.map((route) => normalizePathname(route.href))
  const missingRoutes = expectedToolPaths.filter((path) => !toolPathsInSitemap.includes(path))

  const issues = []
  if (!robotsTxt.includes('Disallow: /api/') && !robotsTxt.includes('Disallow: /api')) {
    issues.push(
      createIssue('robots_missing_api_disallow', {
        message: 'robots.txt does not disallow /api routes',
      })
    )
  }

  for (const missingRoute of missingRoutes) {
    issues.push(
      createIssue('sitemap_missing_route', {
        message: `Sitemap is missing ${missingRoute}`,
        route: `${BASE_URL}${missingRoute}`,
      })
    )
  }

  return {
    sitemap: {
      exists: sitemapResponse.ok,
      toolRouteCount: toolUrlsInSitemap.length,
      expectedToolRouteCount: expectedToolUrls.length,
      missingRoutes,
    },
    robots: {
      exists: robotsResponse.ok,
      disallowsApi: robotsTxt.includes('Disallow: /api/') || robotsTxt.includes('Disallow: /api'),
      content: robotsTxt,
    },
    issues,
  }
}

const writeBacklog = async (report) => {
  const rows = []

  for (const issue of report.sitewide.issues) {
    rows.push({
      priority: issue.priority,
      route: issue.route || 'sitewide',
      source: issue.code.startsWith('robots') ? 'app/robots.ts' : 'app/sitemap.ts',
      issue: issue.code,
      details: issue.message,
    })
  }

  for (const toolReport of report.tools) {
    for (const issue of toolReport.issues) {
      rows.push({
        priority: issue.priority,
        route: toolReport.href,
        source: toolReport.sourceFile,
        issue: issue.code,
        details: issue.message,
      })
    }
  }

  const priorityRank = { high: 0, medium: 1, low: 2 }
  rows.sort((a, b) => {
    const priorityDifference = priorityRank[a.priority] - priorityRank[b.priority]
    if (priorityDifference !== 0) {
      return priorityDifference
    }

    return a.route.localeCompare(b.route)
  })

  const markdown = [
    '# SEO Backlog',
    '',
    '> Generated by `pnpm seo:audit`. Measurement only — do not treat this file as implemented fixes.',
    '',
    `- Generated at: ${report.generatedAt}`,
    `- Tool routes audited: ${report.summary.totalToolRoutes}`,
    `- Routes with SEO gaps: ${report.summary.routesWithIssues}`,
    `- Total issues: ${report.summary.totalIssues}`,
    '',
    '## Priority Guide',
    '',
    '- **high**: canonical/sitemap/robots/invalid JSON-LD or missing core metadata',
    '- **medium**: missing og:image or missing SoftwareApplication schema',
    '- **low**: title/description length tuning',
    '',
    '## Gaps',
    '',
    '| Priority | Route | Source | Issue | Details |',
    '| --- | --- | --- | --- | --- |',
    ...rows.map(
      (row) =>
        `| ${row.priority} | ${escapePipes(row.route)} | ${escapePipes(row.source)} | ${escapePipes(row.issue)} | ${escapePipes(row.details)} |`
    ),
    '',
  ].join('\n')

  await mkdir(dirname(BACKLOG_PATH), { recursive: true })
  await writeFile(BACKLOG_PATH, markdown, 'utf8')
}

const ensureBaseUrlIsReachable = async () => {
  const response = await fetch(BASE_URL, { redirect: 'follow' }).catch(() => null)
  if (!response?.ok) {
    throw new Error(`Unable to reach ${BASE_URL}. Start the app first, then rerun pnpm seo:audit.`)
  }
}

const run = async () => {
  await ensureBaseUrlIsReachable()

  const toolRoutes = await getToolRoutes()
  const toolReports = []

  for (const toolRoute of toolRoutes) {
    process.stdout.write(`Auditing ${toolRoute.href}...\n`)
    toolReports.push(await auditTool(toolRoute))
  }

  const sitewide = await auditSitewide(toolRoutes)
  const routesWithIssues = toolReports.filter((tool) => tool.issues.length > 0).length
  const totalIssues =
    sitewide.issues.length + toolReports.reduce((sum, tool) => sum + tool.issues.length, 0)

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      totalToolRoutes: toolRoutes.length,
      routesWithIssues,
      totalIssues,
    },
    sitewide,
    tools: toolReports,
  }

  await mkdir(dirname(EVIDENCE_PATH), { recursive: true })
  await writeFile(EVIDENCE_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  await writeBacklog(report)

  process.stdout.write(`Saved SEO audit report to ${EVIDENCE_PATH}\n`)
  process.stdout.write(`Saved SEO backlog to ${BACKLOG_PATH}\n`)
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
