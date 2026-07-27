import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { tools } from '../../lib/data/tools'

type BlockingImpact = 'critical' | 'serious'

interface ToolTarget {
  title: string
  href: string
  sourceFile: string
}

interface BlockingViolationRecord {
  id: string
  impact: BlockingImpact
  help: string
  helpUrl: string
  nodeCount: number
  targets: string[]
  htmlSnippets: string[]
  failureSummaries: string[]
}

interface ToolA11yResult {
  title: string
  href: string
  sourceFile: string
  blockingViolationCount: number
  blockingViolations: BlockingViolationRecord[]
}

const EVIDENCE_PATH = resolve(process.cwd(), '.sisyphus/evidence/a11y-violations-2026-04.json')
const BACKLOG_PATH = resolve(process.cwd(), 'docs/A11Y_BACKLOG.md')

const baselineTopTen: ToolTarget[] = [
  {
    title: 'Unit Converter',
    href: '/tools/productivity/unit-converter',
    sourceFile: 'app/tools/productivity/unit-converter/page.tsx',
  },
  {
    title: 'JSON Beautifier & Formatter',
    href: '/tools/data/json-beautify',
    sourceFile: 'app/tools/data/json-beautify/page.tsx',
  },
  {
    title: 'Base64 Encoder & Decoder',
    href: '/tools/security/base64',
    sourceFile: 'app/tools/security/base64/page.tsx',
  },
  {
    title: 'URL Encoder/Decoder',
    href: '/tools/development/url-encoder',
    sourceFile: 'app/tools/development/url-encoder/page.tsx',
  },
  {
    title: 'QR Code Generator',
    href: '/tools/productivity/qr-code',
    sourceFile: 'app/tools/productivity/qr-code/page.tsx',
  },
  {
    title: 'Password Strength Analyzer',
    href: '/tools/security/password-strength',
    sourceFile: 'app/tools/security/password-strength/page.tsx',
  },
  {
    title: 'Color Picker & Palette Generator',
    href: '/tools/design/color-picker',
    sourceFile: 'app/tools/design/color-picker/page.tsx',
  },
  {
    title: 'Regex Tester',
    href: '/tools/development/regex-tester',
    sourceFile: 'app/tools/development/regex-tester/page.tsx',
  },
  {
    title: 'Markdown Editor & Preview',
    href: '/tools/productivity/markdown-editor',
    sourceFile: 'app/tools/productivity/markdown-editor/page.tsx',
  },
  {
    title: 'JWT Decoder & Inspector',
    href: '/tools/development/jwt-decoder',
    sourceFile: 'app/tools/development/jwt-decoder/page.tsx',
  },
]

const topTwentyTools = (() => {
  const seen = new Set(baselineTopTen.map((tool) => tool.href))
  const nextTen = tools
    .filter((tool) => tool.href.startsWith('/tools/'))
    .filter((tool) => !tool.comingSoon)
    .filter((tool) => !seen.has(tool.href))
    .slice(0, 10)
    .map((tool) => ({
      title: tool.title,
      href: tool.href,
      sourceFile: `app${tool.href}/page.tsx`,
    }))

  return [...baselineTopTen, ...nextTen]
})()

function isBlockingImpact(impact: string | null | undefined): impact is BlockingImpact {
  return impact === 'critical' || impact === 'serious'
}

function toBlockingViolationRecord(
  violation: (typeof AxeBuilder.prototype.analyze extends () => Promise<infer TResult>
    ? Awaited<TResult>
    : never)['violations'][number]
): BlockingViolationRecord {
  return {
    id: violation.id,
    impact: violation.impact as BlockingImpact,
    help: violation.help,
    helpUrl: violation.helpUrl,
    nodeCount: violation.nodes.length,
    targets: violation.nodes.map((node) => JSON.stringify(node.target)),
    htmlSnippets: violation.nodes.map((node) => node.html),
    failureSummaries: violation.nodes.map(
      (node) => node.failureSummary ?? 'No failure summary provided'
    ),
  }
}

