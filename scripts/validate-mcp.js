#!/usr/bin/env node

/**
 * MCP Setup Validator
 * Validates that MCP servers are properly configured and can be accessed
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function checkEnvVar(name) {
  const value = process.env[name]
  if (value) {
    log(`  ✓ ${name} is set`, colors.green)
    return true
  } else {
    log(`  ✗ ${name} is NOT set`, colors.red)
    return false
  }
}

function checkMcpServer(name, command, args) {
  try {
    log(`  Testing ${name}...`, colors.blue)
    execSync(`${command} ${args.join(' ')} --help`, {
      stdio: 'pipe',
      timeout: 10000,
    })
    log(`  ✓ ${name} server is accessible`, colors.green)
    return true
  } catch (error) {
    log(`  ✗ ${name} server failed: ${error.message}`, colors.red)
    return false
  }
}

function main() {
  log('\n' + '='.repeat(60), colors.bold)
  log('MCP Configuration Validator', colors.bold)
  log('='.repeat(60) + '\n', colors.bold)

  // Check MCP configuration file
  log('1. Checking MCP Configuration File...', colors.bold)
  const mcpConfigPath = path.join(process.cwd(), '.mcp', 'mcp.json')

  if (fs.existsSync(mcpConfigPath)) {
    log('  ✓ .mcp/mcp.json exists', colors.green)
    try {
      const config = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'))
      const serverCount = Object.keys(config.mcpServers || {}).length
      log(`  ✓ Found ${serverCount} MCP servers configured`, colors.green)

      // Count enabled servers
      const enabledServers = Object.values(config.mcpServers || {}).filter(
        (s) => !s.disabled
      ).length
      log(`  ✓ ${enabledServers} servers are enabled`, colors.green)
    } catch (error) {
      log(`  ✗ Failed to parse mcp.json: ${error.message}`, colors.red)
    }
  } else {
    log('  ✗ .mcp/mcp.json not found', colors.red)
    log('  ℹ Run setup first!', colors.yellow)
  }

  // Check environment variables
  log('\n2. Checking Environment Variables...', colors.bold)
  const requiredVars = ['GITHUB_TOKEN']
  const optionalVars = [
    'BRAVE_API_KEY',
    'SLACK_BOT_TOKEN',
    'SLACK_TEAM_ID',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  let requiredOk = true
  log('  Required:', colors.yellow)
  for (const varName of requiredVars) {
    if (!checkEnvVar(varName)) {
      requiredOk = false
    }
  }

  log('\n  Optional:', colors.yellow)
  for (const varName of optionalVars) {
    checkEnvVar(varName)
  }

  // Check Node.js and npm
  log('\n3. Checking Prerequisites...', colors.bold)
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim()
    log(`  ✓ Node.js ${nodeVersion}`, colors.green)
  } catch (error) {
    log('  ✗ Node.js not found', colors.red)
  }

  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim()
    log(`  ✓ npm ${npmVersion}`, colors.green)
  } catch (error) {
    log('  ✗ npm not found', colors.red)
  }

  try {
    execSync('npx --version', { encoding: 'utf8' })
    log('  ✓ npx is available', colors.green)
  } catch (error) {
    log('  ✗ npx not found', colors.red)
  }

  // Test MCP servers (only if required env vars are set)
  if (requiredOk) {
    log('\n4. Testing MCP Servers...', colors.bold)
    log('  (This may take a moment on first run)\n', colors.yellow)

    checkMcpServer('GitHub', 'npx', ['-y', '@modelcontextprotocol/server-github'])
    checkMcpServer('Filesystem', 'npx', ['-y', '@modelcontextprotocol/server-filesystem'])
    checkMcpServer('Memory', 'npx', ['-y', '@modelcontextprotocol/server-memory'])
    checkMcpServer('Sequential Thinking', 'npx', [
      '-y',
      '@modelcontextprotocol/server-sequential-thinking',
    ])
  } else {
    log('\n4. Skipping MCP Server Tests', colors.yellow)
    log('  Required environment variables are not set', colors.yellow)
  }

  // Summary
  log('\n' + '='.repeat(60), colors.bold)
  log('Validation Complete!', colors.bold)
  log('='.repeat(60) + '\n', colors.bold)

  if (requiredOk) {
    log('✓ Setup looks good! You can start using MCP servers.', colors.green)
    log('\nNext steps:', colors.blue)
    log('  1. Restart your AI assistant to load the configuration')
    log('  2. Try: "Show me the GitHub repository status"')
    log('  3. Try: "List files in the project"')
  } else {
    log('✗ Setup incomplete. Please fix the issues above.', colors.red)
    log('\nTo fix:', colors.yellow)
    log('  1. Copy .env.example to .env')
    log('  2. Set required environment variables')
    log('  3. Run this validator again')
    log('\nSee docs/guides/MCP_SETUP.md for detailed instructions.')
  }

  console.log()
}

main()