function writeArtifacts(collectedResults: ToolA11yResult[]) {
  mkdirSync(dirname(EVIDENCE_PATH), { recursive: true })
  writeFileSync(EVIDENCE_PATH, `${JSON.stringify(collectedResults, null, 2)}\n`)

  const blockingEntries = collectedResults.flatMap((result) =>
    result.blockingViolations.flatMap((violation) =>
      violation.targets.map((target, index) => ({
        title: result.title,
        href: result.href,
        sourceLocation: `${result.sourceFile}:unknown`,
        severity: violation.impact,
        ruleId: violation.id,
        help: violation.help,
        helpUrl: violation.helpUrl,
        target,
        htmlSnippet: violation.htmlSnippets[index] ?? 'Unavailable',
        failureSummary: violation.failureSummaries[index] ?? 'Unavailable',
      }))
    )
  )

  const lines = [
    '# Accessibility Backlog',
    '',
    'Generated from the Task 13 axe-core Playwright sweep across the top 20 tools.',
    '',
    '> Note: axe runtime reports DOM targets/snippets, not trustworthy source line numbers. Entries therefore use `:unknown` instead of invented line numbers.',
    '',
  ]

  if (blockingEntries.length === 0) {
    lines.push('No serious or critical violations were found in the current sweep.', '')
  } else {
    lines.push('| Tool | Route | Source | Severity | Rule | Target | Notes |')
    lines.push('| --- | --- | --- | --- | --- | --- | --- |')

    for (const entry of blockingEntries) {
      const note = `${entry.help}. ${entry.failureSummary}`
        .replace(/\|/g, '\\|')
        .replace(/\n+/g, ' ')
      const target = entry.target.replace(/\|/g, '\\|')
      lines.push(
        `| ${entry.title} | ${entry.href} | ${entry.sourceLocation} | ${entry.severity} | ${entry.ruleId} | ${target} | ${note} |`
      )
      lines.push(`|  |  |  |  |  | HTML snippet | \`${entry.htmlSnippet.replace(/`/g, '\\`')}\` |`)
    }

    lines.push('')
  }

  mkdirSync(dirname(BACKLOG_PATH), { recursive: true })
  writeFileSync(BACKLOG_PATH, `${lines.join('\n')}\n`)
}

function formatBlockingViolations(tool: ToolTarget, blockingViolations: BlockingViolationRecord[]) {
  const summaries = blockingViolations.map((violation) => {
    const targets = violation.targets.join('; ')
    return `${violation.impact.toUpperCase()} ${violation.id}: ${violation.help} [${targets}]`
  })

  return `${tool.title} (${tool.href}) has ${blockingViolations.length} serious/critical axe violations:\n${summaries.join('\n')}`
}

function formatSweepSummary(collectedResults: ToolA11yResult[]) {
  return collectedResults
    .filter((result) => result.blockingViolationCount > 0)
    .map((result) => {
      const tool: ToolTarget = {
        title: result.title,
        href: result.href,
        sourceFile: result.sourceFile,
      }

      return formatBlockingViolations(tool, result.blockingViolations)
    })
    .join('\n\n')
}

test('top tool accessibility sweep', async ({ page }) => {
  const collectedResults: ToolA11yResult[] = []

  try {
    for (const tool of topTwentyTools) {
      await test.step(tool.title, async () => {
        await page.goto(tool.href)
        await page.waitForLoadState('domcontentloaded')
        await page.waitForLoadState('networkidle').catch(() => undefined)

        const analysis = await new AxeBuilder({ page }).analyze()
        const blockingViolations = analysis.violations
          .filter((violation) => isBlockingImpact(violation.impact))
          .map((violation) => toBlockingViolationRecord(violation))

        collectedResults.push({
          title: tool.title,
          href: tool.href,
          sourceFile: tool.sourceFile,
          blockingViolationCount: blockingViolations.length,
          blockingViolations,
        })
      })
    }
  } finally {
    writeArtifacts(collectedResults)
  }

  const toolsWithBlockingViolations = collectedResults.filter(
    (result) => result.blockingViolationCount > 0
  )

  expect(toolsWithBlockingViolations, formatSweepSummary(collectedResults)).toHaveLength(0)
})
